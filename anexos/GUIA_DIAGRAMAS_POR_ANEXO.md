# GUÍA DE DIAGRAMAS POR ANEXO — DocumentChain

> Basado en las pautas del profesor (`anexos/capt/capturas.md`), el patrón del compañero
> (`anexos/capt/Anexo 1-7` PDFs + txt), y el inventario real de diagramas del proyecto.

---

## ESTRUCTURA DE ANEXOS (normativa CCII-N2016-02 + Depto. Informática USAL)

| Anexo | Título | Obligatoriedad |
|-------|--------|:---:|
| A1 | Especificación de Requisitos | Obligatorio |
| A2 | Especificaciones del Tamaño y Esfuerzo | Obligatorio |
| A3 | Análisis y Diseño del Sistema | Obligatorio |
| A4 | Documentación Técnica | Obligatorio |
| A5 | Plan de Seguridad | Obligatorio |
| A6 | Manual del Usuario | Obligatorio |
| A7 | Manual de Montaje / Despliegue | Obligatorio |
| A8 | Uso de Inteligencia Artificial | Recomendado |
| A9 | Diseño Centrado en el Usuario | Opcional |

**Nota:** El compañero usa la numeración ANTIGUA (A1=Requisitos, A2=Análisis, A3=Diseño, A4=Seguridad, A5=Manuales, A6=Arquitectura, A7=Programador). Nosotros usamos la NUEVA del Departamento, que intercambia A2 y A3 (análisis y estimación).

---

## ANEXO I — ESPECIFICACIÓN DE REQUISITOS

### Lo que pide el profesor (capturas.md, imagen 8):
- Objetivos
- Requisitos de información (IRQ)
- Requisitos funcionales (UC)
- **Diagrama de paquetes**
- **Definición de actores**
- **Diagramas de casos de uso**
- Requisitos no funcionales (NFR)
- **Matriz de rastreabilidad**

### Lo que hizo el compañero (Anexo 1, 71 páginas, 41 UC):
- 1 diagrama de paquetes de requisitos funcionales (Ilustración 1)
- 1 jerarquía de actores (Ilustración 2)
- 4 jerarquías de casos de uso por paquete funcional (Ilustraciones 3-6)
- **NO incluye diagramas de secuencia** (van en análisis/diseño)

### Diagramas que debemos incluir:

| # | Diagrama | Archivo | Tipo |
|---|----------|---------|------|
| 1 | Jerarquía de actores | `actor-hierarchy.png` | Jerarquía |
| 2 | Diagrama de paquetes | `package-diagram.png` (ref. desde Anexo III) o texto | Paquetes |
| 3 | Diagrama general de casos de uso | `usecase-general.png` | Casos de uso |
| 4 | Paquete: Acceso y autenticación | `uc_acceso.png` | Casos de uso |
| 5 | Paquete: Gestión de documentos | `uc_documentos.png` | Casos de uso |
| 6 | Paquete: Versiones | `uc_versiones.png` | Casos de uso |
| 7 | Paquete: Firmas | `uc_firmas.png` | Casos de uso |
| 8 | Paquete: Compartición | `uc_comparticion.png` | Casos de uso |
| 9 | Paquete: Auditoría | `uc_auditoria.png` | Casos de uso |
| 10 | Paquete: Administración | `uc_administracion.png` | Casos de uso |

**NO incluir:** diagramas de secuencia BCE ni de diseño (van en Anexo III).

---

## ANEXO II — ESTIMACIÓN DEL TAMAÑO Y ESFUERZO

### Lo que pide el profesor (capturas.md, imagen 9-10):
- Metodología: Proceso Unificado (UP)
- Estimación basada en Casos de Uso (UCP)
- Planificación temporal con diagramas de Gantt

### Lo que hizo el compañero:
**El compañero NO tiene un anexo de estimación separado.** Su estimación va integrada en la memoria. Para DocumentChain sí existe un Anexo II específico de estimación.

### Diagramas que debemos incluir:

