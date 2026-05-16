[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/notificationService](../README.md) / GetNotificationsOptions

# Interface: GetNotificationsOptions

Defined in: [services/notificationService.ts:58](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L58)

Opciones de consulta y filtrado de notificaciones.

## Properties

### limit?

> `optional` **limit**: `number`

Defined in: [services/notificationService.ts:61](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L61)

Límite de resultados

***

### offset?

> `optional` **offset**: `number`

Defined in: [services/notificationService.ts:62](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L62)

Desplazamiento para paginación

***

### type?

> `optional` **type**: [`NotificationType`](../enumerations/NotificationType.md)

Defined in: [services/notificationService.ts:60](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L60)

Filtrar por tipo específico

***

### unreadOnly?

> `optional` **unreadOnly**: `boolean`

Defined in: [services/notificationService.ts:59](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L59)

Solo notificaciones no leídas
