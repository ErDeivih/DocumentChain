# AGENTS.md - Guia para Desarrollo de Anexos y Memoria Final TFG

> **DocumentChain - Sistema de Gestion Documental con Blockchain**
> Este archivo es la referencia definitiva para que cualquier agente de IA pueda continuar y completar los anexos tecnicos y la memoria final del proyecto.

---

## 1. NORMAS GENERALES Y ESTILO (Obligatorio)

### 1.1 Normativa Base
- **Norma Tecnica**: CCII-N2016-02 (Documentacion de Proyectos en Ingenieria Informatica)
- **Normas aprobadas por la Junta de Facultad** de la Universidad de Salamanca (USAL)
- **Manual de Identidad Corporativa USAL**: https://identidadcorporativa.usal.es/recursos/

### 1.2 Estilo de Redaccion
- **Lenguaje formal, objetivo e impersonal**
- **PROHIBIDO** usar primera persona: no "yo pienso", "en mi laboratorio", "hicimos"
- **USAR** formulas como: "se puede pensar que", "se desarrollo", "surgio la idea", "se implemento"
- **Bibliografia**: Formato APA 7 o IEEE (recomendado APA 7 para TFGs de la USAL)
  - APA 7: https://biblioguias.ucm.es/estilo-apa-septima/referencias
  - IEEE: https://ieeeauthorcenter.ieee.org/wpcontent/uploads/IEEE-Reference-Guide.pdf
- **Herramienta recomendada**: Zotero para gestion bibliografica

### 1.3 Normas Graficas
- **Paginacion y encabezados**: Distintos para paginas pares e impares
- **Tablas y figuras**: 
  - Todas deben tener titulo correspondiente
  - Numeradas correlativamente
  - **OBLIGATORIO** referenciarlas en el cuerpo del texto
  - Si se usan imagenes de terceros, citar la fuente original
- **Acronimos**: La primera vez que aparecen, escribir el texto completo seguido de las siglas entre parentesis. Ejemplo: "Application Programming Interface (API)"
- **Tipografia y colores**: Aplicar Manual de Identidad Corporativa USAL (logotipo oficial, tipografias y paleta corporativa)

### 1.4 Formato de Entrega
- Se puede entregar como un **unico PDF** que contenga la memoria y los anexos, o separado en varios PDFs
- Todos los documentos base (Memoria y Anexos tecnicos) son **obligatorios**
- Si falta alguno, su ausencia debe justificarse debidamente

---

## 2. ESTRUCTURA DE LA MEMORIA PRINCIPAL

La memoria justifica decisiones para un publico mas amplio. Los anexos contienen toda la documentacion tecnica exhaustiva.

### 2.1 Consideraciones Generales y Preliminares
1. **Portada**: Sin numeracion. Titulo, autor, curso academico y tutores
2. **Consentimiento informado**: Firmado por el/los tutor/es
3. **Resumen / Abstract**: Sintesis del problema, metodologia, resultados y conclusiones. Extension de 200 a 500 palabras, en **español e ingles**
4. **Glosario, abreviaturas e indices**: Indices detallados de capitulos, anexos, tablas y figuras
5. **Agradecimientos** (opcional)

### 2.2 Capitulos de la Memoria

#### 1. Introduccion
- Vision amplia del problema
- Motivacion que ha llevado a realizar el TFG
- Dominio del problema, contexto, posibles soluciones
- Estructura del documento

#### 2. Objetivos
- **Funcionales**: Un objetivo principal y varios subobjetivos alcanzables, razonables y medibles. **Siempre verbos en infinitivo**.
  - Ejemplo DocumentChain: "Disenar e implementar un sistema de gestion documental con trazabilidad blockchain", "Implementar cifrado de extremo a extremo para documentos sensibles", "Desarrollar un modulo de firma digital con wallet Ethereum", etc.
- **Personales**: Que pretende alcanzar el alumno realizando este TFG

#### 3. Antecedentes
- Establecer el **marco** en que se engloba el trabajo
- Centrarse en los **aspectos teoricos** que no tienen que ver con la informatica sino con el problema que se resuelve
  - Ejemplo DocumentChain: Problemas de autenticidad documental, falsificacion de documentos, necesidad de trazabilidad en entornos corporativos, marco legal europeo (eIDAS), etc.
- Si esta vinculado a una empresa o grupo de investigacion: resumir historia, trayectoria y lineas de trabajo

