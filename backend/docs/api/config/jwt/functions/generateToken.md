[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/jwt](../README.md) / generateToken

# Function: generateToken()

> **generateToken**(`payload`): `string`

Defined in: [config/jwt.ts:25](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/jwt.ts#L25)

Genera un token JWT para un usuario autenticado.

## Parameters

### payload

[`JWTPayload`](../interfaces/JWTPayload.md)

Datos del usuario a codificar dentro del token.

## Returns

`string`

Cadena del token JWT firmado.
