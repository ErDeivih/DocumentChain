[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/auditService](../README.md) / IntegrityCheck

# Interface: IntegrityCheck

Defined in: [services/auditService.ts:49](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L49)

Resultado de la verificación de integridad de un documento.

## Properties

### blockchainData

> **blockchainData**: `object`

Defined in: [services/auditService.ts:51](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L51)

Estado del documento en blockchain

#### exists

> **exists**: `boolean`

#### fileHash

> **fileHash**: `string`

#### isDeleted

> **isDeleted**: `boolean`

#### owner

> **owner**: `string`

***

### databaseData

> **databaseData**: `object`

Defined in: [services/auditService.ts:57](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L57)

Estado del documento en base de datos

#### contentHash

> **contentHash**: `string` \| `null`

#### exists

> **exists**: `boolean`

#### name

> **name**: `string` \| `null`

***

### match

> **match**: `object`

Defined in: [services/auditService.ts:62](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L62)

Coincidencias entre blockchain y base de datos

#### contentHash

> **contentHash**: `boolean`

#### owner

> **owner**: `boolean`

***

### valid

> **valid**: `boolean`

Defined in: [services/auditService.ts:50](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L50)

Indica si el documento es íntegro
