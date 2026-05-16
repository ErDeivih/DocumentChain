[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/transferService](../README.md) / TransferService

# Class: TransferService

Defined in: [services/transferService.ts:81](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L81)

Servicio de transferencia de propiedad de documentos.
Implementa el patrón prepare/confirm con re-encriptación de claves simétricas en backend.

## Constructors

### Constructor

> **new TransferService**(): `TransferService`

#### Returns

`TransferService`

## Methods

### confirmTransfer()

> `static` **confirmTransfer**(`input`): `Promise`\<`void`\>

Defined in: [services/transferService.ts:243](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L243)

Confirm transfer after blockchain transaction
- Updates document owner in DB
- Revokes all previous shares
- Logs the transfer event

#### Parameters

##### input

[`ConfirmTransferInput`](../interfaces/ConfirmTransferInput.md)

#### Returns

`Promise`\<`void`\>

***

### getTransferHistory()

> `static` **getTransferHistory**(`documentId`): `Promise`\<`any`[]\>

Defined in: [services/transferService.ts:331](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L331)

Get transfer history for a document

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`any`[]\>

***

### prepareTransfer()

> `static` **prepareTransfer**(`input`): `Promise`\<[`PrepareTransferResult`](../interfaces/PrepareTransferResult.md)\>

Defined in: [services/transferService.ts:89](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L89)

Prepare transfer for blockchain signing
- Validates ownership and permissions
- Re-encrypts document key with new owner's public key
- Creates transfer record with PREPARING status
- Returns data needed for frontend to sign blockchain transaction

#### Parameters

##### input

[`PrepareTransferInput`](../interfaces/PrepareTransferInput.md)

#### Returns

`Promise`\<[`PrepareTransferResult`](../interfaces/PrepareTransferResult.md)\>
