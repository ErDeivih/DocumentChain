[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/ipfsService](../README.md) / IPFSService

# Class: IPFSService

Defined in: [services/ipfsService.ts:45](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L45)

Servicio de interacción con IPFS (nodo self-hosted).
Proporciona operaciones de subida, descarga, anclaje y verificación de contenido.

## Constructors

### Constructor

> **new IPFSService**(): `IPFSService`

Defined in: [services/ipfsService.ts:48](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L48)

#### Returns

`IPFSService`

## Methods

### calculateCID()

> **calculateCID**(`buffer`): `Promise`\<`string`\>

Defined in: [services/ipfsService.ts:259](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L259)

Calcular CID de un archivo sin subirlo
Útil para verificar si un archivo ya existe antes de subirlo

#### Parameters

##### buffer

`Buffer`

Contenido del archivo

#### Returns

`Promise`\<`string`\>

CID calculado localmente

***

### downloadFile()

> **downloadFile**(`cid`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: [services/ipfsService.ts:95](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L95)

Descargar archivo de IPFS

#### Parameters

##### cid

`string`

Content Identifier del archivo

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Buffer con el contenido del archivo

***

### garbageCollect()

> **garbageCollect**(): `Promise`\<\{ `cleaned`: `number`; `freedBytes`: `number`; \}\>

Defined in: [services/ipfsService.ts:282](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L282)

Garbage collection - Limpiar archivos unpinned
Libera espacio en el nodo IPFS autoalojado
⚠️ Solo ejecutar manualmente o con cron job

#### Returns

`Promise`\<\{ `cleaned`: `number`; `freedBytes`: `number`; \}\>

***

### getFileSize()

> **getFileSize**(`cid`): `Promise`\<`number` \| `null`\>

Defined in: [services/ipfsService.ts:204](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L204)

Obtener tamaño de un archivo sin descargarlo (si es posible)

#### Parameters

##### cid

`string`

Content Identifier

#### Returns

`Promise`\<`number` \| `null`\>

Tamaño en bytes o null si no se puede determinar

***

### getPinStatus()

> **getPinStatus**(`cid`): `Promise`\<[`IPFSPinStatus`](../interfaces/IPFSPinStatus.md)\>

Defined in: [services/ipfsService.ts:157](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L157)

Verificar estado de pin de un archivo

#### Parameters

##### cid

`string`

Content Identifier a verificar

#### Returns

`Promise`\<[`IPFSPinStatus`](../interfaces/IPFSPinStatus.md)\>

Estado de pin

***

### isAvailable()

> **isAvailable**(`cid`): `Promise`\<`boolean`\>

Defined in: [services/ipfsService.ts:188](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L188)

Verificar si un archivo está disponible en IPFS
Intenta obtener su status sin descargarlo

#### Parameters

##### cid

`string`

Content Identifier a verificar

#### Returns

`Promise`\<`boolean`\>

true si está disponible

***

### pinFile()

> **pinFile**(`cid`): `Promise`\<`void`\>

Defined in: [services/ipfsService.ts:117](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L117)

Pin un archivo en el nodo IPFS propio
 * Útil para archivos que se suben externamente pero queremos mantener
 * 
 *

#### Parameters

##### cid

`string`

Content Identifier a hacer pin

#### Returns

`Promise`\<`void`\>

***

### unpinFile()

> **unpinFile**(`cid`): `Promise`\<`void`\>

Defined in: [services/ipfsService.ts:137](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L137)

Unpin un archivo del nodo IPFS propio
 * ⚠️ CUIDADO: Solo usar cuando se elimina permanentemente un documento
 * 
 *

#### Parameters

##### cid

`string`

Content Identifier a unpin

#### Returns

`Promise`\<`void`\>

***

### uploadFile()

> **uploadFile**(`buffer`): `Promise`\<[`IPFSUploadResult`](../interfaces/IPFSUploadResult.md)\>

Defined in: [services/ipfsService.ts:59](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L59)

Subir archivo a IPFS
El nodo self-hosted deja el contenido anclado tras el alta.
 * 
 *

#### Parameters

##### buffer

`Buffer`

Contenido del archivo (ya cifrado)
 *

#### Returns

`Promise`\<[`IPFSUploadResult`](../interfaces/IPFSUploadResult.md)\>

Resultado con CID y metadata

***

### uploadMultipleFiles()

> **uploadMultipleFiles**(`files`): `Promise`\<[`IPFSUploadResult`](../interfaces/IPFSUploadResult.md)[]\>

Defined in: [services/ipfsService.ts:230](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/ipfsService.ts#L230)

Batch upload de múltiples archivos
Más eficiente que subir uno por uno

#### Parameters

##### files

`Buffer`\<`ArrayBufferLike`\>[]

Array de buffers a subir

#### Returns

`Promise`\<[`IPFSUploadResult`](../interfaces/IPFSUploadResult.md)[]\>

Array de resultados con CIDs
