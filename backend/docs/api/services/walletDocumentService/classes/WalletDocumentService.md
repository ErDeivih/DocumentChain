[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/walletDocumentService](../README.md) / WalletDocumentService

# Class: WalletDocumentService

Defined in: [services/walletDocumentService.ts:34](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletDocumentService.ts#L34)

Servicio de consulta de documentos organizados por wallet.
Proporciona agregaciones de actividad y resúmenes de uso por dirección.

## Constructors

### Constructor

> **new WalletDocumentService**(): `WalletDocumentService`

#### Returns

`WalletDocumentService`

## Methods

### getAllUserDocuments()

> `static` **getAllUserDocuments**(`userId`): `Promise`\<\{ `byWallet`: `Map`\<`string`, `any`[]\>; `total`: `number`; \}\>

Defined in: [services/walletDocumentService.ts:248](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletDocumentService.ts#L248)

Obtener todos los documentos agrupados por wallet de un usuario.

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<\{ `byWallet`: `Map`\<`string`, `any`[]\>; `total`: `number`; \}\>

Mapa de wallet a documentos y total

***

### getDocumentsByWallet()

> `static` **getDocumentsByWallet**(`userId`, `walletId`): `Promise`\<`any`[]\>

Defined in: [services/walletDocumentService.ts:41](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletDocumentService.ts#L41)

Obtener documentos creados con una wallet específica.

#### Parameters

##### userId

`string`

ID del usuario propietario

##### walletId

`string`

ID de la wallet

#### Returns

`Promise`\<`any`[]\>

Lista de documentos creados por esa wallet

***

### getSharedToWallet()

> `static` **getSharedToWallet**(`walletAddress`): `Promise`\<`any`[]\>

Defined in: [services/walletDocumentService.ts:75](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletDocumentService.ts#L75)

Obtener documentos compartidos con una dirección de wallet.

#### Parameters

##### walletAddress

`string`

Dirección Ethereum

#### Returns

`Promise`\<`any`[]\>

Lista de documentos compartidos (excluyendo propiedad)

***

### getSignedByWallet()

> `static` **getSignedByWallet**(`userId`, `walletId`): `Promise`\<`any`[]\>

Defined in: [services/walletDocumentService.ts:131](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletDocumentService.ts#L131)

Obtener documentos firmados con una wallet específica.

#### Parameters

##### userId

`string`

ID del usuario propietario

##### walletId

`string`

ID de la wallet

#### Returns

`Promise`\<`any`[]\>

Lista de documentos firmados

***

### getWalletActivity()

> `static` **getWalletActivity**(`walletId`): `Promise`\<[`WalletActivity`](../interfaces/WalletActivity.md)\>

Defined in: [services/walletDocumentService.ts:167](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletDocumentService.ts#L167)

Obtener la actividad completa de una wallet.

#### Parameters

##### walletId

`string`

ID de la wallet

#### Returns

`Promise`\<[`WalletActivity`](../interfaces/WalletActivity.md)\>

Actividad agregada (creados, compartidos, firmados, versiones)

***

### getWalletSummary()

> `static` **getWalletSummary**(`userId`): `Promise`\<\{ `totalDocuments`: `number`; `totalSignatures`: `number`; `totalVersions`: `number`; `wallets`: `object`[]; \}\>

Defined in: [services/walletDocumentService.ts:285](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/walletDocumentService.ts#L285)

Obtener un resumen de wallets para el dashboard.

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<\{ `totalDocuments`: `number`; `totalSignatures`: `number`; `totalVersions`: `number`; `wallets`: `object`[]; \}\>

Resumen con conteos de documentos, firmas y versiones por wallet
