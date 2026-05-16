[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [schemas/document.schema](../README.md) / documentUserParamsSchema

# Variable: documentUserParamsSchema

> `const` **documentUserParamsSchema**: `ZodObject`\<\{ `documentId`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `userId`: `ZodEffects`\<`ZodString`, `string`, `string`\>; \}, `"strip"`, `ZodTypeAny`, \{ `documentId`: `string`; `userId`: `string`; \}, \{ `documentId`: `string`; `userId`: `string`; \}\>

Defined in: [schemas/document.schema.ts:46](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/schemas/document.schema.ts#L46)

Schema para rutas que requieren documentId y userId en params
