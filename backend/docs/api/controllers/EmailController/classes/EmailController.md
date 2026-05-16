[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/EmailController](../README.md) / EmailController

# Class: EmailController

Defined in: [controllers/EmailController.ts:16](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/EmailController.ts#L16)

Controlador de correo electrónico.
Gestiona la verificación de direcciones de email, solicitudes de restablecimiento
de contraseña y reenvío de enlaces de verificación.
Arquitectura MVC: Capa de Controlador.

## Constructors

### Constructor

> **new EmailController**(): `EmailController`

#### Returns

`EmailController`

## Methods

### forgotPassword()

> `static` **forgotPassword**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/EmailController.ts:99](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/EmailController.ts#L99)

Solicita el restablecimiento de contraseña para un usuario.
Endpoint: POST /api/email/forgot-password

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP con { email } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con un mensaje genérico de confirmación por seguridad.

***

### resendVerification()

> `static` **resendVerification**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/EmailController.ts:275](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/EmailController.ts#L275)

Reenvía el correo de verificación a un usuario no verificado.
Endpoint: POST /api/email/resend-verification

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP con { email } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de envío.

***

### resetPassword()

> `static` **resetPassword**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/EmailController.ts:174](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/EmailController.ts#L174)

Restablece la contraseña del usuario utilizando un token válido.
Endpoint: POST /api/email/reset-password

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP con { token, newPassword } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de cambio de contraseña.

***

### verifyEmail()

> `static` **verifyEmail**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/EmailController.ts:25](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/EmailController.ts#L25)

Verifica la dirección de email del usuario mediante un token.
Endpoint: GET /api/email/verify/:token

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP. Los parámetros deben incluir el token de verificación.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de verificación.
