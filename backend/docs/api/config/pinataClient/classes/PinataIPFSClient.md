[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/pinataClient](../README.md) / PinataIPFSClient

# Class: PinataIPFSClient

Defined in: config/pinataClient.ts:23

Cliente IPFS para Pinata que implementa la interfaz `IPFSAdapter`.
Utiliza la API v1 de Pinata para anclar, desanclar y listar archivos,
así como el gateway dedicado para descargas.

## Implements

- [`IPFSAdapter`](../../ipfs/interfaces/IPFSAdapter.md)

## Constructors

### Constructor

> **new PinataIPFSClient**(`config`): `PinataIPFSClient`

Defined in: config/pinataClient.ts:35

Crea una instancia del cliente de Pinata.

#### Parameters

##### config

[`PinataConfig`](../interfaces/PinataConfig.md)

Configuración de autenticación y gateway.

#### Returns

`PinataIPFSClient`

## Methods

### add()

> **add**(`fileData`): `Promise`\<`string`\>

Defined in: config/pinataClient.ts:68

Sube datos a IPFS a través de Pinata.

#### Parameters

##### fileData

`Buffer`

Buffer con los datos a almacenar.

#### Returns

`Promise`\<`string`\>

CID del contenido anclado.

#### Throws

Error si la subida falla o no se devuelve un CID.

#### Implementation of

[`IPFSAdapter`](../../ipfs/interfaces/IPFSAdapter.md).[`add`](../../ipfs/interfaces/IPFSAdapter.md#add)

***

### cat()

> **cat**(`cid`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: config/pinataClient.ts:102

Descarga el contenido asociado a un CID desde el gateway de Pinata.

#### Parameters

##### cid

`string`

Identificador de contenido a descargar.

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Buffer con los datos recuperados.

#### Throws

Error si la descarga falla.

#### Implementation of

[`IPFSAdapter`](../../ipfs/interfaces/IPFSAdapter.md).[`cat`](../../ipfs/interfaces/IPFSAdapter.md#cat)

***

### getGatewayUrl()

> **getGatewayUrl**(`cid`): `string`

Defined in: config/pinataClient.ts:216

Obtiene la URL completa del gateway de Pinata para un CID determinado.

#### Parameters

##### cid

`string`

Identificador de contenido.

#### Returns

`string`

URL de acceso al contenido a través del gateway.

***

### getPinStatus()

> **getPinStatus**(`cid`): `Promise`\<`any`\>

Defined in: config/pinataClient.ts:156

Consulta el estado de anclaje de un CID en Pinata.

#### Parameters

##### cid

`string`

Identificador de contenido a consultar.

#### Returns

`Promise`\<`any`\>

Objeto con el estado de anclaje (`pinned`, `unpinned` o `unknown`).

#### Implementation of

[`IPFSAdapter`](../../ipfs/interfaces/IPFSAdapter.md).[`getPinStatus`](../../ipfs/interfaces/IPFSAdapter.md#getpinstatus)

***

### listPins()

> **listPins**(): `Promise`\<`any`[]\>

Defined in: config/pinataClient.ts:189

Lista todos los CIDs anclados actualmente en Pinata.

#### Returns

`Promise`\<`any`[]\>

Arreglo de objetos con información de cada anclaje.

#### Throws

Error si la consulta a la API falla.

#### Implementation of

[`IPFSAdapter`](../../ipfs/interfaces/IPFSAdapter.md).[`listPins`](../../ipfs/interfaces/IPFSAdapter.md#listpins)

***

### pin()

> **pin**(`cid`): `Promise`\<`void`\>

Defined in: config/pinataClient.ts:121

Ancla un CID en Pinata.
Dado que Pinata ya ancla automáticamente al subir, esta operación es un no-op,
pero se registra para trazabilidad.

#### Parameters

##### cid

`string`

Identificador de contenido a anclar.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IPFSAdapter`](../../ipfs/interfaces/IPFSAdapter.md).[`pin`](../../ipfs/interfaces/IPFSAdapter.md#pin)

***

### unpin()

> **unpin**(`cid`): `Promise`\<`void`\>

Defined in: config/pinataClient.ts:131

Desancla un CID de Pinata.

#### Parameters

##### cid

`string`

Identificador de contenido a desanclar.

#### Returns

`Promise`\<`void`\>

#### Throws

Error si la operación de desanclaje falla (excepto error 404, que se trata como éxito).

#### Implementation of

[`IPFSAdapter`](../../ipfs/interfaces/IPFSAdapter.md).[`unpin`](../../ipfs/interfaces/IPFSAdapter.md#unpin)

***

### unpinAll()

> **unpinAll**(): `Promise`\<`number`\>

Defined in: config/pinataClient.ts:226

Desancla en bloque todos los archivos almacenados actualmente en Pinata.
Útil para limpiezas de datos de prueba y respetar los límites del plan gratuito.

#### Returns

`Promise`\<`number`\>

Número de elementos desanclados correctamente.