| # | Diagrama | Archivo | Tipo |
|---|----------|---------|------|
| 1 | EZEstimate: Actores | `ezestimate-actors.png` | Captura |
| 2 | EZEstimate: Clasificación UC | `ezestimate-uc-1.png` | Captura |
| 3 | EZEstimate: Cálculo final | `ezestimate.png` | Captura |
| 4 | Gantt: Inicio Iteración 1 | `gantt-inicio1.png` | Gantt |
| 5 | Gantt: Inicio Iteración 2 | `gantt-inicio2.png` | Gantt |
| 6 | Gantt: Elaboración Iteración 1 | `gantt-elab1.png` | Gantt |
| 7 | Gantt: Elaboración Iteración 2 | `gantt-elab2.png` | Gantt |
| 8 | Gantt: Construcción Iteración 1 | `gantt-const1.png` | Gantt |
| 9 | Gantt: Construcción Iteración 2 | `gantt-const2.png` | Gantt |
| 10 | Gantt: Transición Iteración 1 | `gantt-trans1.png` | Gantt |
| 11 | Gantt: Transición Iteración 2 | `gantt-trans2.png` | Gantt |
| 12 | Gantt: Pruebas | `gantt-test.png` | Gantt |
| 13 | Logo USAL (portada) | `USAL-Logo-3820702873.png` | Logo |

**Nota:** Los Gantt se generan con pgfgantt inline o PlantUML. El Anexo II actual usa pgfgantt. Los `.puml` en `diagramas/` son una fuente alternativa pero no se usan en la compilación actual.

---

## ANEXO III — ANÁLISIS Y DISEÑO DEL SISTEMA (EL MÁS GRANDE)

### Lo que pide el profesor (capturas.md, imagen 11):
- **MODELO DE ANÁLISIS:** Modelo del dominio, Diagramas de secuencia iniciales (BCE), Clases de análisis
- **DISEÑO ARQUITECTÓNICO:** Arquitectura, Patrones, Subsistemas, Clases de diseño, Diagramas de secuencia posteriores
- **DISEÑO DE DATOS:** Diseño de la base de datos (ER)
- **ENTORNO TECNOLÓGICO Y DESPLIEGUE:** Entorno tecnológico, Modelo de despliegue

### Lo que hizo el compañero — ANÁLISIS (Anexo 3, 34 páginas, 47 ilustraciones):
| Ilustración | Tipo | Contenido |
|:---:|------|------|
| 1 | Clases | Modelo de dominio |
| 2-42 | Secuencia | Realización de CU (UC-001 a UC-041, 41 diagramas) |
| 43-46 | Comunicación | Uno por paquete funcional (4 diagramas) |
| 47 | Arquitectura | Vista arquitectónica MVC |

### Lo que hizo el compañero — DISEÑO (Anexo 4, 55 diagramas):
| Ilustración | Tipo | Contenido |
|:---:|------|------|
| 1-4 | Patrones | BFF, Access Token, Facade |
| 5 | Paquetes | Subsistemas de diseño |
| 6-11 | Clases | Clases de diseño por subsistema (6 diagramas) |
| 12 | Arquitectura | Vista arquitectónica final |
| 13-53 | Secuencia | Diagramas de secuencia de diseño (UC-001 a UC-041) |
| 54 | ER | Diseño de la base de datos |
| 55 | Despliegue | Diagrama de despliegue |

### Diagramas que debemos incluir en nuestro Anexo III (combinando análisis + diseño):

#### PARTE A — MODELO DE ANÁLISIS

| # | Diagrama | Archivo | Comentario |
|---|----------|---------|------------|
| A1 | Modelo del dominio (clases de análisis) | `class-analysis.png` | Equivalente a Ilustración 1 del compañero |
| A2 | Clases BCE | `class-analysis-bce.png` | Boundary-Control-Entity nuestro |
| A3 | BCE: UC-0001 Registrar Usuario | `seq-bce-uc0001-register.png` | |
| ... | ... | `seq-bce-uc0002...` a `seq-bce-uc0043...` | |
| A45 | BCE: UC-0043 Gestionar Roles | `seq-bce-uc0043-manage-roles.png` | |

