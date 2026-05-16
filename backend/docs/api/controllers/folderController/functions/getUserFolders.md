[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/folderController](../README.md) / getUserFolders

# Function: getUserFolders()

> **getUserFolders**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/folderController.ts:18](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/folderController.ts#L18)

Obtiene todas las carpetas del usuario autenticado.
Endpoint: GET /api/folders

## Parameters

### req

`Request`

Objeto de solicitud HTTP autenticado.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de carpetas.
