# Plan de Trabajo - DocumentChain TFG

> **Creado**: Mayo 2026
> **Última actualización**: Mayo 2026
> **Estado general**: En ejecución

---

## Registro de Progreso

### Leyenda
- `⬜` = Pendiente
- `🔄` = En progreso
- `✅` = Completado
- `⏸️` = Bloqueado / En espera

---

## FASE 0: PREPARACIÓN ESTRUCTURAL

| # | Tarea | Estado | Archivo afectado |
|---|-------|--------|------------------|
| 0.1 | Crear TODO.md de seguimiento | ✅ | `anexos/TODO.md` |
| 0.2 | Crear Anexo I desde cero (sin sobrescribir existente) | ✅ | `AnexoI_EspecificacionRequisitos_NUEVO.tex` |
| 0.3 | Crear carpeta `diagramas/analysis/` para BCE | ✅ | `anexos/diagramas/analysis/` |
| 0.4 | Crear archivo de estilo BCE compartido | ✅ | `_sequence-style.puml`, `_structure-style.puml` |

---

## FASE 1: ANEXO I — ESPECIFICACIÓN DE REQUISITOS

| # | Tarea | Estado | Archivo/Entregable |
|---|-------|--------|-------------------|
| 1.1 | Tabla de actores (ACT-01 a ACT-04) | ✅ | Dentro de `AnexoI_EspecificacionRequisitos_NUEVO.tex` |
| 1.2 | Catálogo RF numerado (RF-001 a RF-057) | ✅ | Dentro de `AnexoI_EspecificacionRequisitos_NUEVO.tex` |
| 1.3 | Catálogo RNF numerado (RNF-001 a RNF-018) | ✅ | Dentro de `AnexoI_EspecificacionRequisitos_NUEVO.tex` |
| 1.4 | Requisitos de información (10 entidades) | ✅ | Dentro de `AnexoI_EspecificacionRequisitos_NUEVO.tex` |
| 1.5 | Diagrama de paquetes | ✅ | Referenciado en `AnexoI_EspecificacionRequisitos_NUEVO.tex` |
| 1.6 | Revisar diagramas UC (8 paquetes) | ✅ | Referenciados en `AnexoI_EspecificacionRequisitos_NUEVO.tex` |
| 1.7 | Matriz de rastreabilidad RF ↔ UC ↔ SEQ ↔ Componente | ✅ | Tabla LaTeX en `AnexoI_EspecificacionRequisitos_NUEVO.tex` |

---

## FASE 2: ANEXO II — ESTIMACIÓN

| # | Tarea | Estado | Archivo/Entregable |
|---|-------|--------|-------------------|
| 2.1 | Tabla UAW / UUCW / UUCP completa | ✅ | `AnexoII_EstimacionTamanioEsfuerzo_NUEVO.tex` |
| 2.2 | Factores TCF/ECF con tablas | ✅ | `AnexoII_EstimacionTamanioEsfuerzo_NUEVO.tex` |
| 2.3 | Referencia Gantt (8 diagramas) | ✅ | `AnexoII_EstimacionTamanioEsfuerzo_NUEVO.tex` |

---

## FASE 3-A: ANEXO III — DIAGRAMAS DE ANÁLISIS BCE (56 diagramas)

### BLOQUE 1: AUTENTICACIÓN Y SEGURIDAD (10 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.01 | UC: Registrar usuario | ✅ | `seq-analysis-register.puml` |
| 3-A.02 | UC: Verificar email | ✅ | `seq-analysis-verify-email.puml` |
| 3-A.03 | UC: Iniciar sesión | ✅ | `seq-analysis-login.puml` |
| 3-A.04 | UC: Configurar 2FA | ✅ | `seq-analysis-2fa.puml` |
| 3-A.05 | UC: Recuperar contraseña | ✅ | `seq-analysis-recover-password.puml` |
| 3-A.06 | UC: Cerrar sesión | ✅ | `seq-analysis-logout.puml` |
| 3-A.07 | UC: Cambiar contraseña | ✅ | `seq-analysis-change-password.puml` |
| 3-A.08 | UC: Reenviar verificación | ✅ | `seq-analysis-resend-verification.puml` |
| 3-A.09 | UC: Regenerar backup 2FA | ✅ | `seq-analysis-regen-backup-2fa.puml` |
| 3-A.10 | UC: Auto-suspender cuenta | ✅ | `seq-analysis-self-suspend.puml` |

