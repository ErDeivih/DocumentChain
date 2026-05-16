[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/blockchain](../README.md) / getDocumentRegistryContractWithSigner

# Function: getDocumentRegistryContractWithSigner()

> **getDocumentRegistryContractWithSigner**(`userSigner`): `Contract`

Defined in: [config/blockchain.ts:124](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/blockchain.ts#L124)

Obtiene el contrato DocumentRegistry con un firmante específico (wallet de usuario).
Utilizado cuando se necesita ejecutar transacciones en nombre de un usuario.

## Parameters

### userSigner

`Wallet`

Wallet de ethers del usuario.

## Returns

`Contract`

Instancia del contrato vinculada al firmante proporcionado.

## Throws

Error si no está configurada la dirección del contrato.
