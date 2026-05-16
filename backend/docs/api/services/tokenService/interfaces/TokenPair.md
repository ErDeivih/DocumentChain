[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/tokenService](../README.md) / TokenPair

# Interface: TokenPair

Defined in: [services/tokenService.ts:28](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L28)

Par de tokens generados durante la autenticación.

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [services/tokenService.ts:29](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L29)

Token de acceso de corta duración

***

### expiresIn

> **expiresIn**: `number`

Defined in: [services/tokenService.ts:31](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L31)

Tiempo de expiración del access token en segundos

***

### refreshToken

> **refreshToken**: `string`

Defined in: [services/tokenService.ts:30](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L30)

Token de refresco de larga duración
