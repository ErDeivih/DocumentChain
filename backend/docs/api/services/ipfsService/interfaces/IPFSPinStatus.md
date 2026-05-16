[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/ipfsService](../README.md) / IPFSPinStatus

# Interface: IPFSPinStatus

Defined in: [services/ipfsService.ts:35](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L35)

Estado de anclaje (pin) de un contenido en IPFS.

## Properties

### cid

> **cid**: `string`

Defined in: [services/ipfsService.ts:36](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L36)

Content Identifier consultado

***

### isPinned

> **isPinned**: `boolean`

Defined in: [services/ipfsService.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L37)

Indica si está anclado

***

### peerMap

> **peerMap**: `Record`\<`string`, `any`\>

Defined in: [services/ipfsService.ts:38](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L38)

Mapa de pares con replicación del contenido
