[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/prismaExtension](../README.md) / prisma

# Variable: prisma

> `const` **prisma**: `DynamicClientExtensionThis`\<`TypeMap`\<`InternalArgs` & `object`, `PrismaClientOptions`\>, `TypeMapCb`, \{ \}, \{ \}\>

Defined in: [config/prismaExtension.ts:16](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/prismaExtension.ts#L16)

Extensión del cliente Prisma que transforma el campo `size` del modelo `document`
de `BigInt` a `string` para facilitar su serialización.
