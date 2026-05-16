[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/versionService](../README.md) / PrepareVersionInput

# Interface: PrepareVersionInput

Defined in: [services/versionService.ts:58](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L58)

Datos de entrada para preparar una nueva versión.

## Properties

### comment?

> `optional` **comment**: `string`

Defined in: [services/versionService.ts:61](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L61)

Comentario descriptivo (opcional)

***

### documentId

> **documentId**: `string`

Defined in: [services/versionService.ts:59](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L59)

ID del documento

***

### fileBuffer

> **fileBuffer**: `Buffer`

Defined in: [services/versionService.ts:60](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L60)

Archivo sin cifrar recibido del frontend

***

### userId

> **userId**: `string`

Defined in: [services/versionService.ts:62](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L62)

ID del usuario creador

***

### walletId

> **walletId**: `string`

Defined in: [services/versionService.ts:63](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/versionService.ts#L63)

Wallet utilizada para la operación
