[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/fileValidation](../README.md) / validateFile

# Function: validateFile()

> **validateFile**(`filename`, `mimeType`, `size`): [`FileValidationResult`](../interfaces/FileValidationResult.md)

Defined in: [utils/fileValidation.ts:236](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/fileValidation.ts#L236)

Realiza una validación completa de un archivo comprobando extensión, tipo MIME y tamaño.

## Parameters

### filename

`string`

Nombre del archivo.

### mimeType

`string`

Tipo MIME del archivo.

### size

`number`

Tamaño del archivo en bytes.

## Returns

[`FileValidationResult`](../interfaces/FileValidationResult.md)

Resultado de la validación con posibles errores y configuración detectada.
