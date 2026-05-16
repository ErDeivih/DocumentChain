[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/validator](../README.md) / validateParams

# Function: validateParams()

> **validateParams**(`schema`): (`req`, `res`, `next`) => `Promise`\<`void`\>

Defined in: [middleware/validator.ts:41](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L41)

Middleware para validar los parámetros de ruta (params) de la solicitud mediante un esquema Zod.

## Parameters

### schema

`ZodType`

Esquema Zod a utilizar para la validación.

## Returns

Middleware de Express que valida `req.params`.

> (`req`, `res`, `next`): `Promise`\<`void`\>

### Parameters

#### req

`Request`

#### res

`Response`

#### next

`NextFunction`

### Returns

`Promise`\<`void`\>
