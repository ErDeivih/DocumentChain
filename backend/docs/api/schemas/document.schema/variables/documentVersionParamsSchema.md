[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [schemas/document.schema](../README.md) / documentVersionParamsSchema

# Variable: documentVersionParamsSchema

> `const` **documentVersionParamsSchema**: `ZodObject`\<\{ `documentId`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `versionId`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `documentId`: `string`; `versionId`: `string`; \}, \{ `documentId`: `string`; `versionId`: `string`; \}\>

Defined in: [schemas/document.schema.ts:54](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/schemas/document.schema.ts#L54)

Schema para rutas que requieren documentId y versionId en params
