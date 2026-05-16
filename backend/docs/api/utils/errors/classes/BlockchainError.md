[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/errors](../README.md) / BlockchainError

# Class: BlockchainError

Defined in: [utils/errors.ts:54](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L54)

Error lanzado durante operaciones relacionadas con la blockchain.

## Param

Mensaje descriptivo del error.

## Param

Hash de la transacción asociada, si existe.

## Param

Código de error específico, si existe.

## Extends

- `Error`

## Constructors

### Constructor

> **new BlockchainError**(`message`, `transactionHash?`, `code?`): `BlockchainError`

Defined in: [utils/errors.ts:58](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L58)

#### Parameters

##### message

`string`

##### transactionHash?

`string`

##### code?

`string`

#### Returns

`BlockchainError`

#### Overrides

`Error.constructor`

## Properties

### code?

> `optional` **code**: `string`

Defined in: [utils/errors.ts:56](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L56)

***

### transactionHash?

> `optional` **transactionHash**: `string`

Defined in: [utils/errors.ts:55](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/errors.ts#L55)
