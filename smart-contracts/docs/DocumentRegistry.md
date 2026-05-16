# Solidity API

## DocumentRegistry

Registro descentralizado de documentos con control de versiones, firmas y permisos granulares.

_Contrato consolidado para la gestión completa del ciclo de vida de documentos sobre blockchain.
     Integra patrones de seguridad: ReentrancyGuard y control de roles.
     Las claves simétricas de los documentos no se almacenan en claro; únicamente se guarda su hash cifrado.

Características principales:
- Una transacción por operación para máxima eficiencia de UX.
- Roles de documentos como única fuente de verdad (VIEWER, EDITOR, OWNER).
- Listas de usuarios eficientes mediante EnumerableSet._

### ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

Rol de administrador del sistema. Permite la gestión de roles administrativos.

### DocumentRole

Niveles de permiso asignables a un usuario dentro de un documento.

_Se utiliza como única fuente de verdad para el control de acceso on-chain._

```solidity
enum DocumentRole {
  NONE,
  VIEWER,
  EDITOR,
  OWNER
}
```

### Document

Representa un documento registrado en la blockchain.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
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
```

### Version

Representa una versión concreta de un documento.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct Version {
  uint256 versionNumber;
  string ipfsCid;
  bytes32 encryptedKeyHash;
  address createdBy;
  uint256 createdAt;
  bool isOperational;
  uint256 restoredFrom;
}
```

### Signature

Representa una firma digital asociada a una versión de documento.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct Signature {
  address signer;
  bytes signature;
  string message;
  string comment;
  uint256 timestamp;
}
```

### DocumentCreated

```solidity
event DocumentCreated(bytes32 docId, address owner, string ipfsCid, uint256 timestamp)
```

Emite cuando se crea un nuevo documento.

### VersionCreated

```solidity
event VersionCreated(bytes32 docId, uint256 versionNumber, string ipfsCid, address createdBy, uint256 timestamp)
```

Emite cuando se crea una nueva versión de un documento existente.

### VersionRestored

```solidity
event VersionRestored(bytes32 docId, uint256 newVersionNumber, uint256 restoredFromVersion, address by, uint256 timestamp)
```

Emite cuando se restaura una versión anterior como nueva versión operativa.

### DocumentSigned

```solidity
event DocumentSigned(bytes32 docId, uint256 versionNumber, address signer, string message, uint256 timestamp)
```

Emite cuando un usuario firma una versión específica.

### DocumentShared

```solidity
event DocumentShared(bytes32 docId, address from, address to, enum DocumentRegistry.DocumentRole role, uint256 timestamp)
```

Emite cuando se comparte un documento con un nuevo usuario.

### PermissionRevoked

```solidity
event PermissionRevoked(bytes32 docId, address user, address by, uint256 timestamp)
```

Emite cuando se revoca el permiso de un usuario sobre un documento.

### OwnershipTransferred

```solidity
event OwnershipTransferred(bytes32 docId, address from, address to, uint256 timestamp)
```

Emite cuando se transfiere la propiedad de un documento.

### DocumentArchived

```solidity
event DocumentArchived(bytes32 docId, address by, bool archived, uint256 timestamp)
```

Emite cuando se archiva o desarchiva un documento.

### DocumentDeleted

```solidity
event DocumentDeleted(bytes32 docId, address by, uint256 timestamp)
```

Emite cuando se elimina lógicamente un documento.

### OperationalVersionChanged

```solidity
event OperationalVersionChanged(bytes32 docId, uint256 oldVersion, uint256 newVersion, address by, uint256 timestamp)
```

Emite cuando cambia la versión operativa activa.

### AdminRoleGranted

```solidity
event AdminRoleGranted(address admin, address by, uint256 timestamp)
```

Emite cuando se concede el rol de administrador a una cuenta.

### AdminRoleRevoked

```solidity
event AdminRoleRevoked(address admin, address by, uint256 timestamp)
```

Emite cuando se revoca el rol de administrador a una cuenta.

### constructor

```solidity
constructor() public
```

Inicializa el contrato estableciendo al desplegador como propietario y administrador.

_Otorga DEFAULT_ADMIN_ROLE y ADMIN_ROLE al creador para permitir la gestión inicial._

### notDeleted

```solidity
modifier notDeleted(bytes32 docId)
```

Verifica que el documento no esté eliminado.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| docId | bytes32 | Identificador del documento. |

### notArchived

```solidity
modifier notArchived(bytes32 docId)
```

Verifica que el documento no esté archivado.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| docId | bytes32 | Identificador del documento. |

### grantRole

```solidity
function grantRole(bytes32 role, address account) public virtual
```

Concede un rol a una cuenta, emitiendo evento adicional si es ADMIN_ROLE.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | Identificador del rol (keccak256 hash). |
| account | address | Dirección que recibirá el rol. |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) public virtual
```

