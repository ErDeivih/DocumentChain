[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [validators/passwordPolicy](../README.md) / validatePassword

# Function: validatePassword()

> **validatePassword**(`password`, `customPolicy?`): [`PasswordValidationResult`](../interfaces/PasswordValidationResult.md)

Defined in: [validators/passwordPolicy.ts:100](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/validators/passwordPolicy.ts#L100)

Valida una contraseña según la política configurada.

## Parameters

### password

`string`

Contraseña a validar.

### customPolicy?

`Partial`\<[`PasswordPolicyConfig`](../interfaces/PasswordPolicyConfig.md)\>

Política personalizada opcional que sobrescribe valores por defecto.

## Returns

[`PasswordValidationResult`](../interfaces/PasswordValidationResult.md)

Resultado de la validación con errores detectados y nivel de fortaleza.

## Example

```ts
const result = validatePassword('MySecurePass123!');
if (!result.valid) {
  console.log('Errores:', result.errors);
}
console.log('Fortaleza:', result.strength); // 'strong'
```
