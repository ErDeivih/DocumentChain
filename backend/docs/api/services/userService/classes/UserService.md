[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/userService](../README.md) / UserService

# Class: UserService

Defined in: [services/userService.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L37)

Servicio de gestión de perfiles de usuario.
Proporciona operaciones de consulta, búsqueda y actualización de datos de usuario.

## Constructors

### Constructor

> **new UserService**(): `UserService`

#### Returns

`UserService`

## Methods

### deleteUser()

> `static` **deleteUser**(`userId`): `Promise`\<`void`\>

Defined in: [services/userService.ts:296](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L296)

Eliminar un usuario (solo administradores).
Actualmente realiza borrado físico de la base de datos.

#### Parameters

##### userId

`string`

ID del usuario a eliminar

#### Returns

`Promise`\<`void`\>

***

### getAllUsers()

> `static` **getAllUsers**(`page?`, `limit?`): `Promise`\<\{ `page`: `number`; `total`: `number`; `totalPages`: `number`; `users`: [`UserProfile`](../interfaces/UserProfile.md)[]; \}\>

Defined in: [services/userService.ts:256](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L256)

Obtener todos los usuarios (solo administradores).

#### Parameters

##### page?

`number` = `1`

Número de página

##### limit?

`number` = `50`

Resultados por página

#### Returns

`Promise`\<\{ `page`: `number`; `total`: `number`; `totalPages`: `number`; `users`: [`UserProfile`](../interfaces/UserProfile.md)[]; \}\>

Lista paginada de usuarios

***

### getUserById()

> `static` **getUserById**(`userId`): `Promise`\<[`UserProfile`](../interfaces/UserProfile.md) \| `null`\>

Defined in: [services/userService.ts:43](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L43)

Obtener el perfil de un usuario por su ID.

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<[`UserProfile`](../interfaces/UserProfile.md) \| `null`\>

Perfil del usuario o null si no existe

***

### getUserByUsername()

> `static` **getUserByUsername**(`username`): `Promise`\<[`UserProfile`](../interfaces/UserProfile.md) \| `null`\>

Defined in: [services/userService.ts:91](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L91)

Obtener el perfil de un usuario por su nombre de usuario.

#### Parameters

##### username

`string`

Nombre de usuario

#### Returns

`Promise`\<[`UserProfile`](../interfaces/UserProfile.md) \| `null`\>

Perfil del usuario o null si no existe

***

### getUserPublicKey()

> `static` **getUserPublicKey**(`userId`): `Promise`\<`string` \| `null`\>

Defined in: [services/userService.ts:114](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L114)

Obtener la clave pública de un usuario para compartir documentos.

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<`string` \| `null`\>

Clave pública o null

***

### removeAvatar()

> `static` **removeAvatar**(`userId`): `Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

Defined in: [services/userService.ts:196](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L196)

Eliminar el avatar de un usuario.

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

Perfil actualizado

***

### searchUsers()

> `static` **searchUsers**(`query`, `limit?`): `Promise`\<`object`[]\>

Defined in: [services/userService.ts:223](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L223)

Buscar usuarios por nombre de usuario para compartir documentos.
Devuelve información limitada por privacidad.

#### Parameters

##### query

`string`

Texto de búsqueda

##### limit?

`number` = `10`

Máximo de resultados

#### Returns

`Promise`\<`object`[]\>

Lista de usuarios coincidentes

***

### updateAvatar()

> `static` **updateAvatar**(`userId`, `avatarUrl`): `Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

Defined in: [services/userService.ts:171](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L171)

Actualizar el avatar de un usuario.

#### Parameters

##### userId

`string`

ID del usuario

##### avatarUrl

`string`

URL de la nueva imagen de avatar

#### Returns

`Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

Perfil actualizado

***

### updateProfile()

> `static` **updateProfile**(`userId`, `updates`): `Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

Defined in: [services/userService.ts:129](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/userService.ts#L129)

Actualizar el perfil de un usuario.

#### Parameters

##### userId

`string`

ID del usuario

##### updates

Campos a actualizar

###### avatarUrl?

`string`

###### email?

`string`

###### fullName?

`string`

#### Returns

`Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

Perfil actualizado
