[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/logController](../README.md) / getLogs

# Function: getLogs()

> **getLogs**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/logController.ts:71](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/logController.ts#L71)

Obtiene los registros de log recientes de un tipo determinado.
Endpoint: GET /api/logs

## Parameters

### req

`Request`

Objeto de solicitud HTTP. La query puede incluir { type, lines }.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`void`\>

Promesa que resuelve con la lista de logs parseados.
