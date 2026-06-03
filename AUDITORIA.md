# Auditoría de Código - DocumentChain

Rama: `refactor/auditoria-completa`
Fecha: 2026-06-03

## Resumen de cambios por fase

---

### FASE 0 — Preparación
- Creación de rama `refactor/auditoria-completa` desde `main`
- Baseline de tests pre-refactor
- Creación de este documento

### FASE 1 — Mover tests de _local_no_entrega
- Movidos tests co-located: integration.test.ts, encryption.test.ts, DocumentService.test.ts, ipfs.provider.test.ts, ipfs.self-hosted-client.test.ts
- Movidos 20 specs E2E + helpers.ts a frontend/e2e/
- Movido contracts.test.ts a frontend/src/lib/blockchain/__tests__/
- Movido security-regressions.test.ts a backend/test/
- Actualizado playwright.e2e.local.config.ts para ejecutar todos los specs

### FASE 2 — Arreglar CI workflow
- ci.yml: corregido path reseed-dev.ps1 (./scripts/reseed-dev.ps1)
- ci.yml: añadido --config playwright.e2e.local.config.ts
- ci.yml: eliminado --ext .ts (deprecado ESLint 9)
- ci.yml: eliminado --runInBand y --run redundantes
- ci.yml: reducido --max-warnings 30 → 5 en backend lint
- ci.yml: añadido job smart-contract-tests (hardhat test)
- reseed-dev.ps1: Set-Location corregido al repo root, $REPO_ROOT para todas las rutas
- reseed-dev.ps1: backslash a forward slash en deploymentEnvPath

### FASE 3 — Servicios base nuevos
- **emailVerificationService.ts**: extraído de EmailController (verifyEmail, resendVerification)
- **passwordResetService.ts**: extraído de EmailController (forgotPassword, resetPassword)
- **adminService.ts**: extraído de AdminController (getAllUsers, updateUserRole, createAdminUser, deleteUser, getSystemStats)
- **downloadHeaders.ts** (utils): función setDownloadHeaders compartida para controllers
- **documentLifecycleService.ts**: extraído softDeleteDocument, archiveDocument, unarchiveDocument

### FASE 4 — Refactor controllers
- **EmailController.ts**: reescrito → delega a EmailVerificationService + PasswordResetService. Renombrado a emailController.ts? (nota: mantener nombre original)
- **adminController.ts**: reescrito → delega a AdminService
- **authController.ts**: eliminado Prisma directo en register y me; register ahora delega duplicados al servicio; me usa UserService.getUserById; estandarizado catch(error:any)→catch(error)
- **walletController.ts**: movido blockchain admin sync a WalletService.addWallet
- **folderController.ts**: reemplazado req.user! por guard pattern; unificado formato respuesta ({data} en vez de {success:true,data}); unificados error codes (400 para negocio, 500 para internos)
- **signatureController.ts**: movido Prisma directo (version.findFirst) a SignatureService.getVersionSignaturesByNumber; eliminado import prisma
- **userController.ts**: updateAvatar usa UserService.uploadAvatar; removeAvatar usa UserService.removeAvatarWithFile; deleteMyAccount usa UserService.deleteMyAccount
- **versionController.ts**: mantiene headers propios (X-IPFS-CID específico), sin cambios mayores
- **documentController.ts**: softDeleteDocument movido a DocumentLifecycleService; downloadDocument usa setDownloadHeaders utility; actualizado confirmDeleteDocument

### FASE 5 — Refactor servicios
- **authService.ts**: 2 findUnique → 1 findFirst({OR:[...]}) para verificar duplicados
- **walletService.ts**: añadido sync admin blockchain al final de addWallet
- **userService.ts**: añadidos métodos uploadAvatar, removeAvatarWithFile, deleteMyAccount (con IPFS unpin + FS cleanup); añadidos campos emailVerified/encryptedPrivateKey a getUserById
- **signatureService.ts**: añadido getVersionSignaturesByNumber
- **blockchain/queries.ts**: getAllVersions for-loop secuencial → Promise.all
- **blockchainAdminService.ts**: syncAllAdmins setTimeout(500) secuencial → Promise.allSettled
- **accessControl.ts**: dynamic imports → static imports; wallet checks secuenciales → Promise.all

### FASE 6 — Prisma schema
- DocumentSignature.userId: String? → String (non-nullable, evita duplicados con NULL en PostgreSQL)
- Event: añadido @@index([documentId, eventType, createdAt])
- Comentarios en campos encryptedSymmetricKey para clarificar uso
- Comentario sobre encryptedPrivateKeyRecovery + recoveryKeyHash (van juntos)

### FASE 7 — Frontend
- **Contextos**: useMemo en AuthContext, WalletManagerContext, ActiveWalletContext → evita re-renders innecesarios
- **theme.ts**: ELIMINADO (341 líneas de código muerto)
- **AuthLayout.tsx**: nuevo componente para reducir gradiente duplicado (6+ páginas)
- **App.tsx**: React.lazy + Suspense para 5 rutas no críticas (code splitting)
- **types/index.ts**: FolderStats.totalSize bigint → number; PaginatedResponse<T> → PaginatedDocumentsResponse + PaginatedUsersResponse; ServiceResult<T> eliminado
- **useSocketListener.ts**: singleton global → useRef (reconexión con token nuevo)

### FASE 8 — Nuevos tests
- **authService.test.ts**: expandido de 3 a 10 tests (email not verified, wallet-only user, login by email, bcrypt migration, register duplicates, weak password, short username, logout)

### FASE 9 — Verificación
- TypeScript check backend/frontend
- ESLint backend/frontend
- Tests backend/frontend/smart-contracts
- Commit y push a refactor/auditoria-completa

---

## Archivos modificados

### Backend (nuevos)
- src/services/emailVerificationService.ts
- src/services/passwordResetService.ts
- src/services/adminService.ts
- src/services/documentLifecycleService.ts
- src/utils/downloadHeaders.ts

### Backend (modificados)
- src/controllers/EmailController.ts (reescrito)
- src/controllers/adminController.ts (reescrito)
- src/controllers/authController.ts
- src/controllers/walletController.ts
- src/controllers/folderController.ts
- src/controllers/signatureController.ts
- src/controllers/userController.ts
- src/controllers/documentController.ts
- src/services/authService.ts
- src/services/walletService.ts
- src/services/userService.ts
- src/services/signatureService.ts
- src/services/blockchainAdminService.ts
- src/lib/blockchain/queries.ts
- src/utils/accessControl.ts
- prisma/schema.prisma
- test/unit/authService.test.ts

### Frontend (nuevos)
- src/components/layout/AuthLayout.tsx
- src/lib/blockchain/__tests__/contracts.test.ts (movido)
- e2e/ (20 specs + helpers.ts movidos)

### Frontend (modificados)
- src/contexts/AuthContext.tsx
- src/contexts/WalletManagerContext.tsx
- src/contexts/ActiveWalletContext.tsx
- src/hooks/useSocketListener.ts
- src/App.tsx
- src/types/index.ts
- src/api/documents.ts
- src/services/blockchain/types.ts
- playwright.e2e.local.config.ts
- vitest.config.ts (sin cambios, solo verificado)

### Frontend (eliminados)
- src/lib/theme.ts

### Infraestructura (modificados)
- .github/workflows/ci.yml
- scripts/reseed-dev.ps1

### Tests (movidos)
- backend/src/__tests__/integration.test.ts
- backend/src/config/__tests__/*.test.ts
- backend/src/lib/__tests__/encryption.test.ts
- backend/src/services/__tests__/DocumentService.test.ts
- backend/test/security-regressions.test.ts
