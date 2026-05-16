[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [validators/passwordPolicy](../README.md) / generateSecurePassword

# Function: generateSecurePassword()

> **generateSecurePassword**(`length?`): `string`

Defined in: [validators/passwordPolicy.ts:275](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L275)

Genera una contraseña segura aleatoria que cumple con la política configurada.

## Parameters

### length?

`number` = `16`

Longitud deseada de la contraseña (por defecto: 16).

## Returns

`string`

Contraseña aleatoria segura.

## Example

```ts
const suggestion = generateSecurePassword(20);
// 'aB3#xY7@mK9!pQ2$rT5%'
```
