[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/errors](../README.md) / NotFoundError

# Class: NotFoundError

Defined in: [utils/errors.ts:12](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L12)

Error lanzado cuando un recurso solicitado no se encuentra.

## Param

Nombre del recurso no encontrado.

## Param

Identificador opcional del recurso.

## Extends

- `Error`

## Constructors

### Constructor

> **new NotFoundError**(`resource`, `id?`): `NotFoundError`

Defined in: [utils/errors.ts:13](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L13)

#### Parameters

##### resource

`string`

##### id?

`string`

#### Returns

`NotFoundError`

#### Overrides

`Error.constructor`
