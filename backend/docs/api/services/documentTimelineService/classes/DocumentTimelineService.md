[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/documentTimelineService](../README.md) / DocumentTimelineService

# Class: DocumentTimelineService

Defined in: [services/documentTimelineService.ts:64](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L64)

Servicio de construcción de líneas temporales de documentos.
Agrega eventos persistidos en la base de datos y los presenta en orden cronológico.

## Constructors

### Constructor

> **new DocumentTimelineService**(): `DocumentTimelineService`

#### Returns

`DocumentTimelineService`

## Methods

### getDocumentTimeline()

> `static` **getDocumentTimeline**(`documentId`, `userId`): `Promise`\<[`DocumentTimeline`](../interfaces/DocumentTimeline.md)\>

Defined in: [services/documentTimelineService.ts:68](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentTimelineService.ts#L68)

Obtener la línea temporal completa de un documento

#### Parameters

##### documentId

`string`

##### userId

`string`

#### Returns

`Promise`\<[`DocumentTimeline`](../interfaces/DocumentTimeline.md)\>
