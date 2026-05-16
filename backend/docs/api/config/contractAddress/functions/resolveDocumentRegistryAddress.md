[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/contractAddress](../README.md) / resolveDocumentRegistryAddress

# Function: resolveDocumentRegistryAddress()

> **resolveDocumentRegistryAddress**(): `string` \| `undefined`

Defined in: [config/contractAddress.ts:108](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/contractAddress.ts#L108)

Resuelve la dirección del contrato `DocumentRegistry` priorizando
la dirección de despliegue local cuando se usa un RPC local.

## Returns

`string` \| `undefined`

Dirección del contrato resuelta, o `undefined` si no se puede determinar.
