[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [middleware/requireDocumentOwner](../README.md) / requireDocumentOwner

# Function: requireDocumentOwner()

> **requireDocumentOwner**(`req`, `res`, `next`): `Promise`\<`void`\>

Defined in: middleware/requireDocumentOwner.ts:15

Middleware que valida la propiedad de un documento on-chain (fuente única de verdad).
Utiliza el ownerId de PostgreSQL únicamente como respaldo para documentos aún no registrados en la cadena.
Adjunta el documento a `req.document` para uso posterior.

## Parameters

### req

`Request`

Objeto de solicitud de Express.

### res

`Response`

Objeto de respuesta de Express.

### next

`NextFunction`

Función para pasar el control al siguiente middleware.

## Returns

`Promise`\<`void`\>

Promesa que se resuelve en void.
