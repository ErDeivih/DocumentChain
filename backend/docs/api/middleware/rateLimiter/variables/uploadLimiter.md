[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/rateLimiter](../README.md) / uploadLimiter

# Variable: uploadLimiter

> `const` **uploadLimiter**: `RateLimitRequestHandler`

Defined in: [middleware/rateLimiter.ts:55](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/rateLimiter.ts#L55)

Rate limiter para la subida de documentos (moderado).
Previene el abuso del almacenamiento limitando la cantidad de archivos subidos por hora.
