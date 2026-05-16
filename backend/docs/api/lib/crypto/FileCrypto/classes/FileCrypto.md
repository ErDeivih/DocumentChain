[**DecentralizedFS Backend API v1.0.0**](../../../../README.md)

***

[DecentralizedFS Backend API](../../../../modules.md) / [lib/crypto/FileCrypto](../README.md) / FileCrypto

# Class: FileCrypto

Defined in: [lib/crypto/FileCrypto.ts:8](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L8)

Gestiona el cifrado y descifrado de archivos mediante AES-256-GCM.
Las claves simétricas se generan por archivo y se cifran con la clave pública del usuario.

## Constructors

### Constructor

> **new FileCrypto**(): `FileCrypto`

#### Returns

`FileCrypto`

## Methods

### decryptFile()

> `static` **decryptFile**(`encryptedData`, `symmetricKey`): `Buffer`

Defined in: [lib/crypto/FileCrypto.ts:50](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L50)

Descifra datos de archivo previamente cifrados con [encryptFile](#encryptfile).

#### Parameters

##### encryptedData

`string`

Datos cifrados en formato `iv:authTag:encryptedData`.

##### symmetricKey

`Buffer`

Clave simétrica de 256 bits utilizada durante el cifrado.

#### Returns

`Buffer`

Datos del archivo descifrados como Buffer.

#### Throws

Error si el formato es inválido o la clave no coincide.

***

### decryptFileAsOwner()

> `static` **decryptFileAsOwner**(`encryptedFile`, `encryptedSymmetricKey`, `ownerPublicKey`, `ownerPrivateKey`): `Buffer`

Defined in: [lib/crypto/FileCrypto.ts:124](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L124)

Descifra un archivo utilizando la clave privada del propietario para obtener la clave simétrica.

#### Parameters

##### encryptedFile

`string`

Datos del archivo cifrado.

##### encryptedSymmetricKey

`string`

Clave simétrica cifrada para el propietario.

##### ownerPublicKey

`string`

Clave pública del propietario en formato PEM.

##### ownerPrivateKey

`string`

Clave privada del propietario en formato PEM.

#### Returns

`Buffer`

Datos del archivo descifrados como Buffer.

***

### decryptFileAsSharedUser()

> `static` **decryptFileAsSharedUser**(`encryptedFile`, `encryptedSymmetricKey`, `ownerPublicKey`, `userPrivateKey`): `Buffer`

Defined in: [lib/crypto/FileCrypto.ts:179](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L179)

Descifra un archivo como usuario con acceso compartido (no propietario).

#### Parameters

##### encryptedFile

`string`

Datos del archivo cifrado.

##### encryptedSymmetricKey

`string`

Clave simétrica cifrada para este usuario.

##### ownerPublicKey

`string`

Clave pública del propietario del documento en formato PEM.

##### userPrivateKey

`string`

Clave privada de este usuario en formato PEM.

#### Returns

`Buffer`

Datos del archivo descifrados como Buffer.

***

### encryptFile()

> `static` **encryptFile**(`fileData`, `symmetricKey`): `string`

Defined in: [lib/crypto/FileCrypto.ts:24](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L24)

Cifra los datos de un archivo con AES-256-GCM.

#### Parameters

##### fileData

`Buffer`

Datos del archivo a cifrar.

##### symmetricKey

`Buffer`

Clave simétrica de 256 bits.

#### Returns

`string`

Cadena con los datos cifrados en formato `iv:authTag:encryptedData` (base64).

#### Throws

Error si la longitud de la clave no es de 32 bytes.

***

### encryptFileForOwner()

> `static` **encryptFileForOwner**(`fileData`, `ownerPublicKey`, `ownerPrivateKey`): `object`

Defined in: [lib/crypto/FileCrypto.ts:87](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L87)

Cifra un archivo y prepara la clave simétrica cifrada para el propietario.
Genera una clave simétrica, cifra el archivo y cifra dicha clave con la clave pública del propietario.

#### Parameters

##### fileData

`Buffer`

Datos del archivo a cifrar.

##### ownerPublicKey

`string`

Clave pública del propietario en formato PEM.

##### ownerPrivateKey

`string`

Clave privada del propietario en formato PEM.

#### Returns

`object`

Objeto con el archivo cifrado, la clave simétrica cifrada y la clave simétrica en claro.

##### encryptedFile

> **encryptedFile**: `string`

##### encryptedSymmetricKey

> **encryptedSymmetricKey**: `string`

##### symmetricKey

> **symmetricKey**: `Buffer`

***

### generateMetadataHash()

> `static` **generateMetadataHash**(`filename`, `size`, `contentHash`): `string`

Defined in: [lib/crypto/FileCrypto.ts:224](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L224)

Genera un hash de metadatos para almacenamiento en blockchain.
Combina el nombre del archivo, su tamaño y el hash de contenido.

#### Parameters

##### filename

`string`

Nombre original del archivo.

##### size

`number`

Tamaño del archivo en bytes.

##### contentHash

`string`

Hash SHA-256 del contenido del archivo.

#### Returns

`string`

Hash combinado en formato hexadecimal.

***

### generateSymmetricKey()

> `static` **generateSymmetricKey**(): `Buffer`

Defined in: [lib/crypto/FileCrypto.ts:13](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L13)

Genera una clave simétrica aleatoria de 256 bits para AES.

#### Returns

`Buffer`

Clave de 256 bits como Buffer.

***

### hashFile()

> `static` **hashFile**(`fileData`): `string`

Defined in: [lib/crypto/FileCrypto.ts:201](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L201)

Calcula el hash SHA-256 del contenido de un archivo para verificar su integridad.

#### Parameters

##### fileData

`Buffer`

Datos del archivo a hashear.

#### Returns

`string`

Hash SHA-256 en formato hexadecimal.

***

### reEncryptSymmetricKeyForRecipient()

> `static` **reEncryptSymmetricKeyForRecipient**(`encryptedSymmetricKey`, `ownerPublicKey`, `ownerPrivateKey`, `recipientPublicKey`): `string`

Defined in: [lib/crypto/FileCrypto.ts:150](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L150)

Recifra la clave simétrica para compartirla con otro usuario.
Descifra la clave simétrica con las claves del propietario y la vuelve a cifrar con la clave pública del destinatario.

#### Parameters

##### encryptedSymmetricKey

`string`

Clave simétrica cifrada actualmente.

##### ownerPublicKey

`string`

Clave pública del propietario en formato PEM.

##### ownerPrivateKey

`string`

Clave privada del propietario en formato PEM.

##### recipientPublicKey

`string`

Clave pública del destinatario en formato PEM.

#### Returns

`string`

Clave simétrica cifrada para el destinatario.

***

### verifyFileHash()

> `static` **verifyFileHash**(`fileData`, `expectedHash`): `boolean`

Defined in: [lib/crypto/FileCrypto.ts:211](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/lib/crypto/FileCrypto.ts#L211)

Verifica la integridad de un archivo comparando su hash calculado con el esperado.

#### Parameters

##### fileData

`Buffer`

Datos del archivo a verificar.

##### expectedHash

`string`

Hash SHA-256 esperado (hexadecimal).

#### Returns

`boolean`

`true` si coinciden, `false` en caso contrario.
