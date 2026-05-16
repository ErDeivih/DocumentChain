[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/rateLimiter](../README.md) / prepareLimiter

# Variable: prepareLimiter

> `const` **prepareLimiter**: `RateLimitRequestHandler`

Defined in: [middleware/rateLimiter.ts:144](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/rateLimiter.ts#L144)

Rate limiter para endpoints de preparación (restrictivo).
Previene el abuso del patrón prepare/confirm limitando la cantidad de transacciones
que un usuario puede preparar por minuto.
