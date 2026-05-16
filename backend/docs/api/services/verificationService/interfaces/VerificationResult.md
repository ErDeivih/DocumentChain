[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/verificationService](../README.md) / VerificationResult

# Interface: VerificationResult

Defined in: [services/verificationService.ts:20](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L20)

Resultado de una operación de verificación de documento.

## Properties

### blockchain?

> `optional` **blockchain**: `object`

Defined in: [services/verificationService.ts:54](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L54)

Datos on-chain del documento

#### blockNumber

> **blockNumber**: `number`

#### documentId

> **documentId**: `string`

#### ipfsHash

> **ipfsHash**: `string`

#### isDeleted

> **isDeleted**: `boolean`

#### metadataHash

> **metadataHash**: `string`

#### owner

> **owner**: `string`

#### transactionHash

> **transactionHash**: `string`

***

### document?

> `optional` **document**: `object`

Defined in: [services/verificationService.ts:22](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L22)

Información básica del documento

#### currentVersion

> **currentVersion**: `number`

#### fileSize

> **fileSize**: `number`

#### id

> **id**: `string`

#### ipfsHash

> **ipfsHash**: `string`

#### isArchived

> **isArchived**: `boolean`

#### name

> **name**: `string`

#### owner

> **owner**: `string`

#### ownerUsername?

> `optional` **ownerUsername**: `string`

#### uploadedAt

> **uploadedAt**: `Date`

***

### exists

> **exists**: `boolean`

Defined in: [services/verificationService.ts:21](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L21)

Indica si el documento fue encontrado

***

### matchedVersion?

> `optional` **matchedVersion**: `number`

Defined in: [services/verificationService.ts:39](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L39)

Versión que coincide con la búsqueda

***

### shares?

> `optional` **shares**: `object`[]

Defined in: [services/verificationService.ts:40](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L40)

Comparticiones activas

#### role

> **role**: `string`

#### sharedAt

> **sharedAt**: `Date`

#### sharedWith

> **sharedWith**: `string`

#### sharedWithUsername?

> `optional` **sharedWithUsername**: `string`

***

### signatures?

> `optional` **signatures**: `object`[]

Defined in: [services/verificationService.ts:46](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L46)

Firmas registradas

#### comment?

> `optional` **comment**: `string`

#### signedAt

> **signedAt**: `Date`

#### signedBy

> **signedBy**: `string`

#### signedByUsername?

> `optional` **signedByUsername**: `string`

#### versionNumber

> **versionNumber**: `number`

#### walletAddress

> **walletAddress**: `string`

***

### versions?

> `optional` **versions**: `object`[]

Defined in: [services/verificationService.ts:33](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L33)

Lista de versiones

#### comment?

> `optional` **comment**: `string`

#### createdAt

> **createdAt**: `Date`

#### createdBy?

> `optional` **createdBy**: `string`

#### versionNumber

> **versionNumber**: `number`
