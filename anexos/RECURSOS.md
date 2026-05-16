# Mapa de Recursos del Proyecto DocumentChain

> **FUENTE DE VERDAD**: Las capturas de `anexos/capt/` (1.png a 30.png) contienen la normativa oficial USAL / CCII-N2016-02. Todo lo que se genera debe ajustarse a lo que dictan esas diapositivas.

---

## 1. CAPTURAS NORMATIVAS OFICIALES (FUENTE PRIMARIA)

**Ubicación**: `anexos/capt/1.png` a `anexos/capt/30.png`

**Qué contienen**: Diapositivas del profesor Sergio García González (SGG) explicando la normativa CCII-N2016-02 aprobada por la Junta de Facultad de la USAL.

| Captura | Tema |
|---------|------|
| 1.png | Normas gráficas y plantillas (paginación, tablas/figuras, acrónimos) |
| 2.png | Estilo de redacción y bibliografía (lenguaje formal, APA 7 / IEEE) |
| 3.png | Identidad visual USAL (logotipo, tipografías, colores corporativos) |
| 4.png | Entrega (norma CCII-N2016-02, PDF único o separados, documentos obligatorios) |
| 5.png | Sección 2: Los Anexos (A1-A7 obligatorios, otros opcionales) |
| 6.png | Anexo I: Especificación de requisitos (objetivos, RF, RNF, info, paquetes, actores, UC, matriz) |
| 7.png | Anexo I: Herramientas recomendadas (Visual Paradigm, draw.io) |
| 8.png | Anexo II: Estimación del tamaño y esfuerzo (metodología, UCP, EZestimate) |
| 9.png | Metodologías: Proceso Unificado (UP), ágiles (Scrum), herramientas Gantt |
| 10.png | Anexo III: Análisis y Diseño del Sistema (4 bloques: Análisis, Arquitectónico, Datos, Entorno/Despliegue) |
| 11.png | Anexo IV: Documentación Técnica (stack, frameworks, estructura de código, doc semi-generada) |
| 12.png | Anexo V: Plan de Seguridad (activos, medidas, metodologías → INCIBE) |
| 13.png | Plan de seguridad INCIBE (6 etapas: identificación, valoración, amenazas, consecuencias, medidas, riesgos residuales) |
| 14.png | Recursos INCIBE: Inventario de activos, Análisis de riesgos |
| 15.png | Anexo VI: Manual del Usuario (instalación, guía paso a paso) |
| 16.png | Anexo *: Inteligencia Artificial (uso transparente, asistente, no codificación autónoma) |
| 17.png | Anexo *: Diseño Centrado en el Usuario (needfinding, prototipos, storyboards, pruebas) |
| 18.png | Sección 3: La Memoria — Consideraciones generales (portada, consentimiento, resumen/abstract, glosario, índices) |
| 19.png | Memoria cap. 2-3: Introducción y Objetivos (funcionales + personales, verbos en infinitivo) |
| 20.png | Memoria cap. 4: Antecedentes (marco teórico, aspectos no informáticos del problema) |
| 21.png | Memoria cap. 5: Descripción situación actual / State of Art (apps comerciales, artículos científicos) |
| 22.png | Memoria cap. 6: Normas y Referencias (métodos, herramientas, modelos, IA) |
| 23.png | Memoria cap. 7: Aspectos Relevantes (puente teoría-código, decisiones críticas, NO copiar casos de uso) |
| 24.png | Aspectos Relevantes (continuación): justificar caminos de solución, dónde encontrar el anexo concreto |
| 25.png | Memoria cap. 8-9: Limitaciones y Líneas de trabajo futuro |
| 26.png | Memoria cap. 10: Conclusiones (análisis crítico, honestidad, validación objetiva) |
| 27.png | Memoria cap. 11: Bibliografía (APA 7 o IEEE) |
| 28.png | Sección 5: Presentación (apoyo al discurso, esquemas, demostración) |
| 29.png | Sección 6: Defensa (ensayo previo, control de tiempo/nervios/errores) |
| 30.png | *(continuación defensa/presentación)* |

**Regla de oro de la normativa** (captura 5.png):
> *"Todo lo que no se cuente entre la memoria y los anexos no ha existido."*

