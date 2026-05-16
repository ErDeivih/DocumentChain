[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/transferService](../README.md) / ConfirmTransferInput

# Interface: ConfirmTransferInput

Defined in: [services/transferService.ts:69](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L69)

Datos de entrada para confirmar una transferencia.

## Properties

### documentId?

> `optional` **documentId**: `string`

Defined in: [services/transferService.ts:73](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L73)

ID del documento (opcional)

***

### newOwnerId?

> `optional` **newOwnerId**: `string`

Defined in: [services/transferService.ts:74](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L74)

ID del nuevo propietario (opcional)

***

### signature

> **signature**: `string`

Defined in: [services/transferService.ts:72](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L72)

Firma de la transacción

***

### transferId

> **transferId**: `string`

Defined in: [services/transferService.ts:70](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L70)

Identificador de la transferencia

***

### txHash

> **txHash**: `string`

Defined in: [services/transferService.ts:71](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L71)

Hash de la transacción blockchain
