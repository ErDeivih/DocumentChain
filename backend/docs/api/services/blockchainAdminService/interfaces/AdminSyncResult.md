[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/blockchainAdminService](../README.md) / AdminSyncResult

# Interface: AdminSyncResult

Defined in: [services/blockchainAdminService.ts:13](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L13)

Resultado de una operación de sincronización de administrador en blockchain.

## Properties

### address

> **address**: `string`

Defined in: [services/blockchainAdminService.ts:15](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L15)

Dirección Ethereum afectada

***

### error?

> `optional` **error**: `string`

Defined in: [services/blockchainAdminService.ts:17](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L17)

Mensaje de error en caso de fallo

***

### success

> **success**: `boolean`

Defined in: [services/blockchainAdminService.ts:14](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L14)

Indica si la operación fue exitosa

***

### txHash?

> `optional` **txHash**: `string`

Defined in: [services/blockchainAdminService.ts:16](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L16)

Hash de la transacción (opcional)
