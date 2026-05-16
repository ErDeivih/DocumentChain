[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/folderController](../README.md) / getFolderStats

# Function: getFolderStats()

> **getFolderStats**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/folderController.ts:248](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/folderController.ts#L248)

Obtiene las estadísticas de una carpeta específica.
Endpoint: GET /api/folders/:id/stats

## Parameters

### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la carpeta.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`void`\>

Promesa que resuelve con las estadísticas de la carpeta.
