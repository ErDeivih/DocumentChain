# GUÍA DE DIAGRAMAS POR ANEXO — DocumentChain

> Basado en las pautas del profesor (anexos/capt/capturas.md), el patrón del compañero
> (anexos/capt/Anexo 1-7), y el inventario real de diagramas del proyecto.

---

## Estructura de anexos (normativa CCII-N2016-02 + Depto. Informática USAL)

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

---

## ANEXO I — ESPECIFICACIÓN DE REQUISITOS

**Contenido obligatorio según el profesor:**
- Objetivos
- Requisitos de información (IRQ)
- Requisitos funcionales (UC)
- Diagrama de paquetes
- Definición de actores
- Diagramas de casos de uso
- Requisitos no funcionales (NFR)
- Matriz de rastreabilidad

**Diagramas requeridos:**

| Diagrama | Archivo | Tipo |
|----------|---------|------|
| Diagrama general de casos de uso | `usecase-general.png` | Casos de uso |
| Paquete: Acceso y autenticación | `uc_acceso.png` | Casos de uso |
| Paquete: Gestión de documentos | `uc_documentos.png` | Casos de uso |
| Paquete: Versiones | `uc_versiones.png` | Casos de uso |
| Paquete: Firmas | `uc_firmas.png` | Casos de uso |
| Paquete: Compartición | `uc_comparticion.png` | Casos de uso |
| Paquete: Auditoría | `uc_auditoria.png` | Casos de uso |
| Paquete: Administración | `uc_administracion.png` | Casos de uso |
| Jerarquía de actores | `actor-hierarchy.png` | Jerarquía |
| Diagrama de paquetes | Se genera con texto o se usa el del Anexo III | Paquetes |

**Nota:** Los casos de uso NO son pulsaciones sobre la interfaz. Son funcionalidades del sistema. No se deben incluir diagramas de secuencia aquí (van en Anexo III).

---

## ANEXO II — ESTIMACIÓN DEL TAMAÑO Y ESFUERZO

**Contenido obligatorio según el profesor:**
- Metodología: Proceso Unificado (UP)
- Estimación basada en Casos de Uso (UCP)
- Cálculo de UUCP, UCP, horas estimadas
- Planificación temporal con diagramas de Gantt

**Diagramas requeridos:**

| Diagrama | Archivo | Tipo |
|----------|---------|------|
| Pantalla EZEstimate: Actores | `ezestimate-actors.png` | Captura herramienta |
| Pantalla EZEstimate: UC | `ezestimate-uc-1.png` | Captura herramienta |
| Pantalla EZEstimate: Cálculo final | `ezestimate.png` | Captura herramienta |
| Gantt: Inicio Iteración 1 | `gantt-inicio1.puml` → PNG | Gantt |
| Gantt: Inicio Iteración 2 | `gantt-inicio2.puml` → PNG | Gantt |
| Gantt: Elaboración Iteración 1 | `gantt-elab1.puml` → PNG | Gantt |
| Gantt: Elaboración Iteración 2 | `gantt-elab2.puml` → PNG | Gantt |
| Gantt: Construcción Iteración 1 | `gantt-const1.puml` → PNG | Gantt |
| Gantt: Construcción Iteración 2 | `gantt-const2.puml` → PNG | Gantt |
| Gantt: Transición Iteración 1 | `gantt-trans1.puml` → PNG | Gantt |
| Gantt: Transición Iteración 2 | `gantt-trans2.puml` → PNG | Gantt |
| Gantt: Pruebas | `gantt-test.puml` → PNG | Gantt |

**Nota:** El compañero NO tiene este anexo por separado (su estimación va integrada en la memoria). Nosotros usamos EZEstimate + pgfgantt/PlantUML. Los Gantt deben ser coherentes con las fases del Proceso Unificado.

---

## ANEXO III — ANÁLISIS Y DISEÑO DEL SISTEMA

**Contenido obligatorio según el profesor:**
- MODELO DE ANÁLISIS: Modelo del dominio, Diagramas de secuencia iniciales, Clases de análisis
- DISEÑO ARQUITECTÓNICO: Arquitectura, Patrones, Subsistemas, Clases de diseño, Diagramas de secuencia posteriores
- DISEÑO DE DATOS: Diseño de la base de datos
- ENTORNO TECNOLÓGICO Y DESPLIEGUE: Entorno tecnológico, Modelo de despliegue

**Según el patrón del compañero (Anexo 3 para análisis, Anexo 4 para diseño):**

### A) Modelo de Análisis (BCE)

| Diagrama | Archivo | Cantidad |
|----------|---------|:---:|
| Diagrama de clases de análisis (dominio) | `class-analysis.png` | 1 |
| Diagrama de clases BCE | `class-analysis-bce.png` | 1 |
| Diagramas de secuencia BCE (uno por UC) | `seq-bce-ucXXXX-*.png` | 43 |

**Los 43 BCE deben:**
- Usar `_sequence-bce-style.puml`
- Actores del catálogo canónico (Usuario no logueado, Usuario logueado, Administrador)
- Nombres en español funcional (Interfaz X, Controlador X, Entidad X)
- Sin infraestructura técnica (nada de blockchain, IPFS, PostgreSQL)
- Flujo completo con alternativos (alt)

### B) Diseño

