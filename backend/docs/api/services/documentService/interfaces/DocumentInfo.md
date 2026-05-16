[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/documentService](../README.md) / DocumentInfo

# Interface: DocumentInfo

Defined in: [services/documentService.ts:62](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L62)

Información completa de un documento para la API pública.

## Properties

### archivedAt

> **archivedAt**: `Date` \| `null`

Defined in: [services/documentService.ts:86](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L86)

***

### blockchainId

> **blockchainId**: `string` \| `null`

Defined in: [services/documentService.ts:64](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L64)

***

### blockchainStatus

> **blockchainStatus**: `BlockchainStatus`

Defined in: [services/documentService.ts:84](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L84)

***

### blockchainTxHash

> **blockchainTxHash**: `string` \| `null`

Defined in: [services/documentService.ts:65](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L65)

***

### contentHash

> **contentHash**: `string`

Defined in: [services/documentService.ts:74](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L74)

***

### createdAt

> **createdAt**: `Date`

Defined in: [services/documentService.ts:88](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L88)

***

### creatorWalletId

> **creatorWalletId**: `string`

Defined in: [services/documentService.ts:77](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L77)

***

### description

> **description**: `string` \| `null`

Defined in: [services/documentService.ts:68](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L68)

***

### encryptedSymmetricKey?

> `optional` **encryptedSymmetricKey**: `string` \| `null`

Defined in: [services/documentService.ts:80](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L80)

***

### encryptionAuthTag?

> `optional` **encryptionAuthTag**: `string` \| `null`

Defined in: [services/documentService.ts:82](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L82)

***

### encryptionIV?

> `optional` **encryptionIV**: `string` \| `null`

Defined in: [services/documentService.ts:81](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L81)

***

### fileExtension?

> `optional` **fileExtension**: `string` \| `null`

Defined in: [services/documentService.ts:71](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L71)

***

### folderId?

> `optional` **folderId**: `string` \| `null`

Defined in: [services/documentService.ts:72](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L72)

***

### id

> **id**: `string`

Defined in: [services/documentService.ts:63](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L63)

***

### ipfsCid

> **ipfsCid**: `string` \| `null`

Defined in: [services/documentService.ts:83](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L83)

***

### isArchived

> **isArchived**: `boolean`

Defined in: [services/documentService.ts:85](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L85)

***

### isEncrypted

> **isEncrypted**: `boolean`

Defined in: [services/documentService.ts:79](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L79)

***

### metadataHash

> **metadataHash**: `string`

Defined in: [services/documentService.ts:75](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L75)

***

### mimeType

> **mimeType**: `string`

Defined in: [services/documentService.ts:69](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L69)

***

### name

> **name**: `string`

Defined in: [services/documentService.ts:67](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L67)

***

### owner?

> `optional` **owner**: \{ `avatarUrl`: `string` \| `null`; `fullName`: `string` \| `null`; `id`: `string`; `username`: `string`; \} \| `null`

Defined in: [services/documentService.ts:90](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L90)

***

### ownerId

> **ownerId**: `string`

Defined in: [services/documentService.ts:76](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L76)

***

### publicId

> **publicId**: `string` \| `null`

Defined in: [services/documentService.ts:66](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L66)

***

### role?

> `optional` **role**: `"OWNER"` \| `"SHARED_WRITE"` \| `"SHARED_READ"` \| `null`

Defined in: [services/documentService.ts:87](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L87)

***

### size

> **size**: `number`

Defined in: [services/documentService.ts:70](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L70)

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [services/documentService.ts:73](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L73)

***

### updatedAt

> **updatedAt**: `Date`

Defined in: [services/documentService.ts:89](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L89)

***

### visibility

> **visibility**: `"PRIVATE"` \| `"PUBLIC"`

Defined in: [services/documentService.ts:78](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentService.ts#L78)
