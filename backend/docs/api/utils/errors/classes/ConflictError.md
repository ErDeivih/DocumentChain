[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/errors](../README.md) / ConflictError

# Class: ConflictError

Defined in: [utils/errors.ts:92](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L92)

Error lanzado cuando se detecta un conflicto, por ejemplo, porque el recurso ya existe.

## Param

Mensaje descriptivo del error.

## Param

Campo que causó el conflicto, si aplica.

## Extends

- `Error`

## Constructors

### Constructor

> **new ConflictError**(`message`, `field?`): `ConflictError`

Defined in: [utils/errors.ts:95](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L95)

#### Parameters

##### message

`string`

##### field?

`string`

#### Returns

`ConflictError`

#### Overrides

`Error.constructor`

## Properties

### field?

> `optional` **field**: `string`

Defined in: [utils/errors.ts:93](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L93)
