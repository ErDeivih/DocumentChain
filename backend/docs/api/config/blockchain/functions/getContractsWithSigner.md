[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/blockchain](../README.md) / getContractsWithSigner

# Function: getContractsWithSigner()

> **getContractsWithSigner**(`userSigner`): `object`

Defined in: [config/blockchain.ts:157](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/blockchain.ts#L157)

Obtiene las instancias de contratos utilizando un firmante específico de usuario.

## Parameters

### userSigner

`Wallet`

Wallet de ethers del usuario.

## Returns

`object`

Objeto con instancias del registro vinculadas al firmante proporcionado.

### documentAccessControl

> **documentAccessControl**: `Contract` = `registry`

### documentRegistry

> **documentRegistry**: `Contract` = `registry`

### documentSigning

> **documentSigning**: `Contract` = `registry`

### documentVersioning

> **documentVersioning**: `Contract` = `registry`
