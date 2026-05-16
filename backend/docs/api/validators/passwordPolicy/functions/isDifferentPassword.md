[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [validators/passwordPolicy](../README.md) / isDifferentPassword

# Function: isDifferentPassword()

> **isDifferentPassword**(`newPassword`, `oldPassword`, `minDifference?`): `boolean`

Defined in: [validators/passwordPolicy.ts:242](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L242)

Determina si una nueva contraseña es suficientemente diferente de la anterior.

## Parameters

### newPassword

`string`

Nueva contraseña propuesta.

### oldPassword

`string`

Contraseña anterior existente.

### minDifference?

`number` = `0.5`

Porcentaje mínimo de diferencia requerido (por defecto: 0.5).

## Returns

`boolean`

`true` si la nueva contraseña supera el umbral de diferencia.
