[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [schemas/document.schema](../README.md) / documentVersionNumberParamsSchema

# Variable: documentVersionNumberParamsSchema

> `const` **documentVersionNumberParamsSchema**: `ZodObject`\<\{ `documentId`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `versionNumber`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `documentId`: `string`; `versionNumber`: `string`; \}, \{ `documentId`: `string`; `versionNumber`: `string`; \}\>

Defined in: [schemas/document.schema.ts:62](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/schemas/document.schema.ts#L62)

Schema para rutas que requieren documentId y versionNumber en params
