[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/logController](../README.md) / getLogStats

# Function: getLogStats()

> **getLogStats**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/logController.ts:114](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/logController.ts#L114)

Obtiene estadísticas de los archivos de log existentes.
Endpoint: GET /api/logs/stats

## Parameters

### req

`Request`

Objeto de solicitud HTTP.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`void`\>

Promesa que resuelve con el tamaño, líneas y fecha de modificación de cada archivo.
