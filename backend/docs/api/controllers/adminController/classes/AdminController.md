[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/adminController](../README.md) / AdminController

# Class: AdminController

Defined in: [controllers/adminController.ts:15](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/adminController.ts#L15)

Controlador de administración.
Gestiona las operaciones exclusivas de los administradores del sistema,
incluyendo la gestión de usuarios, estadísticas del sistema, control de
pausa de emergencia (circuit breaker) y sincronización con blockchain.

## Constructors

### Constructor

> **new AdminController**(): `AdminController`

#### Returns

`AdminController`

## Methods

### createAdminUser()

> `static` **createAdminUser**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/adminController.ts:157](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/adminController.ts#L157)

Crea un nuevo usuario con rol de administrador.
Endpoint: POST /api/admin/users

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP. El cuerpo debe contener { username, email, password, fullName? }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el administrador creado y su clave de recuperación.

***

### deleteUser()

> `static` **deleteUser**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/adminController.ts:263](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/adminController.ts#L263)

Elimina un usuario del sistema de forma permanente.
Endpoint: DELETE /api/admin/users/:userId

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

Defined in: [controllers/adminController.ts:24](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/adminController.ts#L24)

Obtiene todos los usuarios registrados en el sistema.
Endpoint: GET /api/admin/users

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado como administrador.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de usuarios y sus metadatos.

***

### getSystemStats()

> `static` **getSystemStats**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/adminController.ts:330](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/adminController.ts#L330)

Obtiene estadísticas generales del sistema.
Endpoint: GET /api/admin/stats

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado como administrador.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el resumen estadístico del sistema.

***

### updateUserRole()

> `static` **updateUserRole**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/adminController.ts:64](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/adminController.ts#L64)

Actualiza el rol de un usuario específico.
Endpoint: PUT /api/admin/users/:userId/role

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP. El cuerpo debe contener { role: 'USER' | 'ADMIN' }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el usuario actualizado.
