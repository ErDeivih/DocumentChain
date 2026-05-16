[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/notificationService](../README.md) / CreateNotificationData

# Interface: CreateNotificationData

Defined in: [services/notificationService.ts:42](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L42)

Datos requeridos para crear una notificación.

## Properties

### data?

> `optional` **data**: `Record`\<`string`, `any`\>

Defined in: [services/notificationService.ts:48](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L48)

Metadatos adicionales (opcional)

***

### link?

> `optional` **link**: `string`

Defined in: [services/notificationService.ts:47](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L47)

Enlace de acción (opcional)

***

### message

> **message**: `string`

Defined in: [services/notificationService.ts:46](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L46)

Cuerpo del mensaje

***

### title

> **title**: `string`

Defined in: [services/notificationService.ts:45](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L45)

Título de la notificación

***

### type

> **type**: [`NotificationType`](../enumerations/NotificationType.md)

Defined in: [services/notificationService.ts:44](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L44)

Tipo de notificación

***

### userId

> **userId**: `string`

Defined in: [services/notificationService.ts:43](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L43)

Identificador del destinatario
