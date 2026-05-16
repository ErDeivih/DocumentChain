[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/isAdmin](../README.md) / isAdmin

# Function: isAdmin()

> **isAdmin**(`req`, `res`, `next`): `Promise`\<`void`\>

Defined in: [middleware/isAdmin.ts:12](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/isAdmin.ts#L12)

Middleware que verifica si el usuario autenticado posee el rol de administrador.

## Parameters

### req

`Request`

Objeto de solicitud de Express.

### res

`Response`

Objeto de respuesta de Express.

### next

`NextFunction`

Función para pasar el control al siguiente middleware.

## Returns

`Promise`\<`void`\>

Promesa que se resuelve en void.
