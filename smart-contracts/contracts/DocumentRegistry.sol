// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title DocumentRegistry
 * @author David Pérez Velasco, Gabriel Villarrubia González, Sergio García González
 * @notice Registro descentralizado de documentos con control de versiones, firmas y permisos granulares.
 * @dev Contrato consolidado para la gestión completa del ciclo de vida de documentos sobre blockchain.
 *      Integra patrones de seguridad: ReentrancyGuard y control de roles.
 *      Las claves simétricas de los documentos no se almacenan en claro; únicamente se guarda su hash cifrado.
 *
 * Características principales:
 * - Una transacción por operación para máxima eficiencia de UX.
 * - Roles de documentos como única fuente de verdad (VIEWER, EDITOR, OWNER).
 * - Listas de usuarios eficientes mediante EnumerableSet.
 *
 * @custom:security-contact security@documentchain.io
 * @custom:version 1.0.0
 */
contract DocumentRegistry is AccessControl, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes32 private constant SIGNATURE_DOMAIN = keccak256("DocumentChain.Signature");

    // ============================================
    // ROLES
    // ============================================

    /// @notice Rol de administrador del sistema. Permite la gestión de roles administrativos.
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");


    /**
     * @notice Niveles de permiso asignables a un usuario dentro de un documento.
     * @dev Se utiliza como única fuente de verdad para el control de acceso on-chain.
     */
    enum DocumentRole {
        NONE,   // 0: Sin acceso
        VIEWER, // 1: Solo lectura
        EDITOR, // 2: Lectura y escritura
        OWNER   // 3: Control total (propietario)
    }

    // ============================================
    // ESTRUCTURAS DE DATOS
    // ============================================

    /**
     * @notice Representa un documento registrado en la blockchain.
     * @param docId Identificador único del documento (UUID convertido a bytes32).
     * @param owner Dirección del propietario actual.
     * @param createdAt Marca temporal de creación (unix timestamp).
     * @param updatedAt Marca temporal de la última modificación.
     * @param currentVersion Número de versión operativa actual.
     * @param latestVersion Número de la última versión creada (puede ser mayor que la operativa).
     * @param isArchived Indica si el documento está archivado (inmutable temporalmente).
     * @param isDeleted Indica si el documento ha sido marcado como eliminado lógicamente.
     */
    struct Document {
        bytes32 docId;
        address owner;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 currentVersion;
        uint256 latestVersion;
        bool isArchived;
        bool isDeleted;
    }

    /**
     * @notice Representa una versión concreta de un documento.
     * @param versionNumber Índice secuencial de la versión.
     * @param ipfsCid Content Identifier de IPFS donde reside el contenido cifrado.
     * @param encryptedKeyHash Hash de la clave simétrica cifrada (para verificación de integridad).
     * @param createdBy Dirección que creó la versión.
     * @param createdAt Marca temporal de creación.
     * @param isOperational Indica si esta versión es la actualmente operativa.
     * @param restoredFrom Si es mayor que 0, indica la versión original desde la que se restauró.
     */
    struct Version {
        uint256 versionNumber;
        string ipfsCid;
        bytes32 encryptedKeyHash;
        address createdBy;
        uint256 createdAt;
        bool isOperational;
        uint256 restoredFrom;
    }

    /**
     * @notice Representa una firma digital asociada a una versión de documento.
     * @param signer Dirección que emitió la firma.
     * @param signature Datos de la firma criptográfica (ECDSA).
     * @param message Mensaje o propósito de la firma.
     * @param comment Comentario opcional adjunto a la firma.
     * @param timestamp Momento en que se registró la firma on-chain.
     */
    struct Signature {
        address signer;
        bytes signature;
        string message;
        string comment;
        uint256 timestamp;
    }

    // ============================================
    // ESTADO DEL CONTRATO
    // ============================================

    /// @dev Mapping de identificador de documento a su estructura Document.
    mapping(bytes32 => Document) private _documents;

    /// @dev Mapping de documento -> número de versión -> estructura Version.
    mapping(bytes32 => mapping(uint256 => Version)) private _versions;

    /// @dev Mapping de documento -> versión -> lista de firmas registradas.
    mapping(bytes32 => mapping(uint256 => Signature[])) private _signatures;

    /// @dev Mapping de documento -> versión -> usuario -> ¿ha firmado ya?
    mapping(bytes32 => mapping(uint256 => mapping(address => bool))) private _hasSigned;

    /// @dev Mapping de documento -> usuario -> rol asignado.
    mapping(bytes32 => mapping(address => DocumentRole)) private _permissions;

    /// @dev Conjunto de usuarios con algún permiso sobre cada documento (eficiente para iteración).
    mapping(bytes32 => EnumerableSet.AddressSet) private _documentUsers;

    /// @dev Conjunto de documentos a los que tiene acceso cada usuario.
    mapping(address => EnumerableSet.Bytes32Set) private _userDocuments;

    /// @dev Contador total de documentos creados en el sistema.
    uint256 private _totalDocuments;

    // ============================================
    // EVENTOS
    // ============================================

    /// @notice Emite cuando se crea un nuevo documento.
    event DocumentCreated(bytes32 indexed docId, address indexed owner, string ipfsCid, uint256 timestamp);

    /// @notice Emite cuando se crea una nueva versión de un documento existente.
    event VersionCreated(bytes32 indexed docId, uint256 indexed versionNumber, string ipfsCid, address indexed createdBy, uint256 timestamp);

    /// @notice Emite cuando se restaura una versión anterior como nueva versión operativa.
    event VersionRestored(bytes32 indexed docId, uint256 newVersionNumber, uint256 restoredFromVersion, address indexed by, uint256 timestamp);

    /// @notice Emite cuando un usuario firma una versión específica.
    event DocumentSigned(bytes32 indexed docId, uint256 indexed versionNumber, address indexed signer, string message, uint256 timestamp);

    /// @notice Emite cuando se comparte un documento con un nuevo usuario.
    event DocumentShared(bytes32 indexed docId, address indexed from, address indexed to, DocumentRole role, uint256 timestamp);

    /// @notice Emite cuando se revoca el permiso de un usuario sobre un documento.
    event PermissionRevoked(bytes32 indexed docId, address indexed user, address indexed by, uint256 timestamp);

    /// @notice Emite cuando se transfiere la propiedad de un documento.
    event OwnershipTransferred(bytes32 indexed docId, address indexed from, address indexed to, uint256 timestamp);

    /// @notice Emite cuando se archiva o desarchiva un documento.
    event DocumentArchived(bytes32 indexed docId, address indexed by, bool archived, uint256 timestamp);

    /// @notice Emite cuando se elimina lógicamente un documento.
    event DocumentDeleted(bytes32 indexed docId, address indexed by, uint256 timestamp);

    /// @notice Emite cuando cambia la versión operativa activa.
    event OperationalVersionChanged(bytes32 indexed docId, uint256 oldVersion, uint256 newVersion, address indexed by, uint256 timestamp);


    /// @notice Emite cuando se concede el rol de administrador a una cuenta.
    event AdminRoleGranted(address indexed admin, address indexed by, uint256 timestamp);

    /// @notice Emite cuando se revoca el rol de administrador a una cuenta.
    event AdminRoleRevoked(address indexed admin, address indexed by, uint256 timestamp);


    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @notice Inicializa el contrato estableciendo al desplegador como propietario y administrador.
     * @dev Otorga DEFAULT_ADMIN_ROLE y ADMIN_ROLE al creador para permitir la gestión inicial.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        emit AdminRoleGranted(msg.sender, msg.sender, block.timestamp);
    }

    // ============================================
    // MODIFICADORES PERSONALIZADOS
    // ============================================

    /**
     * @notice Verifica que el documento no esté eliminado.
     * @param docId Identificador del documento.
     */
    modifier notDeleted(bytes32 docId) {
        require(!_documents[docId].isDeleted, "Document is deleted");
        _;
    }

    /**
     * @notice Verifica que el documento no esté archivado.
     * @param docId Identificador del documento.
     */
    modifier notArchived(bytes32 docId) {
        require(!_documents[docId].isArchived, "Document is archived");
        _;
    }

    // ============================================
    // FUNCIONES DE ADMINISTRACIÓN
    // ============================================

    /**
     * @notice Concede un rol a una cuenta, emitiendo evento adicional si es ADMIN_ROLE.
     * @param role Identificador del rol (keccak256 hash).
     * @param account Dirección que recibirá el rol.
     */
    function grantRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        super.grantRole(role, account);
        if (role == ADMIN_ROLE) {
            emit AdminRoleGranted(account, _msgSender(), block.timestamp);
        }
    }

    /**
     * @notice Revoca un rol a una cuenta, emitiendo evento adicional si es ADMIN_ROLE.
     * @param role Identificador del rol.
     * @param account Dirección a la que se revoca el rol.
     */
    function revokeRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        super.revokeRole(role, account);
        if (role == ADMIN_ROLE) {
            emit AdminRoleRevoked(account, _msgSender(), block.timestamp);
        }
    }

    // ============================================
    // FUNCIONES PRINCIPALES (CORE)
    // ============================================

    /**
     * @notice Crea un nuevo documento en el registro con su versión inicial.
     * @param _docId Identificador único del documento (bytes32).
     * @param _ipfsCid CID de IPFS del contenido cifrado del documento.
     * @param _encryptedKeyHash Hash de la clave simétrica cifrada.
     * @dev Requiere: ID válido, CID no vacío y documento no existente previamente.
     */
    function createDocument(bytes32 _docId, string calldata _ipfsCid, bytes32 _encryptedKeyHash)
        external
        nonReentrant
    {
        require(_docId != bytes32(0), "Invalid document ID");
        require(bytes(_ipfsCid).length > 0, "Invalid IPFS CID");
        require(_documents[_docId].owner == address(0), "Document already exists");

        address sender = _msgSender();

        _documents[_docId] = Document({
            docId: _docId,
            owner: sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            currentVersion: 1,
            latestVersion: 1,
            isArchived: false,
            isDeleted: false
        });

        _versions[_docId][1] = Version({
            versionNumber: 1,
            ipfsCid: _ipfsCid,
            encryptedKeyHash: _encryptedKeyHash,
            createdBy: sender,
            createdAt: block.timestamp,
            isOperational: true,
            restoredFrom: 0
        });

        _permissions[_docId][sender] = DocumentRole.OWNER;
        _documentUsers[_docId].add(sender);
        _userDocuments[sender].add(_docId);

        _totalDocuments++;

        emit DocumentCreated(_docId, sender, _ipfsCid, block.timestamp);
        emit VersionCreated(_docId, 1, _ipfsCid, sender, block.timestamp);
    }

    /**
     * @notice Crea una nueva versión de un documento existente.
     * @param _docId Identificador del documento.
     * @param _ipfsCid CID de IPFS del nuevo contenido cifrado.
     * @param _encryptedKeyHash Hash de la nueva clave simétrica cifrada.
     * @dev Requiere permisos de escritura (EDITOR u OWNER) y que el documento no esté archivado ni eliminado.
     */
    function createVersion(bytes32 _docId, string calldata _ipfsCid, bytes32 _encryptedKeyHash)
        external
        nonReentrant
        notDeleted(_docId)
    {
        require(_documents[_docId].owner != address(0), "Document does not exist");
        require(_canEdit(_docId, _msgSender()), "No write permission");
        require(bytes(_ipfsCid).length > 0, "Invalid IPFS CID");
        require(!_documents[_docId].isArchived, "Document is archived");

        Document storage doc = _documents[_docId];
        uint256 newVersionNum = doc.latestVersion + 1;

        _versions[_docId][doc.currentVersion].isOperational = false;

        _versions[_docId][newVersionNum] = Version({
            versionNumber: newVersionNum,
            ipfsCid: _ipfsCid,
            encryptedKeyHash: _encryptedKeyHash,
            createdBy: _msgSender(),
            createdAt: block.timestamp,
            isOperational: true,
            restoredFrom: 0
        });

        doc.latestVersion = newVersionNum;
        doc.currentVersion = newVersionNum;
        doc.updatedAt = block.timestamp;

        emit VersionCreated(_docId, newVersionNum, _ipfsCid, _msgSender(), block.timestamp);
    }

    /**
     * @notice Comparte un documento con otro usuario asignándole un rol.
     * @param _docId Identificador del documento.
     * @param _user Dirección del usuario destinatario.
     * @param _role Rol a asignar (VIEWER o EDITOR).
     * @dev Solo el propietario puede compartir. No se permite compartir consigo mismo.
     */
    function shareDocument(bytes32 _docId, address _user, DocumentRole _role)
        external
        nonReentrant
        notDeleted(_docId)
        notArchived(_docId)
    {
        require(_isOwner(_docId, _msgSender()), "Only owner can share");
        require(_user != address(0), "Invalid user address");
        require(_role == DocumentRole.VIEWER || _role == DocumentRole.EDITOR, "Invalid role");
        require(_user != _documents[_docId].owner, "Cannot share with owner");

        _permissions[_docId][_user] = _role;
        _documentUsers[_docId].add(_user);
        _userDocuments[_user].add(_docId);

        emit DocumentShared(_docId, _msgSender(), _user, _role, block.timestamp);
    }

    /**
     * @notice Registra una firma digital sobre una versión concreta de un documento.
     * @param _docId Identificador del documento.
     * @param _versionNumber Número de versión a firmar.
     * @param _signature Datos de la firma criptográfica.
     * @param _message Mensaje descriptivo de la firma.
     * @param _comment Comentario opcional.
     * @dev Requiere permisos de lectura y que la versión sea válida. Cada usuario solo puede firmar una vez por versión.
     */
    function signDocument(
        bytes32 _docId,
        uint256 _versionNumber,
        bytes calldata _signature,
        string calldata _message,
        string calldata _comment
    )
        external
        nonReentrant
        notDeleted(_docId)
        notArchived(_docId)
    {
        address sender = _msgSender();
        require(_canView(_docId, sender), "No read permission");
        require(_versionNumber > 0 && _versionNumber <= _documents[_docId].latestVersion, "Invalid version");
        require(_signature.length == 65, "Invalid signature");
        require(!_hasSigned[_docId][_versionNumber][sender], "Already signed");
        _validateDocumentSignature(_docId, _versionNumber, _message, _signature, sender);

        _signatures[_docId][_versionNumber].push(Signature({
            signer: sender,
            signature: _signature,
            message: _message,
            comment: _comment,
            timestamp: block.timestamp
        }));

        _hasSigned[_docId][_versionNumber][sender] = true;

        emit DocumentSigned(_docId, _versionNumber, sender, _message, block.timestamp);
    }

    /**
     * @notice Calcula el hash de contexto que debe firmar la wallet para registrar una firma documental.
     * @dev Incluye contrato y chainId para evitar replay entre despliegues o redes.
     * @param _docId Identificador del documento.
     * @param _versionNumber Número de versión a firmar.
     * @param _message Mensaje legible asociado a la firma.
     * @return Hash de payload que se firma con EIP-191 mediante signMessage.
     */
    function getSignaturePayloadHash(
        bytes32 _docId,
        uint256 _versionNumber,
        string memory _message
    ) public view returns (bytes32) {
        return keccak256(abi.encode(
            SIGNATURE_DOMAIN,
            _docId,
            _versionNumber,
            keccak256(bytes(_message)),
            address(this),
            block.chainid
        ));
    }

    function _validateDocumentSignature(
        bytes32 _docId,
        uint256 _versionNumber,
        string memory _message,
        bytes calldata _signature,
        address _expectedSigner
    ) internal view {
        bytes32 signedHash = MessageHashUtils.toEthSignedMessageHash(
            getSignaturePayloadHash(_docId, _versionNumber, _message)
        );
        require(ECDSA.recover(signedHash, _signature) == _expectedSigner, "Signature does not match signer");
    }

    /**
     * @notice Transfiere la propiedad de un documento a otra dirección.
     * @param _docId Identificador del documento.
     * @param _newOwner Dirección del nuevo propietario.
     * @dev El propietario anterior conserva rol de VIEWER.
     */
    function transferOwnership(bytes32 _docId, address _newOwner)
        external
        nonReentrant
        notDeleted(_docId)
        notArchived(_docId)
    {
        require(_isOwner(_docId, _msgSender()), "Only owner can transfer");
        require(_newOwner != address(0), "Invalid new owner");
        require(_newOwner != _documents[_docId].owner, "Already owner");

        address oldOwner = _documents[_docId].owner;

        _documents[_docId].owner = _newOwner;
        _documents[_docId].updatedAt = block.timestamp;

        _permissions[_docId][oldOwner] = DocumentRole.VIEWER;
        _permissions[_docId][_newOwner] = DocumentRole.OWNER;

        _documentUsers[_docId].add(_newOwner);
        _userDocuments[_newOwner].add(_docId);

        emit OwnershipTransferred(_docId, oldOwner, _newOwner, block.timestamp);
    }

    /**
     * @notice Archiva o desarchiva un documento.
     * @param _docId Identificador del documento.
     * @param _archived true para archivar, false para desarchivar.
     * @dev Solo el propietario puede modificar este estado. Un documento archivado no admite modificaciones.
     */
    function setArchiveStatus(bytes32 _docId, bool _archived)
        external
        nonReentrant
        notDeleted(_docId)
    {
        address sender = _msgSender();
        require(_isOwner(_docId, sender), "Only owner");
        require(_documents[_docId].isArchived != _archived, "Already in that state");

        _documents[_docId].isArchived = _archived;
        _documents[_docId].updatedAt = block.timestamp;

        emit DocumentArchived(_docId, sender, _archived, block.timestamp);
    }

    /**
     * @notice Marca un documento como eliminado lógicamente.
     * @param _docId Identificador del documento a eliminar.
     * @dev La eliminación es lógica: los datos permanecen en blockchain pero se marcan como inaccesibles.
     */
    function deleteDocument(bytes32 _docId)
        external
        nonReentrant
        notArchived(_docId)
    {
        address sender = _msgSender();
        require(_isOwner(_docId, sender), "Only owner can delete");
        require(!_documents[_docId].isDeleted, "Already deleted");

        _documents[_docId].isDeleted = true;
        _documents[_docId].updatedAt = block.timestamp;

        emit DocumentDeleted(_docId, sender, block.timestamp);
    }

    /**
     * @notice Restaura una versión anterior creando una nueva versión operativa con idéntico contenido.
     * @param _docId Identificador del documento.
     * @param _versionToRestore Número de versión a restaurar.
     * @dev Requiere permisos de escritura. La versión restaurada se convierte en la última versión operativa.
     */
    function restoreVersion(bytes32 _docId, uint256 _versionToRestore)
        external
        nonReentrant
        notDeleted(_docId)
        notArchived(_docId)
    {
        require(_canEdit(_docId, _msgSender()), "No write permission");
        require(_versionToRestore > 0 && _versionToRestore <= _documents[_docId].latestVersion, "Invalid version");

        Document storage doc = _documents[_docId];
        Version storage oldVersion = _versions[_docId][_versionToRestore];
        uint256 newVersionNum = doc.latestVersion + 1;

        _versions[_docId][doc.currentVersion].isOperational = false;

        _versions[_docId][newVersionNum] = Version({
            versionNumber: newVersionNum,
            ipfsCid: oldVersion.ipfsCid,
            encryptedKeyHash: oldVersion.encryptedKeyHash,
            createdBy: _msgSender(),
            createdAt: block.timestamp,
            isOperational: true,
            restoredFrom: _versionToRestore
        });

        doc.latestVersion = newVersionNum;
        doc.currentVersion = newVersionNum;
        doc.updatedAt = block.timestamp;

        emit VersionRestored(_docId, newVersionNum, _versionToRestore, _msgSender(), block.timestamp);
    }

    /**
     * @notice Cambia la versión operativa activa sin crear una nueva versión.
     * @param _docId Identificador del documento.
     * @param _versionNumber Número de versión que pasará a ser operativa.
     * @dev Útil para revertir a una versión previa sin generar historial adicional.
     */
    function setOperationalVersion(bytes32 _docId, uint256 _versionNumber)
        external
        nonReentrant
        notDeleted(_docId)
        notArchived(_docId)
    {
        require(_canEdit(_docId, _msgSender()), "No write permission");
        require(_versionNumber > 0 && _versionNumber <= _documents[_docId].latestVersion, "Invalid version");

        Document storage doc = _documents[_docId];
        uint256 oldVersion = doc.currentVersion;

        _versions[_docId][oldVersion].isOperational = false;
        _versions[_docId][_versionNumber].isOperational = true;
        doc.currentVersion = _versionNumber;
        doc.updatedAt = block.timestamp;

        emit OperationalVersionChanged(_docId, oldVersion, _versionNumber, _msgSender(), block.timestamp);
    }

    /**
     * @notice Revoca todos los permisos de un usuario sobre un documento.
     * @param _docId Identificador del documento.
     * @param _user Dirección del usuario afectado.
     * @dev Solo el propietario puede revocar permisos. No se puede revocar al propietario mismo.
     */
    function revokePermission(bytes32 _docId, address _user)
        external
        nonReentrant
        notArchived(_docId)
        notDeleted(_docId)
    {
        require(_isOwner(_docId, _msgSender()), "Only owner");
        require(_user != _documents[_docId].owner, "Cannot revoke owner");
        require(_permissions[_docId][_user] != DocumentRole.NONE, "User has no permission");

        _permissions[_docId][_user] = DocumentRole.NONE;
        _documentUsers[_docId].remove(_user);
        _userDocuments[_user].remove(_docId);

        emit PermissionRevoked(_docId, _user, _msgSender(), block.timestamp);
    }

    // ============================================
    // FUNCIONES DE CONSULTA (VIEW)
    // ============================================

    /**
     * @notice Obtiene la información completa de un documento.
     * @param _docId Identificador del documento.
     * @return Estructura Document con todos sus campos.
     */
    function getDocument(bytes32 _docId) external view returns (Document memory) {
        return _documents[_docId];
    }

    /**
     * @notice Obtiene los datos de una versión específica.
     * @param _docId Identificador del documento.
     * @param _versionNumber Número de versión solicitada.
     * @return Estructura Version correspondiente.
     */
    function getVersion(bytes32 _docId, uint256 _versionNumber) external view returns (Version memory) {
        return _versions[_docId][_versionNumber];
    }

    /**
     * @notice Obtiene todas las firmas registradas sobre una versión.
     * @param _docId Identificador del documento.
     * @param _versionNumber Número de versión.
     * @return Array de estructuras Signature.
     */
    function getVersionSignatures(bytes32 _docId, uint256 _versionNumber) external view returns (Signature[] memory) {
        return _signatures[_docId][_versionNumber];
    }

    /**
     * @notice Consulta el rol de un usuario sobre un documento.
     * @param _docId Identificador del documento.
     * @param _user Dirección del usuario.
     * @return Rol asignado (NONE, VIEWER, EDITOR, OWNER).
     */
    function getUserPermission(bytes32 _docId, address _user) external view returns (DocumentRole) {
        return _permissions[_docId][_user];
    }

    /**
     * @notice Lista los identificadores de documentos accesibles por un usuario.
     * @param _user Dirección del usuario.
     * @return Array de bytes32 con los docId.
     */
    function getUserDocuments(address _user) external view returns (bytes32[] memory) {
        return _userDocuments[_user].values();
    }

    /**
     * @notice Cuenta cuántos documentos tiene acceso un usuario.
     * @param _user Dirección del usuario.
     * @return Cantidad de documentos accesibles.
     */
    function getUserDocumentCount(address _user) external view returns (uint256) {
        return _userDocuments[_user].length();
    }

    /**
     * @notice Lista las direcciones con algún permiso sobre un documento.
     * @param _docId Identificador del documento.
     * @return Array de direcciones.
     */
    function getDocumentUsers(bytes32 _docId) external view returns (address[] memory) {
        return _documentUsers[_docId].values();
    }

    /**
     * @notice Devuelve el número total de documentos creados en el sistema.
     * @return Contador total.
     */
    function totalDocuments() external view returns (uint256) {
        return _totalDocuments;
    }

    /**
     * @notice Verifica si un usuario tiene permisos de lectura sobre un documento.
     * @param _docId Identificador del documento.
     * @param _user Dirección a verificar.
     * @return true si tiene permiso de lectura.
     */
    function canView(bytes32 _docId, address _user) external view returns (bool) {
        return _canView(_docId, _user);
    }

    /**
     * @notice Verifica si un usuario tiene permisos de escritura sobre un documento.
     * @param _docId Identificador del documento.
     * @param _user Dirección a verificar.
     * @return true si tiene permiso de escritura.
     */
    function canEdit(bytes32 _docId, address _user) external view returns (bool) {
        return _canEdit(_docId, _user);
    }

    /**
     * @notice Verifica si una dirección es el propietario de un documento.
     * @param _docId Identificador del documento.
     * @param _user Dirección a verificar.
     * @return true si es el propietario.
     */
    function isOwner(bytes32 _docId, address _user) external view returns (bool) {
        return _isOwner(_docId, _user);
    }

    // ============================================
    // AUXILIARES INTERNOS
    // ============================================

    /**
     * @dev Comprueba si un usuario tiene al menos permiso de lectura.
     */
    function _canView(bytes32 _docId, address _user) internal view returns (bool) {
        DocumentRole role = _permissions[_docId][_user];
        return role != DocumentRole.NONE;
    }

    /**
     * @dev Comprueba si un usuario tiene permiso de escritura.
     */
    function _canEdit(bytes32 _docId, address _user) internal view returns (bool) {
        DocumentRole role = _permissions[_docId][_user];
        return role == DocumentRole.EDITOR || role == DocumentRole.OWNER;
    }

    /**
     * @dev Comprueba si una dirección es el propietario del documento.
     */
    function _isOwner(bytes32 _docId, address _user) internal view returns (bool) {
        return _documents[_docId].owner == _user;
    }

    /**
     * @notice Declaración de compatibilidad con interfaces ERC-165.
     * @param interfaceId Identificador de interfaz de 4 bytes.
     * @return true si la interfaz es soportada.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
