[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/shareService](../README.md) / ConfirmShareInput

# Interface: ConfirmShareInput

Defined in: [services/shareService.ts:103](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L103)

Datos de entrada para confirmar una compartición.

## Properties

### documentId?

> `optional` **documentId**: `string`

Defined in: [services/shareService.ts:106](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L106)

ID del documento (opcional)

***

### recipientId?

> `optional` **recipientId**: `string`

Defined in: [services/shareService.ts:107](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L107)

ID del destinatario (opcional)

***

### role?

> `optional` **role**: `"SHARED_WRITE"` \| `"SHARED_READ"`

Defined in: [services/shareService.ts:108](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L108)

Rol confirmado (opcional)

***

### shareId

> **shareId**: `string`

Defined in: [services/shareService.ts:104](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L104)

Identificador del share

***

### txHash

> **txHash**: `string`

Defined in: [services/shareService.ts:105](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L105)

Hash de la transacción blockchain
