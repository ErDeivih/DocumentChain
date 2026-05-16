[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/jwt](../README.md) / verifyToken

# Function: verifyToken()

> **verifyToken**(`token`): [`JWTPayload`](../interfaces/JWTPayload.md)

Defined in: [config/jwt.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/jwt.ts#L36)

Verifica y decodifica un token JWT.

## Parameters

### token

`string`

Cadena del token JWT a verificar.

## Returns

[`JWTPayload`](../interfaces/JWTPayload.md)

Carga útil (payload) decodificada.

## Throws

Error si el token es inválido o ha expirado.
