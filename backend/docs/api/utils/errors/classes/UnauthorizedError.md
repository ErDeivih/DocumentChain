[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/errors](../README.md) / UnauthorizedError

# Class: UnauthorizedError

Defined in: [utils/errors.ts:24](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L24)

Error lanzado ante problemas de autenticación o autorización.

## Param

Mensaje descriptivo del error (por defecto: `'Acceso no autorizado'`).

## Extends

- `Error`

## Constructors

### Constructor

> **new UnauthorizedError**(`message?`): `UnauthorizedError`

Defined in: [utils/errors.ts:25](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L25)

#### Parameters

##### message?

`string` = `'Acceso no autorizado'`

#### Returns

`UnauthorizedError`

#### Overrides

`Error.constructor`
