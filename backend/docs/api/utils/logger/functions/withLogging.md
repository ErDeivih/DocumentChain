[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/logger](../README.md) / withLogging

# Function: withLogging()

> **withLogging**\<`T`\>(`fn`, `context`): `T`

Defined in: [utils/logger.ts:355](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L355)

Envoltura que captura y registra automáticamente errores en funciones asíncronas.

## Type Parameters

### T

`T` *extends* (...`args`) => `Promise`\<`any`\>

## Parameters

### fn

`T`

Función asíncrona a envolver.

### context

`string`

Contexto descriptivo para los mensajes de log.

## Returns

`T`

Función envuelta con el mismo tipo que la original.