---

## 2. PLANTILLA OFICIAL USAL

**Ubicación**: `anexos/plantilla_USAL.tex`

**Qué es**: Plantilla LaTeX oficial proporcionada por la USAL para informes/TFG.

**Características**:
- Compila con `lualatex`
- Usa `fontspec` + UTF-8 nativo
- Encabezado con logo USAL + título/subtítulo
- Pie de página con líneas grises y número centrado
- Márgenes: 2.5cm laterales, 3cm arriba, 2.5cm abajo
- Sin líneas en cabecera (`\headrulewidth{0pt}`)
- Portada sin numeración, página 2 en adelante con encabezado

**Uso**: Todos los anexos y la memoria deben basarse en esta plantilla. Los `.tex` existentes ya la usan pero deben unificarse.

---

## 3. ANEXOS EXISTENTES (BORRADORES / FINALES PARCIALES)

### 3.1 Archivos LaTeX actuales (más avanzados)

| Archivo | Anexo que cubre | Estado | Observaciones |
|---------|-----------------|--------|---------------|
| `AnexoI_Especificaciones.tex` | A1. Especificación de requisitos | ⚠️ Parcial | Tiene RF, RNF, actores, casos de uso, matrices. Revisar contra normativa actual. |
| `AnexoII_AnalisisDiseno.tex` | A3. Análisis y Diseño | ⚠️ Parcial | Tiene diagramas de clases, secuencia, despliegue. **FALTAN diagramas de análisis BCE** y modelo de dominio explícito. |
| `AnexoIII_EstimacionPlanificacion.tex` | A2. Estimación y esfuerzo | ✅ Avanzado | EZEstimate, Gantt, métricas. Revisar números. |
| `AnexoIV_PlanSeguridad.tex` | A5. Plan de seguridad | ⚠️ Parcial | Tiene activos, amenazas, medidas. Ajustar a formato INCIBE de 6 etapas. |
| `AnexoV_ManualesUsuario.tex` | A6. Manual del usuario | ⚠️ Parcial | Tiene guía paso a paso con capturas. Ampliar con capturas nuevas. |
| `AnexoVI_ArquitecturaBlockchainIPFS.tex` | A4. Documentación técnica + parte A3 | ⚠️ Parcial | Arquitectura, smart contracts, IPFS. Separar bien entre A3 y A4. |
| `AnexoVII_GuiaProgramadorDefensa.tex` | A7. Manual de montaje + Guía defensa | ⚠️ Parcial | Docker, despliegue, consejos defensa. |
| `Memoria_Principal_DocumentChain.tex` | Memoria principal (caps 1-10) | ⚠️ Parcial | Revisar estructura contra normativa de las capturas. |

### 3.2 Archivos temporales Markdown (originales / borradores antiguos)

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| `temp_anexo1.md` | Anexo I completo del compañero (Load Crutches) adaptado | ⚠️ Referencia de estructura, NO contenido final |
| `temp_anexo2.md` | Anexo II del compañero (estimación) | ⚠️ Referencia de estructura |
| `temp_anexo3.md` | Anexo III del compañero (análisis/diseño) | ⚠️ Referencia de estructura |
| `temp_anexo4.md` | Anexo IV del compañero (doc técnica) | ⚠️ Referencia de estructura |
| `temp_anexo5.md` | Anexo V del compañero (plan seguridad) | ⚠️ Referencia de estructura |

**⚠️ IMPORTANTE**: Los `temp_anexo*.md` son copias del TFG del compañero adaptadas. **NO COPIAR TEXTO** — solo sirven como referencia de nivel de detalle y formato de tablas.

### 3.3 Archivos Word (entregas antiguas)

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| `Anexo I.docx` | Especificaciones del sistema | ⚠️ Antiguo, posiblemente desfasado |
| `Anexo II.docx` | Análisis y diseño | ⚠️ Antiguo |
| `Anexo III.docx` | Estimación y planificación | ⚠️ Antiguo |
| `Anexo IV.docx` | Plan de seguridad | ⚠️ Antiguo |
| `Anexo V.docx` | Manuales de usuario | ⚠️ Antiguo |
| `Memoria.docx` | Memoria principal | ⚠️ Antiguo |

