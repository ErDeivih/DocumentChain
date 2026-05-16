> **ESTADO**: COMPLETADO - Mayo 2026. Todas las fases han sido ejecutadas segun TODO.md.

# Plan de Actuación — DocumentChain TFG

> **Base normativa**: Capturas `anexos/capt/` (normativa CCII-N2016-02, USAL)
> **Plantilla LaTeX**: `anexos/plantilla_USAL.tex`
> **Herramienta diagramas**: PlantUML (incluidos estilos `_sequence-style.puml` y `_structure-style.puml`)
> **Restricción técnica**: Todo diagrama debe reflejar la implementación real del código (frontend/, backend/, smart-contracts/)

---

## ESTRUCTURA OBJETIVO (7 anexos obligatorios + opcionales)

| Anexo | Título | Estado actual | Objetivo |
|-------|--------|---------------|----------|
| A1 | Especificación de requisitos | `AnexoI_Especificaciones.tex` parcial | Completar RF, RNF, actores, UC, matriz de rastreabilidad |
| A2 | Estimación del tamaño y esfuerzo | `AnexoIII_EstimacionPlanificacion.tex` avanzado | Revisar UCP, Gantt, métricas |
| A3 | Análisis y diseño del sistema | `AnexoII_AnalisisDiseno.tex` parcial | **Añadir diagramas de análisis BCE** + completar diseño |
| A4 | Documentación técnica | `AnexoVI_ArquitecturaBlockchainIPFS.tex` parcial | Stack, código, smart contracts, estructura |
| A5 | Plan de seguridad | `AnexoIV_PlanSeguridad.tex` parcial | Adaptar a metodología INCIBE (6 etapas) |
| A6 | Manual del usuario | `AnexoV_ManualesUsuario.tex` parcial | Guía paso a paso con capturas `capturas-ui/` |
| A7 | Manual de montaje | `AnexoVII_GuiaProgramadorDefensa.tex` parcial | Docker Compose, despliegue paso a paso |
| A8* | Inteligencia Artificial | No existe | Crear desde cero |
| A9* | Diseño centrado en el usuario | No existe | Opcional — storyboards, prototipos |

\* Opcional / recomendado

---

## FASE 0: PREPARACIÓN Y REESTRUCTURACIÓN

**Objetivo**: Dejar la estructura lista para trabajar sin confusiones.

### 0.1 Unificar numeración de anexos
Los archivos `.tex` actuales tienen numeración desordenada vs la normativa:

| Archivo actual | Debe renombrarse a |
|----------------|-------------------|
| `AnexoI_Especificaciones.tex` | `AnexoI_Especificaciones.tex` ✅ |
| `AnexoII_AnalisisDiseno.tex` | `AnexoIII_AnalisisDiseno.tex` ⚠️ |
| `AnexoIII_EstimacionPlanificacion.tex` | `AnexoII_EstimacionPlanificacion.tex` ⚠️ |
| `AnexoIV_PlanSeguridad.tex` | `AnexoV_PlanSeguridad.tex` ⚠️ |
| `AnexoV_ManualesUsuario.tex` | `AnexoVI_ManualesUsuario.tex` ⚠️ |
| `AnexoVI_ArquitecturaBlockchainIPFS.tex` | `AnexoIV_DocumentacionTecnica.tex` ⚠️ |
| `AnexoVII_GuiaProgramadorDefensa.tex` | `AnexoVII_ManualMontaje.tex` ⚠️ |

**Acción**: Renombrar archivos (o crear nuevos con nombres correctos y migrar contenido).

### 0.2 Preparar carpeta de diagramas de análisis
Los diagramas de secuencia de análisis usarán prefijo `seq-analysis-` para distinguirlos de los de diseño (`seq-`).

### 0.3 Revisar estilos PUML
Asegurar que `_sequence-style.puml` y `_structure-style.puml` incluyen colores corporativos USAL si es posible.

---