### BLOQUE 2: GESTIÓN DE DOCUMENTOS (10 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.11 | UC: Subir documento | ✅ | `seq-analysis-upload.puml` |
| 3-A.12 | UC: Listar documentos | ✅ | `seq-analysis-list-documents.puml` |
| 3-A.13 | UC: Ver detalle documento | ✅ | `seq-analysis-doc-detail.puml` |
| 3-A.14 | UC: Descargar documento | ✅ | `seq-analysis-download.puml` |
| 3-A.15 | UC: Archivar documento | ✅ | `seq-analysis-archive.puml` |
| 3-A.16 | UC: Desarchivar documento | ✅ | `seq-analysis-unarchive.puml` |
| 3-A.17 | UC: Eliminar documento | ✅ | `seq-analysis-delete.puml` |
| 3-A.18 | UC: Editar metadatos | ✅ | `seq-analysis-edit-metadata.puml` |
| 3-A.19 | UC: Buscar documentos | ✅ | `seq-analysis-search.puml` |
| 3-A.20 | UC: Crear carpeta | ✅ | `seq-analysis-create-folder.puml` |

### BLOQUE 3: VERSIONES (5 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.21 | UC: Crear versión | ✅ | `seq-analysis-version.puml` |
| 3-A.22 | UC: Listar versiones | ✅ | `seq-analysis-list-versions.puml` |
| 3-A.23 | UC: Descargar versión | ✅ | `seq-analysis-download-version.puml` |
| 3-A.24 | UC: Restaurar versión | ✅ | `seq-analysis-restore-version.puml` |
| 3-A.25 | UC: Activar versión | ✅ | `seq-analysis-activate-version.puml` |

### BLOQUE 4: COMPARTICIÓN Y PERMISOS (5 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.26 | UC: Compartir documento | ✅ | `seq-analysis-share.puml` |
| 3-A.27 | UC: Modificar permisos | ✅ | `seq-analysis-modify-permissions.puml` |
| 3-A.28 | UC: Revocar acceso | ✅ | `seq-analysis-revoke-access.puml` |
| 3-A.29 | UC: Ver compartidos conmigo | ✅ | `seq-analysis-shared-documents.puml` |
| 3-A.30 | UC: Transferir documento | ✅ | `seq-analysis-transfer.puml` |

### BLOQUE 5: FIRMAS DIGITALES (4 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.31 | UC: Firmar documento | ✅ | `seq-analysis-sign.puml` |
| 3-A.32 | UC: Ver firmas | ✅ | `seq-analysis-view-signatures.puml` |
| 3-A.33 | UC: Verificar firma | ✅ | `seq-analysis-verify-signature.puml` |
| 3-A.34 | UC: Verificar autenticidad | ✅ | `seq-analysis-verify-authenticity.puml` |

### BLOQUE 6: AUDITORÍA Y BÚSQUEDA (2 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.35 | UC: Auditoría blockchain | ✅ | `seq-analysis-blockchain-audit.puml` |
| 3-A.36 | UC: Ver timeline | ✅ | `seq-analysis-timeline.puml` |

### BLOQUE 7: WALLETS BLOCKCHAIN (5 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.37 | UC: Conectar wallet | ✅ | `seq-analysis-connect-wallet.puml` |
| 3-A.38 | UC: Registrar wallet | ✅ | `seq-analysis-register-wallet.puml` |
| 3-A.39 | UC: Etiquetar wallet | ✅ | `seq-analysis-label-wallet.puml` |
| 3-A.40 | UC: Eliminar wallet | ✅ | `seq-analysis-delete-wallet.puml` |
| 3-A.41 | UC: Establecer wallet primaria | ✅ | `seq-analysis-primary-wallet.puml` |

### BLOQUE 8: PERFIL Y PREFERENCIAS (3 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.42 | UC: Ver perfil | ✅ | `seq-analysis-profile.puml` |
| 3-A.43 | UC: Editar preferencias | ✅ | `seq-analysis-preferences.puml` |
| 3-A.44 | UC: Ver estadísticas usuario | ✅ | `seq-analysis-user-stats.puml` |

