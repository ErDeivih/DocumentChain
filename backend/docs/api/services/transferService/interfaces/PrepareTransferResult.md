[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/transferService](../README.md) / PrepareTransferResult

# Interface: PrepareTransferResult

Defined in: [services/transferService.ts:51](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L51)

Resultado de la preparación de una transferencia.

## Properties

### currentOwnerAddress

> **currentOwnerAddress**: `string`

Defined in: [services/transferService.ts:55](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L55)

Dirección del propietario actual

***

### docId

> **docId**: `string`

Defined in: [services/transferService.ts:54](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L54)

bytes32 para blockchain

***

### documentId

> **documentId**: `string`

Defined in: [services/transferService.ts:53](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L53)

ID del documento

***

### message

> **message**: `string`

Defined in: [services/transferService.ts:57](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L57)

Mensaje a firmar en frontend

***

### newOwnerAddress

> **newOwnerAddress**: `string`

Defined in: [services/transferService.ts:56](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L56)

Dirección del nuevo propietario

***

### nonce

> **nonce**: `number`

Defined in: [services/transferService.ts:58](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L58)

Nonce para evitar replay

***

### transferId

> **transferId**: `string`

Defined in: [services/transferService.ts:52](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/transferService.ts#L52)

Identificador de la transferencia