| Diagrama | Archivo | Cantidad |
|----------|---------|:---:|
| Diagrama de clases de diseño | `class-design.png` | 1 |
| Diagrama de componentes | `components.png` | 1 |
| Diagrama de paquetes | `package-diagram.png` | 1 |
| Arquitectura del sistema | `arquitectura.png` | 1 |
| Diagramas de secuencia de diseño | `seq-*.png` | ~47 |
| Preparación/confirmación (flujo) | `prepare-confirm.png` | 1 |
| Ciclo de vida del documento | `state-document-lifecycle.png` | 1 |
| Colaboración: subida | `collaboration-upload.png` | 1 |
| Colaboración: firma | `collaboration-sign.png` | 1 |
| Actividad: subida | `activity-upload.png` | 1 |

### C) Diseño de Datos

| Diagrama | Archivo | Cantidad |
|----------|---------|:---:|
| Diagrama Entidad-Relación | `er-diagram.png` | 1 |
| Diagrama ER combinado | `er-combined.png` | 1 |

### D) Despliegue

| Diagrama | Archivo | Cantidad |
|----------|---------|:---:|
| Diagrama de despliegue | `deployment.png` | 1 |

---

## ANEXO IV — DOCUMENTACIÓN TÉCNICA

**Contenido obligatorio:**
- Tecnologías / Lenguajes
- Marcos de trabajo y bibliotecas
- Estructura del código
- Documentación técnica (TypeDoc)

**Diagramas incluidos:**
- Arquitectura del sistema (referencia a `arquitectura.png`)
- Despliegue (referencia a `deployment.png`)
- NO debe incluir código fuente (lstlisting). Solo referencias a archivos.

---

## ANEXO V — PLAN DE SEGURIDAD

**Contenido obligatorio:**
- Identificación de activos críticos
- Valoración de activos
- Amenazas principales
- Matriz de riesgos
- Medidas de seguridad (prevención, detección, corrección)
- Metodología: Plan Director de Seguridad (INCIBE)

**Diagramas:** No requiere diagramas específicos. Tablas de activos, amenazas y matriz de riesgos.

---

## ANEXO VI — MANUAL DEL USUARIO

**Contenido obligatorio:**
- Instalación y configuración
- Guía paso a paso con capturas de pantalla
- FAQ

**Capturas referenciadas:** ~29 capturas en `anexos/capturas-ui/`

---

## ANEXO VII — MANUAL DE MONTAJE

**Contenido obligatorio:**
- Requisitos hardware/software
- Instalación paso a paso
- Configuración de servicios
- Despliegue con Docker

**Diagramas:**
- Arquitectura de contenedores (TikZ inline o `deployment.png`)
- NO incluir código fuente como listados (usar referencias a archivos)

---

## ANEXO VIII — USO DE IA

**Contenido:** Declaración de herramientas, ejemplos de prompts, transparencia.

**Diagramas:** No requiere.

---

## ANEXO IX — DISEÑO CENTRADO EN EL USUARIO

**Contenido:**
- Needfinding
- Elevator Pitch
- Arquetipos
- Prototipos (wireframes)
- Pruebas de usabilidad

**Diagramas:**

| Diagrama | Archivo | Tipo |
|----------|---------|------|
| Mockup: Login | `ui-login.png` | Interfaz |
| Mockup: Dashboard | `ui-dashboard.png` | Interfaz |
| Mockup: Detalle documento | `ui-document-detail.png` | Interfaz |
| Mockup: Compartición | `ui-share-modal.png` | Interfaz |
| Mockup: Notificaciones | `ui-notifications.png` | Interfaz |
| Mockup: Perfil | `ui-profile.png` | Interfaz |
| Mockup: Registro | `ui-register.png` | Interfaz |
| Mockup: Estadísticas | `ui-stats-user.png` | Interfaz |
| Mockup: Blockchain auditor | `ui-blockchain-auditor.png` | Interfaz |
| Mockup: Admin dashboard | `ui-admin-dashboard.png` | Interfaz |
| Wireframe: Login | `bocetos-anexo2/login-wireframe.png` | Prototipo |
| Wireframe: Registro | `bocetos-anexo2/register-wireframe.png` | Prototipo |
| Wireframe: Dashboard docs | `bocetos-anexo2/documents-dashboard-wireframe.png` | Prototipo |
| Wireframe: Detalle doc | `bocetos-anexo2/document-detail-wireframe.png` | Prototipo |
| Wireframe: Share modal | `bocetos-anexo2/share-modal-wireframe.png` | Prototipo |
| Wireframe: Shared docs | `bocetos-anexo2/shared-documents-wireframe.png` | Prototipo |
| Wireframe: Admin | `bocetos-anexo2/admin-dashboard-wireframe.png` | Prototipo |
| Wireframe: Blockchain auditor | `bocetos-anexo2/blockchain-auditor-wireframe.png` | Prototipo |
| Wireframe: Verify | `bocetos-anexo2/public-verify-wireframe.png` | Prototipo |
| Wireframe: Perfil | `bocetos-anexo2/profile-wireframe.png` | Prototipo |
| Wireframe: Settings | `bocetos-anexo2/settings-wireframe.png` | Prototipo |

---

## RESUMEN DE DIAGRAMAS POR ANEXO

| Anexo | Diagramas | Tipo principal |
|-------|:---------:|---------------|
| I | ~10 | Casos de uso + actores + paquetes |
| II | ~12 | EZEstimate + Gantt |
| III | ~100 | BCE (43) + Diseño seq (~47) + Estructurales (~10) |
| IV | 2 | Arquitectura + despliegue (referencia) |
| V | 0 | Solo tablas |
| VI | ~29 | Capturas de pantalla |
| VII | 1 | Arquitectura contenedores |
| VIII | 0 | Solo texto |
| IX | ~21 | UI mockups + wireframes |

**TOTAL aproximado: 175 figuras entre diagramas, capturas y mockups.**
