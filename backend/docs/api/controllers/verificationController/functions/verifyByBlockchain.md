[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/verificationController](../README.md) / verifyByBlockchain

# Function: verifyByBlockchain()

> **verifyByBlockchain**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Defined in: [controllers/verificationController.ts:82](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/verificationController.ts#L82)

Verifica un documento a partir de su identificador en blockchain.
Endpoint: POST /api/verify/blockchain

## Parameters

### req

`Request`

Objeto de solicitud HTTP con { blockchainId } en el cuerpo.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Promesa que resuelve con el resultado de la verificación.
