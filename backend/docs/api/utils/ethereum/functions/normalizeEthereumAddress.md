[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/ethereum](../README.md) / normalizeEthereumAddress

# Function: normalizeEthereumAddress()

> **normalizeEthereumAddress**(`address`): `string` \| `null`

Defined in: [utils/ethereum.ts:9](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/ethereum.ts#L9)

Normaliza una dirección Ethereum comprobando su validez y aplicando el checksum EIP-55.

## Parameters

### address

Dirección Ethereum a normalizar.

`string` | `null` | `undefined`

## Returns

`string` \| `null`

Dirección normalizada con checksum, o `null` si no es válida.
