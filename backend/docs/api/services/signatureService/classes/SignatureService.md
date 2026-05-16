[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/signatureService](../README.md) / SignatureService

# Class: SignatureService

Defined in: [services/signatureService.ts:139](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L139)

Servicio de gestión de firmas digitales sobre documentos.
Implementa el patrón prepare/confirm donde el backend prepara el registro
y el frontend firma la transacción en blockchain.

## Constructors

### Constructor

> **new SignatureService**(): `SignatureService`

#### Returns

`SignatureService`

## Methods

### checkSignature()

> `static` **checkSignature**(`versionId`, `userId`): `Promise`\<`boolean`\>

Defined in: [services/signatureService.ts:491](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L491)

Check if a user has signed a version (via any of their wallets)

#### Parameters

##### versionId

`string`

##### userId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### confirmSignature()

> `static` **confirmSignature**(`input`): `Promise`\<[`SignatureInfo`](../interfaces/SignatureInfo.md)\>

Defined in: [services/signatureService.ts:287](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L287)

Confirm a signature after blockchain transaction
- Updates DB record with TX_SUBMITTED status
- Event listener will update to SYNCED when confirmed

#### Parameters

##### input

[`ConfirmSignatureInput`](../interfaces/ConfirmSignatureInput.md)

#### Returns

`Promise`\<[`SignatureInfo`](../interfaces/SignatureInfo.md)\>

***

### getDocumentSignatures()

> `static` **getDocumentSignatures**(`documentId`, `requesterUserId`): `Promise`\<[`SignatureView`](../interfaces/SignatureView.md)[]\>

Defined in: [services/signatureService.ts:394](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L394)

Get signatures for a document

#### Parameters

##### documentId

`string`

##### requesterUserId

`string`

#### Returns

`Promise`\<[`SignatureView`](../interfaces/SignatureView.md)[]\>

***

### getMySignature()

> `static` **getMySignature**(`versionId`, `userId`): `Promise`\<[`SignatureInfo`](../interfaces/SignatureInfo.md) \| `null`\>

Defined in: [services/signatureService.ts:514](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L514)

Get the user's own signature for a version

#### Parameters

##### versionId

`string`

##### userId

`string`

#### Returns

`Promise`\<[`SignatureInfo`](../interfaces/SignatureInfo.md) \| `null`\>

***

### getSignaturesByWallet()

> `static` **getSignaturesByWallet**(`walletId`): `Promise`\<[`SignatureInfo`](../interfaces/SignatureInfo.md)[]\>

Defined in: [services/signatureService.ts:431](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L431)

Get signatures by wallet

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<[`SignatureInfo`](../interfaces/SignatureInfo.md)[]\>

***

### getVersionSignatures()

> `static` **getVersionSignatures**(`versionId`, `requesterUserId`): `Promise`\<[`SignatureView`](../interfaces/SignatureView.md)[]\>

Defined in: [services/signatureService.ts:442](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L442)

Get signatures for a version

#### Parameters

##### versionId

`string`

##### requesterUserId

`string`

#### Returns

`Promise`\<[`SignatureView`](../interfaces/SignatureView.md)[]\>

***

### markSignatureFailed()

> `static` **markSignatureFailed**(`signatureId`, `error`): `Promise`\<`void`\>

Defined in: [services/signatureService.ts:555](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L555)

Mark signature as failed

#### Parameters

##### signatureId

`string`

##### error

`string`

#### Returns

`Promise`\<`void`\>

***

### markSignatureSynced()

> `static` **markSignatureSynced**(`signatureId`): `Promise`\<`void`\>

Defined in: [services/signatureService.ts:570](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L570)

Update signature status to SYNCED

#### Parameters

##### signatureId

`string`

#### Returns

`Promise`\<`void`\>

***

### prepareSignature()

> `static` **prepareSignature**(`input`): `Promise`\<[`PrepareSignatureResult`](../interfaces/PrepareSignatureResult.md)\>

Defined in: [services/signatureService.ts:146](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L146)

Prepare a signature for creation
- Validates access
- Creates DB record with PREPARING status
- Returns data needed for frontend to sign blockchain transaction

#### Parameters

##### input

[`PrepareSignatureInput`](../interfaces/PrepareSignatureInput.md)

#### Returns

`Promise`\<[`PrepareSignatureResult`](../interfaces/PrepareSignatureResult.md)\>

***

### rollbackSignature()

> `static` **rollbackSignature**(`signatureId`, `userId`): `Promise`\<`void`\>

Defined in: [services/signatureService.ts:629](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L629)

Rollback a signature that is still in PREPARING status.
Deletes the DB record — used when the blockchain transaction fails.

#### Parameters

##### signatureId

`string`

##### userId

`string`

#### Returns

`Promise`\<`void`\>