#### 4. Descripcion de la Situacion Actual (State of Art)
- Buscar y documentar **aplicaciones comerciales o sistemas existentes** con funcionalidades similares
- Buscar **articulos cientificos o publicaciones** que demuestren aplicaciones o metodos similares
- Evaluar alternativas e identificar sus deficiencias o carencias
- Justificar por que la alternativa propuesta es la mas adecuada

#### 5. Normas y Referencias
**NO es reescribir un libro de texto**. Se divide en cinco bloques:

- **Metodos**: Explicacion tecnica de la metodologia seguida (Proceso Unificado, Scrum, etc.)
- **Herramientas**: Diferenciar entre herramientas de implementacion (IDE, lenguajes) y metodologicas/redaccion
- **Modelos**: Solo si el TFG no es estandar. Documentar arquitecturas complejas, modelos de IA, etc.
- **Inteligencia Artificial**: Identificar herramienta y version utilizada, declarar para que se ha usado, indicar como la IA ha sido una ayuda pero el contenido sigue siendo original

#### 6. Aspectos Relevantes (PUENTE ENTRE TEORIA Y CODIGO)
- **NO es copia y pega** de casos de uso ni codigo fuente. La informacion detallada y tecnica va en los anexos.
- Debe incluir exposicion del ciclo de vida utilizado
- Detalles de mayor relevancia extraidos de las fases de analisis, diseno e implementacion
- Justificar los caminos de solucion tomados frente a otras alternativas
- Decisiones criticas: tipo de patron o arquitectura elegido, uso de IA/LLM en el desarrollo
- **Cuéntale al tribunal por que lo hiciste asi, y diles en que Anexo pueden encontrar el diagrama o el codigo tecnico que lo demuestra.**

#### 7. Limitaciones
- Restricciones de tiempo: justificar prioridades y objetivos que quedaron fuera del cronograma
- Hardware / Software: limitaciones impuestas por APIs externas, costes de servicios
- Acceso a usuarios: dificultades en la fase de pruebas o toma de requisitos

#### 8. Lineas de Trabajo Futuro
- Identificar limitaciones actuales de la solucion
- Proponer lineas de desarrollo futuras para mejorar funcionalidad o eficiencia

#### 9. Conclusiones
- Analisis critico del trabajo
- Honestidad sobre si se han alcanzado los objetivos planteados
- Reflexion sobre errores cometidos, obstaculos superados, nuevos conocimientos y tecnologias aprendidas
- Resumen:
  - Validacion objetiva de cada objetivo y subobjetivo (Que? y Como?)
  - Reflexion sobre nuevos conocimientos y tecnologias dominadas
  - Valor aportado a la empresa colaboradora o grupo de investigacion

#### 10. Bibliografia
- Fuentes citadas a lo largo de la memoria
- Manuales de consulta, recursos web, guias de programacion utilizados
- Estandar APA 7 o IEEE

---

## 3. ESTRUCTURA DE LOS ANEXOS (Documentacion Tecnica Exhaustiva)

> **REGLA DE ORO**: Todo lo que no se cuente entre la memoria y los anexos **no ha existido**.

### Estructura Propuesta para DocumentChain

Segun la normativa del Colegio de Ingenieros en Informatica y las normas del Departamento de Informatica y Automatica de la USAL, se propone:

| Anexo | Titulo | Obligatoriedad |
|-------|--------|----------------|
| A1 | Especificacion de Requisitos | Obligatorio |
| A2 | Especificaciones del Tamano y Esfuerzo | Obligatorio |
| A3 | Analisis y Diseno del Sistema | Obligatorio |
| A4 | Documentacion Tecnica | Obligatorio |
| A5 | Plan de Seguridad | Obligatorio |
| A6 | Manual del Usuario | Obligatorio |
| A7 | Manual de Montaje / Despliegue | Obligatorio |
| A8 | Uso de Inteligencia Artificial | Recomendado |
| A9 | Diseno Centrado en el Usuario | Opcional |

---

### ANEXO I - ESPECIFICACION DE REQUISITOS

Constituye el "contrato" tecnico del sistema. Debe contener toda la elicitacion detallada.