**⚠️ IMPORTANTE**: Los `.docx` son versiones muy antiguas (marzo 2026). **No usar como base** — la información puede estar desfasada respecto al código actual.

---

## 4. MEMORIA DE REFERENCIA DEL COMPAÑERO

**Ubicación**: `anexos/memoria_referencia/Memoria.md`

**Qué es**: Memoria completa del TFG "Load Crutches" de Víctor Martín Fuentes (USAL, enero 2026), tutorizado por Pablo Chamoso Santos.

**Para qué sirve**:
- Ver el **nivel de detalle** esperado en cada sección
- Ver cómo se **redactan** descripciones de interfaces, casos de uso, aspectos relevantes
- Ver cómo se **integran** figuras, tablas y referencias cruzadas
- Ver la **estructura de capítulos** de una memoria aprobada

**NO COPIAR**: El dominio es completamente distinto (muletas inteligentes vs gestión documental blockchain). Únicamente referencia de estilo, extensión y formato.

---

## 5. DIAGRAMAS PUML

### 5.1 Dónde están

**Ubicación**: `anexos/diagramas/`

### 5.2 Inventario completo

#### Casos de Uso (9 diagramas)
- `usecase-general.puml` — Vista general del sistema
- `uc_acceso.puml`, `uc_documentos.puml`, `uc_comparticion.puml`, `uc_versiones.puml`, `uc_firmas.puml`, `uc_auditoria.puml`, `uc_administracion.puml`
- `uc_administracion_prov.puml` — provisional

#### Secuencia de DISEÑO (65 diagramas, existentes)
Todos los `seq-*.puml` son de **diseño**: muestran AuthService, DocumentService, IPFS, PostgreSQL, Smart Contract, etc. Son los "posteriores" del Anexo III.

**Listado completo**:
`seq-activate-version`, `seq-archive`, `seq-blockchain-audit`, `seq-categories`, `seq-change-password`, `seq-connect-wallet`, `seq-create-admin`, `seq-create-folder`, `seq-delete`, `seq-delete-user-admin`, `seq-delete-wallet`, `seq-doc-detail`, `seq-download`, `seq-download-version`, `seq-edit-metadata`, `seq-label-wallet`, `seq-list-documents`, `seq-list-users`, `seq-list-versions`, `seq-login`, `seq-logout`, `seq-manage-roles`, `seq-modify-permissions`, `seq-notifications`, `seq-preferences`, `seq-primary-wallet`, `seq-profile`, `seq-recover-password`, `seq-register`, `seq-register-wallet`, `seq-resend-verification`, `seq-restore-version`, `seq-revoke-access`, `seq-search`, `seq-share`, `seq-shared-documents`, `seq-sign`, `seq-tag-document`, `seq-timeline`, `seq-transfer`, `seq-unarchive`, `seq-upload`, `seq-verify-authenticity`, `seq-verify-email`, `seq-verify-signature`, `seq-version`, `seq-view-signatures`.

Algunos tienen variante `_prov` (provisional).

#### Secuencia de ANÁLISIS (0 diagramas, PENDIENTES)
**FALTAN TODOS**. Hay que crear `seq-analysis-*.puml` para cada caso de uso, usando patrón BCE (Boundary, Control, Entity).

#### Clases
- `class-analysis.puml` — Modelo de dominio (entidades Prisma). **NO es análisis BCE**.
- `class-design.puml`, `class-design_prov.puml` — Diagrama de clases de diseño (Controllers, Services, Repositories).

#### Arquitectura / Componentes / Despliegue / ER
- `arquitectura.puml`, `arquitectura_prov.puml` — Arquitectura por paquetes
- `package-diagram.puml` — Diagrama de paquetes
- `components.puml` — Diagrama de componentes
- `deployment.puml`, `deployment_prov.puml` — Despliegue
- `er-diagram.puml`, `er-diagram_prov.puml`, `er-combined.puml` — Modelo entidad-relación

#### Colaboración
- `collaboration-upload.puml`, `collaboration-sign.puml`

