[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [controllers/logController](../README.md) / logClientError

# Function: logClientError()

> **logClientError**(`req`, `res`): `Promise`\<`void`\>

Defined in: [controllers/logController.ts:193](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/controllers/logController.ts#L193)

Registra un error reportado por el cliente (frontend).
Endpoint: POST /api/logs/client-error

## Parameters

### req

`Request`

Objeto de solicitud HTTP con { error, message, stack, context } en el cuerpo.

### res

`Response`

Objeto de respuesta HTTP.

## Returns

`Promise`\<`void`\>

Promesa que resuelve con la confirmación de registro.
