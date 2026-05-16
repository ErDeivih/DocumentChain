[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/jwt](../README.md) / decodeToken

# Function: decodeToken()

> **decodeToken**(`token`): [`JWTPayload`](../interfaces/JWTPayload.md) \| `null`

Defined in: [config/jwt.ts:50](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/jwt.ts#L50)

Decodifica un token JWT sin verificar su firma (útil para depuración).

## Parameters

### token

`string`

Cadena del token JWT a decodificar.

## Returns

[`JWTPayload`](../interfaces/JWTPayload.md) \| `null`

Carga útil decodificada, o `null` si no se puede decodificar.
