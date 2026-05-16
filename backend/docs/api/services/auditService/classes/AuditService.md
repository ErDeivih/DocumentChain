[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/auditService](../README.md) / AuditService

# Class: AuditService

Defined in: [services/auditService.ts:122](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L122)

Servicio de auditoría pública para verificación de integridad, propiedad y transparencia de documentos.
No requiere autenticación para maximizar la transparencia y permitir auditorías externas.

## Constructors

### Constructor

> **new AuditService**(): `AuditService`

#### Returns

`AuditService`

## Methods

### getFileAuditTrail()

> `static` **getFileAuditTrail**(`blockchainId`): `Promise`\<[`AuditEvent`](../interfaces/AuditEvent.md)[]\>

Defined in: [services/auditService.ts:277](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L277)

Obtener historial completo de auditoría de un documento
Consulta TODOS los eventos de blockchain relacionados con el documento

#### Parameters

##### blockchainId

`string`

ID del documento en blockchain (bytes32)

#### Returns

`Promise`\<[`AuditEvent`](../interfaces/AuditEvent.md)[]\>

Array de eventos cronológicos

***

### getPublicMetadata()

> `static` **getPublicMetadata**(`blockchainId`): `Promise`\<[`PublicDocumentMetadata`](../interfaces/PublicDocumentMetadata.md)\>

Defined in: [services/auditService.ts:677](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L677)

Obtener metadata PÚBLICA de un documento
No requiere autenticación - cualquiera puede ver metadata almacenada en blockchain

#### Parameters

##### blockchainId

`string`

ID del documento en blockchain

#### Returns

`Promise`\<[`PublicDocumentMetadata`](../interfaces/PublicDocumentMetadata.md)\>

Metadata pública del documento

***

### getPublicStats()

> `static` **getPublicStats**(): `Promise`\<\{ `activeUsers`: `number`; `lastBlockSynced`: `number`; `totalDocuments`: `number`; `totalShares`: `number`; `totalSignatures`: `number`; `totalVersions`: `number`; \}\>

Defined in: [services/auditService.ts:752](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L752)

Obtener estadísticas públicas de documentos
Útil para dashboards públicos y análisis de transparencia

#### Returns

`Promise`\<\{ `activeUsers`: `number`; `lastBlockSynced`: `number`; `totalDocuments`: `number`; `totalShares`: `number`; `totalSignatures`: `number`; `totalVersions`: `number`; \}\>

Estadísticas agregadas

***

### getTransactionDetails()

> `static` **getTransactionDetails**(`txHash`): `Promise`\<\{ `events`: `object`[]; `transaction`: \{ `blockNumber`: `number` \| `null`; `from`: `string`; `gasPrice`: `string` \| `null`; `gasUsed`: `string` \| `null`; `hash`: `string`; `status`: `number` \| `null`; `timestamp`: `Date` \| `null`; `to`: `string` \| `null`; `value`: `string`; \}; \}\>

Defined in: [services/auditService.ts:939](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L939)

Obtener detalles de una transacción por su hash
Decodifica logs de eventos del contrato DocumentRegistry
y enriquece con metadata de documentos desde la BD

#### Parameters

##### txHash

`string`

#### Returns

`Promise`\<\{ `events`: `object`[]; `transaction`: \{ `blockNumber`: `number` \| `null`; `from`: `string`; `gasPrice`: `string` \| `null`; `gasUsed`: `string` \| `null`; `hash`: `string`; `status`: `number` \| `null`; `timestamp`: `Date` \| `null`; `to`: `string` \| `null`; `value`: `string`; \}; \}\>

***

### queryBlockchainEvents()

> `static` **queryBlockchainEvents**(`filters`): `Promise`\<\{ `events`: `any`[]; `hasMore`: `boolean`; `total`: `number`; \}\>

Defined in: [services/auditService.ts:807](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L807)

Consultar eventos de blockchain con filtros avanzados
Permite auditoría completa del sistema

#### Parameters

##### filters

Filtros de búsqueda

###### documentId?

`string`

###### endDate?

`Date`

###### eventTypes?

`string`[]

###### fromBlock?

`number`

###### limit?

`number`

###### offset?

`number`

###### startDate?

`Date`

###### toBlock?

`number`

###### txHash?

`string`

###### userId?

`string`

###### walletAddress?

`string`

#### Returns

`Promise`\<\{ `events`: `any`[]; `hasMore`: `boolean`; `total`: `number`; \}\>

Lista de eventos filtrados

***

### verifyFileIntegrity()

> `static` **verifyFileIntegrity**(`fileId`): `Promise`\<[`IntegrityCheck`](../interfaces/IntegrityCheck.md)\>

Defined in: [services/auditService.ts:517](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L517)

Verificar integridad de un documento
Compara datos de blockchain (fuente de verdad) vs base de datos (cache)

#### Parameters

##### fileId

`string`

ID del documento en base de datos

#### Returns

`Promise`\<[`IntegrityCheck`](../interfaces/IntegrityCheck.md)\>

Resultado de verificación de integridad

***

### verifyOwnership()

> `static` **verifyOwnership**(`blockchainId`, `walletAddress`): `Promise`\<[`OwnershipProof`](../interfaces/OwnershipProof.md)\>

Defined in: [services/auditService.ts:611](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/auditService.ts#L611)

Verificar propiedad de un documento
Proporciona prueba criptográfica de que una wallet es dueña de un documento

#### Parameters

##### blockchainId

`string`

ID del documento en blockchain

##### walletAddress

`string`

Dirección de wallet que afirma ser dueña

#### Returns

`Promise`\<[`OwnershipProof`](../interfaces/OwnershipProof.md)\>

Prueba de propiedad
