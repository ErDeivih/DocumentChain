# CONTEXTO PARA SIGUIENTE AGENTE: Consolidación UC (Parte 2)

## Copia/Pega Este Contexto Completo

---

### SITUACIÓN INICIAL (Estado al 2026-05-11 18:15 UTC)

**Tarea anterior completada:**
- ✅ Eliminado UC-0003 (2FA)
- ✅ Eliminada suspensión de schema Prisma
- ✅ Consolidado módulo Acceso: UC-0001 a UC-0012 (12 UCs sin brechas)
- ✅ Backend: 215/215 tests pasando
- ✅ Diagramas PlantUML y PDFs regenerados

**Situación actual detectada:**
```
UC-0001 a UC-0012:    Acceso (✓ 12 UCs)
UC-0013 a UC-0015:    BRECHA (3 números sin usar)
UC-0016 a UC-0024:    Documentos (9 UCs)
UC-0025 a UC-0029:    Versiones (5 UCs)
UC-0030 a UC-0032:    Firmas (3 UCs)
UC-0033 a UC-0035:    Compartición (3 UCs)
UC-0036 a UC-0040:    Auditoría (5 UCs)
UC-0041 a UC-0042:    Administración (2 UCs)

Total: 42 UCs (con brecha de 3 números)
```

### TAREA A EJECUTAR

**Objetivo:** Renumerar UC-0016→UC-0042 restando 3 a cada número para eliminar brecha.

**Resultado esperado:**
```
UC-0001 a UC-0012:    Acceso (12 UCs)
UC-0013 a UC-0021:    Documentos (9 UCs)
UC-0022 a UC-0026:    Versiones (5 UCs)
UC-0027 a UC-0029:    Firmas (3 UCs)
UC-0030 a UC-0032:    Compartición (3 UCs)
UC-0033 a UC-0037:    Auditoría (5 UCs)
UC-0038 a UC-0039:    Administración (2 UCs)

Total: 39 UCs (sin brechas)
```

---

### ARCHIVOS A MODIFICAR (Por Orden de Ejecución)

#### 1. DIAGRAMAS UC (6 archivos en anexos/diagramas/)

**a) uc_documentos.puml**
```
Cambios internos:
UC-0016 → UC-0013
UC-0017 → UC-0014
UC-0018 → UC-0015
UC-0019 → UC-0016
UC-0020 → UC-0017
UC-0021 → UC-0018
UC-0022 → UC-0019
UC-0023 → UC-0020
UC-0024 → UC-0021
```

**b) uc_versiones.puml**
```
UC-0025 → UC-0022
UC-0026 → UC-0023
UC-0027 → UC-0024
UC-0028 → UC-0025
UC-0029 → UC-0026
```

**c) uc_firmas.puml**
```
UC-0030 → UC-0027
UC-0031 → UC-0028
UC-0032 → UC-0029
```

**d) uc_comparticion.puml**
```
UC-0033 → UC-0030
UC-0034 → UC-0031
UC-0035 → UC-0032
```

**e) uc_auditoria.puml**
```
UC-0036 → UC-0033
UC-0037 → UC-0034
UC-0038 → UC-0035
UC-0039 → UC-0036
UC-0040 → UC-0037
```

**f) uc_administracion.puml**
```
UC-0041 → UC-0038
UC-0042 → UC-0039
```

#### 2. DIAGRAMAS DE SECUENCIA BCE (~30 archivos)

**RENOMBRAR archivos Y cambiar contenido (title UC-XXXX:):**

**Documentos:**
- seq-bce-uc0016-upload-doc.puml → seq-bce-uc0013-upload-doc.puml (cambiar title)
- seq-bce-uc0017-list-docs.puml → seq-bce-uc0014-list-docs.puml
- seq-bce-uc0018-detail.puml → seq-bce-uc0015-detail.puml
- seq-bce-uc0019-download.puml → seq-bce-uc0016-download.puml
- seq-bce-uc0020-archive.puml → seq-bce-uc0017-archive.puml
- seq-bce-uc0021-unarchive.puml → seq-bce-uc0018-unarchive.puml
- seq-bce-uc0022-delete.puml → seq-bce-uc0019-delete.puml
- seq-bce-uc0023-transfer.puml → seq-bce-uc0020-transfer.puml
- seq-bce-uc0024-search.puml → seq-bce-uc0021-search.puml

**Versiones:**
- seq-bce-uc0025-new-version.puml → seq-bce-uc0022-new-version.puml
- seq-bce-uc0026-list-versions.puml → seq-bce-uc0023-list-versions.puml
- seq-bce-uc0027-set-operational.puml → seq-bce-uc0024-set-operational.puml
- seq-bce-uc0028-restore.puml → seq-bce-uc0025-restore.puml
- seq-bce-uc0029-download-version.puml → seq-bce-uc0026-download-version.puml