**Contenido obligatorio:**
1. **Objetivos del sistema** (a nivel de requisitos)
2. **Requisitos de informacion**: Entidades de datos principales, flujo de informacion
3. **Requisitos funcionales**: Catalogo exhaustivo numerado (RF-001, RF-002...)
   - Ejemplo DocumentChain:
      - RF-001: El sistema permitira registrar usuarios con verificacion de email
      - RF-002: El sistema permitira autenticacion mediante firma criptografica de wallet
      - RF-003: El usuario podra subir documentos con cifrado
      - RF-004: El sistema generara versiones de documentos
      - RF-005: El usuario podra compartir documentos con otros usuarios
      - RF-006: El sistema permitira firma digital con wallet blockchain
      - RF-007: El administrador podra gestionar usuarios y roles
      - RF-008: El sistema permitira auditoria publica blockchain
      - RF-009: El usuario podra verificar autenticidad de documentos
      - RF-010: El sistema enviara notificaciones de eventos relevantes
      - RF-011: El usuario podra gestionar carpetas y organizar documentos
      - RF-012: El sistema soportara descarga de documentos cifrados
4. **Requisitos no funcionales**: Catalogo numerado (RNF-001, RNF-002...)
   - Seguridad (cifrado AES-256-GCM, autenticacion JWT, firma criptografica)
   - Rendimiento (tiempos de respuesta, concurrencia)
   - Usabilidad (interfaz responsive, accesibilidad)
   - Escalabilidad (Docker, microservicios)
   - Disponibilidad (sincronizacion blockchain, backups)
5. **Diagrama de paquetes**: Estructura modular del sistema (frontend, backend, smart contracts, infraestructura)
6. **Definicion de actores**:
   - Usuario registrado
   - Administrador
   - Usuario con wallet conectada
   - Auditor publico (sin cuenta)
7. **Diagramas de casos de uso**:
   - **IMPORTANTE**: Los casos de uso NO son pulsaciones o clics sobre la interfaz. SON FUNCIONALIDAD.
   - Diagrama general de casos de uso (usecase-general.puml ya existe)
   - Diagramas especificos por subsistema:
     - Acceso y autenticacion (uc_acceso.puml existe)
     - Gestion de documentos (uc_documentos.puml existe)
     - Comparticion (uc_comparticion.puml existe)
     - Versiones (uc_versiones.puml existe)
     - Firmas (uc_firmas.puml existe)
     - Auditoria (uc_auditoria.puml existe)
     - Administracion (uc_administracion.puml existe)
     - Notificaciones (uc_notificaciones.puml existe)
     - Estadisticas (uc_estadisticas_admin.puml existe)
8. **Matriz de rastreabilidad**: Tabla que cruza requisitos con casos de uso, diagramas de secuencia y componentes de implementacion

**Diagramas PUML existentes que deben usarse/revisarse:**
- `anexos/diagramas/usecase-general.puml`
- `anexos/diagramas/uc_*.puml` (todos los anteriores)

---

### ANEXO II - ESPECIFICACIONES DEL TAMANO Y ESFUERZO

Este documento es la base para la elaboracion de la planificacion detallada del proyecto.

**Contenido obligatorio:**
1. **Metodologia o marco de trabajo utilizado**:
   - DocumentChain uso una metodologia agil adaptada (Scrum/Kanban hibrido)
   - Explicar por que se eligio esta metodologia
   - Describir las fases: Inicio, Elaboracion, Construccion, Transicion
2. **Metricas de estimacion**:
   - Estimacion basada en Casos de Uso (Use Case Points)
   - Factor de complejidad tecnica (TCP) y ambiental (ECF)
   - Tabla de actores con pesos
   - Tabla de casos de uso con pesos
   - Calculo de UUCP, UCP, horas estimadas
3. **Estimacion de costes y esfuerzo**:
   - Horas totales invertidas
   - Desglose por fases
   - Coste estimado (tiempo de desarrollo)
4. **Planificacion temporal**:
   - Diagramas de Gantt por fases
   - Fase de Inicio: Requisitos, analisis inicial
   - Fase de Elaboracion: Arquitectura, prototipos, validacion tecnica
   - Fase de Construccion: Implementacion, iteraciones
   - Fase de Transicion: Pruebas, despliegue, documentacion
5. **Calendario de actividades**

**Diagramas PUML existentes:**
- `anexos/diagramas/ezestimate.puml` (diagrama de estimacion)
- `anexos/diagramas/ezestimate-actors.puml`
- `anexos/diagramas/ezestimate-tcf-ecf.puml`
- `anexos/diagramas/ezestimate-uc-1.puml`
- `anexos/diagramas/gantt-*.puml` (todos los diagramas de Gantt)

**Herramientas recomendadas:**
- EZestimate o Use Case Point Calculator Tool para la estimacion
- GanttProject o Tom's Planner para planificacion

