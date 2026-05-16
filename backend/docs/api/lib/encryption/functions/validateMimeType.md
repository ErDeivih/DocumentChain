[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [lib/encryption](../README.md) / validateMimeType

# Function: validateMimeType()

> **validateMimeType**(`mimeType`, `allowedTypes?`): `void`

Defined in: [lib/encryption.ts:180](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/encryption.ts#L180)

Valida un tipo MIME contra una lista blanca de tipos permitidos.

## Parameters

### mimeType

`string`

Tipo MIME del archivo.

### allowedTypes?

Lista opcional de tipos MIME permitidos (`null` permite todos).

`string`[] | `null`

## Returns

`void`

## Throws

Error si el tipo MIME no está permitido.
