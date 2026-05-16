[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/blockchainAdminService](../README.md) / BlockchainAdminService

# Class: BlockchainAdminService

Defined in: [services/blockchainAdminService.ts:29](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L29)

Servicio para sincronizar administradores entre la base de datos y el contrato inteligente.
Asegura que los usuarios con rol ADMIN en la base de datos posean el rol ADMIN_ROLE en blockchain.

Patrón Auto-sync:
- Cuando se crea un admin → se otorga ADMIN_ROLE en blockchain
- Cuando se elimina un admin → se revoca ADMIN_ROLE en blockchain
- syncAllAdmins() puede ejecutarse periódicamente para garantizar consistencia

## Constructors

### Constructor

> **new BlockchainAdminService**(): `BlockchainAdminService`

#### Returns

`BlockchainAdminService`

## Methods

### grantAdminRole()

> `static` **grantAdminRole**(`userAddress`): `Promise`\<[`AdminSyncResult`](../interfaces/AdminSyncResult.md)\>

Defined in: [services/blockchainAdminService.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L36)

Otorgar rol de administrador en blockchain a un usuario

#### Parameters

##### userAddress

`string`

Dirección Ethereum del usuario

#### Returns

`Promise`\<[`AdminSyncResult`](../interfaces/AdminSyncResult.md)\>

Resultado de la operación con txHash

***

### hasAdminRole()

> `static` **hasAdminRole**(`userAddress`): `Promise`\<`boolean`\>

Defined in: [services/blockchainAdminService.ts:140](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L140)

Verificar si un usuario tiene rol de administrador en blockchain

#### Parameters

##### userAddress

`string`

Dirección Ethereum del usuario

#### Returns

`Promise`\<`boolean`\>

true si tiene ADMIN_ROLE, false caso contrario

***

### revokeAdminRole()

> `static` **revokeAdminRole**(`userAddress`): `Promise`\<[`AdminSyncResult`](../interfaces/AdminSyncResult.md)\>

Defined in: [services/blockchainAdminService.ts:88](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L88)

Revocar rol de administrador en blockchain a un usuario

#### Parameters

##### userAddress

`string`

Dirección Ethereum del usuario

#### Returns

`Promise`\<[`AdminSyncResult`](../interfaces/AdminSyncResult.md)\>

Resultado de la operación con txHash

***

### syncAdminOnWalletConnect()

> `static` **syncAdminOnWalletConnect**(`userId`, `walletAddress`): `Promise`\<[`AdminSyncResult`](../interfaces/AdminSyncResult.md) \| `null`\>

Defined in: [services/blockchainAdminService.ts:236](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L236)

Sincronizar un admin específico cuando conecta una wallet

Caso de uso: Usuario admin conecta su wallet por primera vez

#### Parameters

##### userId

`string`

ID del usuario en la DB

##### walletAddress

`string`

Dirección de la wallet conectada

#### Returns

`Promise`\<[`AdminSyncResult`](../interfaces/AdminSyncResult.md) \| `null`\>

***

### syncAllAdmins()

> `static` **syncAllAdmins**(): `Promise`\<[`AdminSyncResult`](../interfaces/AdminSyncResult.md)[]\>

Defined in: [services/blockchainAdminService.ts:170](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/blockchainAdminService.ts#L170)

Sincronizar TODOS los administradores de la DB con blockchain

Este método:
1. Obtiene todos los usuarios con role=ADMIN en la DB
2. Verifica que todos tengan ADMIN_ROLE en blockchain
3. Otorga el rol a los que no lo tengan

Útil para:
- Ejecutar al iniciar el backend
- Ejecutar periódicamente (cronjob)
- Recuperar sincronización después de un error

#### Returns

`Promise`\<[`AdminSyncResult`](../interfaces/AdminSyncResult.md)[]\>

Array con el resultado de cada sincronización
