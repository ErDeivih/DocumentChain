[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [schemas/verification.schema](../README.md) / verifyByFileSchema

# Variable: verifyByFileSchema

> `const` **verifyByFileSchema**: `ZodObject`\<\{ `description`: `ZodOptional`\<`ZodString`\>; `filename`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `description?`: `string`; `filename?`: `string`; \}, \{ `description?`: `string`; `filename?`: `string`; \}\>

Defined in: [schemas/verification.schema.ts:35](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/schemas/verification.schema.ts#L35)

Schema para verificar documento por archivo
Nota: La validación de archivo es manejada por middleware multer
Este schema valida datos adicionales del formulario si es necesario