**Total Parte A: 2 estructurales + 43 BCE = 45 diagramas**

#### PARTE B — DISEÑO ARQUITECTÓNICO

| # | Diagrama | Archivo | Comentario |
|---|----------|---------|------------|
| B1 | Arquitectura del sistema | `arquitectura.png` | Capas y componentes |
| B2 | Diagrama de paquetes | `package-diagram.png` | Estructura modular |
| B3 | Diagrama de componentes | `components.png` | Componentes y conectores |
| B4 | Clases de diseño | `class-design.png` | Clases con atributos y métodos |

#### PARTE C — DIAGRAMAS DE SECUENCIA DE DISEÑO

| # | Diagrama | Archivo |
|---|----------|---------|
| C1 | Registro de usuario | `seq-register.png` |
| C2 | Inicio de sesión | `seq-login.png` |
| C3 | Cierre de sesión | `seq-logout.png` |
| C4 | Conectar wallet | `seq-connect-wallet.png` |
| C5 | Eliminar wallet | `seq-delete-wallet.png` |
| C6 | Wallet principal | `seq-primary-wallet.png` |
| C7 | Renombrar wallet | `seq-label-wallet.png` |
| C8 | Perfil de usuario | `seq-profile.png` |
| C9 | Preferencias | `seq-preferences.png` |
| C10 | Cambiar contraseña | `seq-change-password.png` |
| C11 | Recuperar contraseña | `seq-recover-password.png` |
| C12 | Verificar email | `seq-verify-email.png` |
| C13 | Reenviar verificación | `seq-resend-verification.png` |
| C14 | Eliminar cuenta | `seq-delete-account.png` |
| C15 | Consultar notificaciones | `seq-notifications.png` |
| C16 | Subir documento (prepare) | `seq-upload-prepare.png` |
| C17 | Subir documento (confirm) | `seq-upload-confirm.png` |
| C18 | Subir documento (completo) | `seq-upload.png` |
| C19 | Listar documentos | `seq-list-documents.png` |
| C20 | Detalle de documento | `seq-doc-detail.png` |
| C21 | Descargar documento | `seq-download.png` |
| C22 | Archivar documento | `seq-archive.png` |
| C23 | Desarchivar documento | `seq-unarchive.png` |
| C24 | Eliminar documento | `seq-delete.png` |
| C25 | Transferir documento | `seq-transfer.png` |
| C26 | Buscar documentos | `seq-search.png` |
| C27 | Gestionar carpetas | `seq-manage-folders.png` |
| C28 | Mover documentos | `seq-move-documents.png` |
| C29 | Crear versión | `seq-version.png` |
| C30 | Listar versiones | `seq-list-versions.png` |
| C31 | Versión operativa | `seq-activate-version.png` |
| C32 | Restaurar versión | `seq-restore-version.png` |
| C33 | Descargar versión | `seq-download-version.png` |
| C34 | Firmar documento | `seq-sign.png` |
| C35 | Ver firmas | `seq-view-signatures.png` |
| C36 | Verificar firma | `seq-verify-signature.png` |
| C37 | Compartir documento | `seq-share.png` |
| C38 | Revocar acceso | `seq-revoke-access.png` |
| C39 | Compartidos conmigo | `seq-shared-documents.png` |
| C40 | Timeline del documento | `seq-timeline.png` |
| C41 | Estadísticas de usuario | `seq-user-stats.png` |
| C42 | Estadísticas globales | `seq-global-stats.png` |
| C43 | Verificar autenticidad | `seq-verify-authenticity.png` |
| C44 | Auditoría blockchain | `seq-blockchain-audit.png` |
| C45 | Listar usuarios | `seq-list-users.png` |
| C46 | Gestionar roles | `seq-manage-roles.png` |

**Total Parte C: ~46 diagramas de diseño**

#### PARTE D — DISEÑO DE DATOS Y DESPLIEGUE

