[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/argon2Service](../README.md) / Argon2Service

# Class: Argon2Service

Defined in: [services/argon2Service.ts:51](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/argon2Service.ts#L51)

Servicio de hashing de contraseñas con Argon2id.
Implementa el algoritmo recomendado por OWASP y NIST para el almacenamiento seguro de credenciales.

## Constructors

### Constructor

> **new Argon2Service**(): `Argon2Service`

#### Returns

`Argon2Service`

## Methods

### benchmark()

> `static` **benchmark**(`password?`): `Promise`\<`number`\>

Defined in: [services/argon2Service.ts:217](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/argon2Service.ts#L217)

Comparar tiempo de hash (benchmarking)
Útil para ajustar CONFIG según hardware del servidor

#### Parameters

##### password?

`string` = `'BenchmarkPassword123!'`

Contraseña de prueba

#### Returns

`Promise`\<`number`\>

Tiempo en milisegundos

#### Example

```ts
const time = await Argon2Service.benchmark('TestPassword123!');
console.log(`Tiempo de hash: ${time}ms`);
// Recomendado: 50-200ms
```

***

### detectHashType()

> `static` **detectHashType**(`hash`): [`HashType`](../type-aliases/HashType.md)

Defined in: [services/argon2Service.ts:144](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/argon2Service.ts#L144)

Detectar tipo de hash para migración automática

Soporta:
- argon2id: $argon2id$...
- argon2i: $argon2i$...
- argon2d: $argon2d$...
- bcrypt: $2a$, $2b$, $2y$
- pbkdf2: contiene ':'

#### Parameters

##### hash

`string`

Hash a detectar

#### Returns

[`HashType`](../type-aliases/HashType.md)

Tipo de hash

#### Example

```ts
const type = Argon2Service.detectHashType(user.passwordHash);
if (type === 'bcrypt') {
  // Migrar a Argon2id
}
```

***

### getConfig()

> `static` **getConfig**(): [`Argon2Config`](../interfaces/Argon2Config.md)

Defined in: [services/argon2Service.ts:233](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/argon2Service.ts#L233)

Obtener configuración actual

#### Returns

[`Argon2Config`](../interfaces/Argon2Config.md)

Configuración Argon2id

***

### hash()

> `static` **hash**(`password`): `Promise`\<`string`\>

Defined in: [services/argon2Service.ts:74](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/argon2Service.ts#L74)

Hash de contraseña con Argon2id

#### Parameters

##### password

`string`

Contraseña en texto plano

#### Returns

`Promise`\<`string`\>

Hash en formato PHC: $argon2id$v=19$m=65536,t=3,p=4$salt$hash

#### Example

```ts
const hash = await Argon2Service.hash('MySecurePassword123!');
// $argon2id$v=19$m=65536,t=3,p=4$randomSalt$hashValue
```

***

### hashWithCustomConfig()

> `static` **hashWithCustomConfig**(`password`, `config`): `Promise`\<`string`\>

Defined in: [services/argon2Service.ts:245](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/argon2Service.ts#L245)

Generar hash con configuración personalizada
⚠️ Solo usar para testing o casos especiales

#### Parameters

##### password

`string`

Contraseña

##### config

`Partial`\<[`Argon2Config`](../interfaces/Argon2Config.md)\>

Configuración personalizada

#### Returns

`Promise`\<`string`\>

Hash

***

### needsRehash()

> `static` **needsRehash**(`hash`): `Promise`\<`boolean`\>

Defined in: [services/argon2Service.ts:180](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/argon2Service.ts#L180)

Verificar si hash necesita rehash (parámetros obsoletos)

Retorna true si:
- No es Argon2id
- Usa parámetros más débiles que CONFIG actual

#### Parameters

##### hash

`string`

Hash a verificar

#### Returns

`Promise`\<`boolean`\>

true si necesita rehash

#### Example

```ts
if (await Argon2Service.needsRehash(user.passwordHash)) {
  // Rehash con nuevos parámetros en próximo login
}
```

***

### verify()

> `static` **verify**(`hash`, `password`): `Promise`\<`boolean`\>

Defined in: [services/argon2Service.ts:107](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/argon2Service.ts#L107)

Verificar contraseña contra hash Argon2id

#### Parameters

##### hash

`string`

Hash almacenado en BD

##### password

`string`

Contraseña a verificar

#### Returns

`Promise`\<`boolean`\>

true si coincide, false si no

#### Example

```ts
const isValid = await Argon2Service.verify(storedHash, userPassword);
if (isValid) {
  // Login exitoso
}
```
