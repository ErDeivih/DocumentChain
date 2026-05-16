[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/errorHandler](../README.md) / asyncHandler

# Function: asyncHandler()

> **asyncHandler**(`fn`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/errorHandler.ts:164](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/errorHandler.ts#L164)

Envoltorio de errores asíncronos
Envuelve manejadores de ruta asíncronos para capturar errores

## Parameters

### fn

(`req`, `res`, `next`) => `Promise`\<`any`\>

## Returns

> (`req`, `res`, `next`): `void`

### Parameters

#### req

`Request`

#### res

`Response`

#### next

`NextFunction`

### Returns

`void`
