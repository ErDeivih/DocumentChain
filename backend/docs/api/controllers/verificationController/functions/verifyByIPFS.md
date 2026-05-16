[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/verificationController](../README.md) / verifyByIPFS

# Function: verifyByIPFS()

> **verifyByIPFS**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Defined in: [controllers/verificationController.ts:49](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/verificationController.ts#L49)

Verifica un documento a partir de su hash IPFS.
Endpoint: POST /api/verify/ipfs

## Parameters

### req

`Request`

Objeto de solicitud HTTP con { ipfsHash } en el cuerpo.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Promesa que resuelve con el resultado de la verificación.
