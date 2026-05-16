[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/walletController](../README.md) / WalletController

# Class: WalletController

Defined in: [controllers/walletController.ts:11](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/walletController.ts#L11)

Controlador de wallets.
Gestiona la obtención, adición, eliminación, configuración principal
y verificación de las direcciones de wallet de los usuarios.

## Constructors

### Constructor

> **new WalletController**(): `WalletController`

#### Returns

`WalletController`

## Methods

### addWallet()

> `static` **addWallet**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/walletController.ts:43](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/walletController.ts#L43)

Añade una nueva wallet al usuario autenticado.
Endpoint: POST /api/wallets

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { address, signature?, message?, label?, isPrimary? }.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la wallet creada.

***

### getChallenge()

> `static` **getChallenge**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/walletController.ts:193](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/walletController.ts#L193)

Genera un mensaje de desafío para la verificación de propiedad de una wallet.
Endpoint: POST /api/wallets/challenge

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP con { address } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con el mensaje de desafío.

***

### getPrimaryWallet()

> `static` **getPrimaryWallet**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/walletController.ts:218](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/walletController.ts#L218)

Obtiene la wallet principal del usuario autenticado.
Endpoint: GET /api/wallets/primary

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la wallet principal o un error 404.

***

### getWallets()

> `static` **getWallets**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/walletController.ts:20](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/walletController.ts#L20)

Obtiene todas las wallets asociadas al usuario autenticado.
Endpoint: GET /api/wallets

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de wallets.

***

### removeWallet()

> `static` **removeWallet**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/walletController.ts:108](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/walletController.ts#L108)

Elimina una wallet del usuario autenticado.
Endpoint: DELETE /api/wallets/:walletId

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la wallet.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de eliminación.

***

### setPrimaryWallet()

> `static` **setPrimaryWallet**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/walletController.ts:133](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/walletController.ts#L133)

Establece una wallet como principal para el usuario autenticado.
Endpoint: PUT /api/wallets/:walletId/primary

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la wallet.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la wallet actualizada.

***

### updateLabel()

> `static` **updateLabel**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/walletController.ts:158](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/walletController.ts#L158)

Actualiza la etiqueta (nombre descriptivo) de una wallet.
Endpoint: PUT /api/wallets/:walletId/label

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado con { label } en el cuerpo.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la wallet actualizada.
