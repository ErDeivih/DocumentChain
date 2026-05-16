[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [lib/encryption](../README.md) / encryptSymmetricKey

# Function: encryptSymmetricKey()

> **encryptSymmetricKey**(`symmetricKey`, `publicKeyPem`): `string`

Defined in: [lib/encryption.ts:123](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/encryption.ts#L123)

Cifra una clave simétrica con la clave pública RSA de un usuario.

## Parameters

### symmetricKey

`string`

Clave simétrica codificada en base64.

### publicKeyPem

`string`

Clave pública RSA del usuario en formato PEM.

## Returns

`string`

Clave simétrica cifrada y codificada en base64.
