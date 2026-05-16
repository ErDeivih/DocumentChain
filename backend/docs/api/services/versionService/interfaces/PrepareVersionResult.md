[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/versionService](../README.md) / PrepareVersionResult

# Interface: PrepareVersionResult

Defined in: [services/versionService.ts:73](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L73)

Resultado de la preparación de una versión.

## Properties

### blockchainId

> **blockchainId**: `string`

Defined in: [services/versionService.ts:76](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L76)

ID para la transacción en blockchain

***

### ipfsCid

> **ipfsCid**: `string`

Defined in: [services/versionService.ts:75](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L75)

CID del archivo subido a IPFS

***

### versionId

> **versionId**: `string`

Defined in: [services/versionService.ts:74](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L74)

ID de la versión creada en base de datos

***

### versionNumber

> **versionNumber**: `number`

Defined in: [services/versionService.ts:77](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L77)

Número asignado a la versión