---

### ANEXO III - ANALISIS Y DISENO DEL SISTEMA

Documenta la transicion desde los requisitos hasta la arquitectura final de la solucion.

**Estructura por bloques:**

#### A) MODELO DE ANALISIS
1. **Modelo del dominio**:
   - Diagrama de clases de analisis (conceptual)
   - Entidades principales: Usuario, Documento, Version, Wallet, Firma, Compartido, Evento, Notificacion
   - Relaciones entre entidades
2. **Diagramas de secuencia iniciales** (analisis):
   - Registrar usuario
   - Subir documento (flujo completo con cifrado)
   - Compartir documento
   - Firmar documento
   - Verificar documento
3. **Clases de analisis**: Boundary, Control, Entity
4. **Arquitectura del modelo de analisis**: Capas principales

#### B) DISENO ARQUITECTONICO
1. **Patrones arquitectonicos**:
   - Cliente-Servidor (SPA + API REST)
   - Arquitectura hexagonal / Clean Architecture en backend
   - Patron Observer para eventos blockchain
   - Patron Strategy para diferentes wallets
2. **Subsistema de diseno**:
   - Frontend (React + Vite)
   - Backend (Node.js + Express)
   - Capa de blockchain (ethers.js + Hardhat)
   - Capa de almacenamiento (IPFS)
   - Base de datos (PostgreSQL + Prisma)
3. **Clases de diseno**: Diagrama de clases detallado (class-design.puml)
4. **Diagramas de secuencia posteriores** (diseno detallado):
   - Todos los diagramas seq-*.puml existentes
   - Se deben agrupar por funcionalidad

#### C) DISENO DE DATOS
1. **Diseno de la base de datos**:
   - Diagrama Entidad-Relacion (er-diagram.puml, er-combined.puml)
   - Esquema Prisma completo documentado
   - Descripcion de tablas principales y sus campos
   - Indices y restricciones

#### D) ENTORNO TECNOLOGICO Y DESPLIEGUE
1. **Entorno tecnologico del sistema**:
   - Stack completo (React 19, TypeScript 5.9, Node.js, Express 5, PostgreSQL 16, Docker, IPFS Kubo, Hardhat)
2. **Modelo de despliegue**:
   - Diagrama de despliegue (deployment.puml, deployment_prov.puml)
   - Infraestructura Docker Compose
   - Servicios: postgres, postfix, hardhat, ipfs-node, backend, frontend, nginx
3. **Diagrama de componentes** (components.puml)
4. **Diagrama de colaboracion**:
   - Subida de documento (collaboration-upload.puml)
   - Firma de documento (collaboration-sign.puml)

**Diagramas PUML existentes:**
- `anexos/diagramas/arquitectura.puml` / `arquitectura_prov.puml`
- `anexos/diagramas/class-analysis.puml`
- `anexos/diagramas/class-design.puml` / `class-design_prov.puml`
- `anexos/diagramas/components.puml`
- `anexos/diagramas/deployment.puml` / `deployment_prov.puml`
- `anexos/diagramas/er-diagram.puml` / `er-diagram_prov.puml`
- `anexos/diagramas/er-combined.puml`
- `anexos/diagramas/collaboration-*.puml`
- `anexos/diagramas/seq-*.puml` (mas de 60 diagramas de secuencia)
- `anexos/diagramas/prepare-confirm.puml`
- `anexos/diagramas/flow-public-*.puml`

---

### ANEXO IV - DOCUMENTACION TECNICA

Orientado completamente a desarrolladores que vayan a leer, mantener o evaluar el codigo.

**Contenido obligatorio:**
1. **Tecnologias / Lenguajes usados en el desarrollo**:
   - Frontend: React 19, TypeScript 5.9, Vite 7, Tailwind CSS 3
   - Backend: Node.js, TypeScript 5.9, Express 5
   - Blockchain: Solidity (Hardhat 2.22, ethers.js v6)
   - Base de datos: PostgreSQL 16, Prisma 5.22
   - Almacenamiento: IPFS (Kubo)
   - Infraestructura: Docker, Docker Compose, Nginx
2. **Marcos de trabajo y bibliotecas**:
   - React Router DOM 7, TanStack Query 5, Zustand 5
   - React Hook Form 7 + Zod 4
   - Axios, Socket.io
   - ethers.js v6, @walletconnect/ethereum-provider
   - jsonwebtoken, bcrypt/argon2, Multer, Nodemailer
   - Winston (logs), node-cron
   - Vitest + Testing Library, Playwright (E2E), Jest + Supertest
