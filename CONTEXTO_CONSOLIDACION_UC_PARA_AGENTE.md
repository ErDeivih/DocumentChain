# Contexto: Consolidación de Casos de Uso (UC-0013 a UC-0042)

**Fecha:** 2026-05-11  
**Tarea:** Renumerar casos de uso UC-0013 en adelante para eliminar brechas  
**Estado:** Lista para ejecución por agente externo

---

## 1. Situación Actual Detectada

### Numeración Presente
```
✓ UC-0001 a UC-0012: Módulo Acceso (12 UCs)
✗ UC-0013, UC-0014, UC-0015: BRECHA (3 números sin asignar)
✓ UC-0016 a UC-0024: Módulo Documentos (9 UCs)
✓ UC-0025 a UC-0029: Módulo Versiones (5 UCs)
✓ UC-0030 a UC-0032: Módulo Firmas (3 UCs)
✓ UC-0033 a UC-0035: Módulo Compartición (3 UCs)
✓ UC-0036 a UC-0040: Módulo Auditoría (5 UCs)
✓ UC-0041 a UC-0042: Módulo Administración (2 UCs)

Total: 42 UCs (con 3 números sin usar)
```

### Brechas a Eliminar
La brecha UC-0013/0014/0015 no corresponde a ninguna funcionalidad implementada. **Se debe renumerar documentos y posteriores para eliminarla:**

**ANTES:**
```
Acceso: UC-0001 → UC-0012
[BRECHA: 0013, 0014, 0015]
Documentos: UC-0016 → UC-0024
```

**DESPUÉS (objetivo):**
```
Acceso: UC-0001 → UC-0012
Documentos: UC-0013 → UC-0021      (restar 3)
Versiones: UC-0022 → UC-0026       (restar 3)
Firmas: UC-0027 → UC-0029          (restar 3)
Compartición: UC-0030 → UC-0032    (restar 3)
Auditoría: UC-0033 → UC-0037       (restar 3)
Administración: UC-0038 → UC-0039  (restar 3)

Total: 39 UCs (sin brechas)
```

---

## 2. Lista Completa de Casos de Uso por Módulo

### Módulo 1: Acceso y Cuenta (UC-0001 → UC-0012) ✓ COMPLETADO

1. **UC-0001:** Registrar Usuario
2. **UC-0002:** Iniciar Sesión
3. **UC-0003:** Cerrar Sesión
4. **UC-0004:** Conectar Wallet
5. **UC-0005:** Eliminar Wallet
6. **UC-0006:** Establecer Wallet Principal
7. **UC-0007:** Renombrar Wallet
8. **UC-0008:** Gestionar Perfil y Notificaciones
9. **UC-0009:** Eliminar Cuenta
10. **UC-0010:** Cambiar Contraseña
11. **UC-0011:** Verificar Email
12. **UC-0012:** Reenviar Verificación

---

### Módulo 2: Gestión de Documentos (A RENUMERAR: UC-0016→UC-0024 → UC-0013→UC-0021)

**Archivos a modificar:**
- `anexos/diagramas/uc_documentos.puml`
- `anexos/diagramas/seq-bce-uc0016-*.puml` → `seq-bce-uc0013-*.puml`
- [... otros seq-bce]

**Cambios de numeración:**
```
13. UC-0016 → UC-0013: Subir Documento
14. UC-0017 → UC-0014: Listar Documentos
15. UC-0018 → UC-0015: Ver Detalle de Documento
16. UC-0019 → UC-0016: Descargar Documento
17. UC-0020 → UC-0017: Archivar Documento
18. UC-0021 → UC-0018: Desarchivar Documento
19. UC-0022 → UC-0019: Eliminar Documento
20. UC-0023 → UC-0020: Transferir Documento
21. UC-0024 → UC-0021: Buscar Documentos
```

**Archivos a buscar/reemplazar:**
- Grep `UC-0016|UC-0017|UC-0018|UC-0019|UC-0020|UC-0021|UC-0022|UC-0023|UC-0024` en `anexos/diagramas/`

---

### Módulo 3: Versiones (A RENUMERAR: UC-0025→UC-0029 → UC-0022→UC-0026)

**Cambios de numeración:**
```
22. UC-0025 → UC-0022: Crear Nueva Versión
23. UC-0026 → UC-0023: Listar Versiones
24. UC-0027 → UC-0024: Establecer Versión Operativa
25. UC-0028 → UC-0025: Restaurar Versión Anterior
26. UC-0029 → UC-0026: Descargar Versión Específica
```

**Archivos:** `anexos/diagramas/uc_versiones.puml` + diagramas de secuencia

---

### Módulo 4: Firmas Digitales (A RENUMERAR: UC-0030→UC-0032 → UC-0027→UC-0029)

