[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/timelineController](../README.md) / TimelineController

# Class: TimelineController

Defined in: [controllers/timelineController.ts:10](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/timelineController.ts#L10)

## Constructors

### Constructor

> **new TimelineController**(): `TimelineController`

#### Returns

`TimelineController`

## Methods

### getDocumentTimeline()

> `static` **getDocumentTimeline**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/timelineController.ts:19](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/timelineController.ts#L19)

Obtiene la línea temporal de eventos de un documento.
Endpoint: GET /api/documents/:id/timeline

#### Parameters

##### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.

##### res

`Response`

Objeto de respuesta HTTP.

#### Returns

`Promise`\<`void`\>

Promesa que resuelve con la línea temporal del documento.
