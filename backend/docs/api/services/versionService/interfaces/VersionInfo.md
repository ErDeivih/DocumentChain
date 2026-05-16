[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/versionService](../README.md) / VersionInfo

# Interface: VersionInfo

Defined in: [services/versionService.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L36)

Información de una versión de documento.

## Properties

### blockchainStatus

> **blockchainStatus**: `BlockchainStatus`

Defined in: [services/versionService.ts:44](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L44)

Estado de sincronización en blockchain

***

### blockchainTxHash

> **blockchainTxHash**: `string` \| `null`

Defined in: [services/versionService.ts:45](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L45)

Hash de la transacción

***

### comment

> **comment**: `string` \| `null`

Defined in: [services/versionService.ts:42](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L42)

Comentario descriptivo

***

### createdAt

> **createdAt**: `Date`

Defined in: [services/versionService.ts:47](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L47)

Fecha de creación

***

### documentId

> **documentId**: `string`

Defined in: [services/versionService.ts:38](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L38)

ID del documento padre

***

### id

> **id**: `string`

Defined in: [services/versionService.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L37)

Identificador de la versión

***

### ipfsCid

> **ipfsCid**: `string` \| `null`

Defined in: [services/versionService.ts:41](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L41)

CID de IPFS del contenido cifrado

***

### isEncrypted

> **isEncrypted**: `boolean`

Defined in: [services/versionService.ts:43](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L43)

Indica si el contenido está cifrado

***

### isOperational

> **isOperational**: `boolean`

Defined in: [services/versionService.ts:46](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L46)

Indica si es la versión activa actualmente

***

### userId

> **userId**: `string`

Defined in: [services/versionService.ts:39](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L39)

ID del usuario creador

***

### versionNumber

> **versionNumber**: `number`

Defined in: [services/versionService.ts:40](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L40)

Número secuencial de versión
