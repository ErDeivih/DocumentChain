[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/verificationController](../README.md) / verifyByFile

# Function: verifyByFile()

> **verifyByFile**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Defined in: [controllers/verificationController.ts:18](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/verificationController.ts#L18)

Verifica un documento subiendo su archivo para comparar el hash.
Endpoint: POST /api/verify/file

## Parameters

### req

`Request`

Objeto de solicitud HTTP con el archivo en multipart/form-data.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Promesa que resuelve con el resultado de la verificación.
