[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [schemas/document.schema](../README.md) / listDocumentsQuerySchema

# Variable: listDocumentsQuerySchema

> `const` **listDocumentsQuerySchema**: `ZodObject`\<\{ `folderId`: `ZodOptional`\<`ZodString`\>; `includeArchived`: `ZodEffects`\<`ZodOptional`\<`ZodString`\>, `boolean`, `string` \| `undefined`\>; `limit`: `ZodEffects`\<`ZodOptional`\<`ZodString`\>, `number`, `string` \| `undefined`\>; `page`: `ZodEffects`\<`ZodOptional`\<`ZodString`\>, `number`, `string` \| `undefined`\>; `search`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `folderId?`: `string`; `includeArchived`: `boolean`; `limit`: `number`; `page`: `number`; `search?`: `string`; \}, \{ `folderId?`: `string`; `includeArchived?`: `string`; `limit?`: `string`; `page?`: `string`; `search?`: `string`; \}\>

Defined in: [schemas/document.schema.ts:111](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/schemas/document.schema.ts#L111)

Schema para query params de listado
