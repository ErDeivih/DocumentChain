[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/documentController](../README.md) / DocumentController

# Class: DocumentController

Defined in: [controllers/documentController.ts:24](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L24)

Controlador de gestión de documentos.
Gestiona el ciclo de vida completo de los documentos: creación, consulta,
descarga, archivado, eliminación, transferencia y restauración.

## Constructors

### Constructor

> **new DocumentController**(): `DocumentController`

#### Returns

`DocumentController`

## Methods

### confirmArchiveDocument()

> `static` **confirmArchiveDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:452](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L452)

Confirma el archivado de un documento tras la transacción en blockchain.
Endpoint: POST /api/documents/:documentId/archive/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { txHash } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el documento archivado.

***

### confirmDeleteDocument()

> `static` **confirmDeleteDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:589](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L589)

Confirma la eliminación de un documento tras la transacción en blockchain.
Endpoint: POST /api/documents/:documentId/delete/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { txHash } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de eliminación.

***

### confirmDocument()

> `static` **confirmDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:183](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L183)

Confirma la creación de un documento tras la transacción en blockchain.
Endpoint: POST /api/documents/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { documentId, txHash, blockchainId }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el documento confirmado.

***

### confirmTransferDocument()

> `static` **confirmTransferDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:877](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L877)

Confirma la transferencia de un documento tras la transacción en blockchain.
Endpoint: POST /api/documents/:documentId/transfer/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { txHash, transferId, signature? }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de transferencia.

***

### confirmUnarchiveDocument()

> `static` **confirmUnarchiveDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:688](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L688)

Confirma la desarchivación de un documento tras la transacción en blockchain.
Endpoint: POST /api/documents/:documentId/unarchive/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { txHash } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el documento desarchivado.

***

### ~~createDocument()~~

> `static` **createDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:924](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L924)

Crea un documento mediante el endpoint legado.

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

Utilizar /prepare + /confirm en su lugar.
Endpoint: POST /api/documents

***

### downloadDocument()

> `static` **downloadDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:271](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L271)

Descarga un documento (devuelve el archivo cifrado).
Si la clave simétrica cifrada es 'UNENCRYPTED', el archivo es público.
Endpoint: GET /api/documents/:documentId/download

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP con el archivo adjunto.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el flujo de descarga del documento.

***

### getDocument()

> `static` **getDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:237](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L237)

Obtiene un documento por su identificador.
Endpoint: GET /api/documents/:documentId

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos del documento.

***

### getDocumentsByWallet()

> `static` **getDocumentsByWallet**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:365](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L365)

Obtiene los documentos asociados a una wallet específica.
Endpoint: GET /api/documents/wallet/:walletId

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la wallet.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los documentos de la wallet.

***

### listDocuments()

> `static` **listDocuments**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:326](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L326)

Lista los documentos accesibles para el usuario autenticado.
Permite filtrar por wallet, estado de archivado, término de búsqueda y tipo de archivo.
Endpoint: GET /api/documents

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con filtros en la query string.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista paginada de documentos.

***

### prepareArchiveDocument()

> `static` **prepareArchiveDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:393](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L393)

Prepara el archivado de un documento (fase de preparación).
Endpoint: POST /api/documents/:documentId/archive/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos necesarios para la transacción en blockchain.

***

### prepareDeleteDocument()

> `static` **prepareDeleteDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:525](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L525)

Prepara la eliminación de un documento (fase de preparación).
Endpoint: POST /api/documents/:documentId/delete/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos necesarios para la transacción en blockchain.

***

### prepareDocument()

> `static` **prepareDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:114](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L114)

Prepara un documento para su creación.
El frontend envía el archivo en bruto; el backend decide si cifrarlo
en función de la visibilidad del documento.
Endpoint: POST /api/documents/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con el archivo y metadatos.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el resultado de la preparación del documento.

***

### prepareTransferDocument()

> `static` **prepareTransferDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:824](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L824)

Prepara la transferencia de un documento a otro usuario (fase de preparación).
Endpoint: POST /api/documents/:documentId/transfer/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con los datos del destinatario y la wallet.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el resultado de la preparación de la transferencia.

***

### prepareUnarchiveDocument()

> `static` **prepareUnarchiveDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:625](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L625)

Prepara la desarchivación de un documento (fase de preparación).
Endpoint: POST /api/documents/:documentId/unarchive/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos necesarios para la transacción en blockchain.

***

### rollbackDocument()

> `static` **rollbackDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:963](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L963)

Revierte la creación de un documento eliminando registros y desanclando de IPFS.
Se utiliza cuando la transacción blockchain falla tras la fase de preparación.
Endpoint: POST /api/documents/:documentId/rollback

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de reversión.

***

### updateDocument()

> `static` **updateDocument**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/documentController.ts:760](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/documentController.ts#L760)

Actualiza los metadatos de un documento sin operación en blockchain.
Endpoint: PUT /api/documents/:documentId

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con los campos a actualizar en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el documento actualizado.
