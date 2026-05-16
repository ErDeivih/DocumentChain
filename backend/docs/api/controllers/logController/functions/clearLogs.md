[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/logController](../README.md) / clearLogs

# Function: clearLogs()

> **clearLogs**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/logController.ts:147](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/logController.ts#L147)

Limpia los archivos de log del sistema (solo administradores).
Endpoint: POST /api/logs/clear

## Parameters

### req

`Request`

Objeto de solicitud HTTP con { type } en el cuerpo.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de limpieza.