### BLOQUE 9: ADMINISTRACIÓN (7 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.45 | UC: Listar usuarios (admin) | ✅ | `seq-analysis-list-users.puml` |
| 3-A.46 | UC: Gestionar roles | ✅ | `seq-analysis-manage-roles.puml` |
| 3-A.47 | UC: Suspender usuario | ✅ | `seq-analysis-suspend-user.puml` |
| 3-A.48 | UC: Auto-reactivar | ✅ | `seq-analysis-self-unsuspend.puml` |
| 3-A.49 | UC: Eliminar usuario (admin) | ✅ | `seq-analysis-delete-user-admin.puml` |
| 3-A.50 | UC: Crear admin | ✅ | `seq-analysis-create-admin.puml` |
| 3-A.51 | UC: Pausar/reanudar sistema | ✅ | `seq-analysis-pause-resume-system.puml` |

### BLOQUE 10: MISCELÁNEA (5 diagramas)

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.52 | UC: Estadísticas globales (admin) | ✅ | `seq-analysis-global-stats.puml` |
| 3-A.53 | UC: Ver notificaciones | ✅ | `seq-analysis-notifications.puml` |
| 3-A.54 | UC: Etiquetar documento | ✅ | `seq-analysis-tag-document.puml` |
| 3-A.55 | UC: Gestionar categorías | ✅ | `seq-analysis-categories.puml` |
| 3-A.56 | UC: Auto-suspender | ✅ | `seq-analysis-self-suspend.puml` |

### DIAGRAMAS ADICIONALES ANÁLISIS

| # | Diagrama | Estado | Archivo |
|---|----------|--------|---------|
| 3-A.57 | Diagrama de clases BCE | ✅ | `class-analysis-bce.puml` |
| 3-A.58 | Diagrama de estados: ciclo de vida documento | ✅ | `state-document-lifecycle.puml` |
| 3-A.59 | Diagrama de actividad: subida documento | ✅ | `activity-upload.puml` |
| 3-A.60 | Diagrama de actividad: firma documento | ✅ | `activity-sign.puml` |

---

## FASE 3-B: ANEXO III — DIAGRAMAS DE DISEÑO (revisión)

| # | Tarea | Estado | Archivo |
|---|-------|--------|---------|
| 3-B.1 | Referenciar 65 seq de diseño en Anexo III LaTeX | ✅ | `AnexoIII_AnalisisDiseno_NUEVO.tex` |
| 3-B.2 | Diagramas arquitectura, componentes, despliegue referenciados | ✅ | `AnexoIII_AnalisisDiseno_NUEVO.tex` |
| 3-B.3 | class-design.puml referenciado | ✅ | `AnexoIII_AnalisisDiseno_NUEVO.tex` |
| 3-B.4 | ER y tablas BD referenciados | ✅ | `AnexoIII_AnalisisDiseno_NUEVO.tex` |
| 3-B.5 | deployment.puml referenciado | ✅ | `AnexoIII_AnalisisDiseno_NUEVO.tex` |
| 3-B.6 | components.puml referenciado | ✅ | `AnexoIII_AnalisisDiseno_NUEVO.tex` |

---

## FASE 4: ANEXO IV — DOCUMENTACIÓN TÉCNICA

| # | Tarea | Estado | Archivo |
|---|-------|--------|---------|
| 4.1 | Tabla stack tecnológico | ✅ | `AnexoIV_DocumentacionTecnica_NUEVO.tex` |
| 4.2 | Tabla frameworks y bibliotecas | ✅ | `AnexoIV_DocumentacionTecnica_NUEVO.tex` |
| 4.3 | Estructura del código (árbol directorios) | ✅ | `AnexoIV_DocumentacionTecnica_NUEVO.tex` |
| 4.4 | Métodos principales (cifrado, prepare/confirm, sync) | ✅ | `AnexoIV_DocumentacionTecnica_NUEVO.tex` |
| 4.5 | Smart contracts documentados (NatSpec) | ✅ | `AnexoIV_DocumentacionTecnica_NUEVO.tex` |
| 4.6 | Arquitectura de cifrado 3 capas | ✅ | `AnexoIV_DocumentacionTecnica_NUEVO.tex` |

---

## FASE 5: ANEXO V — PLAN DE SEGURIDAD

