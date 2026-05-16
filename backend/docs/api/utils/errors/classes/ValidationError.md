[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/errors](../README.md) / ValidationError

# Class: ValidationError

Defined in: [utils/errors.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L37)

Error lanzado cuando los datos proporcionados no superan la validación.

## Param

Mensaje descriptivo del error.

## Param

Nombre del campo que generó el error, si aplica.

## Extends

- `Error`

## Constructors

### Constructor

> **new ValidationError**(`message`, `field?`): `ValidationError`

Defined in: [utils/errors.ts:40](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L40)

#### Parameters

##### message

`string`

##### field?

`string`

#### Returns

`ValidationError`

#### Overrides

`Error.constructor`

## Properties

### field?

> `optional` **field**: `string`

Defined in: [utils/errors.ts:38](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L38)
