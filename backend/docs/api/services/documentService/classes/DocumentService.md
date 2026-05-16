[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/documentService](../README.md) / DocumentService

# Class: DocumentService

Defined in: [services/documentService.ts:205](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L205)

Servicio principal para la gestión del ciclo de vida de los documentos.
Incluye preparación, confirmación, descarga, listado y rollback.

## Constructors

### Constructor

> **new DocumentService**(): `DocumentService`

#### Returns

`DocumentService`

## Methods

### confirmDocument()

> `static` **confirmDocument**(`input`): `Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)\>

Defined in: [services/documentService.ts:377](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L377)

Confirma un documento tras la firma de la transacción blockchain.
Actualiza el registro en BD a estado `TX_SUBMITTED` y, si es posible,
sincroniza inmediatamente a `SYNCED` a partir del receipt.

#### Parameters

##### input

[`ConfirmDocumentInput`](../interfaces/ConfirmDocumentInput.md)

Datos de confirmación (`documentId`, `txHash`, `blockchainId`).

#### Returns

`Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)\>

Información del documento actualizado.

#### Throws

Error si el documento no se encuentra o falta el CID de IPFS preparado.

***

### downloadDocument()

> `static` **downloadDocument**(`documentId`, `userId`): `Promise`\<\{ `encryptedFile`: `Buffer`; `encryptedSymmetricKey`: `string`; `encryptionAuthTag`: `string` \| `null`; `encryptionIV`: `string` \| `null`; `mimeType`: `string`; `name`: `string`; \}\>

Defined in: [services/documentService.ts:734](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L734)

Descarga un documento desde IPFS.
El descifrado se realiza en el frontend.

#### Parameters

##### documentId

`string`

UUID del documento.

##### userId

`string`

UUID del usuario solicitante.

#### Returns

`Promise`\<\{ `encryptedFile`: `Buffer`; `encryptedSymmetricKey`: `string`; `encryptionAuthTag`: `string` \| `null`; `encryptionIV`: `string` \| `null`; `mimeType`: `string`; `name`: `string`; \}\>

Buffer con el archivo cifrado y metadatos necesarios para el descifrado.

#### Throws

Error si el usuario no tiene acceso o el documento no tiene versión operacional.

***

### downloadPublicDocumentByPublicId()

> `static` **downloadPublicDocumentByPublicId**(`publicId`, `versionNumber?`): `Promise`\<\{ `file`: `Buffer`; `mimeType`: `string`; `name`: `string`; `versionNumber`: `number`; \}\>

Defined in: [services/documentService.ts:1011](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L1011)

Descarga un documento público por su `publicId`.

#### Parameters

##### publicId

`string`

Identificador público del documento.

##### versionNumber?

`number`

Número de versión opcional; si no se especifica, se descarga la versión operativa.

#### Returns

`Promise`\<\{ `file`: `Buffer`; `mimeType`: `string`; `name`: `string`; `versionNumber`: `number`; \}\>

Archivo descargado con nombre, tipo MIME y número de versión.

#### Throws

Error si el documento no es público o la versión solicitada no está disponible sin cifrado.

***

### getDocumentById()

> `static` **getDocumentById**(`documentId`, `userId`): `Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md) \| `null`\>

Defined in: [services/documentService.ts:600](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L600)

Obtiene un documento por su identificador interno.

#### Parameters

##### documentId

`string`

UUID del documento en BD.

##### userId

`string`

UUID del usuario solicitante.

#### Returns

`Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md) \| `null`\>

Información del documento o `null` si no existe o el usuario no tiene acceso.

***

### getDocumentsByWallet()

> `static` **getDocumentsByWallet**(`userId`, `walletId`): `Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)[]\>

Defined in: [services/documentService.ts:873](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L873)

Obtiene los documentos creados con una wallet específica.

#### Parameters

##### userId

`string`

UUID del usuario.

##### walletId

`string`

UUID de la wallet.

#### Returns

`Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)[]\>

Lista de documentos asociados a la wallet.

#### Throws

Error si la wallet no pertenece al usuario.

***

### getPublicDocumentByPublicId()

> `static` **getPublicDocumentByPublicId**(`publicId`): `Promise`\<[`PublicDocumentInfo`](../interfaces/PublicDocumentInfo.md) \| `null`\>

