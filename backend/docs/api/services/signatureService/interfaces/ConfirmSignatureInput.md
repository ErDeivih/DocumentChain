[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/signatureService](../README.md) / ConfirmSignatureInput

# Interface: ConfirmSignatureInput

Defined in: [services/signatureService.ts:123](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L123)

Datos de entrada para confirmar una firma.

## Properties

### confirmerUserId

> **confirmerUserId**: `string`

Defined in: [services/signatureService.ts:127](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L127)

ID del usuario que confirma

***

### ecdsaSignature

> **ecdsaSignature**: `string`

Defined in: [services/signatureService.ts:126](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L126)

Firma ECDSA del contentHash

***

### signatureId

> **signatureId**: `string`

Defined in: [services/signatureService.ts:124](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L124)

ID de la firma en base de datos

***

### txHash

> **txHash**: `string`

Defined in: [services/signatureService.ts:125](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/signatureService.ts#L125)

Hash de la transacción blockchain
