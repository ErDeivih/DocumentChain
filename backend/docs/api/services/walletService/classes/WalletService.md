[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/walletService](../README.md) / WalletService

# Class: WalletService

Defined in: [services/walletService.ts:26](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L26)

Servicio de gestión de wallets Ethereum de los usuarios.
Permite añadir, eliminar, etiquetar y establecer wallets principales.

## Constructors

### Constructor

> **new WalletService**(): `WalletService`

#### Returns

`WalletService`

## Methods

### addWallet()

> `static` **addWallet**(`userId`, `address`, `label?`, `isPrimary?`): `Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md)\>

Defined in: [services/walletService.ts:67](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L67)

Añadir una nueva wallet para el usuario.
Permite un máximo de 5 wallets por usuario.

#### Parameters

##### userId

`string`

ID del usuario

##### address

`string`

Dirección Ethereum

##### label?

`string`

Etiqueta descriptiva (opcional)

##### isPrimary?

`boolean` = `false`

Indica si debe ser la wallet principal

#### Returns

`Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md)\>

Wallet creada

***

### generateChallengeMessage()

> `static` **generateChallengeMessage**(`address`): `string`

Defined in: [services/walletService.ts:329](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L329)

Generar un mensaje de desafío para verificación de wallet.

#### Parameters

##### address

`string`

Dirección Ethereum a verificar

#### Returns

`string`

Mensaje de desafío con marca de tiempo

***

### getPrimaryWallet()

> `static` **getPrimaryWallet**(`userId`): `Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md) \| `null`\>

Defined in: [services/walletService.ts:275](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L275)

Obtener la wallet principal de un usuario.

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md) \| `null`\>

Wallet principal o null

***

### getUserWallets()

> `static` **getUserWallets**(`userId`): `Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md)[]\>

Defined in: [services/walletService.ts:32](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L32)

Obtener todas las wallets de un usuario.

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md)[]\>

Lista de wallets ordenadas por primarias primero

***

### removeWallet()

> `static` **removeWallet**(`userId`, `walletId`): `Promise`\<`void`\>

Defined in: [services/walletService.ts:147](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L147)

Eliminar una wallet de un usuario.
No se puede eliminar la wallet principal si existen otras wallets.

#### Parameters

##### userId

`string`

ID del usuario

##### walletId

`string`

ID de la wallet a eliminar

#### Returns

`Promise`\<`void`\>

***

### setPrimaryWallet()

> `static` **setPrimaryWallet**(`userId`, `walletId`): `Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md)\>

Defined in: [services/walletService.ts:182](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L182)

Establecer una wallet como principal para un usuario.

#### Parameters

##### userId

`string`

ID del usuario

##### walletId

`string`

ID de la wallet a establecer como principal

#### Returns

`Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md)\>

Wallet actualizada

***

### updateWalletLabel()

> `static` **updateWalletLabel**(`userId`, `walletId`, `label`): `Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md)\>

Defined in: [services/walletService.ts:231](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L231)

Actualizar la etiqueta (nickname) de una wallet.

#### Parameters

##### userId

`string`

ID del usuario

##### walletId

`string`

ID de la wallet

##### label

`string`

Nueva etiqueta

#### Returns

`Promise`\<[`WalletInfo`](../interfaces/WalletInfo.md)\>

Wallet actualizada

***

### verifyWalletSignature()

> `static` **verifyWalletSignature**(`address`, `message`, `signature`): `boolean`

Defined in: [services/walletService.ts:311](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletService.ts#L311)

Verificar la propiedad de una wallet mediante firma de mensaje.

#### Parameters

##### address

`string`

Dirección Ethereum

##### message

`string`

Mensaje firmado

##### signature

`string`

Firma ECDSA

#### Returns

`boolean`

true si la firma corresponde a la dirección
