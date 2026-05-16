[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/emailService](../README.md) / EmailService

# Class: EmailService

Defined in: [services/emailService.ts:12](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L12)

Servicio de correo electrónico.
Gestiona el envío de emails transaccionales y notificaciones mediante SMTP.
Utiliza plantillas Handlebars para la generación de contenido HTML.

## Constructors

### Constructor

> **new EmailService**(): `EmailService`

Defined in: [services/emailService.ts:24](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L24)

#### Returns

`EmailService`

## Methods

### getDiagnostics()

> **getDiagnostics**(): `object`

Defined in: [services/emailService.ts:97](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L97)

#### Returns

`object`

##### appUrl

> **appUrl**: `string`

##### fromEmail

> **fromEmail**: `string`

##### fromName

> **fromName**: `string`

##### smtpHost

> **smtpHost**: `string`

##### smtpPort

> **smtpPort**: `number`

##### smtpSecure

> **smtpSecure**: `boolean`

##### smtpUsesAuth

> **smtpUsesAuth**: `boolean`

##### warnings

> **warnings**: `string`[]

***

### sendDocumentSharedNotification()

> **sendDocumentSharedNotification**(`email`, `recipientUsername`, `documentTitle`, `sharedByUsername`, `documentId`, `permissions`): `Promise`\<`void`\>

Defined in: [services/emailService.ts:288](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L288)

Envía notificación de documento compartido

#### Parameters

##### email

`string`

##### recipientUsername

`string`

##### documentTitle

`string`

##### sharedByUsername

`string`

##### documentId

`string`

##### permissions

`string`[]

#### Returns

`Promise`\<`void`\>

***

### sendNotification()

> **sendNotification**(`email`, `username`, `subject`, `message`, `actionUrl?`, `actionText?`): `Promise`\<`void`\>

Defined in: [services/emailService.ts:365](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L365)

Envía notificación genérica

#### Parameters

##### email

`string`

##### username

`string`

##### subject

`string`

##### message

`string`

##### actionUrl?

`string`

##### actionText?

`string`

#### Returns

`Promise`\<`void`\>

***

### sendPasswordChangedNotification()

> **sendPasswordChangedNotification**(`email`, `username`, `ipAddress?`, `userAgent?`): `Promise`\<`void`\>

Defined in: [services/emailService.ts:260](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L260)

Envía notificación de cambio de contraseña exitoso

#### Parameters

##### email

`string`

##### username

`string`

##### ipAddress?

`string`

##### userAgent?

`string`

#### Returns

`Promise`\<`void`\>

***

### sendPasswordResetEmail()

> **sendPasswordResetEmail**(`email`, `username`, `token`): `Promise`\<`void`\>

Defined in: [services/emailService.ts:232](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L232)

Envía email para resetear contraseña

#### Parameters

##### email

`string`

##### username

`string`

##### token

`string`

#### Returns

`Promise`\<`void`\>

***

### sendSecurityAlert()

> **sendSecurityAlert**(`email`, `username`, `alertType`, `details`): `Promise`\<`void`\>

Defined in: [services/emailService.ts:321](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L321)

Envía alerta de seguridad (login desde nuevo dispositivo/IP)

#### Parameters

##### email

`string`

##### username

`string`

##### alertType

`"new_device"` | `"new_ip"` | `"password_attempt"` | `"2fa_disabled"`

##### details

###### ipAddress?

`string`

###### location?

`string`

###### timestamp?

`Date`

###### userAgent?

`string`

#### Returns

`Promise`\<`void`\>

***

### sendVerificationEmail()

> **sendVerificationEmail**(`email`, `username`, `token`): `Promise`\<`void`\>

Defined in: [services/emailService.ts:205](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L205)

Envía email de verificación de cuenta

#### Parameters

##### email

`string`

##### username

`string`

##### token

`string`

#### Returns

`Promise`\<`void`\>

***

### sendWelcomeEmail()

> **sendWelcomeEmail**(`email`, `username`): `Promise`\<`void`\>

Defined in: [services/emailService.ts:338](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L338)

Envía email de bienvenida

#### Parameters

##### email

`string`

##### username

`string`

#### Returns

`Promise`\<`void`\>

***

### verifyConnection()

> **verifyConnection**(): `Promise`\<`boolean`\>

Defined in: [services/emailService.ts:138](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/emailService.ts#L138)

Verifica la conexión SMTP

#### Returns

`Promise`\<`boolean`\>
