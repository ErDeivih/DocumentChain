# CHANGELOG - Limpieza de Código DocumentChain

> Fecha: 16 de mayo de 2026
> Sesión: single session
> Backup pre-limpieza: commit `a834cf8`

---

## Cambios realizados

### Pase 1 - Seguridad y Basura

#### Archivos basura eliminados (17 archivos)
| Archivo | Motivo |
|---------|--------|
| `texput.log` | crash log de LaTeX |
| `tmp_query.sql` | query ad-hoc de debug |
| `reseed-last.log` | log binario de reseed |
| `test_upload_v2.txt` | artefacto de test |
| `nul` | error de shell redirigido |
| `get_last_share.js` | script de debug |
| `get_last_share.ts` | script de debug (con bug: llamada `prisma.()` vacía) |
| `package-lock.json` (raíz) | huérfano sin package.json |
| `run_check.bat` | referencia script inexistente |
| `start-dev.bat` | obsoleto, redundante con start-dev.ps1 |
| `ANALISIS_FUNCIONALIDADES_COMPLETO.md` | análisis histórico superado |
| `ANALISIS_SIMPLIFICACION_TFG.md` | redundante |
| `CONTEXTO_CONSOLIDACION_UC_PARA_AGENTE.md` | handoff de agente completado |
| `INSTRUCCIONES_COMPLETAS_CONSOLIDACION_UC.md` | ídem |
| `TRABAJO_PENDIENTE_UC_CONSOLIDACION.md` | ídem |
| `PLAN_ELIMINACION_AJUSTADO_TFG.md` | cambios ya implementados |
| `plans/PLAN_IMPLEMENTACION_DETALLADO.md` | planificación histórica |

#### `frontend/src/services/blockchain/SigningService.ts:125` - Texto español suelto (CRÍTICO)
- **Problema:** Línea `Deja que el error se propague al componente.` sin comentar causaba ReferenceError
- **Solución:** Convertido a comentario válido

#### `backend/src/validators/passwordPolicy.ts:275-302` - Math.random() → crypto.randomBytes() (CRÍTICO)
- **Problema:** `Math.random()` usado para generar contraseñas (no criptográficamente seguro)
- **Solución:** Reemplazado por `crypto.randomBytes()` para todas las selecciones aleatorias

#### `backend/src/services/emailService.ts:53-54` - TLS rejectUnauthorized
- **Problema:** `rejectUnauthorized: false` hardcodeado deshabilitaba validación TLS
- **Solución:** Ahora usa `process.env.SMTP_TLS_REJECT_UNAUTHORIZED` (default `true` en producción)

---

### Pase 2 - Código Muerto y Duplicado Mayor

#### Consolidación DocumentPermissionService → BlockchainQueries
**Archivos:** `services/documentPermissionService.ts` (358→~250 líneas), `lib/blockchain/queries.ts` (sin cambios)
- **Problema:** Dos clases consultaban los mismos métodos del contrato por caminos separados
- **Solución:** `DocumentPermissionService.getUserRole`, `canView`, `canEdit`, `isOwner`, `getUserDocuments` ahora delegan a `BlockchainQueries` como fuente canónica única
- **Métodos conservados:** `getDocumentUsers`, `getDocumentUsersWithRoles`, `getUserDocumentCount`, `shareDocument`, `revokePermission` (no existen en BlockchainQueries)

#### PrismaClient unificado a singleton (3 archivos)
**Archivos:** `notificationService.ts`, `documentPermissionService.ts`, `eventListenerService.ts`
- **Problema:** Cada uno creaba `new PrismaClient()` independiente, bypassando la extensión BigInt de `config/database.ts`
- **Solución:** Los 3 importan ahora `prisma from '../config/database'` (singleton extendido)

#### Librerías de cifrado: eliminado uso de FileCrypto en verificationService
**Archivos:** `services/verificationService.ts`
- **Problema:** `FileCrypto.hashFile()` duplicaba `calculateHash()` de `lib/encryption.ts`
- **Solución:** `verificationService.ts` ahora usa `calculateHash` de `lib/encryption.ts`
- **NOTA:** `FileCrypto.ts` y `KeyManager.ts` se conservan (KeyManager lo usan authService y adminController)

#### Endpoints deprecated eliminados de controladores (3 métodos)
**Archivos:** `controllers/documentController.ts`, `controllers/versionController.ts`
- **Eliminados:** `DocumentController.createDocument`, `VersionController.createVersion`, `VersionController.restoreVersion`
- **Motivo:** Siempre devolvían error 400 redirigiendo al nuevo patrón prepare/confirm. Ya no estaban registrados en rutas.

#### `share.schema.ts` eliminado
**Archivo eliminado:** `schemas/share.schema.ts`
- **Motivo:** Nunca importado por ningún archivo (0 referencias). Sus schemas ya existían duplicados en `document.schema.ts`.

