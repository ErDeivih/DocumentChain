[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [lib/encryption](../README.md) / decryptSymmetricKey

# Function: decryptSymmetricKey()

> **decryptSymmetricKey**(`encryptedSymmetricKey`, `privateKeyPem`): `string`

Defined in: [lib/encryption.ts:145](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/encryption.ts#L145)

Descifra una clave simétrica con la clave privada RSA de un usuario.

## Parameters

### encryptedSymmetricKey

`string`

Clave simétrica cifrada codificada en base64.

### privateKeyPem

`string`

Clave privada RSA del usuario en formato PEM.

## Returns

`string`

Clave simétrica descifrada codificada en base64.
