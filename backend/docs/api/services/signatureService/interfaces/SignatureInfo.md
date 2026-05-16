[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/signatureService](../README.md) / SignatureInfo

# Interface: SignatureInfo

Defined in: [services/signatureService.ts:34](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L34)

Información básica de una firma digital.

## Properties

### blockchainStatus

> **blockchainStatus**: `BlockchainStatus`

Defined in: [services/signatureService.ts:39](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L39)

Estado de sincronización en blockchain

***

### documentId

> **documentId**: `string`

Defined in: [services/signatureService.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L36)

ID del documento firmado

***

### id

> **id**: `string`

Defined in: [services/signatureService.ts:35](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L35)

Identificador de la firma

***

### signerWalletId

> **signerWalletId**: `string`

Defined in: [services/signatureService.ts:38](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L38)

Wallet utilizada para firmar

***

### versionId

> **versionId**: `string` \| `null`

Defined in: [services/signatureService.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L37)

ID de la versión firmada
