# CHANGELOG - Limpieza de Código DocumentChain

> 16 mayo 2026 | Commits: `a834cf8` → `667c7c8` → `1ac67c4` → `3520ac9` → `b8db1b9`

---

## COMPLETADO

### Fase 1-2 — CRÍTICO + ALTO
- 17 archivos basura eliminados
- `SigningService.ts:125` texto español → comentario
- `passwordPolicy.ts` Math.random() → crypto.randomBytes()
- `emailService.ts` rejectUnauthorized → env variable
- `DocumentRegistry.sol` 3 modifiers (notDeleted/notArchived) añadidos
- `DocumentPermissionService` → delega a `BlockchainQueries` (capa única)
- `verificationService` → usa `calculateHash` de `encryption.ts`
- 3 endpoints deprecated eliminados de controladores
- 3 PrismaClient → singleton unificado (BigInt extension)
- `share.schema.ts` eliminado (archivo muerto)
- Config files (`blockchain.ts`, `ipfs.ts`, `contractAddress.ts`) → usan `env.ts`

### Fase 3 — Quick Wins
- `getQuery` delega a `getParam` | `substr` → `slice` | `formatBytes` importado
- 6 `console.log` eliminados de `DocumentTransfer.tsx`
- `MAX_FILE_SIZE` constante | 3 directorios vacíos eliminados
- `test-api.sh`, `create-first-admin.sh`, `start-dev-simple.ps1` arreglados
- `ModalFooter` no-op eliminado | `fix-encoding.ps1` usa `$PSScriptRoot`

### Fase 4 — Small Fixes
- `normalizeFileExtensionFilter` extraído a `fileValidation.ts`
- `generateSecurePassword`, `estimateCrackTime` eliminados (dead code)
- Tipos `PinResult`, `PinStatus` añadidos a IPFS
- `parseFilename` unificado (exportado de `documents.ts`)
- `hashSHA3_256` → `ethers.keccak256` real | `deploy-production.ps1` Mumbai→Amoy

### Fase 5 — useSigner Hook
- Hook `useSigner.ts` creado: `getVerifiedSigner()` + `getRegistryContract()`
- 6 componentes migrados, 60 líneas duplicadas eliminadas

### Fase 6 — Batch Final
- **Dead code:** 6 funciones eliminadas (validateSession, revokeAccessToken, cleanupExpiredTokens, getOperationalVersion, getSignature, hasUserSigned)
- **Alias exports:** 19 eliminados de `auth.ts`, `wallets.ts`, `signatures.ts`, `versions.ts`
- **truncateAddress:** 10 ocurrencias unificadas en 7 archivos (WalletSidebar, WalletSelectorModal, WalletManager, Audit, TransactionDetailModal, OperationalVersionSelector, SharedWithMe)
- **IPFS types:** `any` → `PinStatus`, `PinResult` en `IPFSAdapter`
- **E2E:** 62 `test.skip(browserName !== 'chromium')` eliminados de 17 specs

---

## PENDIENTE — Próxima iteración

### Fase 7 (esta sesión) — MEDIUM cierre

| # | Issue | Estado |
|---|-------|--------|
| M6 | `<UserAvatar>` componente compartido (8+ componentes → 1) | **en progreso** |
| M1 | Helper `validateDocumentOwnership` (~11 call sites) | **en progreso** |
| M15 | Logger mock consolidado en 19 tests | **en progreso** |
| L1 | Cachear `_msgSender()` en DocumentRegistry.sol | **en progreso** |

### Fase 8 (próxima sesión) — Descomposición funciones grandes

| # | Issue | Archivos |
|---|-------|----------|
| M2a | `getFileAuditTrail` (232L, 8 event loops) → helpers | `auditService.ts` |
| M2b | `syncHistoricalEvents` (317L, 12 event loops) → mapper | `eventListenerService.ts` |

### Fase 9 (futuro) — Arquitectura (NO prioridad ahora)

| # | Issue | Esfuerzo estimado |
|---|-------|-------------------|
| M8 | Descomponer 10 componentes >300L | 20h+ |
| M9 | Unificar Modal vs Dialog (2 sistemas) | 10h+ |
| M10 | Consolidar WalletManager vs WalletManagerContext | 6h |
| M11 | E2E: selectores data-testid | 6h |
| M12 | E2E: aserciones reales | 4h |
| M14 | Tests unitarios frontend (0 existen) | 20h+ |
| L2 | Quitar Ownable del contrato (solo AccessControl) | 4h |
| L5 | Credenciales SMTP → GitHub Secrets | 10min |

### DESCARTADO definitivamente

| # | Issue | Motivo |
|---|-------|--------|
| L3 | DialogPortal no-op | No es no-op, se usa internamente en DialogContent |
| L4 | deploy-production.ps1 URLs | Ya arreglado (Mumbai→Amoy) |

---

## Tareas Fase 7 — Detalle técnico

### M6: `<UserAvatar>` component
**Archivos a modificar:** Header.tsx, Sidebar.tsx, ShareList.tsx, DocumentTransfer.tsx, OperationalVersionSelector.tsx, AvatarUpload.tsx, Profile.tsx, Settings.tsx
**Patrón duplicado:**
```tsx
<Avatar className="h-10 w-10">
  {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={name} /> : null}
  <AvatarFallback className="bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-sm text-slate-950">
    {name.slice(0, 2).toUpperCase()}
  </AvatarFallback>
</Avatar>
```
**Nuevo componente:** `components/ui/UserAvatar.tsx` con props `name`, `avatarUrl`, `size?`

### M1: Helper `validateDocumentOwnership`
**Archivos a modificar:** `documentController.ts` (8 call sites), `shareController.ts` (3 call sites)
**Patrón:**
```ts
if (document.blockchainId) {
  const { DocumentPermissionService } = await import('../services/documentPermissionService');
  const userWallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!userWallet) throw new Error('Wallet no encontrada');
  const isOwnerOnChain = await DocumentPermissionService.isOwner(document.blockchainId, userWallet.walletAddress);
  if (!isOwnerOnChain) throw new Error('No tienes permisos...');
} else if (document.ownerId !== userId) {
  throw new Error('No tienes permisos...');
}
```
**Nuevo helper:** `services/documentPermissionService.ts` con método `validateOwnership(document, userId): Promise<void>`

### M15: Logger mock consolidation
**Archivos:** 19 test files en `backend/test/unit/` + `test/setup.ts`
**Patrón duplicado:** `jest.mock('../../src/utils/logger', () => ({...}))` repetido en cada archivo
**Solución:** Mover el mock a `setup.ts` (global mock)

### L1: `_msgSender()` caching
**Archivo:** `smart-contracts/contracts/DocumentRegistry.sol`
**Cambio:** `address sender = _msgSender();` al inicio de funciones que llaman `_msgSender()` múltiples veces
