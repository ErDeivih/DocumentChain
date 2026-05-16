[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/fileValidation](../README.md) / isValidFileSize

# Function: isValidFileSize()

> **isValidFileSize**(`filename`, `size`): `object`

Defined in: [utils/fileValidation.ts:206](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/fileValidation.ts#L206)

Valida que el tamaño de un archivo no exceda el límite definido para su tipo.

## Parameters

### filename

`string`

Nombre del archivo.

### size

`number`

Tamaño del archivo en bytes.

## Returns

`object`

Objeto indicando si es válido y, en su caso, el tamaño máximo permitido.

### maxSize?

> `optional` **maxSize**: `number`

### valid

> **valid**: `boolean`
