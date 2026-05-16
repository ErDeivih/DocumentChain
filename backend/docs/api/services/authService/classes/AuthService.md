[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/authService](../README.md) / AuthService

# Class: AuthService

Defined in: [services/authService.ts:82](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L82)

Servicio de autenticación y gestión de sesiones.
Soporta registro/inicio de sesión tradicional con contraseña y autenticación basada en wallet.

## Constructors

### Constructor

> **new AuthService**(): `AuthService`

#### Returns

`AuthService`

## Methods

### ~~changePassword()~~

> `static` **changePassword**(`userId`, `currentPassword`, `newPassword`): `Promise`\<`void`\>

Defined in: [services/authService.ts:604](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L604)

Cambia la contraseña de un usuario.
Descifra la clave privada con la contraseña actual, la recifra con la nueva
y actualiza el hash de contraseña en BD.

#### Parameters

##### userId

`string`

UUID del usuario.

##### currentPassword

`string`

Contraseña actual.

##### newPassword

`string`

Nueva contraseña.

#### Returns

`Promise`\<`void`\>

#### Deprecated

La gestión de contraseñas debe realizarse en el frontend.

#### Throws

Error si el usuario no existe, no tiene contraseña o la contraseña actual es incorrecta.

***

### ~~getPrivateKey()~~

> `static` **getPrivateKey**(`userId`, `password`): `Promise`\<`string`\>

Defined in: [services/authService.ts:574](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L574)

Obtiene la clave privada descifrada de un usuario.

#### Parameters

##### userId

`string`

UUID del usuario.

##### password

`string`

Contraseña del usuario.

#### Returns

`Promise`\<`string`\>

Clave privada descifrada en formato PEM.

#### Deprecated

El descifrado de clave privada debe realizarse únicamente en el frontend.

#### Throws

Error si el usuario no existe o la contraseña es inválida.

***

### login()

> `static` **login**(`input`): `Promise`\<[`AuthResponse`](../interfaces/AuthResponse.md)\>

Defined in: [services/authService.ts:450](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L450)

Inicia sesión de un usuario existente.
Incluye migración automática de bcrypt a Argon2id.

#### Parameters

##### input

[`LoginInput`](../interfaces/LoginInput.md)

Datos de entrada para el inicio de sesión.

#### Returns

`Promise`\<[`AuthResponse`](../interfaces/AuthResponse.md)\>

Respuesta de autenticación con tokens y datos del usuario.

#### Throws

Error si las credenciales son inválidas, el email no está verificado o el usuario requiere wallet.

***

### loginWithWallet()

> `static` **loginWithWallet**(`input`): `Promise`\<[`AuthResponse`](../interfaces/AuthResponse.md)\>

Defined in: [services/authService.ts:226](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L226)

Inicia sesión con firma de wallet.
El usuario firma un mensaje de reto con su wallet; el backend verifica la firma.

#### Parameters

##### input

[`WalletLoginInput`](../interfaces/WalletLoginInput.md)

Datos de entrada para el login con wallet.

#### Returns

`Promise`\<[`AuthResponse`](../interfaces/AuthResponse.md)\>

Respuesta de autenticación con tokens y datos del usuario.

#### Throws

Error si la dirección es inválida, la wallet no está registrada, el reto expiró o la firma no coincide.

***

### logout()

> `static` **logout**(`refreshToken`): `Promise`\<`void`\>

Defined in: [services/authService.ts:710](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L710)

Cierra la sesión de un usuario revocando su refresh token.

#### Parameters

##### refreshToken

`string`

Token de refresco a revocar.

#### Returns

`Promise`\<`void`\>

***

### prepareRegister()

> `static` **prepareRegister**(`input`): `Promise`\<[`AuthResponse`](../interfaces/AuthResponse.md)\>

Defined in: [services/authService.ts:93](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L93)

Prepara el registro de un usuario con cifrado basado en wallet.
El frontend genera el par de claves y cifra la clave privada con la contraseña del usuario;
el backend únicamente almacena los datos cifrados.

#### Parameters

##### input

[`PrepareRegisterInput`](../interfaces/PrepareRegisterInput.md)

Datos de entrada para el registro con wallet.

#### Returns

`Promise`\<[`AuthResponse`](../interfaces/AuthResponse.md)\>

Respuesta de autenticación con tokens y datos del usuario.

#### Throws

Error si las validaciones de entrada fallan o el usuario/email ya existen.

***

### refreshToken()

> `static` **refreshToken**(`refreshToken`): `Promise`\<\{ `accessToken`: `string`; `expiresIn`: `number`; \}\>

Defined in: [services/authService.ts:719](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L719)

Refresca el access token utilizando un refresh token válido.

#### Parameters

##### refreshToken

`string`

Token de refresco.

#### Returns

`Promise`\<\{ `accessToken`: `string`; `expiresIn`: `number`; \}\>

Nuevo access token y tiempo de expiración.

***

### register()

> `static` **register**(`input`): `Promise`\<[`AuthResponse`](../interfaces/AuthResponse.md)\>

Defined in: [services/authService.ts:309](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L309)

Registra un usuario con nombre de usuario/contraseña.
Genera un par de claves RSA, cifra la clave privada con la contraseña,
hashea la contraseña con Argon2id y crea el registro en BD.

#### Parameters

##### input

[`RegisterInput`](../interfaces/RegisterInput.md)

Datos de entrada para el registro.

#### Returns

`Promise`\<[`AuthResponse`](../interfaces/AuthResponse.md)\>

Respuesta de autenticación con tokens, clave de recuperación y datos del usuario.

#### Throws

Error si las validaciones fallan o el usuario/email ya existen.

***

### updateEncryptedPrivateKey()

> `static` **updateEncryptedPrivateKey**(`userId`, `newEncryptedPrivateKey`, `newPublicKey?`): `Promise`\<`void`\>

Defined in: [services/authService.ts:682](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L682)

Actualiza la clave privada cifrada de un usuario (para usuarios basados en wallet).
Se invoca cuando el usuario cambia su contraseña de cifrado en el frontend.

#### Parameters

##### userId

`string`

UUID del usuario.

##### newEncryptedPrivateKey

`string`

Nueva clave privada cifrada.

##### newPublicKey?

`string`

Nueva clave pública (opcional).

#### Returns

`Promise`\<`void`\>

#### Throws

Error si el usuario no existe.

***

### validateSession()

> `static` **validateSession**(`accessToken`): `Promise`\<`boolean`\>

Defined in: [services/authService.ts:550](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/authService.ts#L550)

Valida un token de sesión (legado - para compatibilidad hacia atrás).

#### Parameters

##### accessToken

`string`

Token de acceso a validar.

#### Returns

`Promise`\<`boolean`\>

`true` si la sesión existe y no ha expirado.
