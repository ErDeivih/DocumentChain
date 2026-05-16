[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/request](../README.md) / getQueryArray

# Function: getQueryArray()

> **getQueryArray**(`value`): `string`[]

Defined in: [utils/request.ts:39](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/request.ts#L39)

Obtiene un parámetro de consulta como un arreglo de cadenas.

## Parameters

### value

Valor del query (puede ser cadena, arreglo de cadenas o indefinido).

`string` | `string`[] | `undefined`

## Returns

`string`[]

Arreglo de cadenas; si el valor es una cadena única, se envuelve en un arreglo.
