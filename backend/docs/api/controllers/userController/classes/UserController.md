[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/userController](../README.md) / UserController

# Class: UserController

Defined in: [controllers/userController.ts:14](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L14)

Controlador de usuarios.
Gestiona el perfil, búsqueda, eliminación y avatar,
eliminación de cuenta de los usuarios del sistema.

## Constructors

### Constructor

> **new UserController**(): `UserController`

#### Returns

`UserController`

## Methods

### deleteMyAccount()

> `static` **deleteMyAccount**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:294](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L294)

Elimina la cuenta del usuario autenticado de forma permanente (self-service).
Endpoint: DELETE /api/users/me

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de eliminación de cuenta.

***

### deleteUser()

> `static` **deleteUser**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:187](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L187)

Elimina un usuario del sistema (solo administradores).
Endpoint: DELETE /api/users/:userId

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP. Los parámetros deben incluir el ID del usuario.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de eliminación.

***

### getAllUsers()

> `static` **getAllUsers**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:164](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L164)

Obtiene la lista paginada de todos los usuarios registrados (solo administradores).
Endpoint: GET /api/users

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP con { page?, limit? } en la query string.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista paginada de usuarios.

***

### getProfile()

> `static` **getProfile**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:23](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L23)

Obtiene el perfil completo del usuario autenticado.
Endpoint: GET /api/users/profile

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos del perfil.

***

### getUserById()

> `static` **getUserById**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:111](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L111)

Obtiene un usuario por su identificador único.
Endpoint: GET /api/users/:userId

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP. Los parámetros deben incluir el ID del usuario.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos del usuario.

***

### getUserByUsername()

> `static` **getUserByUsername**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:79](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L79)

Obtiene un usuario por su nombre de usuario (información limitada por privacidad).
Endpoint: GET /api/users/username/:username

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP. Los parámetros deben incluir el nombre de usuario.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con los datos públicos del usuario.

***

### removeAvatar()

> `static` **removeAvatar**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:261](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L261)

Elimina el avatar del usuario autenticado.
Endpoint: DELETE /api/users/me/avatar

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el usuario actualizado.

***

### searchUsers()

> `static` **searchUsers**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:136](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L136)

Busca usuarios por nombre de usuario o término de búsqueda.
Endpoint: GET /api/users/search

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP con { q | query, limit? } en la query string.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de usuarios coincidentes.

***

### updateAvatar()

> `static` **updateAvatar**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:207](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L207)

Actualiza el avatar del usuario autenticado.
Endpoint: PUT /api/users/me/avatar

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con el archivo de imagen.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el usuario actualizado.

***

### updateProfile()

> `static` **updateProfile**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/userController.ts:51](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/userController.ts#L51)

Actualiza el perfil del usuario autenticado.
Endpoint: PUT /api/users/profile

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { email?, fullName? } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el perfil actualizado.
