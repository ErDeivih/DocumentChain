[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/auth](../README.md) / requireBlockchainRead

# Function: requireBlockchainRead()

> **requireBlockchainRead**(`req`, `res`, `next`): `Promise`\<`void`\>

Defined in: [middleware/auth.ts:114](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/auth.ts#L114)

Middleware para verificar permiso de lectura en blockchain
Requiere que el documento tenga blockchainId en req.params o req.body

## Parameters

### req

`Request`

### res

`Response`

### next

`NextFunction`

## Returns

`Promise`\<`void`\>
