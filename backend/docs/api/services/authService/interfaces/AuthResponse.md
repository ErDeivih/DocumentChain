[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/authService](../README.md) / AuthResponse

# Interface: AuthResponse

Defined in: [services/authService.ts:58](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L58)

Respuesta de autenticación con tokens y datos del usuario.

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [services/authService.ts:59](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L59)

***

### expiresIn

> **expiresIn**: `number`

Defined in: [services/authService.ts:61](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L61)

***

### recoveryKey?

> `optional` **recoveryKey**: `string`

Defined in: [services/authService.ts:62](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L62)

***

### refreshToken

> **refreshToken**: `string`

Defined in: [services/authService.ts:60](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L60)

***

### user

> **user**: `object`

Defined in: [services/authService.ts:63](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L63)

#### avatarUrl

> **avatarUrl**: `string` \| `null`

#### createdAt

> **createdAt**: `Date`

#### email

> **email**: `string`

#### emailVerified

> **emailVerified**: `boolean`

#### encryptedPrivateKey?

> `optional` **encryptedPrivateKey**: `string`

#### fullName

> **fullName**: `string` \| `null`

#### id

> **id**: `string`

#### lastLogin

> **lastLogin**: `null`

#### publicKey

> **publicKey**: `string`

#### role

> **role**: `string`

#### username

> **username**: `string`
