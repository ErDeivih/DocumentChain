# Plan de Eliminación Ajustado (TFG)

Fecha: 2026-05-08

## 0) Decisiones cerradas por alcance

Se mantiene:
- Multiwallet (backend + frontend + tests)
- Timeline de historial por documento
- Auditoría blockchain con enfoque explorador tipo Etherscan

Se elimina/simplifica:
- Estadísticas no esenciales (paneles y endpoints duplicados)
- Suspensión/unsuspensión de usuarios
- 2FA TOTP
- Administración avanzada no core (circuit breaker y sync admin manual)
- Notificaciones complejas (WebSocket + preferencias + bandeja completa), manteniendo solo emails críticos

---

## 1) Objetivo técnico del recorte

Reducir complejidad funcional sin tocar el núcleo del TFG:
- Gestión documental
- Versionado
- Firma on-chain
- Compartición y permisos
- Transferencia de propiedad
- Verificación pública e integridad
- Trazabilidad/auditoría blockchain

Principio de diseño:
- "Una capacidad, una superficie": evitar duplicidades API/UI para la misma necesidad.

---

## 2) Plan por fases (implementación)

## Fase A - Limpieza funcional de bajo riesgo

### A1. Eliminar módulo de Stats (excepto métricas mínimas de auditoría pública)

Backend:
- Eliminar rutas de stats no core: backend/src/routes/stats.ts
- Eliminar controlador: backend/src/controllers/statsController.ts
- Eliminar servicio: backend/src/services/statsService.ts
- Quitar montaje de ruta en inicialización de Express (archivo de arranque/rutas principales)

Frontend:
- Eliminar cliente dedicado: frontend/src/api/stats.ts
- Eliminar bloques de UI que dependan de stats en:
  - frontend/src/pages/AdminDashboard.tsx
  - frontend/src/pages/Profile.tsx
  - otros componentes que consuman stats de usuario/sistema
- Limpiar tipos en frontend/src/types/index.ts (UserStats/SystemStats/DocumentStats si quedan huérfanos)

Mantener explícitamente:
- frontend/src/pages/Audit.tsx y frontend/src/api/audit.ts -> getPublicStats() puede quedarse como "métrica de salud/explorador" si se considera parte del Etherscan-like.

