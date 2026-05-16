[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [config/blockchain](../README.md) / signer

# Variable: signer

> `const` **signer**: `Wallet` \| `null`

Defined in: [config/blockchain.ts:72](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/config/blockchain.ts#L72)

Firmante del backend (wallet para pagos de gas y operaciones administrativas).
Es `null` si no se ha configurado `BLOCKCHAIN_PRIVATE_KEY`.
