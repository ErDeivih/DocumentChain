[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/errors](../README.md) / IPFSError

# Class: IPFSError

Defined in: [utils/errors.ts:76](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L76)

Error lanzado durante operaciones relacionadas con IPFS.

## Param

Mensaje descriptivo del error.

## Param

Identificador de contenido (CID) asociado, si existe.

## Extends

- `Error`

## Constructors

### Constructor

> **new IPFSError**(`message`, `cid?`): `IPFSError`

Defined in: [utils/errors.ts:79](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L79)

#### Parameters

##### message

`string`

##### cid?

`string`

#### Returns

`IPFSError`

#### Overrides

`Error.constructor`

## Properties

### cid?

> `optional` **cid**: `string`

Defined in: [utils/errors.ts:77](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L77)
