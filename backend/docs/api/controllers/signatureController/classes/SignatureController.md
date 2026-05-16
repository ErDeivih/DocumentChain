[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/signatureController](../README.md) / SignatureController

# Class: SignatureController

Defined in: [controllers/signatureController.ts:21](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L21)

Controlador de firmas digitales.
Gestiona la preparación, confirmación, consulta y reversión de firmas
asociadas a versiones de documentos.

## Constructors

### Constructor

> **new SignatureController**(): `SignatureController`

#### Returns

`SignatureController`

## Methods

### checkSignature()

> `static` **checkSignature**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/signatureController.ts:194](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L194)

Verifica si el usuario autenticado ha firmado una versión específica.
Endpoint: GET /api/versions/:versionId/signatures/check

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con un indicador booleano.

***

### confirmSignature()

> `static` **confirmSignature**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/signatureController.ts:91](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L91)

Confirma una firma tras la transacción en blockchain.
Endpoint: POST /api/signatures/confirm

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { signatureId, txHash, ecdsaSignature }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la firma confirmada.

***

### getDocumentSignatures()

> `static` **getDocumentSignatures**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/signatureController.ts:170](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L170)

Obtiene todas las firmas asociadas a un documento.
Endpoint: GET /api/documents/:documentId/signatures

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de firmas del documento.

***

### getMySignature()

> `static` **getMySignature**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/signatureController.ts:218](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L218)

Obtiene la firma del usuario autenticado para una versión específica.
Endpoint: GET /api/versions/:versionId/signatures/me

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la firma del usuario o un error 404.

***

### getVersionSignatures()

> `static` **getVersionSignatures**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/signatureController.ts:146](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L146)

Obtiene todas las firmas asociadas a una versión específica.
Endpoint: GET /api/versions/:versionId/signatures

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de firmas.

***

### getVersionSignaturesByNumber()

> `static` **getVersionSignaturesByNumber**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/signatureController.ts:276](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L276)

Obtiene las firmas de una versión específica identificada por su número.
Endpoint: GET /api/documents/:documentId/versions/:versionNumber/signatures

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento y el número de versión.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de firmas de la versión.

***

### prepareSignature()

> `static` **prepareSignature**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/signatureController.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L36)

Prepara una firma para su creación.
El frontend solicita firmar una versión de documento;
el backend crea el registro en estado PREPARING.
Endpoint: POST /api/signatures/prepare

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { documentId, versionNumber, walletId }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el resultado de la preparación de la firma.

***

### rollbackSignature()

> `static` **rollbackSignature**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/signatureController.ts:248](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/signatureController.ts#L248)

Revierte una firma en estado PREPARING eliminando su registro.
Endpoint: POST /api/signatures/:signatureId/rollback

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la firma.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de reversión.