**Firmas:**
- seq-bce-uc0030-sign.puml → seq-bce-uc0027-sign.puml
- seq-bce-uc0031-view-signatures.puml → seq-bce-uc0028-view-signatures.puml
- seq-bce-uc0032-verify-signature.puml → seq-bce-uc0029-verify-signature.puml

**Compartición:**
- seq-bce-uc0033-share.puml → seq-bce-uc0030-share.puml
- seq-bce-uc0034-revoke.puml → seq-bce-uc0031-revoke.puml
- seq-bce-uc0035-shared-with-me.puml → seq-bce-uc0032-shared-with-me.puml

**Auditoría:**
- seq-bce-uc0036-timeline.puml → seq-bce-uc0033-timeline.puml
- seq-bce-uc0037-stats-personal.puml → seq-bce-uc0034-stats-personal.puml
- seq-bce-uc0038-stats-global.puml → seq-bce-uc0035-stats-global.puml
- seq-bce-uc0039-verify-authenticity.puml → seq-bce-uc0036-verify-authenticity.puml
- seq-bce-uc0040-audit-blockchain.puml → seq-bce-uc0037-audit-blockchain.puml

**Administración:**
- seq-bce-uc0041-list-users.puml → seq-bce-uc0038-list-users.puml
- seq-bce-uc0042-manage-roles.puml → seq-bce-uc0039-manage-roles.puml

#### 3. DOCUMENTO DE AUDITORÍA

**Archivo:** `e:\Universidad\tfg\AUDITORIA_FUNCIONALIDADES_CONSOLIDADA.md`

Actualizar tabla "A. Módulo de Acceso y Cuenta" para incluir todos los 7 módulos con números consolidados (UC-0001 a UC-0039).

---

### PROCEDIMIENTO DE EJECUCIÓN (En Orden)

```powershell
# 1. Cambiar en 6 archivos uc_*.puml usando find-replace
# (restar 3 a cada UC número)

# 2. Renombrar ~30 archivos seq-bce-uc*.puml
# (uc0016 → uc0013, uc0017 → uc0014, etc)
# Y cambiar "title UC-0016:" dentro de cada archivo

# 3. Recompilar documentación
cd e:\Universidad\tfg
.\anexos\build_nuevo.ps1

# 4. Validar cambios
cd backend
npm test                    # Debe pasar: 215/215 ✓

cd ..\frontend
npm run test:e2e           # Ejecutar E2E tests

# 5. Verificar resultado
grep -r "UC-00[0-9][0-9]:" anexos/diagramas/uc_*.puml | sort
```

---

### ERRORES ESPERADOS (Y SOLUCIONES)

**Error 1: "isSuspended column does not exist"**
```
Causa: Prisma Client cachacé antiguo
Solución:
cd backend
npx prisma generate
npx prisma db push
```

**Error 2: seq-bce files not found after rename**
```
Causa: Archivos no renombrados en sistema de archivos
Solución: Usar `mv` o `Move-Item` PowerShell para renombrar archivos
```

**Error 3: PlantUML compilation warnings**
```
Causa: UnsupportedOperationException en decoradores
Impacto: NINGUNO - es no-bloqueante, diagramas se generan igual
```

---

### VALIDACIÓN POST-CAMBIOS

✅ **Checklist de Validación:**
- [ ] Total de UCs mostrados: 39 (antes 42)
- [ ] No hay UC-0013, 0014, 0015 vacíos
- [ ] Documentos: UC-0013 a UC-0021 (9 UCs)
- [ ] Versiones: UC-0022 a UC-0026 (5 UCs)
- [ ] Firmas: UC-0027 a UC-0029 (3 UCs)
- [ ] Compartición: UC-0030 a UC-0032 (3 UCs)
- [ ] Auditoría: UC-0033 a UC-0037 (5 UCs)
- [ ] Administración: UC-0038 a UC-0039 (2 UCs)
- [ ] Backend tests: 215/215 ✓
- [ ] Frontend E2E: Todos pasando o expectativas conocidas
- [ ] PDFs recompilados sin errores LaTeX
- [ ] AnexoIII_AnalisisDiseno_NUEVO.pdf contiene UC-0001 a UC-0039

---

### ARCHIVOS DE CONTEXTO GENERADOS

Para referencia del agente:
1. **CONTEXTO_CONSOLIDACION_UC_PARA_AGENTE.md** - Contexto detallado (8 secciones)
2. **TRABAJO_PENDIENTE_UC_CONSOLIDACION.md** - Resumen rápido
3. **Este archivo** - Instrucciones completas para copy-paste

---

**Preparado para:** Siguiente agente  
**Estado:** Listo para ejecución inmediata  
**Tiempo estimado:** 45 minutos (incluye recompilación)  
**Complejidad:** Baja (find-replace + renombrar archivos + compilar)
