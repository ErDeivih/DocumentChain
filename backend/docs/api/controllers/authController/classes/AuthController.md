[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/authController](../README.md) / AuthController

# Class: AuthController

Defined in: [controllers/authController.ts:13](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L13)

Controlador de autenticacion.
Mantiene unicamente los endpoints actualmente expuestos por las rutas.

## Constructors

### Constructor

> **new AuthController**(): `AuthController`

#### Returns

`AuthController`

## Methods

### changePassword()

> `static` **changePassword**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:308](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L308)

Cambio de contrasena autenticado.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### forgotPassword()

> `static` **forgotPassword**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:332](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L332)

Compatibilidad legacy: delega reset de contrasena al EmailController.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### getChallenge()

> `static` **getChallenge**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:87](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L87)

Genera challenge para login con wallet.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### login()

> `static` **login**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:193](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L193)

Login legado email/username + password.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### logout()

> `static` **logout**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:213](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L213)

Logout del usuario autenticado.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### me()

> `static` **me**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:251](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L251)

Perfil del usuario autenticado.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### prepareRegister()

> `static` **prepareRegister**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:17](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L17)

Prepara el registro wallet-based.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### refresh()

> `static` **refresh**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:232](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L232)

Refresca token de acceso.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### register()

> `static` **register**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:155](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L155)

Registro legado email/password.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### resetPassword()

> `static` **resetPassword**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:339](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L339)

Compatibilidad legacy: delega confirmacion de reset al EmailController.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### updateKeys()

> `static` **updateKeys**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:132](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L132)

Actualiza claves cifradas del usuario autenticado.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### walletLogin()

> `static` **walletLogin**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/authController.ts:59](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/authController.ts#L59)

Login wallet-based con firma.

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>
