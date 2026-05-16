[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/versionController](../README.md) / VersionController

# Class: VersionController

Defined in: [controllers/versionController.ts:20](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L20)

Controlador de versiones de documentos.
Gestiona la creación, restauración, consulta, descarga y reversión
de versiones asociadas a un documento.

## Constructors

### Constructor

> **new VersionController**(): `VersionController`

#### Returns

`VersionController`

## Methods

### confirmRestoreVersion()

> `static` **confirmRestoreVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:180](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L180)

Confirma la restauración de una versión tras la transacción en blockchain.
Endpoint: POST /api/versions/:versionId/restore/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { txHash }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la versión restaurada.

***

### confirmSetOperational()

> `static` **confirmSetOperational**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:328](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L328)

Confirma el cambio de versión operacional tras la transacción en blockchain.
Endpoint: POST /api/documents/:documentId/operational-version/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { versionNumber, txHash }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación del cambio operacional.

***

### confirmVersion()

> `static` **confirmVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:83](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L83)

Confirma la creación de una versión tras la transacción en blockchain.
Endpoint: POST /api/documents/:documentId/versions/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { versionId, txHash, blockchainId }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la versión confirmada.

***

### ~~createVersion()~~

> `static` **createVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:258](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L258)

Crea una nueva versión mediante el endpoint legado.

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con un error indicando la deprecación.

#### Deprecated

Utilizar /versions/prepare + /versions/confirm en su lugar.
Endpoint: POST /api/documents/:documentId/versions

***

### downloadVersion()

> `static` **downloadVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:437](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L437)

Descarga una versión específica (devuelve el archivo cifrado).
Endpoint: GET /api/versions/:versionId/download

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.

##### res

`Response`

Objeto de respuesta HTTP con el archivo adjunto.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el flujo de descarga de la versión.

***

### getVersion()

> `static` **getVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:407](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L407)

Obtiene una versión específica por su identificador.
Endpoint: GET /api/versions/:versionId

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos de la versión.

***

### getVersions()

> `static` **getVersions**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:225](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L225)

Obtiene todas las versiones de un documento.
Endpoint: GET /api/documents/:documentId/versions

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de versiones.

***

### prepareRestoreVersion()

> `static` **prepareRestoreVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:133](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L133)

Prepara la restauración de una versión anterior (fase de preparación).
Endpoint: POST /api/documents/:documentId/versions/restore/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { versionNumber, walletId? }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos necesarios para la transacción en blockchain.

***

### prepareSetOperational()

> `static` **prepareSetOperational**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:289](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L289)

Prepara el cambio de versión operacional de un documento (fase de preparación on-chain).
Endpoint: POST /api/documents/:documentId/operational-version/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { versionNumber }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos necesarios para la transacción en blockchain.

***

### prepareVersion()

> `static` **prepareVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:35](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L35)

Prepara una nueva versión para su creación.
El frontend envía el archivo ya cifrado junto con los metadatos de cifrado;
el backend lo sube a IPFS y crea el registro en estado PREPARING.
Endpoint: POST /api/documents/:documentId/versions/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con el archivo y { comment, walletId }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el resultado de la preparación de la versión.

***

### ~~restoreVersion()~~

> `static` **restoreVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:377](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L377)

Restaura una versión anterior creando una nueva versión con el contenido antiguo (legado).

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con un error indicando la deprecación.

#### Deprecated

Utilizar /versions/restore/prepare + /versions/restore/confirm en su lugar.
Endpoint: POST /api/documents/:documentId/versions/:versionId/restore

***

### rollbackVersion()

> `static` **rollbackVersion**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:480](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L480)

Revierte la creación de una versión eliminando el registro y desanclando de IPFS.
Se utiliza cuando la transacción blockchain falla tras la fase de preparación.
Endpoint: POST /api/versions/:versionId/rollback

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de reversión.

***

### rollbackVersionRestore()

> `static` **rollbackVersionRestore**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/versionController.ts:507](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/versionController.ts#L507)

Revierte una restauración de versión eliminando el registro pero preservando IPFS.
Se utiliza cuando la transacción blockchain falla tras la fase de preparación de restauración.
Endpoint: POST /api/versions/:versionId/rollback-restore

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de reversión.