3. **Estructura del codigo y metodos principales**:
   - Arbol de directorios del proyecto
   - Descripcion de modulos principales:
     - `frontend/src/components/`, `frontend/src/pages/`, `frontend/src/api/`
     - `backend/src/controllers/`, `backend/src/services/`, `backend/src/lib/crypto/`
     - `smart-contracts/contracts/`
   - Metodos criticos:
     - Cifrado de documentos (FileCrypto.ts, KeyManager.ts)
     - Flujo prepare/confirm para blockchain
     - Sincronizacion de eventos blockchain
     - Gestion de permisos on-chain
4. **Documentacion tecnica (semi-generada)**:
   - Referencia a posible uso de TypeDoc para el backend
   - Documentacion de contratos inteligentes (NatSpec en Solidity)
   - API REST documentada con Swagger/OpenAPI
5. **Smart Contracts**:
   - DocumentRegistry.sol: registro de documentos
   - Versioning.sol: gestion de versiones
   - Signing.sol: firmas digitales
   - AccessControl.sol: control de acceso y permisos
   - Descripcion de cada funcion publica y eventos emitidos
6. **Arquitectura de cifrado** (3 capas):
   - Capa 1: Autenticacion (JWT)
   - Capa 2: Intercambio de claves (ECDH P-256) + cifrado simetrico (AES-256-GCM)
   - Capa 3: Blockchain (hash de contenido, metadatos inmutables)
7. **Flujo de integracion continua / despliegue**

---

### ANEXO V - PLAN DE SEGURIDAD

Se debe definir la seguridad de las entidades y elementos relacionados con el proyecto.

**Contenido obligatorio (basado en metodologia INCIBE):**
1. **Identificacion de puntos / activos criticos**:
   - Activos de informacion: documentos cifrados, claves privadas, tokens JWT
   - Activos de infraestructura: servidor backend, nodo IPFS, nodo blockchain
   - Activos de usuario: credenciales, wallets
2. **Valoracion de activos criticos**:
   - Tabla de activos con valor (confidencialidad, integridad, disponibilidad)
3. **Amenazas principales**:
   - Acceso no autorizado a documentos
   - Perdida de claves de cifrado
   - Ataques al nodo blockchain
   - Phishing / suplantacion
   - Perdida de disponibilidad (DoS)
4. **Consecuencias y probabilidad**:
   - Matriz de riesgos (probabilidad x impacto)
5. **Medidas de seguridad existentes**:
    - Cifrado de documentos (AES-256-GCM)
    - Autenticacion mediante firma criptografica de wallet
    - Challenge-firma para wallets (prueba de posesion)
    - Control de acceso basado en roles (RBAC)
   - Validacion de permisos on-chain
   - Logs de auditoria (tabla Event)
   - SSL/TLS en comunicaciones
   - Docker y aislamiento de servicios
6. **Riesgos residuales**
7. **Metodologias y herramientas**:
   - Plan Director de Seguridad (referencia INCIBE)
   - OWASP Top 10 para aplicaciones web
   - Herramientas: análisis estatico de contratos (Slither), pruebas de penetracion

---

### ANEXO VI - MANUAL DEL USUARIO

Estrictamente orientado al cliente o usuario final.

**Contenido obligatorio:**
1. **Instalacion y configuracion**:
   - Requisitos del sistema (navegador moderno, MetaMask opcional)
   - Configuracion inicial de cuenta
   - Verificacion de email
2. **Guia paso a paso para utilizar la aplicacion**:
   - **Registro e inicio de sesion**: Capturas de login-page.png, register-form.png
   - **Panel principal**: Capturas de documents-list.png, admin-dashboard.png
   - **Gestion de documentos**: Subir (upload-modal.png), crear carpetas, organizar
   - **Versiones**: Historial, subir nueva version, cambiar version operacional (versions-tab.png)
   - **Compartir documentos**: Modal de compartir (share-modal.png), permisos
   - **Firmar documentos**: Seleccion de wallet, firma digital (sign-modal.png, signers-modal.png)
   - **Verificar documentos**: Pagina publica de verificacion (verify-page.png)
   - **Auditoria blockchain**: Explorador de eventos (blockchain-auditor.png)
   - **Notificaciones**: Centro de notificaciones (notifications-page.png)
   - **Perfil y ajustes**: Gestion de wallets, avatar, preferencias (profile-page.png, settings-page.png)
   - **Vista movil**: Todas las capturas mobile-*.png
