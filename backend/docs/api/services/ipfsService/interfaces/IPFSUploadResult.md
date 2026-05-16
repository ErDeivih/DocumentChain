[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/ipfsService](../README.md) / IPFSUploadResult

# Interface: IPFSUploadResult

Defined in: [services/ipfsService.ts:23](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L23)

Resultado de la subida de un archivo a IPFS.

## Properties

### cid

> **cid**: `string`

Defined in: [services/ipfsService.ts:24](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L24)

Content Identifier generado por IPFS

***

### pinned

> **pinned**: `boolean`

Defined in: [services/ipfsService.ts:26](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L26)

Indica si el archivo fue anclado en el nodo

***

### size

> **size**: `number`

Defined in: [services/ipfsService.ts:25](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L25)

Tamaño del archivo en bytes
