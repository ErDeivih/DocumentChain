[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/shareService](../README.md) / PrepareShareInput

# Interface: PrepareShareInput

Defined in: [services/shareService.ts:73](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L73)

Datos de entrada para preparar una compartición.

## Properties

### decryptedSymmetricKey

> **decryptedSymmetricKey**: `string`

Defined in: [services/shareService.ts:79](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L79)

Clave simétrica descifrada (Base64)

***

### documentId

> **documentId**: `string`

Defined in: [services/shareService.ts:74](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L74)

ID del documento a compartir

***

### role

> **role**: `"SHARED_WRITE"` \| `"SHARED_READ"`

Defined in: [services/shareService.ts:76](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L76)

Rol a asignar

***

### sharedToWalletAddress?

> `optional` **sharedToWalletAddress**: `string`

Defined in: [services/shareService.ts:80](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L80)

Dirección destino (opcional)

***

### sharedWithUserId

> **sharedWithUserId**: `string`

Defined in: [services/shareService.ts:75](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L75)

ID del usuario destinatario

***

### sharerUserId

> **sharerUserId**: `string`

Defined in: [services/shareService.ts:77](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L77)

ID del usuario que comparte

***

### sharerWalletId

> **sharerWalletId**: `string`

Defined in: [services/shareService.ts:78](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L78)

Wallet del usuario que comparte
