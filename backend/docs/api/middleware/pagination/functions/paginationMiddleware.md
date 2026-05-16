[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/pagination](../README.md) / paginationMiddleware

# Function: paginationMiddleware()

> **paginationMiddleware**(`req`, `res`, `next`): `void`

Defined in: [middleware/pagination.ts:12](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/pagination.ts#L12)

Middleware de paginación para estandarizar queries de listados.
Elimina código duplicado de parsing en controllers añadiendo un objeto
`pagination` a la solicitud con los valores calculados de página, límite y desplazamiento.

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

`void`
