[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/versionService](../README.md) / VersionService

# Class: VersionService

Defined in: [services/versionService.ts:135](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L135)

Servicio de gestión de versiones de documentos.
Implementa el patrón prepare/confirm para crear, restaurar y cambiar versiones operacionales,
incluyendo cifrado backend y almacenamiento descentralizado en IPFS.

## Constructors

### Constructor

> **new VersionService**(): `VersionService`

#### Returns

`VersionService`

## Methods

### confirmRestoreVersion()

> `static` **confirmRestoreVersion**(`versionId`, `txHash`): `Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md)\>

Defined in: [services/versionService.ts:1064](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L1064)

Confirm a version restore after blockchain transaction.

#### Parameters

##### versionId

`string`

##### txHash

`string`

#### Returns

`Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md)\>

***

### confirmSetOperational()

> `static` **confirmSetOperational**(`input`): `Promise`\<`void`\>

Defined in: [services/versionService.ts:657](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L657)

Confirm set operational version (on-chain confirm phase)

#### Parameters

##### input

[`ConfirmSetOperationalInput`](../interfaces/ConfirmSetOperationalInput.md)

#### Returns

`Promise`\<`void`\>

***

### confirmVersion()

> `static` **confirmVersion**(`input`): `Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md)\>

Defined in: [services/versionService.ts:352](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L352)

Confirm a version after blockchain transaction
- Updates DB record with TX_SUBMITTED status
- Event listener will update to SYNCED when confirmed

#### Parameters

##### input

[`ConfirmVersionInput`](../interfaces/ConfirmVersionInput.md)

#### Returns

`Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md)\>

***

### downloadVersion()

> `static` **downloadVersion**(`versionId`, `userId`): `Promise`\<\{ `documentName`: `string`; `encryptedFile`: `Buffer`; `encryptedSymmetricKey`: `string`; `encryptionAuthTag`: `string` \| `null`; `encryptionIV`: `string` \| `null`; `ipfsCid`: `string`; `mimeType`: `string`; `versionNumber`: `number`; \}\>

Defined in: [services/versionService.ts:720](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L720)

Download version (returns encrypted file from IPFS)

#### Parameters

##### versionId

`string`

##### userId

`string`

#### Returns

`Promise`\<\{ `documentName`: `string`; `encryptedFile`: `Buffer`; `encryptedSymmetricKey`: `string`; `encryptionAuthTag`: `string` \| `null`; `encryptionIV`: `string` \| `null`; `ipfsCid`: `string`; `mimeType`: `string`; `versionNumber`: `number`; \}\>

***

### getDocumentVersions()

> `static` **getDocumentVersions**(`documentId`, `userId`): `Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md)[]\>

Defined in: [services/versionService.ts:430](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L430)

Get versions for a document

#### Parameters

##### documentId

`string`

##### userId

`string`

#### Returns

`Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md)[]\>

***

### getVersion()

> `static` **getVersion**(`versionId`, `userId`): `Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md) \| `null`\>

Defined in: [services/versionService.ts:472](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L472)

Get a specific version

#### Parameters

##### versionId

`string`

##### userId

`string`

#### Returns

`Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md) \| `null`\>

***

### markVersionFailed()

> `static` **markVersionFailed**(`versionId`, `error`): `Promise`\<`void`\>

Defined in: [services/versionService.ts:781](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L781)

Mark version as failed

#### Parameters

##### versionId

`string`

##### error

`string`

#### Returns

`Promise`\<`void`\>

***

### markVersionSynced()

> `static` **markVersionSynced**(`versionId`): `Promise`\<`void`\>

Defined in: [services/versionService.ts:796](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L796)

Update version status to SYNCED

#### Parameters

##### versionId

`string`

#### Returns

`Promise`\<`void`\>

***

### prepareRestoreVersion()

> `static` **prepareRestoreVersion**(`documentId`, `versionNumber`, `userId`, `walletId?`): `Promise`\<\{ `blockchainId`: `string`; `versionId`: `string`; \}\>

Defined in: [services/versionService.ts:966](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L966)

Prepare a version restore (creates a new version pointing to same IPFS CID as an older version).
No file upload is required — the encrypted content is reused.

#### Parameters

##### documentId

`string`

##### versionNumber

`number`

##### userId

`string`

##### walletId?

`string`

#### Returns

`Promise`\<\{ `blockchainId`: `string`; `versionId`: `string`; \}\>

***

### prepareSetOperational()

> `static` **prepareSetOperational**(`input`): `Promise`\<[`PrepareSetOperationalResult`](../interfaces/PrepareSetOperationalResult.md)\>

Defined in: [services/versionService.ts:585](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L585)

Prepare set operational version (on-chain prepare phase)

#### Parameters

##### input

[`PrepareSetOperationalInput`](../interfaces/PrepareSetOperationalInput.md)

#### Returns

`Promise`\<[`PrepareSetOperationalResult`](../interfaces/PrepareSetOperationalResult.md)\>

***

### prepareVersion()

> `static` **prepareVersion**(`input`): `Promise`\<[`PrepareVersionResult`](../interfaces/PrepareVersionResult.md)\>

Defined in: [services/versionService.ts:191](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L191)

Prepare a version for creation
- Validates file (size, MIME type)
- Encrypts file with AES-256-GCM
- Uploads encrypted file to IPFS
- Creates DB record with PREPARING status
- Returns data needed for frontend to sign blockchain transaction

#### Parameters

##### input

[`PrepareVersionInput`](../interfaces/PrepareVersionInput.md)

#### Returns

`Promise`\<[`PrepareVersionResult`](../interfaces/PrepareVersionResult.md)\>

***

### rollbackVersion()

> `static` **rollbackVersion**(`versionId`, `userId`): `Promise`\<`void`\>

Defined in: [services/versionService.ts:832](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L832)

Rollback version creation
- Deletes version from DB
- Unpins IPFS CID
- Used when blockchain transaction fails after prepare

#### Parameters

##### versionId

`string`

##### userId

`string`

#### Returns

`Promise`\<`void`\>

***

### rollbackVersionRestore()

> `static` **rollbackVersionRestore**(`versionId`, `userId`): `Promise`\<`void`\>

Defined in: [services/versionService.ts:906](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L906)

Rollback version restore
- Deletes version from DB
- DOES NOT unpin IPFS (CID belongs to original version)
- Used when blockchain transaction fails after restore prepare

#### Parameters

##### versionId

`string`

##### userId

`string`

#### Returns

`Promise`\<`void`\>

***

### setOperationalVersion()

> `static` **setOperationalVersion**(`documentId`, `versionNumber`, `userId`): `Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md)\>

Defined in: [services/versionService.ts:495](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L495)

Set a document version as operational.

#### Parameters

##### documentId

`string`

##### versionNumber

`number`

##### userId

`string`

#### Returns

`Promise`\<[`VersionInfo`](../interfaces/VersionInfo.md)\>