| # | Diagrama | Archivo | Comentario |
|---|----------|---------|------------|
| D1 | Diagrama Entidad-Relación | `er-diagram.png` | ER clásico |
| D2 | ER combinado (BD + blockchain) | `er-combined.png` | Nuestro añadido |
| D3 | Diagrama de despliegue | `deployment.png` | Docker + servicios |
| D4 | Patrón prepare/confirm | `prepare-confirm.png` | Flujo de estados |
| D5 | Ciclo de vida del documento | `state-document-lifecycle.png` | Estados del documento |
| D6 | Colaboración: subida | `collaboration-upload.png` | Opcional |
| D7 | Colaboración: firma | `collaboration-sign.png` | Opcional |
| D8 | Actividad: subida | `activity-upload.png` | Opcional |

**Total general Anexo III: ~103 diagramas (45 + 4 + 46 + 8)**

---

## ANEXO IV — DOCUMENTACIÓN TÉCNICA

### Lo que pide el profesor (capturas.md, imagen 12):
- Tecnologías / Lenguajes usados
- Marcos de trabajo y bibliotecas
- Estructura del código y métodos principales
- Documentación técnica (semi-generada) → TypeDoc

### Diagramas incluidos:
| # | Diagrama | Archivo |
|---|----------|---------|
| 1 | Arquitectura del sistema | `arquitectura.png` (ref. Anexo III) |
| 2 | Diagrama de despliegue | `deployment.png` (ref. Anexo III) |

**NO incluir código fuente (lstlisting).** Solo referencias a archivos del repositorio.

---

## ANEXO V — PLAN DE SEGURIDAD

### Lo que pide el profesor (capturas.md, imagen 13-14):
- Identificación de puntos / activos críticos
- Medidas de seguridad
- Metodologías y herramientas → Plan director de seguridad (INCIBE)

### Diagramas:
**No requiere diagramas.** Solo tablas (activos, amenazas, matriz de riesgos, medidas).

---

## ANEXO VI — MANUAL DEL USUARIO

### Capturas de pantalla (en `anexos/capturas-ui/`):
| # | Captura | Archivo |
|---|---------|---------|
| 1 | Landing pública | `landing-public.png` |
| 2 | Inicio de sesión | `login-page.png` |
| 3 | Registro | `register-form.png` |
| 4 | Registro exitoso | `register-success.png` |
| 5 | Panel principal | `documents-page.png` |
| 6 | Detalle documento | `document-detail.png` |
| 7 | Subir documento | `upload-modal.png` |
| 8 | Subir versión | `upload-version-modal.png` |
| 9 | Pestaña versiones | `versions-tab.png` |
| 10 | Timeline | `timeline-page.png` |
| 11 | Compartir | `share-modal.png` |
| 12 | Compartidos conmigo | `shared-page.png` |
| 13 | Firmar documento | `sign-modal.png` |
| 14 | Firmantes | `signers-modal.png` |
| 15 | Transferir | `transfer-tab.png` |
| 16 | Descargar | `download-modal.png` |
| 17 | Buscar | (captura en documents-page) |
| 18 | Crear carpeta | `create-folder-modal.png` |
| 19 | Perfil | `profile-page.png` |
| 20 | Seguridad / cuenta | `security-account-page.png` |
| 21 | Configuración | `settings-page.png` |
| 22 | Notificaciones | `notifications-page.png` |
| 23 | Recovery Key | `recovery-key-modal.png` |
| 24 | Wallet selector | `wallet-selector-modal.png` |
| 25 | Blockchain auditor | `blockchain-auditor.png` |
| 26 | Verificación pública | `public-audit-page.png` |
| 27 | Panel administración | `admin-dashboard.png` |
| 28 | Admin usuarios | `admin-users-tab.png` |
| 29 | Admin logs | `admin-logs-tab.png` |

---

## ANEXO VII — MANUAL DE MONTAJE

### Lo que pide el profesor (capturas.md, estructura A7):
- Requisitos de hardware y software
- Instalación paso a paso
- Configuración de servicios
- Verificación del despliegue

