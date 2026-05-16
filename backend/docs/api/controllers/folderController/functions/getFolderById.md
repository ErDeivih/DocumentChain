[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/folderController](../README.md) / getFolderById

# Function: getFolderById()

> **getFolderById**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Defined in: [controllers/folderController.ts:43](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/folderController.ts#L43)

Obtiene una carpeta específica por su identificador.
Endpoint: GET /api/folders/:id

## Parameters

### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la carpeta.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Promesa que resuelve con los datos de la carpeta.
