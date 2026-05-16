[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/auditService](../README.md) / OwnershipProof

# Interface: OwnershipProof

Defined in: [services/auditService.ts:75](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L75)

Prueba criptográfica de propiedad de un documento.

## Properties

### blockchainId

> **blockchainId**: `string`

Defined in: [services/auditService.ts:77](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L77)

ID del documento en blockchain

***

### documentInfo

> **documentInfo**: `object`

Defined in: [services/auditService.ts:79](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L79)

Información pública del documento

#### createdAt

> **createdAt**: `string`

#### fileHash

> **fileHash**: `string`

#### owner

> **owner**: `string`

***

### isOwner

> **isOwner**: `boolean`

Defined in: [services/auditService.ts:76](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L76)

Indica si la wallet es propietaria

***

### walletAddress

> **walletAddress**: `string`

Defined in: [services/auditService.ts:78](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L78)

Dirección de la wallet verificada
