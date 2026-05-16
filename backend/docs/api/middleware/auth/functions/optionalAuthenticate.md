[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/auth](../README.md) / optionalAuthenticate

# Function: optionalAuthenticate()

> **optionalAuthenticate**(`req`, `res`, `next`): `Promise`\<`void`\>

Defined in: [middleware/auth.ts:82](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/auth.ts#L82)

Autenticación opcional - no falla si no se proporciona token
Útil para endpoints que funcionan diferente para usuarios autenticados

## Parameters

### req

`Request`

### res

`Response`

### next

`NextFunction`

## Returns

`Promise`\<`void`\>
