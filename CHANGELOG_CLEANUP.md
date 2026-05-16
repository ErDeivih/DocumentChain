# CHANGELOG - Limpieza de Código DocumentChain

> Fecha: 16 de mayo de 2026
> Commits: `a834cf8` (backup) → `667c7c8` (pases 1-2) → `1ac67c4` (pases 3-4) → `3520ac9` (fase 5)

---

## Resumen de cambios realizados

### Commit `667c7c8` — Pases 1 y 2 (CRÍTICO + ALTO)

#### Archivos basura eliminados (17)
`texput.log`, `tmp_query.sql`, `reseed-last.log`, `test_upload_v2.txt`, `nul`, `get_last_share.*`, `package-lock.json` (raíz), `run_check.bat`, `start-dev.bat`, 8 MDs de planificación histórica.

#### Bugs críticos arreglados
| # | Archivo | Problema | Solución |
|---|---------|----------|----------|
| 1 | `SigningService.ts:125` | Texto español suelto causaba ReferenceError | Convertido a comentario |
| 2 | `passwordPolicy.ts:283` | `Math.random()` para generar contraseñas | `crypto.randomBytes()` |
| 3 | `emailService.ts:53` | `rejectUnauthorized: false` hardcodeado | Variable de entorno `SMTP_TLS_REJECT_UNAUTHORIZED` |
| 4 | `DocumentRegistry.sol` | 3 funciones sin modifiers de seguridad | `notDeleted`/`notArchived` añadidos a `setArchiveStatus`, `deleteDocument`, `revokePermission` |

#### Estructural (ALTOS)
| # | Cambio | Archivos |
|---|--------|----------|
| 5 | `DocumentPermissionService` delega a `BlockchainQueries` (fuente canónica única) | `documentPermissionService.ts` |
| 6 | `verificationService` usa `calculateHash` de `encryption.ts` (elimina uso de `FileCrypto`) | `verificationService.ts` |
| 7 | 3 endpoints deprecated eliminados (`createDocument`, `createVersion`, `restoreVersion`) | `documentController.ts`, `versionController.ts` |
| 8 | 3 instancias de `PrismaClient` unificadas al singleton con extensión BigInt | `notificationService.ts`, `eventListenerService.ts`, `documentPermissionService.ts` |
| 9 | `share.schema.ts` eliminado (archivo muerto, 0 referencias) | `schemas/share.schema.ts` |
| 10 | Config files usan `env.ts` validado | `blockchain.ts`, `ipfs.ts`, `contractAddress.ts` |

---

### Commit `1ac67c4` — Fases 3 y 4 (Medium Quick Wins + Small Fixes)

#### Fase 3 — Quick Wins (11 items)
| # | Cambio | Archivos |
|---|--------|----------|
| 1 | `getQuery` delega a `getParam` (código idéntico) | `utils/request.ts` |
| 2 | `substr` → `slice` (API deprecated) | `utils/logger.ts:151` |
| 3 | `formatBytes` importado de utils en vez de redefinido | `LogsViewer.tsx` |
| 4 | 6 `console.log` eliminados de producción | `DocumentTransfer.tsx` |
| 5 | `MAX_FILE_SIZE` constante compartida | `lib/utils.ts`, `UploadModal.tsx`, `UploadVersionModal.tsx` |
| 6 | 3 directorios vacíos eliminados | `lib/api/`, `lib/ipfs/`, `lib/utils/` |
| 7 | `test-api.sh` actualizado (stats endpoint eliminado) | `scripts/test-api.sh` |
| 8 | `create-first-admin.sh` puerto corregido 3001→3000 | `scripts/create-first-admin.sh` |
| 9 | `start-dev-simple.ps1` puertos y protocolos corregidos | `start-dev-simple.ps1` |
| 10 | `ModalFooter` no-op eliminado | `ui/Modal.tsx`, `ui/index.tsx` |
| 11 | `fix-encoding.ps1` paths relativos con `$PSScriptRoot` | `fix-encoding.ps1` |

