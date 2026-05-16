[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/transferService](../README.md) / PrepareTransferInput

# Interface: PrepareTransferInput

Defined in: [services/transferService.ts:32](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L32)

Datos de entrada para preparar una transferencia de propiedad.

## Properties

### currentOwnerId

> **currentOwnerId**: `string`

Defined in: [services/transferService.ts:34](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L34)

ID del propietario actual

***

### currentOwnerWalletId

> **currentOwnerWalletId**: `string`

Defined in: [services/transferService.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L36)

Wallet del propietario actual

***

### decryptedSymmetricKey?

> `optional` **decryptedSymmetricKey**: `string`

Defined in: [services/transferService.ts:38](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L38)

Clave simétrica descifrada (Base64, opcional)

***

### documentId

> **documentId**: `string`

Defined in: [services/transferService.ts:33](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L33)

ID del documento a transferir

***

### newOwnerId

> **newOwnerId**: `string`

Defined in: [services/transferService.ts:35](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L35)

ID del nuevo propietario

***

### newOwnerWalletAddress

> **newOwnerWalletAddress**: `string`

Defined in: [services/transferService.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L37)

Dirección del nuevo propietario
