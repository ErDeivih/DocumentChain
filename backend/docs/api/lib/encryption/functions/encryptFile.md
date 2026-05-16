[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [lib/encryption](../README.md) / encryptFile

# Function: encryptFile()

> **encryptFile**(`fileBuffer`, `symmetricKey?`): [`EncryptionResult`](../interfaces/EncryptionResult.md)

Defined in: [lib/encryption.ts:49](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/encryption.ts#L49)

Cifra los datos de un archivo con AES-256-GCM.

## Parameters

### fileBuffer

`Buffer`

Buffer del archivo original.

### symmetricKey?

`string`

Clave simétrica opcional en base64; si no se proporciona, se genera una nueva.

## Returns

[`EncryptionResult`](../interfaces/EncryptionResult.md)

Resultado del cifrado con los datos cifrados y metadatos asociados.
