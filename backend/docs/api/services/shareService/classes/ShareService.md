[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/shareService](../README.md) / ShareService

# Class: ShareService

Defined in: [services/shareService.ts:132](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L132)

Servicio de gestión de comparticiones de documentos.
Implementa el patrón prepare/confirm con re-encriptación de claves simétricas en backend.
La autorización es responsabilidad exclusiva del contrato inteligente.

## Constructors

### Constructor

> **new ShareService**(): `ShareService`

#### Returns

`ShareService`

## Methods

### confirmRevokeShare()

> `static` **confirmRevokeShare**(`shareId`, `txHash`): `Promise`\<`void`\>

Defined in: [services/shareService.ts:725](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L725)

Confirm share revocation

#### Parameters

##### shareId

`string`

##### txHash

`string`

#### Returns

`Promise`\<`void`\>

***

### confirmShare()

> `static` **confirmShare**(`input`): `Promise`\<[`ShareInfo`](../interfaces/ShareInfo.md)\>

Defined in: [services/shareService.ts:285](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L285)

Confirm a share after blockchain transaction
Logs the event for timeline/audit - permissions are managed exclusively on blockchain

#### Parameters

##### input

[`ConfirmShareInput`](../interfaces/ConfirmShareInput.md)

#### Returns

`Promise`\<[`ShareInfo`](../interfaces/ShareInfo.md)\>

***

### getDocumentShares()

> `static` **getDocumentShares**(`documentId`, `userId`): `Promise`\<[`ShareInfo`](../interfaces/ShareInfo.md)[]\>

Defined in: [services/shareService.ts:411](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L411)

Get shares for a document
Queries the smart contract exclusively - no fallback to PostgreSQL events

#### Parameters

##### documentId

`string`

##### userId

`string`

#### Returns

`Promise`\<[`ShareInfo`](../interfaces/ShareInfo.md)[]\>

***

### getSharedWithUser()

> `static` **getSharedWithUser**(`userId`): `Promise`\<[`ShareInfo`](../interfaces/ShareInfo.md)[]\>

Defined in: [services/shareService.ts:515](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L515)

Get documents shared with a user
Queries the smart contract exclusively - no fallback to PostgreSQL events

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<[`ShareInfo`](../interfaces/ShareInfo.md)[]\>

***

### ~~markShareFailed()~~

> `static` **markShareFailed**(`shareId`, `error`): `Promise`\<`void`\>

Defined in: [services/shareService.ts:802](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L802)

Mark share as failed

#### Parameters

##### shareId

`string`

##### error

`string`

#### Returns

`Promise`\<`void`\>

#### Deprecated

***

### ~~markShareSynced()~~

> `static` **markShareSynced**(`shareId`): `Promise`\<`void`\>

Defined in: [services/shareService.ts:810](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L810)

Update share status to SYNCED

#### Parameters

##### shareId

`string`

#### Returns

`Promise`\<`void`\>

#### Deprecated

***

### prepareRevokeShare()

> `static` **prepareRevokeShare**(`documentId`, `recipientIdentifier`, `ownerId`, `sharerWalletId`): `Promise`\<[`PrepareRevokeShareResult`](../interfaces/PrepareRevokeShareResult.md)\>

Defined in: [services/shareService.ts:599](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L599)

Revoke a share (prepare phase)
Returns the blockchainId so frontend can call removeAccess() on the smart contract

#### Parameters

##### documentId

`string`

##### recipientIdentifier

`string`

##### ownerId

`string`

##### sharerWalletId

`string`

#### Returns

`Promise`\<[`PrepareRevokeShareResult`](../interfaces/PrepareRevokeShareResult.md)\>

***

### prepareShare()

> `static` **prepareShare**(`input`): `Promise`\<[`PrepareShareResult`](../interfaces/PrepareShareResult.md)\>

Defined in: [services/shareService.ts:150](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L150)

Prepare a share for creation
- Validates ownership ON-CHAIN (sole source of truth)
- Re-encrypts symmetric key with recipient's public key
- Returns data needed for frontend to sign blockchain transaction

#### Parameters

##### input

[`PrepareShareInput`](../interfaces/PrepareShareInput.md)

#### Returns

`Promise`\<[`PrepareShareResult`](../interfaces/PrepareShareResult.md)\>
