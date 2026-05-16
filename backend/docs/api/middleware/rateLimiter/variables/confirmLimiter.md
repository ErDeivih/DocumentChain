[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/rateLimiter](../README.md) / confirmLimiter

# Variable: confirmLimiter

> `const` **confirmLimiter**: `RateLimitRequestHandler`

Defined in: [middleware/rateLimiter.ts:164](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/rateLimiter.ts#L164)

Rate limiter para endpoints de confirmación (moderado).
Permite un límite ligeramente superior al de preparación, ya que las confirmaciones
deben seguir a las solicitudes de preparación.
