[**DecentralizedFS Backend API v1.0.0**](../../../../README.md)

***

[DecentralizedFS Backend API](../../../../modules.md) / [lib/blockchain/queries](../README.md) / BlockchainQueries

# Class: BlockchainQueries

Defined in: [lib/blockchain/queries.ts:54](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L54)

Clase de utilidades para realizar consultas a los smart contracts de DocumentChain.
Provee métodos estáticos para obtener documentos, versiones, firmas y permisos directamente desde la blockchain.

## Constructors

### Constructor

> **new BlockchainQueries**(): `BlockchainQueries`

#### Returns

`BlockchainQueries`

## Methods

### canRead()

> `static` **canRead**(`blockchainId`, `userAddress`): `Promise`\<`boolean`\>

Defined in: [lib/blockchain/queries.ts:379](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L379)

Verifica si un usuario puede leer un documento.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si el usuario tiene permiso de lectura, `false` en caso contrario.

***

### canShare()

> `static` **canShare**(`blockchainId`, `userAddress`): `Promise`\<`boolean`\>

Defined in: [lib/blockchain/queries.ts:461](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L461)

Verifica si un usuario puede compartir un documento.
Solo el propietario puede compartir documentos.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si el usuario puede compartir, `false` en caso contrario.

***

### canSign()

> `static` **canSign**(`blockchainId`, `userAddress`): `Promise`\<`boolean`\>

Defined in: [lib/blockchain/queries.ts:420](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L420)

Verifica si un usuario puede firmar un documento.
Cualquier usuario con permiso de lectura puede firmar.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si el usuario puede firmar, `false` en caso contrario.

***

### canWrite()

> `static` **canWrite**(`blockchainId`, `userAddress`): `Promise`\<`boolean`\>

Defined in: [lib/blockchain/queries.ts:399](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L399)

Verifica si un usuario puede escribir en un documento.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si el usuario tiene permiso de escritura, `false` en caso contrario.

***

### getAllVersions()

> `static` **getAllVersions**(`blockchainId`): `Promise`\<[`BlockchainVersion`](../interfaces/BlockchainVersion.md)[]\>

Defined in: [lib/blockchain/queries.ts:105](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L105)

Obtiene todas las versiones de un documento desde la blockchain.
Itera desde la versión 1 hasta la última registrada.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

#### Returns

`Promise`\<[`BlockchainVersion`](../interfaces/BlockchainVersion.md)[]\>

Lista de versiones del documento.

#### Throws

NotFoundError si el documento no existe.

#### Throws

BlockchainError si ocurre un error durante la consulta.

***

### getDocument()

> `static` **getDocument**(`blockchainId`): `Promise`\<[`BlockchainDocument`](../interfaces/BlockchainDocument.md)\>

Defined in: [lib/blockchain/queries.ts:62](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L62)

Obtiene los datos de un documento desde la blockchain.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain (bytes32).

#### Returns

`Promise`\<[`BlockchainDocument`](../interfaces/BlockchainDocument.md)\>

Objeto con la información del documento.

#### Throws

NotFoundError si el documento no existe (owner es la dirección cero).

#### Throws

BlockchainError si ocurre un error durante la consulta.

***

### getOperationalVersion()

> `static` **getOperationalVersion**(`blockchainId`): `Promise`\<[`BlockchainVersion`](../interfaces/BlockchainVersion.md) \| `null`\>

Defined in: [lib/blockchain/queries.ts:202](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L202)

Obtiene la versión operativa de un documento.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

#### Returns

`Promise`\<[`BlockchainVersion`](../interfaces/BlockchainVersion.md) \| `null`\>

La versión marcada como operativa, o `null` si no existe.

#### Throws

BlockchainError si ocurre un error durante la consulta.

***

### getSignature()

> `static` **getSignature**(`blockchainId`, `versionNumber`, `signerAddress`): `Promise`\<[`BlockchainSignature`](../interfaces/BlockchainSignature.md)\>

Defined in: [lib/blockchain/queries.ts:272](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L272)