## FASE 1: ANEXO I — ESPECIFICACIÓN DE REQUISITOS

**Base**: `AnexoI_Especificaciones.tex` + `temp_anexo1.md` (referencia estructura)

### Entregables obligatorios
1. **Objetivos del sistema** (a nivel de requisitos)
2. **Requisitos de información**: Entidades principales (Usuario, Documento, Versión, Wallet, Firma, Compartido, Evento...)
3. **Requisitos funcionales** catalogados (RF-001 a RF-NNN)
4. **Requisitos no funcionales** catalogados (RNF-001 a RNF-NNN)
5. **Diagrama de paquetes**: Sistema → subsistemas (Acceso, Documentos, Compartición, Versiones, Firmas, Auditoría, Admin)
6. **Definición de actores** (tabla):
   - ACT-01: Usuario registrado
   - ACT-02: Administrador
   - ACT-03: Usuario con wallet conectada
   - ACT-04: Auditor público (sin cuenta)
7. **Diagramas de casos de uso** (ya existen, revisar):
   - General (`usecase-general.puml`)
   - Por paquete: `uc_acceso`, `uc_documentos`, `uc_comparticion`, `uc_versiones`, `uc_firmas`, `uc_auditoria`, `uc_administracion`
8. **Matriz de rastreabilidad** (tabla LaTeX): Cruce RF ↔ Caso de Uso ↔ Diagrama de Secuencia (análisis + diseño) ↔ Componente implementado

### Diagramas PUML a crear/modificar
- Revisar todos los `uc_*.puml` para que reflejen el código actual (ej: wallets añadidas recientemente)
- No es necesario crear diagramas de secuencia aquí (van en A3)

---

## FASE 2: ANEXO II — ESTIMACIÓN DEL TAMAÑO Y ESFUERZO

**Base**: `AnexoIII_EstimacionPlanificacion.tex`

### Entregables obligatorios
1. **Metodología**: Proceso Unificado adaptado (fases Inicio, Elaboración, Construcción, Transición)
2. **Estimación Use Case Points**:
   - Tabla de actores con pesos (simple, average, complex)
   - Tabla de casos de uso con pesos (simple, average, complex)
   - Factor de complejidad técnica (TCP/TCF)
   - Factor ambiental (ECF)
   - Cálculo: UUCP → UCP → horas estimadas
3. **Estimación de costes y esfuerzo**:
   - Horas totales por fase
   - Calendario de actividades
4. **Planificación temporal**:
   - Diagramas de Gantt por fase/iteración (ya existen 8 diagramas)

### Diagramas PUML existentes (revisar)
- `ezestimate.puml`, `ezestimate-actors.puml`, `ezestimate-tcf-ecf.puml`, `ezestimate-uc-1.puml`
- `gantt-*.puml` (8 fases + test)

---

## FASE 3: ANEXO III — ANÁLISIS Y DISEÑO DEL SISTEMA

**Base**: `AnexoII_AnalisisDiseno.tex` + normativa captura 10.png

Este es el anexo más extenso y el que requiere más trabajo nuevo.

### BLOQUE A: MODELO DE ANÁLISIS

#### A.1 Modelo del dominio
- **Entregable**: Diagrama de clases de análisis conceptual
- **Qué muestra**: Entidades del negocio (Usuario, Documento, Versión, Firma, Compartición, Notificación, Carpeta, Evento) y sus relaciones
- **Basado en**: `class-analysis.puml` actual (es un modelo de dominio, válido aquí con ajustes)

#### A.2 Diagramas de secuencia INICIALES (ANÁLISIS — BCE)
**⚠️ ESTO ES LO QUE FALTA Y ES CRÍTICO**

Para **CADA caso de uso** se debe crear un diagrama de secuencia de análisis usando:
- **Boundary** (interfaz de usuario / pantalla / modal)
- **Control** (gestor / coordinador de la operación)
- **Entity** (entidades de dominio)

**Convención de nombres**: `anexos/diagramas/seq-analysis-<caso-de-uso>.puml`

