[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [validators/passwordPolicy](../README.md) / estimateCrackTime

# Function: estimateCrackTime()

> **estimateCrackTime**(`password`): `string`

Defined in: [validators/passwordPolicy.ts:318](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L318)

Estima el tiempo necesario para descifrar una contraseña mediante fuerza bruta.

## Parameters

### password

`string`

Contraseña a analizar.

## Returns

`string`

Cadena legible con la estimación (segundos, minutos, años, etc.).

## Example

```ts
const time = estimateCrackTime('abc123');
// '2 segundos' (muy débil)

const time2 = estimateCrackTime('aB3#xY7@mK9!pQ2$rT5%');
// '3 mil años' (muy fuerte)
```
