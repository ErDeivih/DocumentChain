[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/validator](../README.md) / Validator

# Class: Validator

Defined in: [middleware/validator.ts:103](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L103)

Clase de utilidad para la validación manual de solicitudes (legado).
Proporciona métodos estáticos para validar campos requeridos, formatos y longitudes.

## Constructors

### Constructor

> **new Validator**(): `Validator`

#### Returns

`Validator`

## Methods

### isEmail()

> `static` **isEmail**(`field?`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/validator.ts:138](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L138)

Valida el formato de correo electrónico de un campo del cuerpo de la solicitud.

#### Parameters

##### field?

`string` = `'email'`

Nombre del campo a validar (por defecto: `'email'`).

#### Returns

Middleware de Express que verifica el formato del correo.

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`Request`

###### res

`Response`

###### next

`NextFunction`

##### Returns

`void`

***

### isEnum()

> `static` **isEnum**(`field`, `enumValues`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/validator.ts:220](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L220)

Valida que el valor de un campo pertenezca a un conjunto de valores permitidos (enum).

#### Parameters

##### field

`string`

Nombre del campo a validar.

##### enumValues

`any`[]

Lista de valores permitidos.

#### Returns

Middleware de Express que verifica la pertenencia al enum.

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`Request`

###### res

`Response`

###### next

`NextFunction`

##### Returns

`void`

***

### isEthereumAddress()

> `static` **isEthereumAddress**(`field?`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/validator.ts:179](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L179)

Valida que un campo del cuerpo de la solicitud contenga una dirección Ethereum válida.

#### Parameters

##### field?

`string` = `'address'`

Nombre del campo a validar (por defecto: `'address'`).

#### Returns

Middleware de Express que verifica la dirección Ethereum.

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`Request`

###### res

`Response`

###### next

`NextFunction`

##### Returns

`void`

***

### isUUID()

> `static` **isUUID**(`field`, `location?`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/validator.ts:199](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L199)

Valida que un campo tenga un formato UUID válido.

#### Parameters

##### field

`string`

Nombre del campo a validar.

##### location?

Ubicación del campo en la solicitud (`body`, `params` o `query`).

`"query"` | `"params"` | `"body"`

#### Returns

Middleware de Express que comprueba el formato UUID.

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`Request`

###### res

`Response`

###### next

`NextFunction`

##### Returns

`void`

***

### minLength()

> `static` **minLength**(`field`, `min`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/validator.ts:158](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L158)

Valida la longitud mínima de un campo del cuerpo de la solicitud.

#### Parameters

##### field

`string`

Nombre del campo a validar.

##### min

`number`

Longitud mínima requerida.

#### Returns

Middleware de Express que comprueba la longitud mínima.

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`Request`

###### res

`Response`

###### next

`NextFunction`

##### Returns

`void`

***

### required()

> `static` **required**(`fields`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/validator.ts:110](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L110)

Valida que los campos indicados estén presentes en el cuerpo de la solicitud.

#### Parameters

##### fields

`string`[]

Lista de nombres de campos requeridos.

#### Returns

Middleware de Express que comprueba la presencia de los campos.

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`Request`

###### res

`Response`

###### next

`NextFunction`

##### Returns

`void`

***

### sanitize()

> `static` **sanitize**(`fields`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/validator.ts:241](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L241)

Elimina espacios en blanco iniciales y finales de los campos indicados en el cuerpo de la solicitud.

#### Parameters

##### fields

`string`[]

Lista de nombres de campos a sanear.

#### Returns

Middleware de Express que realiza el recorte de espacios.

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`Request`

###### res

`Response`

###### next

`NextFunction`

##### Returns

`void`

***

### validateFile()

> `static` **validateFile**(`options?`): (`req`, `res`, `next`) => `void`

Defined in: [middleware/validator.ts:259](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/middleware/validator.ts#L259)

Valida la subida de archivos comprobando su presencia, tamaño y tipo MIME.

#### Parameters

##### options?

Opciones de validación: `required`, `maxSize` (en bytes) y `allowedTypes`.

###### allowedTypes?

`string`[]

###### maxSize?

`number`

###### required?

`boolean`

#### Returns

Middleware de Express que valida el archivo subido.

> (`req`, `res`, `next`): `void`

##### Parameters

###### req

`Request`

###### res

`Response`

###### next

`NextFunction`

##### Returns

`void`
