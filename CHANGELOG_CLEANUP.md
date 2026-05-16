# CHANGELOG - Limpieza de Código DocumentChain

> 16 mayo 2026 | 8 commits: `667c7c8` → `1ac67c4` → `3520ac9` → `b8db1b9` → `1c08e2d` → `3f49c57`

---

## COMPLETADO (todo lo hecho)

### Pases 1-2 (CRÍTICO + ALTO) — `667c7c8`
- 17 archivos basura eliminados
- Bugs: SigningService español suelto, Math.random → crypto.randomBytes, TLS rejectUnauthorized, 3 modifiers en contrato
- Unificación: PrismaClient singleton (3 archivos), DocumentPermissionService → BlockchainQueries, encryption dedup
- Eliminado: 3 endpoints deprecated, share.schema.ts, stripEnvQuotes duplicada
- Configs: blockchain.ts, ipfs.ts, contractAddress.ts → usan env.ts

### Fases 3-4 (Quick Wins + Small Fixes) — `1ac67c4`
- getQuery→getParam, substr→slice, formatBytes import, 6 console.log, MAX_FILE_SIZE constante
- 3 dirs vacíos, 4 scripts arreglados, ModalFooter eliminado, fix-encoding.ps1
- normalizeFileExtensionFilter extraído, dead code passwordPolicy, parseFilename unificado
- hashSHA3_256→ethers.keccak256, deploy-production.ps1 Mumbai→Amoy

### Fase 5 (useSigner Hook) — `3520ac9`
- `hooks/useSigner.ts`: getVerifiedSigner() + getRegistryContract()
- 6 componentes migrados, 60 líneas duplicadas eliminadas

### Fase 6 (Batch Final) — `b8db1b9`
- Dead code: 6 funciones eliminadas (validateSession, revokeAccessToken, cleanupExpiredTokens, getOperationalVersion, getSignature, hasUserSigned)
- Alias exports: 19 eliminados de auth.ts, wallets.ts, signatures.ts, versions.ts
- truncateAddress: 10 ocurrencias unificadas en 7 archivos
- IPFS types: any → PinStatus/PinResult
- E2E: 62 test.skip eliminados de 17 specs

### Fase 7 (Cierre MEDIUM + UserAvatar) — `1c08e2d` + `3f49c57`
- **validateDocumentOwnership helper**: 16 call sites → 1 helper en DocumentPermissionService
  - documentController.ts (7 bloques reemplazados)
  - versionService.ts (6 bloques reemplazados)
  - transferService.ts (1 bloque reemplazado)
  - shareService.ts (2 bloques reemplazados, 1 preservado)
- **UserAvatar component**: 8 Avatar blocks → `<UserAvatar>` en 5 archivos
  - Header.tsx (x2), ShareList.tsx, DocumentTransfer.tsx (x2), OperationalVersionSelector.tsx (x2), DocumentDetails.tsx
- **_msgSender() caching**: signDocument (5 calls→1 cached), setArchiveStatus, deleteDocument

---

## PENDIENTE — Próxima iteración

### Fase 8 — Descomposición funciones grandes (~6h)

| # | Issue | Archivos | Detalle |
|---|-------|----------|---------|
| M2a | `getFileAuditTrail` (232L, 8 event loops) → helpers | `auditService.ts` | Extraer 8 métodos privados (getCreatedEvents, getSharedEvents, etc.) |
| M2b | `syncHistoricalEvents` (317L, 12 event loops) → mapper | `eventListenerService.ts` | Extraer event-type mapper con 12 handlers |

### Fase 9 — Test quality (~4h)

| # | Issue | Archivos |
|---|-------|----------|
| M15 | Logger mock consolidado en 19 tests | `backend/test/unit/*.test.ts` + `setup.ts` |

### Fase 10 — Arquitectura (NO prioridad, ~40h+)

| # | Issue | Esfuerzo |
|---|-------|----------|
| M8 | Descomponer 10 componentes >300L | 20h |
| M9 | Unificar Modal vs Dialog | 10h |
| M10 | WalletManager vs WalletManagerContext | 6h |
| M11-12 | E2E data-testid + aserciones reales | 10h |
| M14 | Tests unitarios frontend | 20h |
| L2 | Quitar Ownable del contrato | 4h |
| L5 | Credenciales SMTP → GitHub Secrets | 10min |

### Notas técnicas para Fase 8

**getFileAuditTrail** (`backend/src/services/auditService.ts:277-508`):
El método itera sobre 8 tipos de evento (DOCUMENT_CREATED, DOCUMENT_SHARED, DOCUMENT_SIGNED, etc.) con bucles casi idénticos. Cada iteración consulta eventos de la BD, los procesa y los añade al resultado. Se puede extraer cada tipo a un método privado `processEvents(type, filter, docId)`.

**syncHistoricalEvents** (`backend/src/services/eventListenerService.ts:364-680`):
Similar patrón con 12 tipos de evento. Cada bloque consulta eventos pasados del contrato (DocumentCreated, VersionCreated, DocumentShared, etc.) y sincroniza con la BD. Se puede crear un mapper `eventType → handlerFn` y loop genérico.

### SKIP permanente

| # | Issue | Motivo |
|---|-------|--------|
| L3 | DialogPortal no-op | No es no-op, se usa internamente en DialogContent |
| L4 | deploy-production.ps1 URLs | Ya arreglado (Mumbai→Amoy) |
| M12 alt | Falso "state machine pattern" | No se encontró patrón real en el código |
| L1 alt | "Eventos faltantes en contrato" | Falso, todos los eventos ya se emiten |
