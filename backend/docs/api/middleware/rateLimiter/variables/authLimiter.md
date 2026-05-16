[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/rateLimiter](../README.md) / authLimiter

# Variable: authLimiter

> `const` **authLimiter**: `RateLimitRequestHandler`

Defined in: [middleware/rateLimiter.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/rateLimiter.ts#L36)

Rate limiter para endpoints de autenticación (estricto).
Protege contra ataques de fuerza bruta limitando los intentos de inicio de sesión.