3. **Preguntas frecuentes (FAQ)**
4. **Resolucion de problemas comunes**

**Capturas UI disponibles en `anexos/capturas-ui/`:**
- landing-public.png, login-page.png, register-form.png, register-success.png
- documents-list.png, document-detail.png, upload-modal.png, upload-version-modal.png
- versions-tab.png, versions-tab-empty.png, timeline-page.png
- share-modal.png, shared-page.png, sign-modal.png, signers-modal.png
- transfer-tab.png, blockchain-auditor.png, verify-page.png, public-audit-page.png
- profile-page.png, settings-page.png, notifications-page.png
- admin-dashboard.png, two-factor-setup.png, two-factor-login.png, recovery-key-modal.png
- wallet-selector-modal.png
- mobile-*.png (15 capturas de vista movil)

---

### ANEXO VII - MANUAL DE MONTAJE / DESPLIEGUE

Guia tecnica para desplegar el sistema en un entorno de produccion.

**Contenido obligatorio:**
1. **Requisitos de hardware y software**:
   - Servidor con Docker y Docker Compose
   - Recursos minimos (RAM, CPU, disco)
2. **Instalacion paso a paso**:
   - Clonar repositorio
   - Configurar variables de entorno (.env)
   - Levantar servicios con Docker Compose
   - Configurar IPFS
   - Desplegar contratos inteligentes (Hardhat)
   - Ejecutar seed de base de datos
3. **Configuracion de servicios**:
   - PostgreSQL
   - Postfix (email)
   - Nginx (proxy inverso)
   - SSL/TLS
4. **Verificacion del despliegue**
5. **Mantenimiento y actualizacion**
6. **Scripts de utilidad**:
   - `reseed-dev.ps1`
   - `build.ps1`
   - Scripts de despliegue en `scripts/`

---

### ANEXO VIII - USO DE INTELIGENCIA ARTIFICIAL (Recomendado)

Documentar de forma transparente la utilizacion de modelos de lenguaje como herramientas de soporte.

**Contenido:**
- Se ha empleado la IA exclusivamente como asistente para:
  - Depuracion de errores
  - Optimizacion de fragmentos de codigo
  - Generacion de documentacion tecnica
  - Diseno de diagramas UML
- Herramientas utilizadas: ChatGPT, GitHub Copilot, Claude, etc.
- Todas las sugerencias generadas han sido supervisadas, verificadas y adaptadas manualmente
- Se garantiza que el sistema no ha sido codificado de forma autonoma por la IA
- Ejemplos de prompts especificos usados para tareas concretas

---

### ANEXO IX - DISENO CENTRADO EN EL USUARIO (Opcional)

Detallar la metodologia aplicada para asegurar que la solucion sea intuitiva.

**Contenido:**
- Identificacion de necesidades reales mediante tecnicas de needfinding
- Definicion de la solucion a traves de un Elevator Pitch
- Validacion inicial de la arquitectura de la informacion y flujos de navegacion con prototipos de baja fidelidad
- Diseno de escenarios (storyboards), arquetipos de usuarios y analisis de tareas
- Prototipado en papel y digital
- Pruebas de usabilidad y sesiones de feedback

---

## 4. INVENTARIO DE RECURSOS DISPONIBLES

### 4.1 Diagramas PUML Existentes

**Ubicacion**: `anexos/diagramas/`

| Categoria | Archivos | Estado |
|-----------|----------|--------|
| Arquitectura | arquitectura.puml, arquitectura_prov.puml | Revisar |
| Clases (Analisis) | class-analysis.puml | Revisar |
| Clases (Diseno) | class-design.puml, class-design_prov.puml | Revisar |
| Componentes | components.puml | Revisar |
| Despliegue | deployment.puml, deployment_prov.puml | Revisar |
| ER / BD | er-diagram.puml, er-diagram_prov.puml, er-combined.puml | Revisar |
| Colaboracion | collaboration-upload.puml, collaboration-sign.puml | OK |
| Secuencia | seq-*.puml (mas de 60 diagramas) | Revisar / Completar |
| Casos de Uso | usecase-general.puml, uc_*.puml | Revisar |
| Estimacion | ezestimate.puml, ezestimate-*.puml | OK |
| Gantt | gantt-*.puml (8 diagramas) | OK |
| UI Mockups | ui-*.puml (8 diagramas) | Revisar |
| Flujos | flow-public-*.puml, prepare-confirm.puml | OK |
| Nuevos (2025) | _new_puml/seq-*.puml | Integrar |