| # | Caso de uso | Archivo BCE a crear |
|---|-------------|---------------------|
| 1 | Registrar usuario | `seq-analysis-register.puml` |
| 2 | Verificar email | `seq-analysis-verify-email.puml` |
| 3 | Iniciar sesión | `seq-analysis-login.puml` |
| 4 | Configurar 2FA | `seq-analysis-2fa.puml` |
| 5 | Recuperar contraseña | `seq-analysis-recover-password.puml` |
| 6 | Cerrar sesión | `seq-analysis-logout.puml` |
| 7 | Cambiar contraseña | `seq-analysis-change-password.puml` |
| 8 | Ver perfil | `seq-analysis-profile.puml` |
| 9 | Editar preferencias | `seq-analysis-preferences.puml` |
| 10 | Ver estadísticas usuario | `seq-analysis-user-stats.puml` |
| 11 | Subir documento | `seq-analysis-upload.puml` |
| 12 | Listar documentos | `seq-analysis-list-documents.puml` |
| 13 | Ver detalle documento | `seq-analysis-doc-detail.puml` |
| 14 | Descargar documento | `seq-analysis-download.puml` |
| 15 | Archivar documento | `seq-analysis-archive.puml` |
| 16 | Desarchivar documento | `seq-analysis-unarchive.puml` |
| 17 | Eliminar documento | `seq-analysis-delete.puml` |
| 18 | Editar metadatos | `seq-analysis-edit-metadata.puml` |
| 19 | Buscar documentos | `seq-analysis-search.puml` |
| 20 | Crear carpeta | `seq-analysis-create-folder.puml` |
| 21 | Crear versión | `seq-analysis-version.puml` |
| 22 | Listar versiones | `seq-analysis-list-versions.puml` |
| 23 | Descargar versión | `seq-analysis-download-version.puml` |
| 24 | Restaurar versión | `seq-analysis-restore-version.puml` |
| 25 | Activar versión | `seq-analysis-activate-version.puml` |
| 26 | Compartir documento | `seq-analysis-share.puml` |
| 27 | Modificar permisos | `seq-analysis-modify-permissions.puml` |
| 28 | Revocar acceso | `seq-analysis-revoke-access.puml` |
| 29 | Ver compartidos conmigo | `seq-analysis-shared-documents.puml` |
| 30 | Firmar documento | `seq-analysis-sign.puml` |
| 31 | Ver firmas | `seq-analysis-view-signatures.puml` |
| 32 | Verificar firma | `seq-analysis-verify-signature.puml` |
| 33 | Verificar autenticidad | `seq-analysis-verify-authenticity.puml` |
| 34 | Auditoría blockchain | `seq-analysis-blockchain-audit.puml` |
| 35 | Ver timeline | `seq-analysis-timeline.puml` |
| 36 | Conectar wallet | `seq-analysis-connect-wallet.puml` |
| 37 | Registrar wallet | `seq-analysis-register-wallet.puml` |
| 38 | Etiquetar wallet | `seq-analysis-label-wallet.puml` |
| 39 | Eliminar wallet | `seq-analysis-delete-wallet.puml` |
| 40 | Establecer wallet primaria | `seq-analysis-primary-wallet.puml` |
| 41 | Listar usuarios (admin) | `seq-analysis-list-users.puml` |
| 42 | Gestionar roles (admin) | `seq-analysis-manage-roles.puml` |
| 43 | Suspender usuario (admin) | `seq-analysis-suspend-user.puml` |
| 44 | Auto-suspender | `seq-analysis-self-suspend.puml` |
| 45 | Auto-reactivar | `seq-analysis-self-unsuspend.puml` |
| 46 | Eliminar usuario (admin) | `seq-analysis-delete-user-admin.puml` |
| 47 | Crear admin | `seq-analysis-create-admin.puml` |
| 48 | Pausar sistema | `seq-analysis-pause-system.puml` |
| 49 | Reanudar sistema | `seq-analysis-resume-system.puml` |
| 50 | Estadísticas globales (admin) | `seq-analysis-global-stats.puml` |
| 51 | Ver notificaciones | `seq-analysis-notifications.puml` |
| 52 | Transferir documento | `seq-analysis-transfer.puml` |
| 53 | Etiquetar documento | `seq-analysis-tag-document.puml` |
| 54 | Gestionar categorías | `seq-analysis-categories.puml` |
| 55 | Regenerar backup 2FA | `seq-analysis-regen-backup-2fa.puml` |
| 56 | Reenviar verificación | `seq-analysis-resend-verification.puml` |

