[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/documentTimelineService](../README.md) / DocumentTimeline

# Interface: DocumentTimeline

Defined in: [services/documentTimelineService.ts:38](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L38)

Línea temporal completa de un documento.

## Properties

### blockchainId

> **blockchainId**: `string`

Defined in: [services/documentTimelineService.ts:40](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L40)

ID del documento en blockchain

***

### documentId

> **documentId**: `string`

Defined in: [services/documentTimelineService.ts:39](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L39)

ID interno del documento

***

### events

> **events**: [`TimelineEvent`](TimelineEvent.md)[]

Defined in: [services/documentTimelineService.ts:41](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L41)

Lista cronológica de eventos