| # | Tarea | Estado | Archivo |
|---|-------|--------|---------|
| 5.1 | Inventario de activos | ✅ | `AnexoV_PlanSeguridad_NUEVO.tex` |
| 5.2 | Valoración CIA | ✅ | `AnexoV_PlanSeguridad_NUEVO.tex` |
| 5.3 | Amenazas principales | ✅ | `AnexoV_PlanSeguridad_NUEVO.tex` |
| 5.4 | Matriz de riesgos | ✅ | `AnexoV_PlanSeguridad_NUEVO.tex` |
| 5.5 | Medidas de seguridad | ✅ | `AnexoV_PlanSeguridad_NUEVO.tex` |
| 5.6 | Riesgos residuales | ✅ | `AnexoV_PlanSeguridad_NUEVO.tex` |

---

## FASE 6: ANEXO VI — MANUAL DEL USUARIO

| # | Tarea | Estado | Archivo |
|---|-------|--------|---------|
| 6.1 | Guía registro/login con capturas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |
| 6.2 | Guía gestión documentos con capturas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |
| 6.3 | Guía versiones con capturas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |
| 6.4 | Guía compartir con capturas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |
| 6.5 | Guía firmar con capturas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |
| 6.6 | Guía verificar con capturas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |
| 6.7 | Guía wallets con capturas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |
| 6.8 | Guía administración con capturas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |
| 6.9 | FAQ y resolución de problemas | ✅ | `AnexoVI_ManualUsuario_NUEVO.tex` |

---

## FASE 7: ANEXO VII — MANUAL DE MONTAJE

| # | Tarea | Estado | Archivo |
|---|-------|--------|---------|
| 7.1 | Requisitos hardware/software | ✅ | `AnexoVII_ManualMontaje_NUEVO.tex` |
| 7.2 | Instalación paso a paso (Docker) | ✅ | `AnexoVII_ManualMontaje_NUEVO.tex` |
| 7.3 | Configuración servicios (DB, email, Nginx) | ✅ | `AnexoVII_ManualMontaje_NUEVO.tex` |
| 7.4 | Verificación y mantenimiento | ✅ | `AnexoVII_ManualMontaje_NUEVO.tex` |

---

## FASE 8: MEMORIA PRINCIPAL

| # | Capítulo | Estado | Archivo |
|---|----------|--------|---------|
| 8.0 | Preliminares (portada, abstract, glosario, índices) | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.1 | Cap. 1 - Introducción | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.2 | Cap. 2 - Objetivos | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.3 | Cap. 3 - Antecedentes | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.4 | Cap. 4 - State of Art | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.5 | Cap. 5 - Normas y Referencias | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.6 | Cap. 6 - Aspectos Relevantes | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.7 | Cap. 7 - Limitaciones | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.8 | Cap. 8 - Líneas de trabajo futuro | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.9 | Cap. 9 - Conclusiones | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |
| 8.10 | Cap. 10 - Bibliografía | ✅ | `MemoriaPrincipal_DocumentChain_NUEVO.tex` |

---

## ANEXOS OPCIONALES

| # | Anexo | Estado | Archivo |
|---|-------|--------|---------|
| 9.1 | A8 - Inteligencia Artificial | ✅ | `AnexoVIII_UsoIA_NUEVO.tex` |
| 9.2 | A9 - Diseño Centrado en el Usuario | ✅ | `AnexoIX_DisenoCentradoUsuario_NUEVO.tex` |

---

## HISTORIAL DE CAMBIOS

| Fecha | Fase | Descripción |
|-------|------|-------------|
| 06/05/2026 | 0 | Creación del plan maestro |
| 06/05/2026 | 3-A | 60 diagramas de análisis BCE creados (56 secuencia + 4 adicionales) |
| 06/05/2026 | 1 | Anexo I completo creado desde cero (RF, RNF, actores, UC, matriz rastreabilidad) |
| 06/05/2026 | 2 | Anexo II completo creado desde cero (UCP, TCF, ECF, Gantt, 12,300h estimadas) |
| 06/05/2026 | 3 | Anexo III completo creado desde cero (60 diagramas BCE + diseño + BD + despliegue) |
| 06/05/2026 | 4-9 | Anexos IV, V, VI, VII, VIII, IX y Memoria Principal completados y compilados |
| 06/05/2026 | Build | Exportados 60 PNG de análisis, corregidos errores LaTeX, compilados 10 PDFs |
| 06/05/2026 | Enriquecimiento | Anexos IV, V, VI, VII y Memoria Principal enriquecidos con información técnica de anexos antiguos |
| 06/05/2026 | Build | Recompilados 10 PDFs tras enriquecimiento, todas las referencias cruzadas resueltas |
| | | |

---

*Este archivo se actualiza a medida que avanza el trabajo.*
