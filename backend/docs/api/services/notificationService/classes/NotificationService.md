[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/notificationService](../README.md) / NotificationService

# Class: NotificationService

Defined in: [services/notificationService.ts:77](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L77)

Sistema de notificaciones multi-canal.
Gestiona la creación, consulta y envío de notificaciones mediante base de datos, WebSocket y email.

Canales:
- Base de datos: histórico persistente
- WebSocket: push en tiempo real
- Email: notificaciones por correo según preferencias del usuario

⚠️ IMPORTANTE: Las notificaciones SON DATOS PRIVADOS del usuario.
NO se almacenan en blockchain.

## Constructors

### Constructor

> **new NotificationService**(): `NotificationService`

#### Returns

`NotificationService`

## Methods

### createNotification()

> **createNotification**(`data`): `Promise`\<`any`\>

Defined in: [services/notificationService.ts:94](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L94)

Crear y enviar notificación multi-canal

#### Parameters

##### data

[`CreateNotificationData`](../interfaces/CreateNotificationData.md)

Datos de la notificación

#### Returns

`Promise`\<`any`\>

Notificación creada

#### Example

```ts
await notificationService.createNotification({
  userId: 'user-uuid',
  type: NotificationType.FILE_SHARED,
  title: 'Nuevo archivo compartido',
  message: 'Alice compartió "documento.pdf" contigo',
  link: '/files/abc123',
  data: { fileId: 'abc123', ownerId: 'alice-uuid' }
});
```

***

### deleteNotification()

> **deleteNotification**(`notificationId`, `userId`): `Promise`\<`void`\>

Defined in: [services/notificationService.ts:247](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L247)

Eliminar notificación

#### Parameters

##### notificationId

`string`

ID de la notificación

##### userId

`string`

ID del usuario (validación)

#### Returns

`Promise`\<`void`\>

***

### getUnreadCount()

> **getUnreadCount**(`userId`): `Promise`\<`number`\>

Defined in: [services/notificationService.ts:270](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L270)

Obtener conteo de notificaciones no leídas

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<`number`\>

Cantidad de notificaciones no leídas

***

### getUserNotifications()

> **getUserNotifications**(`userId`, `options?`): `Promise`\<\{ `notifications`: `any`[]; `total`: `number`; \}\>

Defined in: [services/notificationService.ts:152](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L152)

Obtener notificaciones de usuario

#### Parameters

##### userId

`string`

ID del usuario

##### options?

[`GetNotificationsOptions`](../interfaces/GetNotificationsOptions.md)

Opciones de filtrado y paginación

#### Returns

`Promise`\<\{ `notifications`: `any`[]; `total`: `number`; \}\>

Notificaciones y total

***

### getUserPreferences()

> **getUserPreferences**(`userId`): `Promise`\<`any`\>

Defined in: [services/notificationService.ts:294](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L294)

Obtener preferencias de notificación del usuario
Crea preferencias por defecto si no existen

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<`any`\>

Preferencias de notificación

***

### markAllAsRead()

> **markAllAsRead**(`userId`): `Promise`\<`number`\>

Defined in: [services/notificationService.ts:218](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L218)

Marcar todas las notificaciones como leídas

#### Parameters

##### userId

`string`

ID del usuario

#### Returns

`Promise`\<`number`\>

Cantidad de notificaciones actualizadas

***

### markAsRead()

> **markAsRead**(`notificationId`, `userId`): `Promise`\<`void`\>

Defined in: [services/notificationService.ts:191](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L191)

Marcar notificación como leída

#### Parameters

##### notificationId

`string`

ID de la notificación

##### userId

`string`

ID del usuario (validación)

#### Returns

`Promise`\<`void`\>

***

### updatePreferences()

> **updatePreferences**(`userId`, `updates`): `Promise`\<`any`\>

Defined in: [services/notificationService.ts:351](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/notificationService.ts#L351)

Actualizar preferencias de notificación

#### Parameters

##### userId

`string`

ID del usuario

##### updates

Actualizaciones de preferencias

###### emailEnabled?

`boolean`

###### pushEnabled?

`boolean`

###### typePreferences?

`Record`\<`string`, `boolean`\>

#### Returns

`Promise`\<`any`\>
