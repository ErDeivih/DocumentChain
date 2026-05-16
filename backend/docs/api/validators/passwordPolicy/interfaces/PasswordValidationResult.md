[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [validators/passwordPolicy](../README.md) / PasswordValidationResult

# Interface: PasswordValidationResult

Defined in: [validators/passwordPolicy.ts:37](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L37)

Interfaz que representa el resultado de la validación de una contraseña.

## Properties

### errors

> **errors**: `string`[]

Defined in: [validators/passwordPolicy.ts:41](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L41)

Lista de mensajes de error detectados.

***

### score

> **score**: `number`

Defined in: [validators/passwordPolicy.ts:45](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L45)

Puntuación numérica entre 0 y 100.

***

### strength

> **strength**: `"weak"` \| `"medium"` \| `"strong"` \| `"very-strong"`

Defined in: [validators/passwordPolicy.ts:43](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L43)

Categoría de fortaleza de la contraseña.

***

### valid

> **valid**: `boolean`

Defined in: [validators/passwordPolicy.ts:39](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L39)

Indica si la contraseña cumple con todos los requisitos.