### Diagrama:
| # | Diagrama | Archivo |
|---|----------|---------|
| 1 | Arquitectura de contenedores | TikZ inline o `deployment.png` |

**NO incluir listados de código fuente del sistema.**

---

## ANEXO VIII — USO DE INTELIGENCIA ARTIFICIAL

### Lo que pide el profesor (AGENTS.md, sección A8):
- Herramientas utilizadas y versión
- Declaración de uso (asistencia, no autonomía)
- Ejemplos de prompts concretos

### Diagramas: No requiere.

---

## ANEXO IX — DISEÑO CENTRADO EN EL USUARIO

### Lo que pide el profesor (AGENTS.md, sección A9):
- Needfinding
- Elevator Pitch
- Arquetipos de usuarios
- Prototipos y mockups
- Pruebas de usabilidad

### Diagramas:

**Wireframes (prototipos HTML, en `bocetos-anexo2/`):**

| # | Wireframe | Archivo |
|---|-----------|---------|
| 1 | Inicio de sesión | `login-wireframe.png` |
| 2 | Registro | `register-wireframe.png` |
| 3 | Panel documentos | `documents-dashboard-wireframe.png` |
| 4 | Detalle documento | `document-detail-wireframe.png` |
| 5 | Compartir | `share-modal-wireframe.png` |
| 6 | Compartidos conmigo | `shared-documents-wireframe.png` |
| 7 | Administración | `admin-dashboard-wireframe.png` |
| 8 | Blockchain auditor | `blockchain-auditor-wireframe.png` |
| 9 | Verificación pública | `public-verify-wireframe.png` |
| 10 | Perfil | `profile-wireframe.png` |
| 11 | Configuración | `settings-wireframe.png` |

**Mockups UI (PlantUML, en `diagramas/`):**

| # | Mockup | Archivo |
|---|--------|---------|
| 12 | Login | `ui-login.png` |
| 13 | Dashboard | `ui-dashboard.png` |
| 14 | Detalle documento | `ui-document-detail.png` |
| 15 | Share modal | `ui-share-modal.png` |
| 16 | Notificaciones | `ui-notifications.png` |
| 17 | Perfil | `ui-profile.png` |
| 18 | Registro | `ui-register.png` |
| 19 | Estadísticas usuario | `ui-stats-user.png` |
| 20 | Blockchain auditor | `ui-blockchain-auditor.png` |
| 21 | Admin dashboard | `ui-admin-dashboard.png` |

---

## RESUMEN DE DIAGRAMAS POR ANEXO

| Anexo | Estructurales | Secuencia | Casos de Uso | Gantt | Capturas/Mockups | **Total** |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| I | 2 | 0 | 10 | 0 | 0 | **12** |
| II | 1 | 0 | 0 | 12 | 3 | **16** |
| III | 10 | ~89 | 0 | 0 | 0 | **~103** |
| IV | 2 | 0 | 0 | 0 | 0 | **2** |
| V | 0 | 0 | 0 | 0 | 0 | **0** |
| VI | 0 | 0 | 0 | 0 | ~29 | **29** |
| VII | 1 | 0 | 0 | 0 | 0 | **1** |
| VIII | 0 | 0 | 0 | 0 | 0 | **0** |
| IX | 0 | 0 | 0 | 0 | ~21 | **21** |
| **TOTAL** | **16** | **~89** | **10** | **12** | **~53** | **~184** |

**Nota sobre la no-duplicación:**
- Los diagramas de secuencia **BCE** (análisis, español funcional) y los de **diseño** (implementación, componentes reales) NO son duplicados: los primeros modelan la lógica del dominio y los segundos la realización técnica.
- La arquitectura (`arquitectura.png`) se referencia en Anexo III y Anexo IV, pero el PNG es el mismo.
- El despliegue (`deployment.png`) se referencia en Anexo III y Anexo VII, pero el PNG es el mismo.
- Los wireframes de Anexo IX son prototipos de baja fidelidad; las capturas de Anexo VI son la UI final. No son duplicados.