**Cambios de numeración:**
```
27. UC-0030 → UC-0027: Firmar Documento
28. UC-0031 → UC-0028: Ver Firmas de un Documento
29. UC-0032 → UC-0029: Verificar Firma del Usuario
```

**Archivos:** `anexos/diagramas/uc_firmas.puml`

---

### Módulo 5: Compartición de Documentos (A RENUMERAR: UC-0033→UC-0035 → UC-0030→UC-0032)

**Cambios de numeración:**
```
30. UC-0033 → UC-0030: Compartir Documento
31. UC-0034 → UC-0031: Revocar Acceso
32. UC-0035 → UC-0032: Ver Compartidos Conmigo
```

**Archivos:** `anexos/diagramas/uc_comparticion.puml`

---

### Módulo 6: Auditoría y Verificación (A RENUMERAR: UC-0036→UC-0040 → UC-0033→UC-0037)

**Cambios de numeración:**
```
33. UC-0036 → UC-0033: Ver Timeline
34. UC-0037 → UC-0034: Ver Estadísticas Personales
35. UC-0038 → UC-0035: Ver Estadísticas Globales
36. UC-0039 → UC-0036: Verificar Autenticidad
37. UC-0040 → UC-0037: Auditoría Blockchain
```

**Archivos:** `anexos/diagramas/uc_auditoria.puml`

---

### Módulo 7: Administración (A RENUMERAR: UC-0041→UC-0042 → UC-0038→UC-0039)

**Cambios de numeración:**
```
38. UC-0041 → UC-0038: Listar Usuarios
39. UC-0042 → UC-0039: Gestionar Roles
```

**Archivos:** `anexos/diagramas/uc_administracion.puml`

---

## 3. Tareas Específicas a Ejecutar

### 3.1 Renumeración en Diagramas PlantUML

**Patrón de búsqueda/reemplazo para cada módulo:**

```powershell
# DOCUMENTOS (restar 3)
UC-0016 → UC-0013
UC-0017 → UC-0014
UC-0018 → UC-0015
UC-0019 → UC-0016
UC-0020 → UC-0017
UC-0021 → UC-0018
UC-0022 → UC-0019
UC-0023 → UC-0020
UC-0024 → UC-0021

# VERSIONES (restar 3)
UC-0025 → UC-0022
UC-0026 → UC-0023
UC-0027 → UC-0024
UC-0028 → UC-0025
UC-0029 → UC-0026

# FIRMAS (restar 3)
UC-0030 → UC-0027
UC-0031 → UC-0028
UC-0032 → UC-0029

# COMPARTICIÓN (restar 3)
UC-0033 → UC-0030
UC-0034 → UC-0031
UC-0035 → UC-0032

# AUDITORÍA (restar 3)
UC-0036 → UC-0033
UC-0037 → UC-0034
UC-0038 → UC-0035
UC-0039 → UC-0036
UC-0040 → UC-0037

# ADMINISTRACIÓN (restar 3)
UC-0041 → UC-0038
UC-0042 → UC-0039
```

### 3.2 Archivos PlantUML a Modificar

**Diagrama de Casos de Uso (uc_*.puml):**
```
✓ anexos/diagramas/uc_acceso.puml (NO CAMBIAR - UC-0001 a UC-0012)
→ anexos/diagramas/uc_documentos.puml
→ anexos/diagramas/uc_versiones.puml
→ anexos/diagramas/uc_firmas.puml
→ anexos/diagramas/uc_comparticion.puml
→ anexos/diagramas/uc_auditoria.puml
→ anexos/diagramas/uc_administracion.puml
```

**Diagramas de Secuencia (seq-bce-uc*.puml):**
Están nombrados por archivo (ej: `seq-bce-uc0016-*.puml`), hay ~42 archivos.
Cambiar nombres de archivo Y contenido del título "title UC-XXXX:"

Ejemplo:
```
seq-bce-uc0016-upload-doc.puml → seq-bce-uc0013-upload-doc.puml
Contenido: "title UC-0016: Subir Documento" → "title UC-0013: Subir Documento"
```

### 3.3 Paso de Build Final

```powershell
cd e:\Universidad\tfg
.\anexos\build_nuevo.ps1
```

Esto regenerará:
- 152 diagramas PNG
- 9 PDFs _NUEVO (especialmente AnexoIII_AnalisisDiseno_NUEVO.pdf con diagramas corregidos)

---

## 4. Testing y Validación

### 4.1 Backend Tests (Deben pasar sin cambios)
```powershell
cd e:\Universidad\tfg\backend
npm test
# Esperado: 215 tests passed
```

### 4.2 Frontend E2E Tests (Actualmente con fallos por Prisma)
```powershell
cd e:\Universidad\tfg\frontend
npm run test:e2e
# Nota: Regenerar Prisma Client si aún hay errores isSuspended
cd ..\backend
npx prisma generate
npx prisma db push
```

