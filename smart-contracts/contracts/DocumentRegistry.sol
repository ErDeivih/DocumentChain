// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title DocumentRegistry
 * @dev Contrato consolidado para gestión completa del ciclo de vida de documentos
 * @notice Integra: Registro, Versionado, Firmas, Control de Acceso y Pausa de Emergencia
 * 
 * Características:
 * - UNA transacción por operación (máxima eficiencia UX)
 * - Pausable en emergencias (Circuit Breaker Pattern)
 * - Protección contra reentrancy
 * - Roles de administrador granulares (ADMIN_ROLE)
 * - Roles de documentos como única fuente de verdad (VIEWER, EDITOR, OWNER)
 * - Listas de usuarios eficientes (EnumerableSet)
 * 
 * @custom:security-contact security@documentchain.io
 */
contract DocumentRegistry is 
    Ownable, 
    AccessControl, 
    Pausable, 
    ReentrancyGuard 
{
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    
    // ============================================
    // ROLES
    // ============================================
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    enum DocumentRole {
        NONE,           // 0: Sin acceso
        VIEWER,         // 1: Solo lectura
        EDITOR,         // 2: Lectura + escritura
        OWNER           // 3: Control total
    }
    
    // ============================================
    // STRUCTS
    // ============================================
    
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
    
    struct Version {
        uint256 versionNumber;
        string ipfsCid;
        bytes32 encryptedKeyHash;
        address createdBy;
        uint256 createdAt;
        bool isOperational;
        uint256 restoredFrom;
    }
    
    struct Signature {
        address signer;
        bytes signature;
        string message;
        string comment;
        uint256 timestamp;
    }
    
    // ============================================
    // STATE
    // ============================================
    
    mapping(bytes32 => Document) private _documents;
    mapping(bytes32 => mapping(uint256 => Version)) private _versions;
    mapping(bytes32 => mapping(uint256 => Signature[])) private _signatures;
    mapping(bytes32 => mapping(uint256 => mapping(address => bool))) private _hasSigned;
    mapping(bytes32 => mapping(address => DocumentRole)) private _permissions;
    mapping(bytes32 => EnumerableSet.AddressSet) private _documentUsers;
    mapping(address => EnumerableSet.Bytes32Set) private _userDocuments;
    uint256 private _totalDocuments;
    mapping(address => bool) private _suspendedUsers;
    
    // ============================================
    // EVENTS
    // ============================================
    
    event DocumentCreated(bytes32 indexed docId, address indexed owner, string ipfsCid, uint256 timestamp);
    event VersionCreated(bytes32 indexed docId, uint256 indexed versionNumber, string ipfsCid, address indexed createdBy, uint256 timestamp);
    event VersionRestored(bytes32 indexed docId, uint256 newVersionNumber, uint256 restoredFromVersion, address indexed by, uint256 timestamp);
    event DocumentSigned(bytes32 indexed docId, uint256 indexed versionNumber, address indexed signer, string message, uint256 timestamp);
    event DocumentShared(bytes32 indexed docId, address indexed from, address indexed to, DocumentRole role, uint256 timestamp);
    event PermissionRevoked(bytes32 indexed docId, address indexed user, address indexed by, uint256 timestamp);
    event OwnershipTransferred(bytes32 indexed docId, address indexed from, address indexed to, uint256 timestamp);
    event DocumentArchived(bytes32 indexed docId, address indexed by, bool archived, uint256 timestamp);
    event DocumentDeleted(bytes32 indexed docId, address indexed by, uint256 timestamp);
    event OperationalVersionChanged(bytes32 indexed docId, uint256 oldVersion, uint256 newVersion, address indexed by, uint256 timestamp);
    event SystemPaused(address indexed by, uint256 timestamp);
    event SystemUnpaused(address indexed by, uint256 timestamp);
    event AdminRoleGranted(address indexed admin, address indexed by, uint256 timestamp);
    event AdminRoleRevoked(address indexed admin, address indexed by, uint256 timestamp);
    event UserSuspended(address indexed user, address indexed by, uint256 timestamp);
    event UserUnsuspended(address indexed user, address indexed by, uint256 timestamp);
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        emit AdminRoleGranted(msg.sender, msg.sender, block.timestamp);
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    // ============================================
    // MODIFIERS
    // ============================================

    modifier notSuspended(address user) {
        require(!_suspendedUsers[user], "User is suspended");
        _;
    }

    modifier notDeleted(bytes32 docId) {
        require(!_documents[docId].isDeleted, "Document is deleted");
        _;
    }

    modifier notArchived(bytes32 docId) {
        require(!_documents[docId].isArchived, "Document is archived");
        _;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    function suspendMyself() external {
        address sender = _msgSender();
        require(!_suspendedUsers[sender], "User already suspended");
        _suspendedUsers[sender] = true;
        emit UserSuspended(sender, sender, block.timestamp);
    }

    function unsuspendMyself() external {
        address sender = _msgSender();
        require(_suspendedUsers[sender], "User is not suspended");
        _suspendedUsers[sender] = false;
        emit UserUnsuspended(sender, sender, block.timestamp);
    }

    function isUserSuspended(address user) external view returns (bool) {
        return _suspendedUsers[user];
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit SystemPaused(_msgSender(), block.timestamp);
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit SystemUnpaused(_msgSender(), block.timestamp);
    }
    
    function isPaused() external view returns (bool) {
        return paused();
    }
    
    function grantRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        super.grantRole(role, account);
        if (role == ADMIN_ROLE) {
            emit AdminRoleGranted(account, _msgSender(), block.timestamp);
        }
    }
    
    function revokeRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        super.revokeRole(role, account);
        if (role == ADMIN_ROLE) {
            emit AdminRoleRevoked(account, _msgSender(), block.timestamp);
        }
    }
    
    // ============================================
    // CORE FUNCTIONS
    // ============================================
    
    function createDocument(bytes32 _docId, string calldata _ipfsCid, bytes32 _encryptedKeyHash) external nonReentrant whenNotPaused notSuspended(_msgSender()) {
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
    
    function createVersion(bytes32 _docId, string calldata _ipfsCid, bytes32 _encryptedKeyHash) external nonReentrant whenNotPaused notSuspended(_msgSender()) notDeleted(_docId) {
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
    
    function shareDocument(bytes32 _docId, address _user, DocumentRole _role) external nonReentrant whenNotPaused notSuspended(_msgSender()) notDeleted(_docId) notArchived(_docId) {
        require(_isOwner(_docId, _msgSender()), "Only owner can share");
        require(_user != address(0), "Invalid user address");
        require(!_suspendedUsers[_user], "Cannot share with suspended user");
        require(_role == DocumentRole.VIEWER || _role == DocumentRole.EDITOR, "Invalid role");
        require(_user != _documents[_docId].owner, "Cannot share with owner");
        
        _permissions[_docId][_user] = _role;
        _documentUsers[_docId].add(_user);
        _userDocuments[_user].add(_docId);
        
        emit DocumentShared(_docId, _msgSender(), _user, _role, block.timestamp);
    }
    
    function signDocument(bytes32 _docId, uint256 _versionNumber, bytes calldata _signature, string calldata _message, string calldata _comment) external nonReentrant whenNotPaused notSuspended(_msgSender()) notDeleted(_docId) notArchived(_docId) {
        require(_canView(_docId, _msgSender()), "No read permission");
        require(_versionNumber > 0 && _versionNumber <= _documents[_docId].latestVersion, "Invalid version");
        require(_signature.length > 0, "Invalid signature");
        require(!_hasSigned[_docId][_versionNumber][_msgSender()], "Already signed");
        
        _signatures[_docId][_versionNumber].push(Signature({
            signer: _msgSender(),
            signature: _signature,
            message: _message,
            comment: _comment,
            timestamp: block.timestamp
        }));
        
        _hasSigned[_docId][_versionNumber][_msgSender()] = true;
        
        emit DocumentSigned(_docId, _versionNumber, _msgSender(), _message, block.timestamp);
    }
    
    function transferOwnership(bytes32 _docId, address _newOwner) external nonReentrant whenNotPaused notSuspended(_msgSender()) notDeleted(_docId) notArchived(_docId) {
        require(_isOwner(_docId, _msgSender()), "Only owner can transfer");
        require(_newOwner != address(0), "Invalid new owner");
        require(!_suspendedUsers[_newOwner], "Cannot transfer to suspended user");
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
    
    function setArchiveStatus(bytes32 _docId, bool _archived) external nonReentrant whenNotPaused notSuspended(_msgSender()) {
        require(_isOwner(_docId, _msgSender()), "Only owner");
        require(_documents[_docId].isArchived != _archived, "Already in that state");
        
        _documents[_docId].isArchived = _archived;
        _documents[_docId].updatedAt = block.timestamp;
        
        emit DocumentArchived(_docId, _msgSender(), _archived, block.timestamp);
    }
    
    function deleteDocument(bytes32 _docId) external nonReentrant whenNotPaused notSuspended(_msgSender()) {
        require(_isOwner(_docId, _msgSender()), "Only owner can delete");
        require(!_documents[_docId].isDeleted, "Already deleted");
        
        _documents[_docId].isDeleted = true;
        _documents[_docId].updatedAt = block.timestamp;
        
        emit DocumentDeleted(_docId, _msgSender(), block.timestamp);
    }
    
    function restoreVersion(bytes32 _docId, uint256 _versionToRestore) external nonReentrant whenNotPaused notSuspended(_msgSender()) notDeleted(_docId) notArchived(_docId) {
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
    
    function setOperationalVersion(bytes32 _docId, uint256 _versionNumber) external nonReentrant whenNotPaused notSuspended(_msgSender()) notDeleted(_docId) notArchived(_docId) {
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
    
    function revokePermission(bytes32 _docId, address _user) external nonReentrant whenNotPaused notSuspended(_msgSender()) notArchived(_docId) {
        require(_isOwner(_docId, _msgSender()), "Only owner");
        require(_user != _documents[_docId].owner, "Cannot revoke owner");
        require(_permissions[_docId][_user] != DocumentRole.NONE, "User has no permission");
        
        _permissions[_docId][_user] = DocumentRole.NONE;
        _documentUsers[_docId].remove(_user);
        _userDocuments[_user].remove(_docId);
        
        emit PermissionRevoked(_docId, _user, _msgSender(), block.timestamp);
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    function getDocument(bytes32 _docId) external view returns (Document memory) {
        return _documents[_docId];
    }
    
    function getVersion(bytes32 _docId, uint256 _versionNumber) external view returns (Version memory) {
        return _versions[_docId][_versionNumber];
    }
    
    function getVersionSignatures(bytes32 _docId, uint256 _versionNumber) external view returns (Signature[] memory) {
        return _signatures[_docId][_versionNumber];
    }
    
    function getUserPermission(bytes32 _docId, address _user) external view returns (DocumentRole) {
        return _permissions[_docId][_user];
    }
    
    function getUserDocuments(address _user) external view returns (bytes32[] memory) {
        return _userDocuments[_user].values();
    }
    
    function getUserDocumentCount(address _user) external view returns (uint256) {
        return _userDocuments[_user].length();
    }
    
    function getDocumentUsers(bytes32 _docId) external view returns (address[] memory) {
        return _documentUsers[_docId].values();
    }
    
    function totalDocuments() external view returns (uint256) {
        return _totalDocuments;
    }
    
    function canView(bytes32 _docId, address _user) external view returns (bool) {
        return _canView(_docId, _user);
    }
    
    function canEdit(bytes32 _docId, address _user) external view returns (bool) {
        return _canEdit(_docId, _user);
    }
    
    function isOwner(bytes32 _docId, address _user) external view returns (bool) {
        return _isOwner(_docId, _user);
    }
    
    // ============================================
    // INTERNAL HELPERS
    // ============================================
    
    function _canView(bytes32 _docId, address _user) internal view returns (bool) {
        DocumentRole role = _permissions[_docId][_user];
        return role != DocumentRole.NONE;
    }
    
    function _canEdit(bytes32 _docId, address _user) internal view returns (bool) {
        DocumentRole role = _permissions[_docId][_user];
        return role == DocumentRole.EDITOR || role == DocumentRole.OWNER;
    }
    
    function _isOwner(bytes32 _docId, address _user) internal view returns (bool) {
        return _documents[_docId].owner == _user;
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