Revoca un rol a una cuenta, emitiendo evento adicional si es ADMIN_ROLE.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | Identificador del rol. |
| account | address | Dirección a la que se revoca el rol. |

### createDocument

```solidity
function createDocument(bytes32 _docId, string _ipfsCid, bytes32 _encryptedKeyHash) external
```

Crea un nuevo documento en el registro con su versión inicial.

_Requiere: ID válido, CID no vacío y documento no existente previamente._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador único del documento (bytes32). |
| _ipfsCid | string | CID de IPFS del contenido cifrado del documento. |
| _encryptedKeyHash | bytes32 | Hash de la clave simétrica cifrada. |

### createVersion

```solidity
function createVersion(bytes32 _docId, string _ipfsCid, bytes32 _encryptedKeyHash) external
```

Crea una nueva versión de un documento existente.

_Requiere permisos de escritura (EDITOR u OWNER) y que el documento no esté archivado ni eliminado._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _ipfsCid | string | CID de IPFS del nuevo contenido cifrado. |
| _encryptedKeyHash | bytes32 | Hash de la nueva clave simétrica cifrada. |

### shareDocument

```solidity
function shareDocument(bytes32 _docId, address _user, enum DocumentRegistry.DocumentRole _role) external
```

Comparte un documento con otro usuario asignándole un rol.

_Solo el propietario puede compartir. No se permite compartir consigo mismo._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _user | address | Dirección del usuario destinatario. |
| _role | enum DocumentRegistry.DocumentRole | Rol a asignar (VIEWER o EDITOR). |

### signDocument

```solidity
function signDocument(bytes32 _docId, uint256 _versionNumber, bytes _signature, string _message, string _comment) external
```

Registra una firma digital sobre una versión concreta de un documento.

_Requiere permisos de lectura y que la versión sea válida. Cada usuario solo puede firmar una vez por versión._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _versionNumber | uint256 | Número de versión a firmar. |
| _signature | bytes | Datos de la firma criptográfica. |
| _message | string | Mensaje descriptivo de la firma. |
| _comment | string | Comentario opcional. |

### transferOwnership

```solidity
function transferOwnership(bytes32 _docId, address _newOwner) external
```

Transfiere la propiedad de un documento a otra dirección.

_El propietario anterior conserva rol de VIEWER._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _newOwner | address | Dirección del nuevo propietario. |

### setArchiveStatus

```solidity
function setArchiveStatus(bytes32 _docId, bool _archived) external
```

Archiva o desarchiva un documento.

_Solo el propietario puede modificar este estado. Un documento archivado no admite modificaciones._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _archived | bool | true para archivar, false para desarchivar. |

### deleteDocument

```solidity
function deleteDocument(bytes32 _docId) external
```

Marca un documento como eliminado lógicamente.

_La eliminación es lógica: los datos permanecen en blockchain pero se marcan como inaccesibles._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento a eliminar. |

### restoreVersion

```solidity
function restoreVersion(bytes32 _docId, uint256 _versionToRestore) external
```

Restaura una versión anterior creando una nueva versión operativa con idéntico contenido.

_Requiere permisos de escritura. La versión restaurada se convierte en la última versión operativa._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _versionToRestore | uint256 | Número de versión a restaurar. |

### setOperationalVersion

