[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/folderController](../README.md) / getFolderPath

# Function: getFolderPath()

> **getFolderPath**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/folderController.ts:221](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/folderController.ts#L221)

Obtiene la ruta completa (breadcrumb) de una carpeta.
Endpoint: GET /api/folders/:id/path

## Parameters

### req

`Request`

Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la carpeta.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`void`\>

Promesa que resuelve con la jerarquía de carpetas.