Defined in: [services/documentService.ts:911](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L911)

Obtiene la información pública de un documento por su `publicId`.

#### Parameters

##### publicId

`string`

Identificador público del documento.

#### Returns

`Promise`\<[`PublicDocumentInfo`](../interfaces/PublicDocumentInfo.md) \| `null`\>

Información pública del documento o `null` si no existe.

***

### listDocuments()

> `static` **listDocuments**(`userId`, `options?`): `Promise`\<[`PaginatedDocumentInfo`](../interfaces/PaginatedDocumentInfo.md)\>

Defined in: [services/documentService.ts:634](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L634)

Lista los documentos accesibles para un usuario con soporte de paginación y filtros.

#### Parameters

##### userId

`string`

UUID del usuario.

##### options?

Opciones de paginación, búsqueda y filtros (wallet, carpeta, archivados, tipo de archivo, etc.).

###### fileType?

`string`

###### folderId?

`string`

###### includeArchived?

`boolean`

###### limit?

`number`

###### onlyArchived?

`boolean`

###### page?

`number`

###### search?

`string`

###### walletId?

`string`

#### Returns

`Promise`\<[`PaginatedDocumentInfo`](../interfaces/PaginatedDocumentInfo.md)\>

Documentos paginados con metadatos de paginación.

***

### markDocumentFailed()

> `static` **markDocumentFailed**(`documentId`, `error`): `Promise`\<`void`\>

Defined in: [services/documentService.ts:1073](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L1073)

Marca un documento como fallido en blockchain.

#### Parameters

##### documentId

`string`

UUID del documento.

##### error

`string`

Mensaje de error descriptivo.

#### Returns

`Promise`\<`void`\>

***

### markDocumentSynced()

> `static` **markDocumentSynced**(`documentId`, `blockchainId`): `Promise`\<`void`\>

Defined in: [services/documentService.ts:1090](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L1090)

Actualiza el estado de un documento a `SYNCED`.

#### Parameters

##### documentId

`string`

UUID del documento.

##### blockchainId

`string`

Identificador en blockchain (bytes32).

#### Returns

`Promise`\<`void`\>

***

### prepareDocument()

> `static` **prepareDocument**(`input`): `Promise`\<[`PrepareDocumentResult`](../interfaces/PrepareDocumentResult.md)\>

Defined in: [services/documentService.ts:219](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L219)

Prepara un documento para su creación en blockchain.
Flujo:
1. Valida la wallet y obtiene la clave pública del usuario.
2. Valida el archivo (tamaño máximo 100 MB).
3. Cifra el archivo con AES-256-GCM (solo si es privado).
4. Sube el archivo a IPFS.
5. Crea el registro en BD con estado `PREPARING`.
6. Devuelve los datos necesarios para que el frontend firme la transacción blockchain.

#### Parameters

##### input

[`PrepareDocumentInput`](../interfaces/PrepareDocumentInput.md)

Datos de entrada para la preparación.

#### Returns

`Promise`\<[`PrepareDocumentResult`](../interfaces/PrepareDocumentResult.md)\>

Resultado de la preparación con `docId`, `ipfsCid`, `documentId` y `publicId`.

#### Throws

Error si la validación falla o ocurre un problema durante la preparación.

***

### rollbackDocument()

> `static` **rollbackDocument**(`documentId`, `userId`): `Promise`\<`void`\>

Defined in: [services/documentService.ts:1192](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L1192)

Revierte la creación de un documento.
Elimina el documento y sus versiones de la BD, desancla los CIDs de IPFS
y registra el evento. Se utiliza cuando la transacción blockchain falla tras la preparación.

#### Parameters

##### documentId

`string`

UUID del documento.

##### userId

`string`

UUID del usuario que solicita el rollback (debe ser el propietario).

#### Returns

`Promise`\<`void`\>

#### Throws

Error si el documento no existe o el usuario no es el propietario.

***

### userHasAccess()

> `static` **userHasAccess**(`documentId`, `userId`): `Promise`\<`boolean`\>

Defined in: [services/documentService.ts:829](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L829)

Verifica si un usuario tiene acceso a un documento.

#### Parameters

##### documentId

`string`

UUID del documento.

##### userId

`string`

UUID del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si tiene acceso, `false` en caso contrario.