### 4.3 Validaciones Manuales
- [ ] Abrir AnexoIII_AnalisisDiseno_NUEVO.pdf
- [ ] Verificar que todas las referencias UC están entre UC-0001 a UC-0039
- [ ] Confirmar que no hay brechas en la numeración
- [ ] Revisar tabla de módulos en introducción

---

## 5. Checklist de Cambios

### 5.1 Archivos a Modificar

**uc_documentos.puml**
```puml
# Cambiar TODAS las referencias UC-00XX en usecase definitions
Antes: usecase "UC-0016: Subir Documento" as UC19
Después: usecase "UC-0013: Subir Documento" as UC19
(y así para UC-0017→0014, UC-0018→0015, etc.)
```

**uc_versiones.puml**
```puml
Antes: usecase "UC-0025: Crear Nueva Version" 
Después: usecase "UC-0022: Crear Nueva Version"
(y así para todos)
```

**uc_firmas.puml, uc_comparticion.puml, uc_auditoria.puml, uc_administracion.puml**
- Aplicar el mismo patrón

**Todos los seq-bce-uc*.puml files**
- Renombrar archivo: `mv seq-bce-uc0016-*.puml seq-bce-uc0013-*.puml`
- Cambiar título en contenido: `title UC-0016:` → `title UC-0013:`

### 5.2 Validación de Cambios

Después de cada grupo de cambios:
```powershell
# Verificar que no hay duplicados
grep -r "UC-0016:" anexos/diagramas/

# Contar UCs totales (debe haber 39)
grep -r "usecase.*UC-" anexos/diagramas/ | grep -v hidden | wc -l
```

---

## 6. Estado Actual de Cambios (Pre-consolidación)

### Cambios Ya Realizados (2026-05-11)
- ✅ Eliminado UC-0003 "Validar Segundo Factor" del módulo Acceso
- ✅ Consolidado UC-0008 "Gestionar Perfil y Notificaciones" (agrupa perfil + preferencias)
- ✅ Renumerado módulo Acceso: UC-0001 a UC-0012 (sin brechas)
- ✅ Eliminada suspensión de schema Prisma (isSuspended, suspendedAt, suspendReason)
- ✅ Eliminado código 2FA (tokenService.generateTempToken, verifyTempToken)
- ✅ Migración Prisma: 20260511180124_remove_suspension_fields

### Lo que Falta Hacer (Para Este Agente)
- ❌ Renumerar Documentos: UC-0016-0024 → UC-0013-0021 (restar 3)
- ❌ Renumerar Versiones: UC-0025-0029 → UC-0022-0026 (restar 3)
- ❌ Renumerar Firmas: UC-0030-0032 → UC-0027-0029 (restar 3)
- ❌ Renumerar Compartición: UC-0033-0035 → UC-0030-0032 (restar 3)
- ❌ Renumerar Auditoría: UC-0036-0040 → UC-0033-0037 (restar 3)
- ❌ Renumerar Administración: UC-0041-0042 → UC-0038-0039 (restar 3)
- ❌ Renombrar archivos seq-bce-uc*: ~30 archivos (uc0016-0024, 0025-0029, etc.)
- ❌ Recompilar anexos: `.\anexos\build_nuevo.ps1`
- ❌ Validar tests backend/frontend
- ❌ Actualizar AUDITORIA_FUNCIONALIDADES_CONSOLIDADA.md con nuevo catálogo

---

## 7. Notas Importantes

### Prisma Client Issue
Si los tests E2E fallan con "The column `User.isSuspended` does not exist in the current database":
```powershell
cd backend
npx prisma generate
npx prisma db push
```

### Buildscript
El archivo `anexos/build_nuevo.ps1` automáticamente:
1. Genera 152 PNGs desde diagramas PlantUML
2. Compila 9 PDFs LaTeX _NUEVO

Posibles warnings de PlantUML (no bloqueantes):
```
java.lang.UnsupportedOperationException (algunos decoradores - ignorar)
Warning: no image in diagramas\_sequence-bce-style.puml
```

### Documentación Anexa
Después de renumerar y compilar:
- Actualizar [AUDITORIA_FUNCIONALIDADES_CONSOLIDADA.md](AUDITORIA_FUNCIONALIDADES_CONSOLIDADA.md)
- Cambiar tabla "A. Módulo de Acceso y Cuenta (11 UC)" a tablas para todos los 7 módulos
- Confirmar total: 39 UC (UC-0001 a UC-0039, sin brechas)

---

## 8. Línea de Comandos Única (Todo en Uno)

```powershell
# El agente puede ejecutar esto directamente después de hacer cambios
cd e:\Universidad\tfg\backend
npm test
cd ..\frontend
npm run test:e2e --maxWorkers=1
```

---

**Último estado:** Contexto generado para agente de continuación (2026-05-11 18:10 UTC)
