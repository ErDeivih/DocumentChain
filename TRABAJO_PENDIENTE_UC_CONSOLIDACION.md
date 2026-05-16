# RESUMEN: Cambios UC-0013 a UC-0039 (Para Próximo Agente)

## Tarea Rápida
Renumerar 7 módulos de diagramas PlantUML para eliminar brecha UC-0013/0014/0015.

## Archivos Clave a Cambiar

### Fase 1: Diagramas de Casos de Uso (6 archivos)

1. **uc_documentos.puml** - Cambiar UC-0016→0024 a UC-0013→0021 (restar 3)
2. **uc_versiones.puml** - Cambiar UC-0025→0029 a UC-0022→0026 (restar 3)
3. **uc_firmas.puml** - Cambiar UC-0030→0032 a UC-0027→0029 (restar 3)
4. **uc_comparticion.puml** - Cambiar UC-0033→0035 a UC-0030→0032 (restar 3)
5. **uc_auditoria.puml** - Cambiar UC-0036→0040 a UC-0033→0037 (restar 3)
6. **uc_administracion.puml** - Cambiar UC-0041→0042 a UC-0038→0039 (restar 3)

**Ubicación:** `e:\Universidad\tfg\anexos\diagramas\uc_*.puml`

### Fase 2: Diagramas de Secuencia BCE (~30 archivos)

Cambiar nombres Y contenido:
- `seq-bce-uc0016-*.puml` → `seq-bce-uc0013-*.puml` (cambiar nombre + título dentro)
- `seq-bce-uc0017-*.puml` → `seq-bce-uc0014-*.puml`
- ... etc hasta UC-0042 → UC-0039

**Ubicación:** `e:\Universidad\tfg\anexos\diagramas/seq-bce-uc*.puml`

### Fase 3: Documento de Auditoría

Actualizar tabla en `e:\Universidad\tfg\AUDITORIA_FUNCIONALIDADES_CONSOLIDADA.md`

---

## Cambios de Números (Copia/Pega para Find-Replace)

```
### DOCUMENTOS (restar 3)
UC-0024 → UC-0021
UC-0023 → UC-0020
UC-0022 → UC-0019
UC-0021 → UC-0018
UC-0020 → UC-0017
UC-0019 → UC-0016
UC-0018 → UC-0015
UC-0017 → UC-0014
UC-0016 → UC-0013

### VERSIONES (restar 3)
UC-0029 → UC-0026
UC-0028 → UC-0025
UC-0027 → UC-0024
UC-0026 → UC-0023
UC-0025 → UC-0022

### FIRMAS (restar 3)
UC-0032 → UC-0029
UC-0031 → UC-0028
UC-0030 → UC-0027

### COMPARTICIÓN (restar 3)
UC-0035 → UC-0032
UC-0034 → UC-0031
UC-0033 → UC-0030

### AUDITORÍA (restar 3)
UC-0040 → UC-0037
UC-0039 → UC-0036
UC-0038 → UC-0035
UC-0037 → UC-0034
UC-0036 → UC-0033

### ADMINISTRACIÓN (restar 3)
UC-0042 → UC-0039
UC-0041 → UC-0038
```

---

## Comandos de Ejecución

```powershell
# 1. Cambiar en uc_documentos.puml (restar 3 a cada número)
cd e:\Universidad\tfg\anexos\diagramas

# 2. Cambiar en uc_versiones.puml, uc_firmas.puml, etc (restar 3)

# 3. Renombrar seq-bce-uc0016-*.puml → seq-bce-uc0013-*.puml (30 archivos)
# Nota: Cambiar dentro del archivo "title UC-0016:" → "title UC-0013:"

# 4. Recompilación de anexos
cd e:\Universidad\tfg
.\anexos\build_nuevo.ps1

# 5. Tests
cd backend
npm test

cd ..\frontend  
npm run test:e2e --maxWorkers=1
```

---

## Verificación Post-Cambios

```powershell
# Contar total de UCs (debe ser 39)
grep -r "UC-00[0-9][0-9]:" anexos/diagramas/uc_*.puml | wc -l

# Verificar no hay duplicados UC-0016
grep -r "UC-0016" anexos/diagramas/
```

---

## Catálogo Final Esperado (39 UCs)

```
UC-0001-0012: Acceso (12)
UC-0013-0021: Documentos (9)
UC-0022-0026: Versiones (5)
UC-0027-0029: Firmas (3)
UC-0030-0032: Compartición (3)
UC-0033-0037: Auditoría (5)
UC-0038-0039: Administración (2)
```

Total: **39 UCs** (sin brechas, ni sobrantes)