```solidity
function setOperationalVersion(bytes32 _docId, uint256 _versionNumber) external
```

Cambia la versión operativa activa sin crear una nueva versión.

_Útil para revertir a una versión previa sin generar historial adicional._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _versionNumber | uint256 | Número de versión que pasará a ser operativa. |

### revokePermission

```solidity
function revokePermission(bytes32 _docId, address _user) external
```

Revoca todos los permisos de un usuario sobre un documento.

_Solo el propietario puede revocar permisos. No se puede revocar al propietario mismo._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _user | address | Dirección del usuario afectado. |

### getDocument

```solidity
function getDocument(bytes32 _docId) external view returns (struct DocumentRegistry.Document)
```

Obtiene la información completa de un documento.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DocumentRegistry.Document | Estructura Document con todos sus campos. |

### getVersion

```solidity
function getVersion(bytes32 _docId, uint256 _versionNumber) external view returns (struct DocumentRegistry.Version)
```

Obtiene los datos de una versión específica.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _versionNumber | uint256 | Número de versión solicitada. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DocumentRegistry.Version | Estructura Version correspondiente. |

### getVersionSignatures

```solidity
function getVersionSignatures(bytes32 _docId, uint256 _versionNumber) external view returns (struct DocumentRegistry.Signature[])
```

Obtiene todas las firmas registradas sobre una versión.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _versionNumber | uint256 | Número de versión. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DocumentRegistry.Signature[] | Array de estructuras Signature. |

### getUserPermission

```solidity
function getUserPermission(bytes32 _docId, address _user) external view returns (enum DocumentRegistry.DocumentRole)
```

Consulta el rol de un usuario sobre un documento.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _user | address | Dirección del usuario. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | enum DocumentRegistry.DocumentRole | Rol asignado (NONE, VIEWER, EDITOR, OWNER). |

### getUserDocuments

```solidity
function getUserDocuments(address _user) external view returns (bytes32[])
```

Lista los identificadores de documentos accesibles por un usuario.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _user | address | Dirección del usuario. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32[] | Array de bytes32 con los docId. |

### getUserDocumentCount

```solidity
function getUserDocumentCount(address _user) external view returns (uint256)
```

Cuenta cuántos documentos tiene acceso un usuario.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _user | address | Dirección del usuario. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Cantidad de documentos accesibles. |

### getDocumentUsers

```solidity
function getDocumentUsers(bytes32 _docId) external view returns (address[])
```

Lista las direcciones con algún permiso sobre un documento.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | Array de direcciones. |

### totalDocuments

```solidity
function totalDocuments() external view returns (uint256)
```

Devuelve el número total de documentos creados en el sistema.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Contador total. |

### canView

```solidity
function canView(bytes32 _docId, address _user) external view returns (bool)
```

Verifica si un usuario tiene permisos de lectura sobre un documento.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _user | address | Dirección a verificar. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true si tiene permiso de lectura. |

### canEdit

```solidity
function canEdit(bytes32 _docId, address _user) external view returns (bool)
```

Verifica si un usuario tiene permisos de escritura sobre un documento.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _user | address | Dirección a verificar. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true si tiene permiso de escritura. |

### isOwner

```solidity
function isOwner(bytes32 _docId, address _user) external view returns (bool)
```

Verifica si una dirección es el propietario de un documento.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _docId | bytes32 | Identificador del documento. |
| _user | address | Dirección a verificar. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true si es el propietario. |

### _canView

```solidity
function _canView(bytes32 _docId, address _user) internal view returns (bool)
```

_Comprueba si un usuario tiene al menos permiso de lectura._

### _canEdit

```solidity
function _canEdit(bytes32 _docId, address _user) internal view returns (bool)
```

_Comprueba si un usuario tiene permiso de escritura._

### _isOwner

```solidity
function _isOwner(bytes32 _docId, address _user) internal view returns (bool)
```

_Comprueba si una dirección es el propietario del documento._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

Declaración de compatibilidad con interfaces ERC-165.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| interfaceId | bytes4 | Identificador de interfaz de 4 bytes. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true si la interfaz es soportada. |

