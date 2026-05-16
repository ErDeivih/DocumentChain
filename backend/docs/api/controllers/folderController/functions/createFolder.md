[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/folderController](../README.md) / createFolder

# Function: createFolder()

> **createFolder**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Defined in: [controllers/folderController.ts:77](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/folderController.ts#L77)

Crea una nueva carpeta para el usuario autenticado.
Endpoint: POST /api/folders

## Parameters

### req

`Request`

Objeto de solicitud HTTP autenticado con { name, description?, parentId?, color?, icon? }.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Promesa que resuelve con la carpeta creada.
