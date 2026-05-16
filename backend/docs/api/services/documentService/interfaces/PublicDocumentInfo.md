[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/documentService](../README.md) / PublicDocumentInfo

# Interface: PublicDocumentInfo

Defined in: [services/documentService.ts:164](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L164)

Información pública de un documento.

## Properties

### blockchainId

> **blockchainId**: `string` \| `null`

Defined in: [services/documentService.ts:167](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L167)

***

### contentHash

> **contentHash**: `string`

Defined in: [services/documentService.ts:173](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L173)

***

### createdAt

> **createdAt**: `Date`

Defined in: [services/documentService.ts:178](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L178)

***

### description

> **description**: `string` \| `null`

Defined in: [services/documentService.ts:169](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L169)

***

### fileExtension?

> `optional` **fileExtension**: `string` \| `null`

Defined in: [services/documentService.ts:172](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L172)

***

### id

> **id**: `string`

Defined in: [services/documentService.ts:165](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L165)

***

### isArchived

> **isArchived**: `boolean`

Defined in: [services/documentService.ts:176](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L176)

***

### isDeleted

> **isDeleted**: `boolean`

Defined in: [services/documentService.ts:177](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L177)

***

### metadataHash

> **metadataHash**: `string`

Defined in: [services/documentService.ts:174](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L174)

***

### mimeType

> **mimeType**: `string`

Defined in: [services/documentService.ts:170](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L170)

***

### name

> **name**: `string`

Defined in: [services/documentService.ts:168](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L168)

***

### owner

> **owner**: `object`

Defined in: [services/documentService.ts:179](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L179)

#### fullName

> **fullName**: `string` \| `null`

#### id

> **id**: `string`

#### username

> **username**: `string`

***

### publicId

> **publicId**: `string`

Defined in: [services/documentService.ts:166](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L166)

***

### signatures

> **signatures**: [`PublicDocumentSignatureInfo`](PublicDocumentSignatureInfo.md)[]

Defined in: [services/documentService.ts:185](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L185)

***

### size

> **size**: `number`

Defined in: [services/documentService.ts:171](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L171)

***

### versions

> **versions**: [`PublicDocumentVersionInfo`](PublicDocumentVersionInfo.md)[]

Defined in: [services/documentService.ts:184](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L184)

***

### visibility

> **visibility**: `"PUBLIC"`

Defined in: [services/documentService.ts:175](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L175)
