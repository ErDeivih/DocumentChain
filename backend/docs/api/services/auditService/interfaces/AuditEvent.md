[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/auditService](../README.md) / AuditEvent

# Interface: AuditEvent

Defined in: [services/auditService.ts:31](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L31)

Evento de auditoría extraído de blockchain o base de datos.

## Properties

### actor

> **actor**: `string`

Defined in: [services/auditService.ts:35](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L35)

Dirección o identificador del actor que generó el evento

***

### blockchainId

> **blockchainId**: `string`

Defined in: [services/auditService.ts:34](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L34)

ID del documento en blockchain

***

### blockNumber

> **blockNumber**: `number`

Defined in: [services/auditService.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L37)

Número de bloque en blockchain

***

### details

> **details**: `Record`\<`string`, `any`\>

Defined in: [services/auditService.ts:39](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L39)

Metadatos adicionales del evento

***

### eventType

> **eventType**: `string`

Defined in: [services/auditService.ts:33](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L33)

Tipo de evento (ej. DocumentCreated)

***

### id

> **id**: `string`

Defined in: [services/auditService.ts:32](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L32)

Identificador único del evento

***

### timestamp

> **timestamp**: `Date`

Defined in: [services/auditService.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L36)

Fecha y hora del evento

***

### transactionHash

> **transactionHash**: `string`

Defined in: [services/auditService.ts:38](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L38)

Hash de la transacción
