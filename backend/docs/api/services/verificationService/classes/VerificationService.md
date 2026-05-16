[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/verificationService](../README.md) / VerificationService

# Class: VerificationService

Defined in: [services/verificationService.ts:69](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L69)

Servicio de verificación de autenticidad e integridad de documentos.
Permite verificar la existencia y propiedades de un documento mediante hash, CID o blockchainId.

## Constructors

### Constructor

> **new VerificationService**(): `VerificationService`

#### Returns

`VerificationService`

## Methods

### verifyByBlockchainId()

> `static` **verifyByBlockchainId**(`blockchainId`, `matchedVersionHint?`): `Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

Defined in: [services/verificationService.ts:214](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L214)

Verificar documento por ID de blockchain

#### Parameters

##### blockchainId

`string`

##### matchedVersionHint?

`number`

#### Returns

`Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

***

### verifyByIPFSHash()

> `static` **verifyByIPFSHash**(`ipfsHash`): `Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

Defined in: [services/verificationService.ts:191](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L191)

Verificar documento por IPFS hash
Busca el CID en las versiones de documentos almacenados en DB,
y delega al método por blockchainId si se encuentra.

#### Parameters

##### ipfsHash

`string`

#### Returns

`Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

***

### verifyFileByHash()

> `static` **verifyFileByHash**(`fileBuffer`): `Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

Defined in: [services/verificationService.ts:73](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/verificationService.ts#L73)

Verificar si un archivo existe en la blockchain mediante su hash

#### Parameters

##### fileBuffer

`Buffer`

#### Returns

`Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>
