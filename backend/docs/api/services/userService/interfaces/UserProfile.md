[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/userService](../README.md) / UserProfile

# Interface: UserProfile

Defined in: [services/userService.ts:15](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L15)

Perfil público de un usuario.

## Properties

### avatarUrl?

> `optional` **avatarUrl**: `string` \| `null`

Defined in: [services/userService.ts:22](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L22)

URL del avatar

***

### createdAt

> **createdAt**: `Date`

Defined in: [services/userService.ts:23](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L23)

Fecha de registro

***

### email

> **email**: `string`

Defined in: [services/userService.ts:18](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L18)

Correo electrónico

***

### fullName

> **fullName**: `string` \| `null`

Defined in: [services/userService.ts:19](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L19)

Nombre completo

***

### id

> **id**: `string`

Defined in: [services/userService.ts:16](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L16)

ID del usuario

***

### publicKey

> **publicKey**: `string`

Defined in: [services/userService.ts:21](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L21)

Clave pública para compartición segura

***

### role

> **role**: `string`

Defined in: [services/userService.ts:20](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L20)

Rol en el sistema

***

### username

> **username**: `string`

Defined in: [services/userService.ts:17](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L17)

Nombre de usuario único

***

### wallets?

> `optional` **wallets**: `object`[]

Defined in: [services/userService.ts:24](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L24)

Carteras asociadas al usuario

#### address

> **address**: `string`

#### id

> **id**: `string`

#### isPrimary

> **isPrimary**: `boolean`

#### label

> **label**: `string` \| `null`