**Total: 56 diagramas de secuencia de análisis nuevos.**

**Formato BCE estándar**:
```plantuml
actor Usuario as user
boundary "Pantalla X" as ui
control "GestorX" as ctrl
entity "EntidadX" as ent

group UC-XXXX: Nombre del caso de uso
  user -> ui: Acción del usuario
  ui -> ctrl: Solicitar operación
  ctrl -> ent: Consultar/modificar datos
  ent --> ctrl: Resultado
  ctrl --> ui: Respuesta
  ui --> user: Mostrar resultado
end
```

#### A.3 Clases de análisis (BCE)
- **Entregable**: `anexos/diagramas/class-analysis-bce.puml`
- **Qué muestra**: Clases estereotipadas con `<<boundary>>`, `<<control>>`, `<<entity>>`
- **Ejemplo de boundaries**: `LoginPage`, `DocumentListPage`, `UploadModal`, `ShareModal`, `WalletSidebar`
- **Ejemplo de controls**: `AuthManager`, `DocumentManager`, `ShareManager`, `SignatureManager`, `WalletManager`
- **Ejemplo de entities**: `User`, `Document`, `Version`, `Signature`, `Share`, `Wallet`, `Event`

#### A.4 Arquitectura del modelo de análisis
- Diagrama de capas: Presentación → Lógica de negocio → Persistencia
- Puede reutilizarse `arquitectura.puml` pero con etiquetas BCE

### BLOQUE B: DISEÑO ARQUITECTÓNICO

#### B.1 Patrones arquitectónicos
- Cliente-Servidor (SPA + API REST)
- Arquitectura por capas en backend (Controllers → Services → Repositories)
- Patrón Observer (eventos blockchain → WebSocket)
- Patrón Strategy (múltiples wallets: EIP-6963 + WalletConnect)
- Patrón Prepare/Confirm (transacciones blockchain de dos fases)

#### B.2 Subsistema de diseño
- Frontend (React + Vite)
- Backend (Node.js + Express)
- Capa Blockchain (ethers.js + Hardhat)
- Capa Almacenamiento (IPFS Kubo)
- Base de datos (PostgreSQL + Prisma)

#### B.3 Clases de diseño
- Ya existe `class-design.puml` — revisar que incluya wallets y cambios recientes

#### B.4 Diagramas de secuencia POSTERIORES (DISEÑO)
- **Ya existen 65 diagramas** `seq-*.puml`
- **Revisar** que reflejen el código actual (especialmente wallets, verify, paginación, Socket.io)
- **Renombrar** a `seq-design-*.puml` para distinguir de análisis (opcional pero recomendado)

### BLOQUE C: DISEÑO DE DATOS

#### C.1 Diagrama Entidad-Relación
- Ya existen `er-diagram.puml`, `er-combined.puml` — revisar que incluyan wallets y cambios recientes

#### C.2 Esquema Prisma
- Documentar el schema completo con descripción de cada tabla, índices y restricciones

### BLOQUE D: ENTORNO TECNOLÓGICO Y DESPLIEGUE

#### D.1 Stack tecnológico
- Tabla con tecnología / versión / propósito

#### D.2 Modelo de despliegue
- Ya existe `deployment.puml`, `deployment_prov.puml` — revisar

