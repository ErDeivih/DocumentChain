[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/tokenService](../README.md) / TokenService

# Class: TokenService

Defined in: [services/tokenService.ts:38](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L38)

Servicio de generación, refresco y revocación de tokens JWT.
Gestiona sesiones de usuario mediante access tokens y refresh tokens.

## Constructors

### Constructor

> **new TokenService**(): `TokenService`

#### Returns

`TokenService`

## Methods

### cleanupExpiredTokens()

> `static` **cleanupExpiredTokens**(): `Promise`\<`number`\>

Defined in: [services/tokenService.ts:170](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L170)

Limpiar tokens expirados (cron job)

#### Returns

`Promise`\<`number`\>

***

### generateTokenPair()

> `static` **generateTokenPair**(`userId`, `username`, `role`): `Promise`\<[`TokenPair`](../interfaces/TokenPair.md)\>

Defined in: [services/tokenService.ts:42](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L42)

Generar par de tokens (access + refresh)

#### Parameters

##### userId

`string`

##### username

`string`

##### role

`string`

#### Returns

`Promise`\<[`TokenPair`](../interfaces/TokenPair.md)\>

***

### refreshAccessToken()

> `static` **refreshAccessToken**(`refreshToken`): `Promise`\<`Omit`\<[`TokenPair`](../interfaces/TokenPair.md), `"refreshToken"`\>\>

Defined in: [services/tokenService.ts:91](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L91)

Refrescar access token usando refresh token

#### Parameters

##### refreshToken

`string`

#### Returns

`Promise`\<`Omit`\<[`TokenPair`](../interfaces/TokenPair.md), `"refreshToken"`\>\>

***

### revokeAccessToken()

> `static` **revokeAccessToken**(`accessToken`): `Promise`\<`void`\>

Defined in: [services/tokenService.ts:159](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L159)

Revocar access token (logout alternativo)

#### Parameters

##### accessToken

`string`

#### Returns

`Promise`\<`void`\>

***

### revokeAllUserSessions()

> `static` **revokeAllUserSessions**(`userId`): `Promise`\<`number`\>

Defined in: [services/tokenService.ts:184](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L184)

Revocar todas las sesiones de un usuario

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`number`\>

***

### revokeRefreshToken()

> `static` **revokeRefreshToken**(`refreshToken`): `Promise`\<`void`\>

Defined in: [services/tokenService.ts:148](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/tokenService.ts#L148)

Revocar refresh token (logout)

#### Parameters

##### refreshToken

`string`

#### Returns

`Promise`\<`void`\>
