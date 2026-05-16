[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/signatureService](../README.md) / SignatureView

# Interface: SignatureView

Defined in: [services/signatureService.ts:73](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L73)

Vista completa de una firma digital.

## Properties

### blockchainStatus

> **blockchainStatus**: `BlockchainStatus`

Defined in: [services/signatureService.ts:81](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L81)

Estado en blockchain

***

### blockchainTxHash

> **blockchainTxHash**: `string` \| `null`

Defined in: [services/signatureService.ts:82](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L82)

Hash de la transacción

***

### documentId

> **documentId**: `string`

Defined in: [services/signatureService.ts:75](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L75)

ID del documento

***

### id

> **id**: `string`

Defined in: [services/signatureService.ts:74](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L74)

Identificador de la firma

***

### signedAt

> **signedAt**: `Date`

Defined in: [services/signatureService.ts:80](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L80)

Fecha de firma

***

### signer

> **signer**: [`SignerSummary`](SignerSummary.md)

Defined in: [services/signatureService.ts:83](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L83)

Datos del firmante

***

### signerWalletId

> **signerWalletId**: `string` \| `null`

Defined in: [services/signatureService.ts:79](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L79)

Wallet del firmante

***

### userId

> **userId**: `string` \| `null`

Defined in: [services/signatureService.ts:78](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L78)

ID del usuario

***

### versionId

> **versionId**: `string`

Defined in: [services/signatureService.ts:76](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L76)

ID de la versión

***

### versionNumber

> **versionNumber**: `number`

Defined in: [services/signatureService.ts:77](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L77)

Número de versión