#### D.3 Diagrama de componentes
- Ya existe `components.puml` — revisar

### Diagramas PUML adicionales sugeridos
- `state-document-lifecycle.puml` — Ciclo de vida del documento (DRAFT → PREPARING → TX_SUBMITTED → SYNCED → ARCHIVED)
- `state-version-lifecycle.puml` — Ciclo de vida de versión
- `activity-upload.puml` — Diagrama de actividad para subida con firma
- `activity-verify.puml` — Diagrama de actividad para verificación
- `activity-sign.puml` — Diagrama de actividad para firma

---

## FASE 4: ANEXO IV — DOCUMENTACIÓN TÉCNICA

**Base**: `AnexoVI_ArquitecturaBlockchainIPFS.tex`

### Entregables
1. **Tecnologías y lenguajes**:
   - Frontend: React 19, TypeScript 5.9, Vite 7, Tailwind CSS 3
   - Backend: Node.js, Express 5, TypeScript 5.9
   - Blockchain: Solidity, Hardhat 2.22, ethers.js v6
   - BD: PostgreSQL 16, Prisma 5.22
   - Storage: IPFS Kubo
   - Infra: Docker, Docker Compose, Nginx
2. **Marcos de trabajo y bibliotecas**:
   - React Router DOM 7, TanStack Query 5, Zustand 5
   - React Hook Form 7 + Zod 4
   - Axios, Socket.io
   - ethers.js v6, @walletconnect/ethereum-provider
   - jsonwebtoken, bcrypt, Multer, Nodemailer
   - Winston, node-cron
   - Vitest, Testing Library, Playwright
3. **Estructura del código**:
   - Árbol de directorios de `frontend/src/`, `backend/src/`, `smart-contracts/`
   - Descripción de módulos principales
4. **Métodos principales**:
   - Cifrado de documentos (`FileCrypto.ts`, `KeyManager.ts`)
   - Flujo prepare/confirm
   - Sincronización blockchain (event listeners)
   - Gestión de permisos on-chain
5. **Smart Contracts** (con NatSpec):
   - DocumentRegistry.sol
   - Versioning.sol
   - Signing.sol
   - AccessControl.sol
6. **Arquitectura de cifrado** (3 capas):
   - Capa 1: JWT + 2FA
   - Capa 2: ECDH P-256 + AES-256-GCM
   - Capa 3: Blockchain (hash inmutable)

---

## FASE 5: ANEXO V — PLAN DE SEGURIDAD

**Base**: `AnexoIV_PlanSeguridad.tex` + metodología INCIBE (capturas 12-14)

### Metodología: 6 etapas INCIBE

| Etapa | Nombre | Entregable |
|-------|--------|------------|
| 1 | Identificación de activos susceptibles | Tabla de activos (info, infraestructura, usuarios) |
| 2 | Valoración de activos críticos | Matriz CIA (Confidencialidad, Integridad, Disponibilidad) |
| 3 | Principales amenazas | Lista de amenazas por activo |
| 4 | Consecuencias y probabilidad | Matriz de riesgos (probabilidad × impacto) |
| 5 | Medidas de seguridad existentes | Listado detallado |
| 6 | Riesgos residuales | Riesgos que quedan tras las medidas |

### Medidas a documentar
- Cifrado AES-256-GCM
- Autenticación multifactor TOTP
- Challenge-firma para wallets (prueba de posesión)
- RBAC (control de acceso basado en roles)
- Validación de permisos on-chain
- Logs de auditoría (tabla Event)
- SSL/TLS
- Docker y aislamiento de servicios

---

## FASE 6: ANEXO VI — MANUAL DEL USUARIO

**Base**: `AnexoV_ManualesUsuario.tex`

