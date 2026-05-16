[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/shareService](../README.md) / ShareInfo

# Interface: ShareInfo

Defined in: [services/shareService.ts:47](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L47)

Información de una compartición de documento.

## Properties

### blockchainStatus

> **blockchainStatus**: `BlockchainStatus`

Defined in: [services/shareService.ts:53](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L53)

Estado de sincronización en blockchain

***

### createdAt

> **createdAt**: `string`

Defined in: [services/shareService.ts:54](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L54)

Fecha de creación en formato ISO

***

### documentId

> **documentId**: `string`

Defined in: [services/shareService.ts:49](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L49)

ID del documento compartido

***

### id

> **id**: `string`

Defined in: [services/shareService.ts:48](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L48)

Identificador del share

***

### role

> **role**: `"OWNER"` \| `"SHARED_WRITE"` \| `"SHARED_READ"`

Defined in: [services/shareService.ts:51](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L51)

Rol asignado (lectura, escritura o propietario)

***

### sharerWalletId

> **sharerWalletId**: `string` \| `null`

Defined in: [services/shareService.ts:52](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L52)

Wallet que realizó la compartición

***

### user?

> `optional` **user**: `object`

Defined in: [services/shareService.ts:55](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L55)

Datos básicos del destinatario

#### avatarUrl

> **avatarUrl**: `string` \| `null`

#### email

> **email**: `string`

#### fullName

> **fullName**: `string` \| `null`

#### username

> **username**: `string`

***

### userId

> **userId**: `string`

Defined in: [services/shareService.ts:50](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/shareService.ts#L50)

ID del usuario destinatario
