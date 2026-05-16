[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/logger](../README.md) / logIPFSError

# Function: logIPFSError()

> **logIPFSError**(`operation`, `error`, `cid?`): `void`

Defined in: [utils/logger.ts:297](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L297)

Registra un error ocurrido durante una operación IPFS.

## Parameters

### operation

`string`

Nombre de la operación que falló.

### error

`Error`

Instancia del error producido.

### cid?

`string`

Identificador de contenido (CID) afectado, si aplica.

## Returns

`void`
