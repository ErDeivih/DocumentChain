[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/documentTimelineService](../README.md) / TimelineEvent

# Interface: TimelineEvent

Defined in: [services/documentTimelineService.ts:18](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L18)

Evento individual dentro de la línea temporal de un documento.

## Properties

### actor

> **actor**: `object`

Defined in: [services/documentTimelineService.ts:22](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L22)

Usuario o sistema que ejecutó la acción

#### fullName

> **fullName**: `string` \| `null`

#### id

> **id**: `string`

#### username

> **username**: `string`

#### walletAddress?

> `optional` **walletAddress**: `string`

***

### blockchainTx?

> `optional` **blockchainTx**: `string`

Defined in: [services/documentTimelineService.ts:29](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L29)

Hash de la transacción en blockchain (opcional)

***

### details

> **details**: `Record`\<`string`, `any`\>

Defined in: [services/documentTimelineService.ts:28](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L28)

Información adicional específica del evento

***

### id

> **id**: `string`

Defined in: [services/documentTimelineService.ts:19](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L19)

Identificador del evento

***

### timestamp

> **timestamp**: `Date`

Defined in: [services/documentTimelineService.ts:21](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L21)

Fecha y hora del evento

***

### type

> **type**: `"version_created"` \| `"document_signed"` \| `"document_shared"` \| `"permission_revoked"` \| `"ownership_transferred"` \| `"operational_changed"`

Defined in: [services/documentTimelineService.ts:20](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L20)

Tipo de evento (versión, firma, compartición, etc.)
