[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/folderController](../README.md) / moveDocumentsToFolder

# Function: moveDocumentsToFolder()

> **moveDocumentsToFolder**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Defined in: [controllers/folderController.ts:184](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/folderController.ts#L184)

Mueve uno o varios documentos a una carpeta determinada.
Endpoint: POST /api/folders/:id/move

## Parameters

### req

`Request`

Objeto de solicitud HTTP autenticado con { documentIds: string[] }.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\> \| `undefined`\>

Promesa que resuelve con la confirmación del movimiento.
