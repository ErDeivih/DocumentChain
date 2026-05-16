[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/rateLimiter](../README.md) / blockchainLimiter

# Variable: blockchainLimiter

> `const` **blockchainLimiter**: `RateLimitRequestHandler`

Defined in: [middleware/rateLimiter.ts:115](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/rateLimiter.ts#L115)

Rate limiter para operaciones blockchain (muy restrictivo).
Limita las consultas a la cadena de bloques dado su elevado coste computacional.
