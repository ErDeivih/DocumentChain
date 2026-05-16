[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [lib/encryption](../README.md) / validateFileSize

# Function: validateFileSize()

> **validateFileSize**(`fileSize`, `maxSizeMB?`): `void`

Defined in: [lib/encryption.ts:167](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/encryption.ts#L167)

Valida que el tamaño de un archivo no exceda el límite permitido.

## Parameters

### fileSize

`number`

Tamaño del archivo en bytes.

### maxSizeMB?

`number` = `100`

Tamaño máximo permitido en MB (por defecto: 100 MB).

## Returns

`void`

## Throws

Error si el archivo supera el tamaño máximo.