#### Estimación y Planificación
- `ezestimate.puml`, `ezestimate-actors.puml`, `ezestimate-tcf-ecf.puml`, `ezestimate-uc-1.puml`
- `gantt-inicio1/2.puml`, `gantt-elab1/2.puml`, `gantt-const1/2.puml`, `gantt-trans1/2.puml`, `gantt-test.puml`

#### Flujos y UI
- `flow-public-upload.puml`, `flow-public-link-qr.puml`, `prepare-confirm.puml`
- `ui-*.puml` (8 mockups)

#### Estilos
- `_sequence-style.puml`, `_structure-style.puml`

---

## 6. CAPTURAS DE PANTALLA DE LA APLICACIÓN

### 6.1 Vista completa desktop
**Ubicación**: `anexos/capturas-ui/`

Contiene ~40 capturas de la interfaz web de DocumentChain funcionando:
- `landing-public.png`, `login-page.png`, `register-form.png`, `register-success.png`
- `documents-list.png`, `document-detail.png`, `upload-modal.png`, `upload-version-modal.png`
- `versions-tab.png`, `versions-tab-empty.png`, `timeline-page.png`
- `share-modal.png`, `shared-page.png`, `sign-modal.png`, `signers-modal.png`
- `transfer-tab.png`, `blockchain-auditor.png`, `verify-page.png`, `public-audit-page.png`
- `profile-page.png`, `settings-page.png`, `notifications-page.png`
- `admin-dashboard.png`, `two-factor-setup.png`, `two-factor-login.png`, `recovery-key-modal.png`
- `wallet-selector-modal.png`
- `mobile-*.png` (15 capturas responsive)

### 6.2 Para el manual de usuario
Estas capturas se usarán en el **Anexo VI (Manual del Usuario)**.

---

## 7. DOCUMENTACIÓN TÉCNICA DEL PROYECTO

**Ubicación**: `docs/`

| Archivo | Utilidad |
|---------|----------|
| `API.md` | Endpoints REST, formato de peticiones/responses. Útil para Anexo IV. |
| `FRONTEND_ENCRYPTION_MIGRATION.md` | Migración de cifrado. Útil para Anexo IV (aspectos técnicos). |
| `IPFS_SETUP.md` | Configuración de IPFS. Útil para Anexo VII. |
| `UBUNTU_SELF_HOSTED_DEPLOY.md` | Despliegue en Ubuntu. Útil para Anexo VII. |
| `POSTFIX_SMTP_SETUP.md`, `EMAIL_SMTP_SETUP.md` | Configuración email. Anexo VII. |
| `WALLETCONNECT_SETUP.md` | Configuración wallets. Anexo IV. |
| `ADMIN_SETUP.md` | Setup de admin. Anexo VII. |

---

## 8. CÓDIGO FUENTE (referencia técnica)

| Ruta | Qué contiene | Para qué anexo |
|------|-------------|----------------|
| `frontend/src/` | React 19, TypeScript, Vite, Tailwind | Anexo IV (estructura de código) |
| `backend/src/` | Node.js, Express, TypeScript, Prisma | Anexo IV (estructura de código) |
| `smart-contracts/contracts/` | Solidity (Hardhat) | Anexo IV (smart contracts) |
| `docker-compose.yml` | Infraestructura Docker | Anexo VII (despliegue) |
| `backend/prisma/schema.prisma` | Esquema de base de datos | Anexo III (diseño de datos) |

---

## 9. REGLAS PARA NO LIAR LOS RECURSOS

1. **Siempre que dudes, mira las capturas `anexos/capt/`**. Son la normativa oficial.
2. **Los `temp_anexo*.md` y `memoria_referencia/` son solo REFERENCIA DE ESTILO**. No copiar texto ni diagramas de ellos.
3. **Los `.docx` antiguos están desfasados**. No usarlos como fuente de información técnica.
4. **Los `.tex` existentes son la base real**, pero deben reestructurarse para ajustarse a las 7 anexos obligatorios + opcionales.
5. **Los `seq-*.puml` actuales son de DISEÑO**. Hay que crear los de ANÁLISIS (BCE) como `seq-analysis-*.puml`.
6. **El código fuente (`frontend/`, `backend/`, `smart-contracts/`) es la verdad técnica**. Todo diagrama debe reflejar la implementación real.

---

*Última actualización: Mayo 2026*
