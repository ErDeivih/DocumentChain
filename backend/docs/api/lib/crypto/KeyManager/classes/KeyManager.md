[**DecentralizedFS Backend API v1.0.0**](../../../../README.md)

***

[DecentralizedFS Backend API](../../../../modules.md) / [lib/crypto/KeyManager](../README.md) / KeyManager

# Class: KeyManager

Defined in: [lib/crypto/KeyManager.ts:8](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L8)

Gestiona la generación y administración de pares de claves RSA-OAEP.
Las claves se utilizan para cifrar/descifrar las claves simétricas de archivos.
No se derivan de la wallet; es un par de claves independiente por usuario.

## Constructors

### Constructor

> **new KeyManager**(): `KeyManager`

#### Returns

`KeyManager`

## Methods

### decryptFromSender()

> `static` **decryptFromSender**(`encryptedData`, `senderPublicKey`, `recipientPrivateKey`): `Buffer`

Defined in: [lib/crypto/KeyManager.ts:149](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L149)

Descifra datos previamente cifrados con [encryptForRecipient](#encryptforrecipient).

#### Parameters

##### encryptedData

`string`

Datos cifrados en formato `iv:authTag:encryptedData`.

##### senderPublicKey

`string`

Clave pública del remitente en formato PEM.

##### recipientPrivateKey

`string`

Clave privada del destinatario en formato PEM.

#### Returns

`Buffer`

Datos descifrados como Buffer.

***

### decryptPrivateKey()

> `static` **decryptPrivateKey**(`encryptedPrivateKey`, `password`): `string`

Defined in: [lib/crypto/KeyManager.ts:62](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L62)

Descifra una clave privada con la contraseña del usuario.

#### Parameters

##### encryptedPrivateKey

`string`

Clave privada cifrada en formato `salt:iv:authTag:encryptedData`.

##### password

`string`

Contraseña del usuario.

#### Returns

`string`

Clave privada descifrada en formato PEM.

#### Throws

Error si el descifrado falla (contraseña incorrecta o datos corruptos).

***

### decryptPrivateKeyWithRecovery()

> `static` **decryptPrivateKeyWithRecovery**(`encryptedPrivateKey`, `recoveryKey`): `string`

Defined in: [lib/crypto/KeyManager.ts:261](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L261)

Descifra una clave privada con una clave de recuperación.

#### Parameters

##### encryptedPrivateKey

`string`

Clave privada cifrada en formato `iv:authTag:encryptedData`.

##### recoveryKey

`string`

Clave de recuperación (base64).

#### Returns

`string`

Clave privada descifrada en formato PEM.

#### Throws

Error si el descifrado falla (clave de recuperación incorrecta o datos corruptos).

***

### deriveSharedSecret()

> `static` **deriveSharedSecret**(`privateKey`, `publicKey`): `Buffer`

Defined in: [lib/crypto/KeyManager.ts:96](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L96)

Deriva un secreto compartido mediante ECDH (curva prime256v1).

#### Parameters

##### privateKey

`string`

Clave privada propia en formato PEM.

##### publicKey

`string`

Clave pública de la otra parte en formato PEM.

#### Returns

`Buffer`

Secreto compartido como Buffer.

***

### encryptForRecipient()

> `static` **encryptForRecipient**(`data`, `recipientPublicKey`, `senderPrivateKey`): `string`

Defined in: [lib/crypto/KeyManager.ts:116](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L116)

Cifra datos con la clave pública del destinatario (cifrado híbrido).
Utiliza ECDH para derivar un secreto compartido y luego cifra con AES-256-GCM.

#### Parameters

##### data

`Buffer`

Datos a cifrar (normalmente una clave simétrica).

##### recipientPublicKey

`string`

Clave pública del destinatario en formato PEM.

##### senderPrivateKey

`string`

Clave privada del remitente en formato PEM.

#### Returns

`string`

Datos cifrados en formato `iv:authTag:encryptedData`.

***

### encryptPrivateKey()

> `static` **encryptPrivateKey**(`privateKey`, `password`): `string`

Defined in: [lib/crypto/KeyManager.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L37)

Cifra una clave privada con la contraseña del usuario mediante AES-256-GCM.
Deriva la clave de cifrado desde la contraseña usando PBKDF2.

#### Parameters

##### privateKey

`string`

Clave privada en formato PEM.

##### password

`string`

Contraseña del usuario.

#### Returns

`string`

Clave privada cifrada en formato `salt:iv:authTag:encryptedData`.

***

### encryptPrivateKeyWithRecovery()

> `static` **encryptPrivateKeyWithRecovery**(`privateKey`, `recoveryKey`): `string`

Defined in: [lib/crypto/KeyManager.ts:237](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L237)

Cifra una clave privada con una clave de recuperación mediante AES-256-GCM.
Crea una segunda capa de cifrado de la clave privada para fines de recuperación.

#### Parameters

##### privateKey

`string`

Clave privada en formato PEM.

##### recoveryKey

`string`

Clave de recuperación (base64).

#### Returns

`string`

Clave privada cifrada en formato `iv:authTag:encryptedData`.

***

### generateKeyPair()

> `static` **generateKeyPair**(): `object`

Defined in: [lib/crypto/KeyManager.ts:14](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L14)

Genera un nuevo par de claves RSA-OAEP de 4096 bits en formato PEM.
Las claves del backend deben coincidir con las expectativas del frontend (RSA-OAEP) para evitar errores de importación.

#### Returns

`object`

Objeto con la clave pública y la clave privada en formato PEM.

##### privateKey

> **privateKey**: `string`

##### publicKey

> **publicKey**: `string`

***

### generateRecoveryKey()

> `static` **generateRecoveryKey**(): `string`

Defined in: [lib/crypto/KeyManager.ts:217](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L217)

Genera una clave de recuperación para la restauración de la cuenta.

#### Returns

`string`

Clave de recuperación codificada en base64 (256 bits de entropía).

***

### hashRecoveryKey()

> `static` **hashRecoveryKey**(`recoveryKey`): `string`

Defined in: [lib/crypto/KeyManager.ts:226](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L226)

Calcula el hash SHA-256 de una clave de recuperación para su almacenamiento seguro.

#### Parameters

##### recoveryKey

`string`

Clave de recuperación a hashear.

#### Returns

`string`

Hash SHA-256 de la clave de recuperación.

***

### isValidPrivateKey()

> `static` **isValidPrivateKey**(`privateKey`): `boolean`

Defined in: [lib/crypto/KeyManager.ts:204](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L204)

Valida que una cadena sea una clave privada válida en formato PEM.

#### Parameters

##### privateKey

`string`

Clave privada a validar.

#### Returns

`boolean`

`true` si es válida, `false` en caso contrario.

***

### isValidPublicKey()

> `static` **isValidPublicKey**(`publicKey`): `boolean`

Defined in: [lib/crypto/KeyManager.ts:190](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/KeyManager.ts#L190)

Valida que una cadena sea una clave pública válida en formato PEM.

#### Parameters

##### publicKey

`string`

Clave pública a validar.

#### Returns

`boolean`

`true` si es válida, `false` en caso contrario.
