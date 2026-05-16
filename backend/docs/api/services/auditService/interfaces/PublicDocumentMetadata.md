[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/auditService](../README.md) / PublicDocumentMetadata

# Interface: PublicDocumentMetadata

Defined in: [services/auditService.ts:102](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L102)

Metadatos públicos de un documento consultados desde blockchain.

## Properties

### blockchainId

> **blockchainId**: `string`

Defined in: [services/auditService.ts:103](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L103)

ID del documento en blockchain

***

### contentCid

> **contentCid**: `string`

Defined in: [services/auditService.ts:110](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L110)

CID de IPFS del contenido

***

### currentVersion

> **currentVersion**: `number`

Defined in: [services/auditService.ts:112](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L112)

Versión operacional actual

***

### documentId?

> `optional` **documentId**: `string`

Defined in: [services/auditService.ts:104](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L104)

ID interno en base de datos

***

### fileHash

> **fileHash**: `string`

Defined in: [services/auditService.ts:107](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L107)

Hash del contenido del archivo

***

### fileSize

> **fileSize**: `number`

Defined in: [services/auditService.ts:111](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L111)

Tamaño del archivo en bytes

***

### isArchived

> **isArchived**: `boolean`

Defined in: [services/auditService.ts:113](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L113)

Indica si está archivado

***

### isDeleted

> **isDeleted**: `boolean`

Defined in: [services/auditService.ts:114](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L114)

Indica si está eliminado

***

### lastUpdated

> **lastUpdated**: `Date`

Defined in: [services/auditService.ts:115](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L115)

Fecha de última actualización

***

### owner

> **owner**: `string`

Defined in: [services/auditService.ts:108](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L108)

Dirección del propietario

***

### publicId?

> `optional` **publicId**: `string` \| `null`

Defined in: [services/auditService.ts:105](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L105)

Identificador público opcional

***

### uploadTimestamp

> **uploadTimestamp**: `Date`

Defined in: [services/auditService.ts:109](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L109)

Fecha de subida

***

### visibility?

> `optional` **visibility**: `string`

Defined in: [services/auditService.ts:106](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L106)

Visibilidad del documento