**Nota sobre diagramas de secuencia**: Existen muchos diagramas seq-*.puml. Se deben:
1. Revisar que esten actualizados con la logica actual del sistema
2. Asegurar que sigan el estilo definido en `_sequence-style.puml`
3. Completar los que falten para casos de uso criticos

### 4.2 Capturas de Pantalla de la UI

**Ubicacion**: `anexos/capturas-ui/`

Contiene aproximadamente 40 capturas de pantalla del sistema funcionando, incluyendo:
- Vista desktop completa
- Vista movil (responsive)
- Modales y flujos clave

### 4.3 Memoria de Referencia (Ejemplo de Companero)

**Ubicacion**: `anexos/memoria_referencia/Memoria.md`

Es la memoria completa de un companero de la USAL (proyecto Load Crutches). Sirve como referencia de:
- Nivel de detalle esperado en cada seccion
- Formato de redaccion tecnica
- Como integrar diagramas y capturas
- Estructura de capitulos y subcapitulos
- Estilo de glosario y bibliografia

**USAR SOLO COMO REFERENCIA DE ESTILO Y ESTRUCTURA, NO COPIAR CONTENIDO.**

### 4.4 Archivos Temporales de Anexos

**Ubicacion**: `anexos/temp_anexo*.md`

Son borradores previos de los anexos. Pueden contener informacion util pero necesitan:
- Reestructuracion completa segun esta guia
- Actualizacion de contenido tecnico
- Correccion de estilo

### 4.5 Archivos LaTeX Actuales

**Ubicacion**: `anexos/*_NUEVO.tex`

La memoria y anexos actuales estan en LaTeX (serie _NUEVO):
- `MemoriaPrincipal_DocumentChain_NUEVO.tex`
- `AnexoI_EspecificacionRequisitos_NUEVO.tex`
- `AnexoII_EstimacionTamanioEsfuerzo_NUEVO.tex`
- `AnexoIII_AnalisisDiseno_NUEVO.tex`
- `AnexoIV_DocumentacionTecnica_NUEVO.tex`
- `AnexoV_PlanSeguridad_NUEVO.tex`
- `AnexoVI_ManualUsuario_NUEVO.tex`
- `AnexoVII_ManualMontaje_NUEVO.tex`
- `AnexoVIII_UsoIA_NUEVO.tex`
- `AnexoIX_DisenoCentradoUsuario_NUEVO.tex`

Los archivos antiguos (sin sufijo _NUEVO) han sido archivados en `anexos/obsoletos/`.

**ESTRATEGIA RECOMENDADA**: Evaluar si es mas eficiente:
- (A) Actualizar los .tex existentes, o
- (B) Rehacer desde cero usando la plantilla USAL (`plantilla_USAL.tex`) y esta guia

---

## 5. GUÍA DE ESTILO PARA DIAGRAMAS

### 5.1 Estilo PUML

**Usar los archivos de estilo existentes:**
- `anexos/diagramas/_sequence-style.puml`
- `anexos/diagramas/_structure-style.puml`

### 5.2 Convenciones
- **Colores corporativos USAL** donde sea posible
- **Tipografia consistente** en todos los diagramas
- **Leyendas claras** para cada diagrama
- **Numeracion correlativa**: Figura A3.1, Figura A3.2, etc.
- **Referencias en texto**: "Como se muestra en la Figura A3.1..."

### 5.3 Tipos de Diagramas Requeridos

| Tipo | Herramienta | Uso |
|------|-------------|-----|
| Casos de Uso | PlantUML / Visual Paradigm | Anexo I |
| Clases (Analisis/Diseno) | PlantUML | Anexo III |
| Secuencia | PlantUML | Anexo III |
| Componentes | PlantUML | Anexo III |
| Despliegue | PlantUML | Anexo III |
| Entidad-Relacion | PlantUML | Anexo III |
| Gantt | PlantUML | Anexo II |
| Actividades / Flujo | PlantUML | Anexo III, VI |
| Mockups UI | PlantUML / Figma | Anexo III, VI |

---

## 6. CHECKLIST DE ENTREGA FINAL

### Memoria Principal
- [ ] Portada sin numeracion
- [ ] Consentimiento informado firmado
- [ ] Resumen (200-500 palabras, espanol e ingles)
- [ ] Glosario con acronimos definidos
- [ ] Indices de figuras y tablas
- [ ] 10 capitulos segun seccion 2.2
- [ ] Bibliografia en APA 7 o IEEE

