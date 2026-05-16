[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/folderController](../README.md) / deleteFolder

# Function: deleteFolder()

> **deleteFolder**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/folderController.ts:152](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/folderController.ts#L152)

Elimina una carpeta y opcionalmente su contenido.
Endpoint: DELETE /api/folders/:id

## Parameters

### req

`Request`

Objeto de solicitud HTTP autenticado. La query puede incluir deleteContents.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de eliminación.
