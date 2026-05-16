[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/signatureService](../README.md) / PrepareSignatureResult

# Interface: PrepareSignatureResult

Defined in: [services/signatureService.ts:108](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L108)

Resultado de la preparación de una firma.

## Properties

### blockchainId

> **blockchainId**: `string`

Defined in: [services/signatureService.ts:109](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L109)

ID del documento en blockchain

***

### contentHash

> **contentHash**: `string`

Defined in: [services/signatureService.ts:111](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L111)

Hash del contenido del documento

***

### messageToSign

> **messageToSign**: `string`

Defined in: [services/signatureService.ts:112](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L112)

Mensaje legible para firmar en MetaMask

***

### signatureId

> **signatureId**: `string`

Defined in: [services/signatureService.ts:113](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L113)

ID de la firma creada en base de datos

***

### versionId

> **versionId**: `number`

Defined in: [services/signatureService.ts:110](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L110)

Número de versión