### Anexos
- [ ] Anexo I: Especificacion de Requisitos (completo)
- [ ] Anexo II: Estimacion del Tamano y Esfuerzo (completo)
- [ ] Anexo III: Analisis y Diseno del Sistema (completo)
- [ ] Anexo IV: Documentacion Tecnica (completa)
- [ ] Anexo V: Plan de Seguridad (completo)
- [ ] Anexo VI: Manual del Usuario (completo)
- [ ] Anexo VII: Manual de Montaje / Despliegue (completo)
- [ ] Anexo VIII: Uso de IA (recomendado)

### Formatos
- [ ] Paginas pares e impares con encabezados distintos
- [ ] Todas las figuras y tablas numeradas y referenciadas
- [ ] Acronimos definidos en primera aparicion
- [ ] Lenguaje formal e impersonal
- [ ] Bibliografia completa y bien formateada
- [ ] PDF final generado correctamente

---

## 7. NOTAS PARA FUTUROS AGENTES

### 7.1 Como usar este documento
1. Leer completamente esta guia antes de empezar
2. Revisar la memoria de referencia del companero (`memoria_referencia/`) para entender el nivel de detalle
3. Evaluar los archivos .tex existentes vs rehacer desde cero
4. Revisar todos los diagramas PUML existentes y determinar cuales necesitan actualizacion
5. Usar las capturas UI de `capturas-ui/` para ilustrar el Manual del Usuario (Anexo VI)
6. Documentar cada funcionalidad del sistema con el nivel de detalle apropiado

### 7.2 Fuentes de Informacion del Sistema
- **Codigo fuente**: `frontend/src/`, `backend/src/`, `smart-contracts/`
- **Documentacion tecnica**: `docs/` (API.md, IMPLEMENTATION.md, etc.)
- **READMEs**: `README.md`, `frontend/README.md`, `backend/README.md`
- **Configuracion**: `docker-compose.yml`, Dockerfiles
- **Pruebas**: Tests unitarios y E2E en `frontend/src/test/` y `backend/test/`

### 7.3 Decisiones de Diseno Clave a Documentar
- Arquitectura de cifrado de 3 capas
- Patron prepare/confirm para transacciones blockchain
- Sincronizacion bidireccional BD-blockchain mediante event listeners
- Gestion de wallets (EIP-6963 + WalletConnect)
- Dockerizacion completa del stack

### 7.4 Contacto y Contexto
- **Autor del TFG**: (nombre del estudiante)
- **Tutor**: Dr. Pablo Chamoso Santos
- **Universidad**: Universidad de Salamanca
- **Titulacion**: Grado en Ingenieria Informatica
- **Tecnologias principales**: React, TypeScript, Node.js, PostgreSQL, Solidity, Docker, IPFS

---

> **ULTIMA ACTUALIZACION**: Mayo 2026
> **VERSION**: 2.0
> **ESTADO**: Plan de actuacion completo definido. Pendiente aprobacion del usuario para comenzar ejecucion.

---

## 8. DOCUMENTOS DEL PROYECTO DE DOCUMENTACION

### 8.1 RECURSOS.md
**Ubicacion**: `anexos/RECURSOS.md`

Mapa completo de todos los recursos disponibles para la elaboracion de la memoria y anexos:
- Capturas normativas oficiales USAL (`anexos/capt/`)
- Plantilla LaTeX oficial (`plantilla_USAL.tex`)
- Anexos existentes (finales parciales, temporales, Word antiguos)
- Memoria de referencia del companero
- Diagramas PUML (inventario completo con estado)
- Capturas de pantalla de la aplicacion
- Documentacion tecnica del proyecto (`docs/`)
- Codigo fuente como referencia tecnica

### 8.2 PLAN_DE_ACTUACION.md
**Ubicacion**: `anexos/PLAN_DE_ACTUACION.md`

Plan maestro de actuacion con:
- Estructura objetivo de 7 anexos obligatorios + opcionales
- Fases de trabajo ordenadas por dependencias
- Lista exhaustiva de los 56 diagramas de secuencia de analisis (BCE) que faltan
- Inventario de diagramas de diseno a revisar
- Entregables de cada anexo
- Restricciones de redaccion, LaTeX y coherencia codigo-diagrama
- Orden de ejecucion recomendado
- Estimacion de esfuerzo por fase