Obtiene una firma específica desde la blockchain.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### versionNumber

`number`

Número de versión a consultar.

##### signerAddress

`string`

Dirección Ethereum del firmante.

#### Returns

`Promise`\<[`BlockchainSignature`](../interfaces/BlockchainSignature.md)\>

Información de la firma solicitada.

#### Throws

NotFoundError si la firma no existe.

#### Throws

BlockchainError si ocurre un error durante la consulta.

***

### getUserDocuments()

> `static` **getUserDocuments**(`userAddress`): `Promise`\<`string`[]\>

Defined in: [lib/blockchain/queries.ts:481](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L481)

Obtiene los documentos asociados a un usuario (propios y compartidos).
Filtra únicamente aquellos documentos para los que el usuario tiene permiso de lectura activo.

#### Parameters

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`string`[]\>

Lista de identificadores de documento en la blockchain.

***

### getUserRole()

> `static` **getUserRole**(`blockchainId`, `userAddress`): `Promise`\<`string` \| `null`\>

Defined in: [lib/blockchain/queries.ts:351](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L351)

Obtiene el rol de un usuario para un documento específico.
Utiliza `getUserPermission()` del contrato DocumentRegistry (arquitectura de contrato único).
La implementación anterior utilizaba incorrectamente `AccessControl.hasRole()` con nombres de rol inventados;
los permisos de documentos se gestionan a través del mapping `_permissions`, no mediante AccessControl.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`string` \| `null`\>

Rol del usuario (`DOCUMENT_OWNER`, `DOCUMENT_SHARED_WRITE`, `DOCUMENT_SHARED_READ`) o `null`.

***

### getVersion()

> `static` **getVersion**(`blockchainId`, `versionNumber`): `Promise`\<[`BlockchainVersion`](../interfaces/BlockchainVersion.md)\>

Defined in: [lib/blockchain/queries.ts:158](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L158)

Obtiene los datos de una versión específica desde la blockchain.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### versionNumber

`number`

Número de versión a consultar.

#### Returns

`Promise`\<[`BlockchainVersion`](../interfaces/BlockchainVersion.md)\>

Información de la versión solicitada.

#### Throws

NotFoundError si la versión no existe (createdBy es la dirección cero).

#### Throws

BlockchainError si ocurre un error durante la consulta.

***

### getVersionSignatures()

> `static` **getVersionSignatures**(`blockchainId`, `versionNumber`): `Promise`\<[`BlockchainSignature`](../interfaces/BlockchainSignature.md)[]\>

Defined in: [lib/blockchain/queries.ts:227](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L227)

Obtiene todas las firmas asociadas a una versión desde la blockchain.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### versionNumber

`number`

Número de versión a consultar.

#### Returns

`Promise`\<[`BlockchainSignature`](../interfaces/BlockchainSignature.md)[]\>

Lista de firmas registradas para la versión.

#### Throws

BlockchainError si ocurre un error durante la consulta.

***

### hasUserSigned()

> `static` **hasUserSigned**(`blockchainId`, `versionNumber`, `signerAddress`): `Promise`\<`boolean`\>

Defined in: [lib/blockchain/queries.ts:317](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L317)

Verifica si un usuario ha firmado una versión específica.
Dado que el contrato no expone un getter directo, se obtienen todas las firmas de la versión y se busca la dirección.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### versionNumber

`number`

Número de versión a consultar.

##### signerAddress

`string`

Dirección Ethereum del posible firmante.

#### Returns

`Promise`\<`boolean`\>

`true` si el usuario ha firmado la versión, `false` en caso contrario.

***

### isOwner()

> `static` **isOwner**(`blockchainId`, `userAddress`): `Promise`\<`boolean`\>

Defined in: [lib/blockchain/queries.ts:440](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/blockchain/queries.ts#L440)

Verifica si un usuario es propietario de un documento.

#### Parameters

##### blockchainId

`string`

Identificador del documento en la blockchain.

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si el usuario es propietario, `false` en caso contrario.
