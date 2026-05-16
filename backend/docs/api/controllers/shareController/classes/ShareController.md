[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/shareController](../README.md) / ShareController

# Class: ShareController

Defined in: [controllers/shareController.ts:44](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L44)

Controlador de compartidos.
Gestiona la preparación, confirmación, revocación y consulta de permisos
de acceso compartido sobre documentos entre usuarios.

## Constructors

### Constructor

> **new ShareController**(): `ShareController`

#### Returns

`ShareController`

## Methods

### checkPermission()

> `static` **checkPermission**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/shareController.ts:511](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L511)

Verifica si el usuario tiene un permiso específico sobre un documento.
Endpoint: GET /api/documents/:documentId/permissions/check

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con el rol a verificar en la query string.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con un indicador booleano de permiso.

***

### confirmRevokeShare()

> `static` **confirmRevokeShare**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/shareController.ts:235](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L235)

Confirma la revocación de un compartido tras la transacción en blockchain.
Endpoint: POST /api/documents/:documentId/share/:userId/revoke/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { txHash, shareId }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de revocación.

***

### confirmShare()

> `static` **confirmShare**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/shareController.ts:136](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L136)

Confirma un compartido tras la transacción en blockchain.
Endpoint: POST /api/documents/:documentId/share/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { shareId, txHash }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el compartido confirmado.

***

### getDocumentShares()

> `static` **getDocumentShares**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/shareController.ts:277](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L277)

Obtiene la lista de compartidos de un documento específico.
Endpoint: GET /api/documents/:documentId/shares

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de compartidos.

***

### getMyRole()

> `static` **getMyRole**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/shareController.ts:442](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L442)

Obtiene el rol del usuario autenticado sobre un documento específico.
Endpoint: GET /api/documents/:documentId/my-role

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el rol del usuario (OWNER, SHARED_WRITE, SHARED_READ o null).

***

### getSharedWithMe()

> `static` **getSharedWithMe**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/shareController.ts:313](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L313)

Obtiene los documentos que han sido compartidos con el usuario autenticado.
Endpoint: GET /api/shares/with-me

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con filtros de paginación y búsqueda.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los documentos compartidos paginados.

***

### prepareRevokeShare()

> `static` **prepareRevokeShare**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/shareController.ts:188](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L188)

Prepara la revocación de un compartido (fase de preparación).
Endpoint: POST /api/documents/:documentId/share/:userId/revoke/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { sharerWalletId }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos necesarios para la transacción en blockchain.

***

### prepareShare()

> `static` **prepareShare**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/shareController.ts:59](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/shareController.ts#L59)

Prepara un compartido para su creación.
El frontend envía la clave simétrica descifrada por HTTPS;
el backend la recifra para el destinatario y crea el registro PREPARING.
Endpoint: POST /api/documents/:documentId/share/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con los datos del destinatario y la clave.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el resultado de la preparación del compartido.
