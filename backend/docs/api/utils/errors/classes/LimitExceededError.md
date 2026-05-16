[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/errors](../README.md) / LimitExceededError

# Class: LimitExceededError

Defined in: [utils/errors.ts:109](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L109)

Error lanzado cuando se excede un límite establecido (rate limit, tamaño de archivo, etc.).

## Param

Mensaje descriptivo del error.

## Param

Valor del límite excedido.

## Param

Valor actual que provocó el exceso.

## Extends

- `Error`

## Constructors

### Constructor

> **new LimitExceededError**(`message`, `limit?`, `current?`): `LimitExceededError`

Defined in: [utils/errors.ts:113](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L113)

#### Parameters

##### message

`string`

##### limit?

`number`

##### current?

`number`

#### Returns

`LimitExceededError`

#### Overrides

`Error.constructor`

## Properties

### current?

> `optional` **current**: `number`

Defined in: [utils/errors.ts:111](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L111)

***

### limit?

> `optional` **limit**: `number`

Defined in: [utils/errors.ts:110](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L110)