#### Config files refactorizados para usar `env.ts` validado
**Archivos:** `config/blockchain.ts`, `config/ipfs.ts`, `config/contractAddress.ts`
- `blockchain.ts`: Usa `env.BLOCKCHAIN_RPC_URL` y `env.BLOCKCHAIN_PRIVATE_KEY` en vez de `process.env`
- `ipfs.ts`: Usa `env.IPFS_API_URL` y `env.IPFS_GATEWAY_URL`; elimina función `stripEnvQuotes` redundante con `stripWrappedQuotes` de `env.ts`
- `contractAddress.ts`: Usa `env.BLOCKCHAIN_RPC_URL` y `env.CONTRACT_DOCUMENT_REGISTRY`

#### DocumentRegistry.sol - 3 modifiers faltantes corregidos
**Archivo:** `smart-contracts/contracts/DocumentRegistry.sol`
| Función | Modifier añadido | Motivo |
|---------|-----------------|--------|
| `setArchiveStatus()` | `notDeleted(_docId)` | Un documento eliminado no debería poder archivarse |
| `deleteDocument()` | `notArchived(_docId)` | Un documento archivado no debería poder eliminarse directamente |
| `revokePermission()` | `notDeleted(_docId)` | No se deberían modificar permisos de un documento eliminado |

El contrato compila correctamente tras los cambios.

---

## Issues MEDIUM documentados (pendientes para futuro)

### Backend
1. Patrón "validate ownership on-chain" repetido ~20 veces en controladores - extraer a helper middleware
2. `normalizeFileExtensionFilter` duplicado en `documentService.ts` y `shareController.ts`
3. Funciones >100 líneas sin descomponer: `AuditService.getFileAuditTrail` (230L), `EventListenerService.syncHistoricalEvents` (316L)
4. Funciones exportadas nunca usadas: `validateSession`, `revokeAccessToken`, `cleanupExpiredTokens`, `getOperationalVersion`, `getSignature`, `hasUserSigned`, `getUserDocumentCount`, `generateSecurePassword`, `estimateCrackTime`
5. `getParam` y `getQuery` idénticos en `utils/request.ts` - uno debe delegar al otro
6. `substr` deprecated en `utils/logger.ts:151` - cambiar a `slice`
7. Tests: mock de logger duplicado en 18+ archivos - mover a mock compartido
8. `any` types en IPFS adapter (9 instancias en `ipfs.ts`, `pinataClient.ts`)

### Frontend
9. `formatAddress`/`shortenAddress`/`truncateAddress` duplicado en 6+ componentes
10. `parseFilename` duplicado en `api/documents.ts` y `api/versions.ts`
11. `formatBytes` duplicado en `LogsViewer.tsx` (debe importar de `lib/utils.ts`)
12. State machine pattern duplicado en 5+ componentes (UploadModal, ShareModal, etc.)
13. Wallet signer verification duplicado en 6+ componentes
14. Avatar + initials styling duplicado en 8+ componentes
15. 12 componentes >300 líneas sin descomponer
16. `console.log` en producción (DocumentTransfer, +30 catch blocks)
17. Magic numbers: `100 * 1024 * 1024` hardcodeado en 4 sitios distintos
18. Dos sistemas de modales (`Modal` vs `Dialog`) con APIs diferentes
19. Alias exports redundantes en todos los `api/*.ts` (nadie los importa)
20. `WalletManager` duplica lógica de `WalletManagerContext`
21. E2E: selectores frágiles (XPath, placeholders, sin `data-testid`)
22. E2E: tests sin aserciones reales (login, notifications)
23. E2E: 100% tests usan `test.skip(browserName !== 'chromium')` (62 ocurrencias)
24. Cero tests unitarios frontend (solo E2E)
25. `hashSHA3_256` usa SHA-256 en vez de Keccak (nombre engañoso)
26. 3 directorios vacíos en `frontend/src/lib/`

### Scripts / Infra
27. `test-api.sh` referencia endpoint eliminado `/api/stats/me`
28. `create-first-admin.sh` usa puerto 3001 en vez de 3000
29. `deploy-production.ps1` usa URLs de Mumbai (red deprecated: cambiar a Amoy)
30. `start-dev-simple.ps1` reporta puertos incorrectos

### Credenciales (documentado, no modificado)
- `.env` raíz: contiene credenciales SMTP reales (gitignored)
- `.github/workflows/deploy-local-server.yml`: credenciales SMTP hardcodeadas → mover a GitHub Secrets

---

## Issues LOW documentados (pendientes para futuro)

1. Smart contract: eventos faltantes en `createVersion`, `restoreVersion`, `transferOwnership`
2. Smart contract: `_msgSender()` llamado múltiples veces sin cachear (gas optimization)
3. Smart contract: `Ownable` + `AccessControl` redundante en el contrato
4. `ModalFooter` y `DialogPortal` son wrappers no-op (`<>{children}</>`)
5. `fix-encoding.ps1` paths hardcodeados