#### Fase 4 — Small Structural Fixes (10 items)
| # | Cambio | Archivos |
|---|--------|----------|
| 12 | `normalizeFileExtensionFilter` extraído a `fileValidation.ts` | `documentService.ts`, `shareController.ts` |
| 13 | `generateSecurePassword` y `estimateCrackTime` eliminados (dead code) | `passwordPolicy.ts` (-80 líneas) |
| 14 | Tipos `PinResult`, `PinStatus` añadidos a IPFS adapter | `ipfs.ts` |
| 15 | `parseFilename` unificado (exportado desde `documents.ts`, importado en `versions.ts`) | `api/documents.ts`, `api/versions.ts` |
| 16 | `hashSHA3_256` ahora usa `ethers.keccak256` real (antes usaba SHA-256) | `lib/crypto/utils.ts` |
| 17 | `deploy-production.ps1` red actualizada Mumbai→Amoy | `deploy-production.ps1` |

---

### Commit `3520ac9` — Fase 5 (Medium Refactors)

#### Hook `useSigner` extraído
- **Nuevo archivo:** `frontend/src/hooks/useSigner.ts`
- **Elimina 60 líneas duplicadas** en 6 componentes que repetían el mismo patrón de verificación de wallet:
  - `UploadModal.tsx` → usa `getRegistryContract(connectedAddress)`
  - `ShareModal.tsx` → usa `getRegistryContract(connectedAddress)`
  - `SignDocumentModal.tsx` → usa `getVerifiedSigner(connectedAddress)`
  - `UploadVersionModal.tsx` → usa `getRegistryContract(connectedAddress)`
  - `OperationalVersionSelector.tsx` → usa `getRegistryContract(connectedAddress)`
  - `DocumentTransfer.tsx` → usa `getVerifiedSigner(connectedAddress)`
- 6 imports de `blockchainProvider` y `DocumentRegistryContract` eliminados de componentes

---

## Issues documentados para el futuro

### MEDIUM (15 items)
1. Patrón "validate ownership on-chain" repetido ~11 veces — extraer a helper
2. Funciones >100 líneas: `auditService.getFileAuditTrail` (232L), `eventListenerService.syncHistoricalEvents` (317L) — descomponer
3. Funciones exportadas nunca usadas: `validateSession`, `revokeAccessToken`, `cleanupExpiredTokens` (en `tokenService.ts`)
4. `any` types en IPFS adapter (`getPinStatus`, `listPins`, etc.)
5. `truncateAddress` duplicado en 4+ componentes frontend
6. Avatar + initials styling duplicado en 8+ componentes — extraer `<UserAvatar>`
7. Alias exports redundantes en `api/*.ts` — verificar y eliminar
8. 10 componentes >300 líneas sin descomponer
9. 2 sistemas de modales (`Modal` vs `Dialog`) con APIs diferentes
10. `WalletManager` duplica lógica de `WalletManagerContext`
11. E2E: selectores frágiles (XPath, placeholders, sin `data-testid`)
12. E2E: tests sin aserciones reales
13. E2E: `test.skip(browserName !== 'chromium')` en 62 tests
14. Cero tests unitarios frontend
15. Logger mock duplicado en 19 tests — consolidar

### LOW (5 items)
1. Smart contract: `_msgSender()` sin cachear en algunas funciones
2. Smart contract: `Ownable` + `AccessControl` redundante
3. `DialogPortal` wrapper no-op (pero usado internamente)
4. `deploy-production.ps1` necesita revisión completa de URLs
5. Credenciales SMTP en `.github/workflows/deploy-local-server.yml` — mover a GitHub Secrets

### Credenciales (documentado, no modificado)
- `.env` raíz: contiene credenciales SMTP (protegido por `.gitignore`)
