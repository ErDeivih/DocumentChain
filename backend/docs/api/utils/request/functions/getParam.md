[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/request](../README.md) / getParam

# Function: getParam()

> **getParam**(`value`): `string`

Defined in: [utils/request.ts:13](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/request.ts#L13)

Obtiene un único valor de tipo cadena a partir de un parámetro de la solicitud.
Dado que Express puede proporcionar `string | string[]`, esta función garantiza
que se devuelva una única cadena.

## Parameters

### value

Valor del parámetro (puede ser cadena, arreglo de cadenas o indefinido).

`string` | `string`[] | `undefined`

## Returns

`string`

Primera cadena del arreglo, la cadena misma, o una cadena vacía.
