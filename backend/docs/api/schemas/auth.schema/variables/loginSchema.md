[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [schemas/auth.schema](../README.md) / loginSchema

# Variable: loginSchema

> `const` **loginSchema**: `ZodEffects`\<`ZodObject`\<\{ `email`: `ZodOptional`\<`ZodString`\>; `identifier`: `ZodOptional`\<`ZodEffects`\<`ZodString`, `string`, `string`\>\>; `password`: `ZodString`; `username`: `ZodOptional`\<`ZodEffects`\<`ZodString`, `string`, `string`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `email?`: `string`; `identifier?`: `string`; `password`: `string`; `username?`: `string`; \}, \{ `email?`: `string`; `identifier?`: `string`; `password`: `string`; `username?`: `string`; \}\>, \{ `email?`: `string`; `identifier?`: `string`; `password`: `string`; `username?`: `string`; \}, \{ `email?`: `string`; `identifier?`: `string`; `password`: `string`; `username?`: `string`; \}\>

Defined in: [schemas/auth.schema.ts:29](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/schemas/auth.schema.ts#L29)

Schema para login