### Estructura
1. **Requisitos del sistema**: Navegador moderno, MetaMask opcional
2. **Registro e inicio de sesión**: Usar `login-page.png`, `register-form.png`, `2fa-setup.png`
3. **Panel principal**: `documents-list.png`, `admin-dashboard.png`
4. **Gestión de documentos**: `upload-modal.png`, crear carpetas, organizar
5. **Versiones**: `versions-tab.png`, subir nueva versión, cambiar operacional
6. **Compartir**: `share-modal.png`, permisos
7. **Firmar**: `sign-modal.png`, `signers-modal.png`, wallet
8. **Verificar**: `verify-page.png`
9. **Auditoría blockchain**: `blockchain-auditor.png`
10. **Notificaciones**: `notifications-page.png`
11. **Perfil y wallets**: `profile-page.png`, `settings-page.png`, `wallet-selector-modal.png`
12. **Vista móvil**: `mobile-*.png`
13. **FAQ y resolución de problemas**

---

## FASE 7: ANEXO VII — MANUAL DE MONTAJE / DESPLIEGUE

**Base**: `AnexoVII_GuiaProgramadorDefensa.tex` + `docs/UBUNTU_SELF_HOSTED_DEPLOY.md`

### Estructura
1. **Requisitos hardware/software**
2. **Instalación paso a paso**:
   - Clonar repositorio
   - Configurar `.env`
   - `docker-compose up`
   - Configurar IPFS
   - Desplegar contratos (Hardhat)
   - Seed de BD
3. **Configuración de servicios**: PostgreSQL, Postfix, Nginx, SSL
4. **Verificación del despliegue**
5. **Mantenimiento y actualización**
6. **Scripts útiles**: `reseed-dev.ps1`, `build.ps1`

---

## FASE 8: ANEXOS OPCIONALES

### A8 — Inteligencia Artificial
- Documentar uso de IA (ChatGPT, Copilot, Claude) como asistente
- Ejemplos de prompts para tareas concretas
- Declarar que el contenido es original y supervisado

### A9 — Diseño Centrado en el Usuario
- Storyboards de flujos principales
- Arquetipos de usuarios
- Prototipos de baja fidelidad (ui-*.puml ya existen)

---

## FASE 9: MEMORIA PRINCIPAL

**Base**: `Memoria_Principal_DocumentChain.tex`

### Capítulos según normativa (capturas 19-27)

| Cap | Título | Contenido clave | Dónde apoyarse |
|-----|--------|-----------------|----------------|
| — | Preliminares | Portada, consentimiento, resumen/abstract (español + inglés, 200-500 palabras), glosario, índices | Plantilla USAL |
| 1 | Introducción | Problema de autenticidad documental, falsificación, trazabilidad, eIDAS | Código + docs |
| 2 | Objetivos | Funcionales (verbos infinitivo) + personales | Anexo I |
| 3 | Antecedentes | Marco teórico: problemas de documentos digitales, necesidad de trazabilidad | Investigación web |
| 4 | State of Art | Aplicaciones comerciales (DocuSign, Notarize, etc.), artículos científicos sobre blockchain para documentos | Web + papers |
| 5 | Normas y Referencias | Métodos (Proceso Unificado), Herramientas (IDE, frameworks), Modelos (arquitectura 3 capas), IA | Anexos II-IV |
| 6 | Aspectos Relevantes | Puente teoría-código: decisiones críticas (cifrado 3 capas, prepare/confirm, wallets EIP-6963, Docker). **NO copiar casos de uso ni código**. Referir a anexos. | Anexos III-IV |
| 7 | Limitaciones | Tiempo (objetivos fuera de alcance), APIs externas (costes), acceso a usuarios (sin testing real) | Reflexión propia |
| 8 | Líneas de trabajo futuro | Escalabilidad, integraciones, optimizaciones | Reflexión propia |
| 9 | Conclusiones | Honestidad sobre objetivos alcanzados, nuevos conocimientos, valor aportado | Reflexión propia |
| 10 | Bibliografía | APA 7 o IEEE | Zotero / manual |

---

## RESTRICCIONES Y REGLAS DE TRABAJO

