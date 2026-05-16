[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/blockchain](../README.md) / getContracts

# Function: getContracts()

> **getContracts**(): `object`

Defined in: [config/blockchain.ts:142](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/blockchain.ts#L142)

Obtiene todas las instancias de contratos.
Dado que toda la funcionalidad reside ahora en DocumentRegistry,
devuelve la misma instancia del registro para cada clave a fin de no romper consumidores anteriores.

## Returns

`object`

Objeto con instancias del registro bajo distintas claves de compatibilidad.

### documentAccessControl

> **documentAccessControl**: `Contract` = `registry`

### documentRegistry

> **documentRegistry**: `Contract` = `registry`

### documentSigning

> **documentSigning**: `Contract` = `registry`

### documentVersioning

> **documentVersioning**: `Contract` = `registry`