Criterio de aceptación:
- No existen llamadas a /api/stats/*
- Admin y Profile cargan sin tarjetas de estadísticas avanzadas

---

### A2. Eliminar suspensión/unsuspensión de usuario

Backend API:
- Quitar endpoints en backend/src/routes/users.ts:
  - POST /users/me/suspend/prepare
  - POST /users/me/suspend/confirm
  - POST /users/me/unsuspend/prepare
  - POST /users/me/unsuspend/confirm
- Eliminar lógica relacionada en backend/src/controllers/userController.ts
- Eliminar servicio backend/src/services/userSuspensionService.ts
- Limpiar referencias en auth middleware/controladores (campos isSuspended, suspendedAt, suspendReason)

Contrato (opciones):
- Opción recomendada para TFG (mínimo riesgo):
  - Mantener funciones en contrato pero dejar de usarlas desde backend/frontend
  - No migración on-chain inmediata
- Opción de limpieza total (si quieres coherencia máxima):
  - Nueva versión de contrato sin suspendMyself/unsuspendMyself/isUserSuspended
  - Redeploy + actualización de ABI + reseed

Base de datos:
- En Prisma schema, retirar campos de usuario si ya no se usan (isSuspended/suspendedAt/suspendReason)
- Crear migración y ajustar seeds

Frontend:
- Quitar acciones de suspensión/reactivación en Settings/Profile si existen

Criterio de aceptación:
- No hay flujo de suspensión en UI ni API
- Eliminación de cuenta sigue funcionando (hard delete)

---

### A3. Eliminar 2FA TOTP

Backend:
- En backend/src/routes/auth.ts, eliminar:
  - POST /auth/2fa/verify
  - GET /auth/2fa/status
  - POST /auth/2fa/setup
  - POST /auth/2fa/enable
  - POST /auth/2fa/disable
  - POST /auth/2fa/regenerate-backup-codes
- Eliminar métodos 2FA en backend/src/controllers/authController.ts
- Eliminar backend/src/services/twoFactorService.ts
- Limpiar campos 2FA en modelo User (si existen): secret, backup codes, enabled

Frontend:
- Eliminar frontend/src/api/twoFactor.ts
- Quitar UI/settings de 2FA en frontend/src/pages/Settings.tsx y/o frontend/src/pages/Login.tsx

Criterio de aceptación:
- Login por credenciales + wallet funciona sin paso 2FA
- No quedan rutas /auth/2fa/* expuestas

---

## Fase B - Simplificación de administración

### B1. Quitar administración avanzada no core

Backend (admin):
- En backend/src/routes/admin.ts, eliminar:
  - GET /admin/system/status
  - POST /admin/system/pause
  - POST /admin/system/unpause
  - POST /admin/sync/admins
- En backend/src/controllers/adminController.ts, retirar métodos asociados
- Revisar backend/src/services/systemService.ts y backend/src/services/blockchainAdminService.ts para eliminar funciones huérfanas

Frontend:
- En frontend/src/pages/AdminPanel.tsx y frontend/src/pages/AdminDashboard.tsx, retirar widgets/acciones de pause/unpause/sync
- Ajustar frontend/src/api/admin.ts a solo operaciones core de administración (usuarios/roles)

Contrato:
- Se puede mantener pause/unpause en contrato sin exponerlo en UI/API (recomendado para evitar redeploy inmediato)
- Si se exige coherencia total, plantear V2 de contrato sin Pausable y sin ADMIN emergency ops

Criterio de aceptación:
- Panel admin solo gestiona usuarios/roles y trazabilidad mínima
- No hay botones de operación de emergencia

---

## Fase C - Notificaciones (recorte controlado)

### C1. Pasar de "suite de notificaciones" a "email crítico"

Mantener:
- Emails críticos: verificación de cuenta, reset password, password changed, documento firmado (si lo justificas)

Eliminar/simplificar:
- Bandeja completa de notificaciones en app
- Preferencias detalladas por tipo
- Push realtime WebSocket para notificaciones

Backend:
- Revisar backend/src/services/notificationService.ts
- Revisar backend/src/routes/notification.routes.ts y controlador asociado
- Reducir a servicio mínimo o eliminar módulo si todo queda en emailService
- Evaluar eliminar backend/src/services/webSocketService.ts si solo era para notificaciones

Frontend:
- Eliminar frontend/src/pages/Notifications.tsx
- Eliminar frontend/src/api/notifications.ts
- Limpiar iconos/badges de notificaciones en layout/navbar

Criterio de aceptación:
- Correos críticos siguen llegando
- UI no muestra bandeja de notificaciones

---

## 3) Auditoría estilo Etherscan (mantener y simplificar)

Estado actual:
- Ya existe base funcional en frontend/src/pages/Audit.tsx (público) y frontend/src/pages/BlockchainAuditor.tsx (técnico)
- API pública de auditoría en frontend/src/api/audit.ts y backend route audit

Recomendación de simplificación:
- Unificar en una sola experiencia de explorador (evitar dos páginas solapadas)
- Mantener 4 búsquedas clave:
  1) blockchainId
  2) txHash
  3) walletAddress
  4) file/publicId
- Mantener filtros mínimos:
  - tipo de evento
  - rango temporal
  - bloque desde/hasta
- Mantener export CSV opcional (si aporta a TFG)
- Eliminar widgets no esenciales de "dashboard" dentro del auditor

Contrato: ¿hace falta tocarlo para Etherscan-like?
- No obligatoriamente.
- Solo considerar cambios de contrato si falta indexabilidad de eventos o campos de evento.
- Si se decide tocar:
  - añadir/empaquetar campos en eventos existentes, sin romper semántica
  - versionar ABI y actualizar listener/indexador backend

Criterio de aceptación:
- Explorador único, claro, justificable en memoria
- Búsqueda por txHash y blockchainId demostrable en E2E

---

## 4) Impacto en contrato (resumen de decisión)

## Opción recomendada (sin migración inmediata)
- No modificar contrato ahora
- Eliminar exposición de funciones no core en backend/frontend
- Ventaja: menor riesgo y menor coste de pruebas

## Opción estricta (coherencia máxima)
- Crear DocumentRegistry V2 sin:
  - suspensión usuario
  - pausa/unpause (si se decide)
- Implica:
  - redeploy
  - actualización ABI backend/frontend
  - reindexado/listeners
  - reseed datos QA
  - actualización masiva de tests

Recomendación para TFG:
- Ejecutar opción recomendada y justificar en memoria que ciertas capacidades on-chain quedan "no expuestas" por alcance funcional.

---

## 5) Plan de pruebas (unitarias, integración, E2E)

## 5.1 Backend unitarias/integración afectadas

Actualizar o eliminar tests:
- backend/test/unit/userSuspensionService.test.ts
- backend/test/unit/userSuspend.test.ts
- tests de auth con 2FA en authService/authController
- tests de stats en backend (si existen)
- tests admin de pause/unpause/sync
- backend/src/__tests__/integration.test.ts (rutas eliminadas)

Añadir/ajustar cobertura:
- Auth sin 2FA
- Delete account sin suspensión previa
- Admin básico (users/roles)
- Auditoría endpoints principales

## 5.2 Frontend E2E afectadas

Revisar/ajustar:
- frontend/e2e/notifications.spec.ts
- frontend/e2e/categories-admin-listing.spec.ts (si toca admin avanzado)
- frontend/e2e/app-features.spec.ts
- frontend/e2e/route-coverage.spec.ts
- frontend/e2e/use-cases.spec.ts
- frontend/e2e/audit-txhash.spec.ts (mantener y reforzar)
- frontend/e2e/login.spec.ts (flujo sin 2FA)

Nuevos criterios E2E clave:
- Explorador auditor: búsqueda por txHash + blockchainId + wallet
- Timeline documento se mantiene operativo
- Multiwallet sin regresiones
- No aparecen rutas/pantallas eliminadas

## 5.3 Smoke/regresión

Ejecutar al final de cada fase:
- backend/scripts/full-system-smoke-test.js
- suites E2E críticas (login, upload, share, sign, transfer, verify, audit)

---

## 6) Plan de migraciones y datos

Si se eliminan campos de User (2FA/suspensión):
- Crear migración Prisma
- Ajustar seed y scripts de generación de datos
- Verificar compatibilidad con datos QA existentes

Si NO se modifica contrato:
- No hay migración on-chain

Si SÍ se modifica contrato:
- Nuevo deployment tag
- scripts de sincronización de dirección de contrato
- regenerar fixtures E2E dependientes de eventos

---

## 7) Impacto documental (TFG)

Actualizar anexos/memoria en paralelo:
- Catálogo de casos de uso (eliminar 2FA, suspensión, admin avanzado, notificaciones internas complejas, stats avanzadas)
- Diagramas de secuencia afectados (auth, settings, admin)
- Arquitectura: simplificar subsistemas eliminados
- Plan de pruebas: retirar escenarios eliminados y añadir auditor explorador unificado

---

## 8) Orden recomendado de ejecución

1. Eliminar Stats (A1)
2. Eliminar Suspensión (A2)
3. Eliminar 2FA (A3)
4. Simplificar Admin avanzado (B1)
5. Recorte de Notificaciones (C1)
6. Unificación Auditor tipo Etherscan
7. Ronda completa de tests + E2E
8. Actualización documental final

---

## 9) Riesgos y mitigaciones

Riesgo: rotura por referencias huérfanas de rutas/API
- Mitigación: eliminar por módulo completo (route+controller+service+client+page)

Riesgo: regresión en auth
- Mitigación: cerrar primero tests de login/password reset/wallet login

Riesgo: E2E inestable por dataset
- Mitigación: reseed QA antes de cada tanda

Riesgo: desalineación contrato vs app
- Mitigación: evitar redeploy en primera iteración; desactivar exposición desde app

---

## 10) Definición de "hecho" (DoD)

- No existen endpoints activos de stats no core, 2FA, suspensión y admin avanzado
- Frontend no contiene navegación hacia pantallas eliminadas
- Auditor tipo Etherscan queda como pieza de trazabilidad principal
- Timeline y multiwallet funcionan
- Tests unitarios/integración/E2E críticos en verde
- Documentación de TFG actualizada con nuevo alcance