### Sobre diagramas
1. **Todo diagrama de análisis BCE debe tener su correspondiente de diseño**. La matriz de rastreabilidad cruzará ambos.
2. **Los diagramas de secuencia de análisis NO deben mostrar tecnologías** (no PostgreSQL, no IPFS, no Express). Solo Boundary, Control, Entity.
3. **Los diagramas de secuencia de diseño DEBEN mostrar tecnologías** (React, DocumentService, PostgreSQL, IPFS, Smart Contract).
4. **Numeración correlativa**: Figura A3.1, A3.2, etc. dentro de cada anexo.
5. **Referencia obligatoria en texto**: "Como se muestra en la Figura A3.1..."

### Sobre redacción
1. **Lenguaje formal, objetivo e impersonal**. Prohibida primera persona.
2. **Acronimos**: Primera vez texto completo + siglas entre paréntesis.
3. **Bibliografía**: Formato APA 7 (recomendado para USAL) o IEEE.

### Sobre LaTeX
1. **Usar siempre `lualatex`** para compilar (no pdflatex).
2. **Codificación UTF-8**. NUNCA usar PowerShell `Set-Content` para editar (rompe tildes). Usar `Write`/`Edit` tools o Python con `io.open(..., encoding='utf-8')`.
3. **Imágenes**: Exportar PUML a PNG/SVG e incluir con `\includegraphics`.
4. **Tablas**: Usar entorno `table` o `longtable` para tablas largas (matriz de rastreabilidad).

### Sobre coherencia código-documentación
1. **Si el código cambia, el diagrama debe cambiar**. Los diagramas de diseño deben reflejar la implementación real.
2. **Los diagramas de análisis son más estables** (no dependen de tecnología), pero deben reflejar la funcionalidad real.

---

## ORDEN DE EJECUCIÓN RECOMENDADO

Los anexos tienen dependencias entre sí. Orden óptimo:

1. **FASE 0** → Preparación estructural
2. **FASE 1** → Anexo I (requisitos y casos de uso son la base)
3. **FASE 3 (solo análisis BCE)** → Diagramas de secuencia iniciales
4. **FASE 2** → Anexo II (estimación basada en casos de uso)
5. **FASE 3 (diseño)** → Completar diagramas de diseño, BD, despliegue
6. **FASE 4** → Anexo IV (documentación técnica)
7. **FASE 5** → Anexo V (plan de seguridad)
8. **FASE 6** → Anexo VI (manual usuario)
9. **FASE 7** → Anexo VII (manual montaje)
10. **FASE 8** → Opcionales
11. **FASE 9** → Memoria principal (se hace al final porque referencia a todos los anexos)

---

## ESTIMACIÓN DE ESFUERZO (aproximada)

| Fase | Diagramas nuevos | Tablas nuevas | Páginas LaTeX | Esfuerzo relativo |
|------|-----------------|---------------|---------------|-------------------|
| FASE 0 | 0 | 0 | 0 | Bajo |
| FASE 1 | ~3 UC revisados | 4-5 tablas | 15-20 | Medio |
| FASE 2 | 0 | 3-4 tablas | 10-15 | Medio-Bajo |
| **FASE 3 (análisis)** | **~56 seq BCE + 1 class BCE + 2-3 estados/actividad** | 0 | 25-35 | **MUY ALTO** |
| FASE 3 (diseño) | Revisar 65 existentes | 0 | 15-20 | Medio |
| FASE 4 | 0 | 3-4 tablas | 15-20 | Medio |
| FASE 5 | 0 | 4-5 tablas | 10-15 | Medio |
| FASE 6 | 0 | 0 | 20-30 | Medio-Alto |
| FASE 7 | 0 | 0 | 10-15 | Medio-Bajo |
| FASE 8 | 0 | 0 | 5-10 | Bajo |
| FASE 9 | 0 | 0 | 40-60 | **ALTO** |

---

*Plan generado: Mayo 2026*
*Base normativa: CCII-N2016-02, USAL*
