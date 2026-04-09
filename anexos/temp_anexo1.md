> **LOAD CRUTCHES: SISTEMA DE SOPORTE EN LA RECUPERACIÓN DE PACIENTES
> QUE REQUIEREN USO DE MULETAS**
>
> **-**

LOAD CRUTCHES: SUPPORT SYSTEM FOR THE RECOVERY OF PATIENTS WHO REQUIRE
THE USE OF CRUTCHES

Anexo I: Especificaciones del sistema

![](media/image1.png){width="4.535625546806649in" height="1.25125in"}

# Trabajo de Fin de Grado Grado en Ingeniería Informática

> **Alumno:**

# Víctor Martín Fuentes

> **Tutor:**
>
> Pablo Chamoso Santos
>
> Salamanca, enero de 2026
>
> []{#_bookmark0 .anchor}Contenido

[Índice de figuras 3](#_bookmark0)

[Índice de tablas 3](#índice-de-tablas)

1.  [Introducción 1](#introducción)

2.  [Lista de usuarios participantes
    1](#lista-de-usuarios-participantes)

3.  [Objetivos del proyecto 2](#objetivos-del-proyecto)

4.  [Catálogo de requisitos del sistema
    4](#catálogo-de-requisitos-del-sistema)

    1.  [Requisitos de información 4](#requisitos-de-información)

    2.  [Requisitos no funcionales 8](#requisitos-no-funcionales)

    3.  [Requisitos funcionales 10](#requisitos-funcionales)

        1.  [Diagramas de actores 10](#_bookmark23)

        2.  [Diagramas de casos de uso 11](#_bookmark27)

            1.  [Gestión de acceso 12](#_bookmark28)

            2.  [Rehabilitación 22](#_bookmark38)

            3.  [Gestión clínica 27](#_bookmark43)

            4.  [Comunicación y gestión de consejos 34](#_bookmark51)

5.  [Matrices de rastreabilidad 39](#matrices-de-rastreabilidad)

    1.  [Matriz de rastreabilidad requisitos de información frente a
        objetivos
        39](#matriz-de-rastreabilidad-requisitos-de-información-frente-a-objetivos)

    2.  [Matriz de rastreabilidad requisitos no funcionales frente a
        requisitos
        de](#matriz-de-rastreabilidad-requisitos-no-funcionales-frente-a-requisitos-de-información)
        [información
        39](#matriz-de-rastreabilidad-requisitos-no-funcionales-frente-a-requisitos-de-información)

    3.  [Matriz de rastreabilidad requisitos no funcionales frente a
        requisitos
        no](#matriz-de-rastreabilidad-requisitos-no-funcionales-frente-a-requisitos-no-funcionales)
        [funcionales
        39](#matriz-de-rastreabilidad-requisitos-no-funcionales-frente-a-requisitos-no-funcionales)

    4.  [Matriz de rastreabilidad requisitos no funcionales frente a
        objetivos
        40](#matriz-de-rastreabilidad-requisitos-no-funcionales-frente-a-objetivos)

    5.  [Matriz de rastreabilidad requisitos funcionales frente a
        requisitos
        no](#matriz-de-rastreabilidad-requisitos-funcionales-frente-a-requisitos-no-funcionales)
        [funcionales
        40](#matriz-de-rastreabilidad-requisitos-funcionales-frente-a-requisitos-no-funcionales)

    6.  [Matriz de rastreabilidad requisitos funcionales frente a
        requisitos
        de](#matriz-de-rastreabilidad-requisitos-funcionales-frente-a-requisitos-de-información)
        [información
        41](#matriz-de-rastreabilidad-requisitos-funcionales-frente-a-requisitos-de-información)

    7.  [Matriz de rastreabilidad requisitos funcionales frente a
        requisitos
        funcionales](#matriz-de-rastreabilidad-requisitos-funcionales-frente-a-requisitos-funcionales)
        [42](#matriz-de-rastreabilidad-requisitos-funcionales-frente-a-requisitos-funcionales)

    8.  [Matriz de rastreabilidad requisitos funcionales frente a
        objetivos
        42](#matriz-de-rastreabilidad-requisitos-funcionales-frente-a-objetivos)

6.  [Propuesta arquitectónica 43](#propuesta-arquitectónica)

7.  [Glosario 44](#glosario)

[Bibliografía 45](#bibliografía)

# Índice de figuras

> Ilustración 1: Diagrama de casos de uso completo del sistema **¡Error!
> Marcador no**

### definido.

> Ilustración 2: Diagrama de casos de uso del paquete \"Gestión de
> acceso\" **¡Error!**

### Marcador no definido.

> Ilustración 3: Diagrama de casos de uso del paquete
> \"Rehabilitación\"**¡Error! Marcador no definido.**
>
> Ilustración 4: Diagrama de casos de uso del paquete \"Gestión clínica
> (web doctor)\"

### . ¡Error! Marcador no definido.

> Ilustración 5: Diagrama de casos de uso del paquete \"Comunicación y
> gestión de consejos\" **¡Error! Marcador no definido.**
>
> Ilustración 6: Matriz de rastreabilidad requisitos de información
> frente a objetivos (IRQ- OBJ) **¡Error! Marcador no definido.**
>
> Ilustración 7: Matriz de rastreabilidad requisitos no funcionales
> frente a requisitos de información (NFR-IRQ) **¡Error! Marcador no
> definido.**
>
> Ilustración 8: Matriz de rastreabilidad requisitos no funcionales
> frente a requisitos no funcionales (NFR-NFR) **¡Error! Marcador no
> definido.**
>
> Ilustración 9: Matriz de rastreabilidad requisitos no funcionales
> frente a objetivos (NFR- OBJ) **¡Error! Marcador no definido.**
>
> Ilustración 10: Matriz de rastreabilidad requisitos funcionales frente
> a requisitos no funcionales (UC-NFR) **¡Error! Marcador no definido.**
>
> Ilustración 11: Matriz de rastreabilidad requisitos funcionales frente
> a requisitos de información (UC-IRQ) **¡Error! Marcador no definido.**
>
> Ilustración 12: Matriz de rastreabilidad requisitos funcionales frente
> a requisitos funcionales (UC-UC) **¡Error! Marcador no definido.**
>
> Ilustración 13: Matriz de rastreabilidad requisitos funcionales frente
> a objetivos (UC- OBJ) **¡Error! Marcador no definido.**
>
> Ilustración 14: Primera propuesta arquitectónica del modelo **¡Error!
> Marcador no**
>
> **definido.**

# Índice de tablas

> [Tabla 1: Participante -- Víctor Martín Fuentes
> 1](#lista-de-usuarios-participantes)
>
> [Tabla 2: Participante - Pablo Chamoso Santos 1](#_bookmark5)
>
> [Tabla 3: Especificación del objetivo OBJ-0001: Gestionar usuarios y
> seguridad 2](#_bookmark7)
>
> [Tabla 4: Especificación del objetivo OBJ-0002: Integración de muleta
> inteligente y](#_bookmark8) [gestionar monitorización biomédica
> 2](#_bookmark8)
>
> [Tabla 5: Especificación del objetivo OBJ-0003: Definir trazabilidad
> clínica y visual de](#_bookmark9) [progreso 3](#_bookmark9)
>
> [Tabla 6: Especificación del objetivo OBJ-0004: Personalizar
> tratamiento paciente 3](#_bookmark10)
>
> [Tabla 7: Especificación del requisito de información IRQ-0001: Datos
> de usuario y](#_bookmark13) [roles 4](#_bookmark13)
>
> [Tabla 8: Especificación del requisito de información IRQ-0002:
> Telemetría de sesiones](#_bookmark14) [de rehabilitación
> 5](#_bookmark14)
>
> [Tabla 9: Especificación del requisito de información IRQ-0003:
> Configuración de](#_bookmark15) [límites y lesiones 6](#_bookmark15)
>
> [Tabla 10: Especificación del requisito de información IRQ-0004:
> Comunicación y](#_bookmark16) [consejos médicos 7](#_bookmark16)
>
> [Tabla 11: Especificación del requisito no funcional NFR-0001:
> Seguridad y privacidad](#_bookmark18) [de los datos médicos
> 8](#_bookmark18)
>
> [Tabla 12: Especificación del requisito no funcional NFR-0002:
> Eficiencia y tiempo real](#_bookmark19) [(*Biofeedback*)
> 8](#_bookmark19)
>
> [Tabla 13: Especificación del requisito no funcional NFR-0003:
> Usabilidad e interfaz de](#_bookmark20) [usuario 9](#_bookmark20)
>
> [Tabla 14: Especificación del requisito no funcional NFR-0004: Tiempo
> de aprendizaje](#_bookmark21)
>
> [. 10](#_bookmark21)
>
> [Tabla 15: Especificación del actor ACT-01: Paciente 10](#_bookmark24)
>
> [Tabla 16: Especificación del actor ACT-02: Doctor 11](#_bookmark25)
>
> [Tabla 17: Especificación del actor ACT-03: Muleta inteligente
> 11](#_bookmark26)
>
> [Tabla 18: Especificación del caso de uso UC-0001: Iniciar sesión
> 13](#_bookmark29)
>
> [Tabla 19: Especificación del caso de uso UC-0002: Cerrar sesión
> 14](#_bookmark30)
>
> [Tabla 20: Especificación del caso de uso UC-0004: Registrar Doctor
> 15](#_bookmark31)
>
> [Tabla 21: Especificación del caso de uso UC-0003: Registrar paciente
> 16](#_bookmark32)
>
> [Tabla 22: Especificación del caso de uso UC-0005: Listar pacientes
> 17](#_bookmark33)
>
> [Tabla 23: Especificación del caso de uso UC-0006: Editar paciente
> 18](#_bookmark34)
>
> [Tabla 24: Especificación del caso de uso UC-0007: Eliminar paciente
> 19](#_bookmark35)
>
> [Tabla 25: Especificación del caso de uso UC-0008: Ver perfil personal
> 20](#_bookmark36)
>
> [Tabla 26: Especificación del caso de uso UC-0009: Cambiar contraseña
> 21](#_bookmark37)
>
> [Tabla 27: Especificación del caso de uso UC-0010: Conectar muleta
> 23](#_bookmark39)
>
> [Tabla 28: Especificación del caso de uso UC-0011: Realizar sesión de
> rehabilitación . 24](#_bookmark40) [Tabla 29: Especificación del caso
> de uso UC-0012: Finalizar y guardar sesión 25](#_bookmark41)
>
> [Tabla 30: Especificación del caso de uso UC-0013: Consultar progreso
> diario 26](#_bookmark42)
>
> [Tabla 31: Especificación del caso de uso UC-0014: Consultar historial
> de sesiones 28](#_bookmark44)
>
> [Tabla 32: Especificación del caso de uso UC-0015: Configurar límites
> y objetivos 29](#_bookmark45)
>
> [Tabla 33: Especificación del caso de uso UC-0016: Crear lesión
> 30](#_bookmark46)
>
> [Tabla 34: Especificación del caso de uso UC-0017: Editar lesión
> 31](#_bookmark47)
>
> [Tabla 35: Especificación del caso de uso UC-0018: Eliminar lesión
> 31](#_bookmark48)
>
> [Tabla 36: Especificación del caso de uso UC-0019: Asignar lesión a
> paciente 32](#_bookmark49)
>
> [Tabla 37: Especificación del caso de uso UC-0020: Consultar catálogo
> de lesiones 33](#_bookmark50)
>
> [Tabla 38: Especificación del caso de uso UC-0021: Intercambio de
> mensajes (chat) 35](#_bookmark52)
>
> [Tabla 39: Especificación del caso de uso UC-0022: Crear consejo
> médico 35](#_bookmark53)
>
> [Tabla 40: Especificación del caso de uso UC-0023: Eliminar consejo
> 36](#_bookmark54)
>
> [Tabla 41: Especificación del caso de uso UC-0024: Consultar consejos
> (Paciente) 37](#_bookmark55)
>
> [Tabla 42: Especificación del caso de uso UC-0025: Listar consejos
> (Doctor) 38](#_bookmark56)

# Introducción

> En este anexo se expondrá la especificación de los requisitos del
> software del sistema desarrollado durante el desarrollo del trabajo de
> fin de grado "Load Crutches: Sistema de soporte en la recuperación de
> pacientes que requieren el uso de muletas.".
>
> Para la presentación de las tablas de requisitos de los casos de uso
> se ha utilizado como plantilla el estándar de la metodología de
> elicitación de requisitos establecida por Durán y Bernárdez para los
> sistemas software.
>
> En este documento se presentarán tres tipos de requisitos:

- **Requisitos funcionales:** indican funcionalidades o capacidades que
  el sistema pueda llevar a cabo. Para identificar estos requisitos se
  utilizará un modelo basado en casos de uso.

- **Requisitos de información:** indican aquellas entidades cuya
  información debe ser almacenada por el sistema.

- **Requisitos no funcionales:** indican las restricciones o
  expectativas no funcionales que se imponen en el funcionamiento del
  sistema.

# Lista de usuarios participantes

> Tabla 1: Participante -- Víctor Martín Fuentes

  ------------------------------------------------------------------
  **Participante**   **Víctor Martín Fuentes**
  ------------------ -----------------------------------------------
  **Organización**   Universidad de Salamanca

  **Rol**            Desarrollador, usuario

  **Es               Sí
  desarrollador**    

  **Es cliente**     Sí

  **Es usuario**     Sí

  **Comentarios**    Ninguno
  ------------------------------------------------------------------

> []{#_bookmark5 .anchor}Tabla 2: Participante - Pablo Chamoso Santos

  ------------------------------------------------------------------
  **Participante**   **Pablo Chamoso Santos**
  ------------------ -----------------------------------------------
  **Organización**   Universidad de Salamanca

  **Rol**            Tutor

  **Es               No
  desarrollador**    

  **Es cliente**     Sí

  **Es usuario**     Sí

  **Comentarios**    Ninguno
  ------------------------------------------------------------------

# Objetivos del proyecto

> A continuación, se describirán los objetivos que se han establecido e
> identificado para ser obtenidos en el desarrollo del proyecto,
> definidos a partir de las tareas que se pretenden realizar en el
> desarrollo del proyecto, previamente a la definición de los
> requisitos.
>
> []{#_bookmark7 .anchor}Tabla 3: Especificación del objetivo OBJ-0001:
> Gestionar usuarios y seguridad

+------------------+--------------------------------------------------+
| **OBJ-0001**     | **Gestionar usuarios y seguridad**               |
+==================+==================================================+
| **Versión**      | 1.0 (10/09/2025)                                 |
+------------------+--------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                            |
+------------------+--------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                           |
+------------------+--------------------------------------------------+
| **Descripción**  | El sistema debe proporcionar una plataforma      |
|                  | segura para la gestión de dos roles              |
|                  | diferenciados: doctores y pacientes. Debe        |
|                  | permitir el registro y validación de             |
|                  | profesionales médicos, así como la creación de   |
|                  | cuentas de pacientes gestionadas por dichos      |
|                  | profesionales. El acceso debe estar protegido    |
|                  | mediante autenticación basada en tokens          |
|                  |                                                  |
|                  | y las contraseñas deben almacenarse encriptadas, |
|                  | garantizando la privacidad de los datos médicos  |
|                  | sensibles.                                       |
+------------------+--------------------------------------------------+
| **Subobjetivos** | Ninguno                                          |
+------------------+--------------------------------------------------+
| **Importancia**  | Vital                                            |
+------------------+--------------------------------------------------+
| **Estado**       | En construcción                                  |
+------------------+--------------------------------------------------+
| **Estabilidad**  | Alta                                             |
+------------------+--------------------------------------------------+
| **Comentarios**  | Ninguno                                          |
+------------------+--------------------------------------------------+

> []{#_bookmark8 .anchor}Tabla 4: Especificación del objetivo OBJ-0002:
> Integración de muleta inteligente y gestionar monitorización biomédica

+-----------------+--------------------------------------------------+
| **OBJ-0002**    | **Integrar muleta inteligente y gestionar        |
|                 | monitorización biomédica**                       |
+=================+==================================================+
| **Versión**     | 1.0 (10/09/2025)                                 |
+-----------------+--------------------------------------------------+
| **Autores**     | Víctor Martín Fuentes                            |
+-----------------+--------------------------------------------------+
| **Fuentes**     | A. Durán, B. Bernárdez                           |
+-----------------+--------------------------------------------------+
| **Descripción** | Implementar la comunicación vía bluetooth con    |
|                 | una muleta inteligente instrumentada, capaz de   |
|                 | actuar como sensor biomecánico. El sistema debe  |
|                 | capturar, procesar y transmitir en tiempo real   |
|                 | dos métricas fundamentales para la               |
|                 | rehabilitación:                                  |
|                 |                                                  |
|                 | > 1\. Carga soportada (Peso): Medición precisa   |
|                 | > de la fuerza ejercida sobre la muleta en cada  |
|                 | > apoyo.                                         |
+-----------------+--------------------------------------------------+

+------------------+--------------------------------------------------+
|                  | > 2\. Cadencia (Pasos): Conteo exacto de los     |
|                  | > pasos realizados durante cada sesión.          |
+==================+==================================================+
| **Subobjetivos** | Ninguno                                          |
+------------------+--------------------------------------------------+
| **Importancia**  | Vital                                            |
+------------------+--------------------------------------------------+
| **Estado**       | En construcción                                  |
+------------------+--------------------------------------------------+
| **Estabilidad**  | Alta                                             |
+------------------+--------------------------------------------------+
| **Comentarios**  | Ninguno                                          |
+------------------+--------------------------------------------------+

> []{#_bookmark9 .anchor}Tabla 5: Especificación del objetivo OBJ-0003:
> Definir trazabilidad clínica y visual de progreso

+------------------+--------------------------------------------------+
| **OBJ-0003**     | **Definir trazabilidad clínica y visual de       |
|                  | rehabilitación**                                 |
+==================+==================================================+
| **Versión**      | 1.0 (10/09/2025)                                 |
+------------------+--------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                            |
+------------------+--------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                           |
+------------------+--------------------------------------------------+
| **Descripción**  | Proveer al personal médico de un *dashboard* que |
|                  | permita visualizar la evolución de la            |
|                  | rehabilitación basándose en la telemetría        |
|                  | enviada por la muleta inteligente. El sistema    |
|                  | debe transformar los datos brutos de peso y      |
|                  | pasos en gráficas de evolución temporal,         |
|                  | permitiendo al doctor evaluar si el paciente     |
|                  | está cumpliendo los                              |
|                  |                                                  |
|                  | objetivos de carga progresiva y detectar         |
|                  | posibles estancamientos o riesgos de lesión por  |
|                  | sobrecarga.                                      |
+------------------+--------------------------------------------------+
| **Subobjetivos** | Ninguno                                          |
+------------------+--------------------------------------------------+
| **Importancia**  | Vital                                            |
+------------------+--------------------------------------------------+
| **Estado**       | En construcción                                  |
+------------------+--------------------------------------------------+
| **Estabilidad**  | Alta                                             |
+------------------+--------------------------------------------------+
| **Comentarios**  | Ninguno                                          |
+------------------+--------------------------------------------------+

> []{#_bookmark10 .anchor}Tabla 6: Especificación del objetivo OBJ-0004:
> Personalizar tratamiento paciente

  -----------------------------------------------------------------
  **OBJ-0004**   **Personalizar tratamiento paciente**
  -------------- --------------------------------------------------
  **Versión**    1.0 (10/09/2025)

  **Autores**    Víctor Martín Fuentes

  **Fuentes**    A. Durán, B. Bernárdez
  -----------------------------------------------------------------

+------------------+--------------------------------------------------+
| **Descripción**  | Facilitar la configuración remota de los         |
|                  | parámetros de la muleta inteligente desde la     |
|                  | consola del doctor. El sistema debe permitir al  |
|                  | médico establecer \"ventanas de carga\" (peso    |
|                  | mínimo y máximo permitido) y objetivos de pasos  |
|                  | diarios, los cuales se sincronizarán con la App  |
|                  | del paciente para ajustar el comportamiento del  |
|                  |                                                  |
|                  | *biofeedback* en tiempo real. Además, incluye un |
|                  | sistema de chat para el seguimiento cualitativo  |
|                  | y envío de consejos.                             |
+==================+==================================================+
| **Subobjetivos** | Ninguno                                          |
+------------------+--------------------------------------------------+
| **Importancia**  | Vital                                            |
+------------------+--------------------------------------------------+
| **Estado**       | En construcción                                  |
+------------------+--------------------------------------------------+
| **Estabilidad**  | Alta                                             |
+------------------+--------------------------------------------------+
| **Comentarios**  | Ninguno                                          |
+------------------+--------------------------------------------------+

# Catálogo de requisitos del sistema

> En este apartado se detallan los requisitos del sistema Load Crutches,
> clasificados según su naturaleza.

## Requisitos de información

> []{#_bookmark13 .anchor}Tabla 7: Especificación del requisito de
> información IRQ-0001: Datos de usuario y roles

+-----------------+--------------------------------------------------+
| **IRQ-0001**    | **Datos de usuario y roles**                     |
+=================+==================================================+
| **Versión**     | 1.0 (10/09/2025)                                 |
+-----------------+--------------------------------------------------+
| **Autores**     | Víctor Martín Fuentes                            |
+-----------------+--------------------------------------------------+
| **Fuentes**     | A. Durán, B. Bernárdez                           |
+-----------------+--------------------------------------------------+
| **Descripción** | El sistema debe almacenar la información         |
|                 | personal y de acceso de dos tipos de usuarios:   |
|                 | Doctores y pacientes.                            |
+-----------------+--------------------------------------------------+
| **Datos         | Comunes:                                         |
| específicos**   |                                                  |
|                 | 1.  ID de usuario                                |
|                 |                                                  |
|                 | 2.  Nombre de usuario                            |
|                 |                                                  |
|                 | 3.  Nombre                                       |
|                 |                                                  |
|                 | 4.  Apellidos                                    |
|                 |                                                  |
|                 | 5.  Email                                        |
|                 |                                                  |
|                 | 6.  Contraseña                                   |
|                 |                                                  |
|                 | 7.  Rol Específicos paciente:                    |
|                 |                                                  |
|                 |     1.  DNI                                      |
+-----------------+--------------------------------------------------+

+-----------------+--------------------------------------------------+
|                 | 2.  Fecha de nacimiento                          |
|                 |                                                  |
|                 | 3.  Altura                                       |
|                 |                                                  |
|                 | 4.  Peso inicial                                 |
|                 |                                                  |
|                 | 5.  Descripción                                  |
|                 |                                                  |
|                 | 6.  ID Doctor asignado                           |
+=================+==================================================+
| **Importancia** | Vital                                            |
+-----------------+--------------------------------------------------+
| **Estado**      | En construcción                                  |
+-----------------+--------------------------------------------------+
| **Estabilidad** | Alta                                             |
+-----------------+--------------------------------------------------+
| **Comentarios** | El registro de pacientes no es público, debe ser |
|                 | realizado exclusivamente por el doctor desde su  |
|                 | panel de gestión para garantizar la veracidad de |
|                 | la relación clínica. La contraseña se            |
|                 |                                                  |
|                 | almacena mediante un hash irreversible para      |
|                 | cumplir con la normativa de protección de datos. |
+-----------------+--------------------------------------------------+

> []{#_bookmark14 .anchor}Tabla 8: Especificación del requisito de
> información IRQ-0002: Telemetría de sesiones de rehabilitación

+-----------------+--------------------------------------------------+
| **IRQ-0002**    | **Telemetría de sesiones de rehabilitación**     |
+=================+==================================================+
| **Versión**     | 1.0 (10/09/2025)                                 |
+-----------------+--------------------------------------------------+
| **Autores**     | Víctor Martín Fuentes                            |
+-----------------+--------------------------------------------------+
| **Fuentes**     | A. Durán, B. Bernárdez                           |
+-----------------+--------------------------------------------------+
| **Descripción** | El sistema debe almacenar los datos generados en |
|                 | cada microsesión realizada y asignarlos a la     |
|                 | sesión diaria correspondiente.                   |
+-----------------+--------------------------------------------------+
| **Datos         | Sesión diaria:                                   |
| específicos**   |                                                  |
|                 | 1.  ID de sesión                                 |
|                 |                                                  |
|                 | 2.  ID paciente                                  |
|                 |                                                  |
|                 | 3.  Fecha de la sesión diaria                    |
|                 |                                                  |
|                 | 4.  Límite inferior de peso                      |
|                 |                                                  |
|                 | 5.  Límite superior de peso                      |
|                 |                                                  |
|                 | 6.  Número de pasos totales                      |
|                 |                                                  |
|                 | 7.  Carga media diaria Datos microsesión:        |
|                 |                                                  |
|                 | 8.  ID de sesión                                 |
|                 |                                                  |
|                 | 9.  *Timestamp*                                  |
|                 |                                                  |
|                 | 10. Carga media diaria                           |
+-----------------+--------------------------------------------------+

+-----------------+--------------------------------------------------+
|                 | > 11\. Número de pasos de la sesión              |
+=================+==================================================+
| **Importancia** | Vital                                            |
+-----------------+--------------------------------------------------+
| **Estado**      | En construcción                                  |
+-----------------+--------------------------------------------------+
| **Estabilidad** | Alta                                             |
+-----------------+--------------------------------------------------+
| **Comentarios** | El almacenamiento se estructura en dos niveles   |
|                 | para optimizar el rendimiento: Cada día tiene    |
|                 | una única sesión (sesión diaria), que tiene      |
|                 | registradas las medias de todas las              |
|                 | microsesiones que se han hecho ese día, cada     |
|                 | microsesión está asignada una sesión diaria y    |
|                 |                                                  |
|                 | contiene los datos específicos que se han hecho  |
|                 | en esa microsesión.                              |
+-----------------+--------------------------------------------------+

> []{#_bookmark15 .anchor}Tabla 9: Especificación del requisito de
> información IRQ-0003: Configuración de límites y lesiones

+-----------------+--------------------------------------------------+
| **IRQ-0003**    | **Configuración de límites y lesiones**          |
+=================+==================================================+
| **Versión**     | 1.0 (10/09/2025)                                 |
+-----------------+--------------------------------------------------+
| **Autores**     | Víctor Martín Fuentes                            |
+-----------------+--------------------------------------------------+
| **Fuentes**     | A. Durán, B. Bernárdez                           |
+-----------------+--------------------------------------------------+
| **Descripción** | El sistema debe registrar los límites asignados  |
|                 | a cada usuario y las lesiones que tiene el       |
|                 | usuario.                                         |
+-----------------+--------------------------------------------------+
| **Datos         | Límites de Peso:                                 |
| específicos**   |                                                  |
|                 | 1.  ID de límite                                 |
|                 |                                                  |
|                 | 2.  ID usuario                                   |
|                 |                                                  |
|                 | 3.  Peso mínimo                                  |
|                 |                                                  |
|                 | 4.  Peso máximo                                  |
|                 |                                                  |
|                 | 5.  *Timestamp*                                  |
|                 |                                                  |
|                 | Objetivos de pasos:                              |
|                 |                                                  |
|                 | 1.  ID de pasos                                  |
|                 |                                                  |
|                 | 2.  ID usuario                                   |
|                 |                                                  |
|                 | 3.  Límite de pasos                              |
|                 |                                                  |
|                 | 4.  *Timestamp*                                  |
|                 |                                                  |
|                 | Lesiones:                                        |
|                 |                                                  |
|                 | 1.  ID de lesión                                 |
|                 |                                                  |
|                 | 2.  Nombre de la lesión                          |
|                 |                                                  |
|                 | 3.  Descripción                                  |
+-----------------+--------------------------------------------------+

+-----------------+--------------------------------------------------+
|                 | 4.  ID doctor creador                            |
|                 |                                                  |
|                 | 5.  Fecha de asignación a paciente               |
+=================+==================================================+
| **Importancia** | Vital                                            |
+-----------------+--------------------------------------------------+
| **Estado**      | En construcción                                  |
+-----------------+--------------------------------------------------+
| **Estabilidad** | Alta                                             |
+-----------------+--------------------------------------------------+
| **Comentarios** | Los límites de peso y pasos se envían a la app   |
|                 | para configurar el                               |
|                 |                                                  |
|                 | *biofeedback*.                                   |
+-----------------+--------------------------------------------------+

> []{#_bookmark16 .anchor}Tabla 10: Especificación del requisito de
> información IRQ-0004: Comunicación y consejos médicos

+-----------------+--------------------------------------------------+
| **IRQ-0003**    | **Comunicación y consejos médicos**              |
+=================+==================================================+
| **Versión**     | 1.0 (10/09/2025)                                 |
+-----------------+--------------------------------------------------+
| **Autores**     | Víctor Martín Fuentes                            |
+-----------------+--------------------------------------------------+
| **Fuentes**     | A. Durán, B. Bernárdez                           |
+-----------------+--------------------------------------------------+
| **Descripción** | El sistema debe almacenar las recomendaciones    |
|                 | médicas específicas y el historial de mensajes   |
|                 | del chat entre doctores y                        |
|                 |                                                  |
|                 | pacientes.                                       |
+-----------------+--------------------------------------------------+
| **Datos         | Consejos médicos:                                |
| específicos**   |                                                  |
|                 | 1.  ID de consejo                                |
|                 |                                                  |
|                 | 2.  ID lesión asociada                           |
|                 |                                                  |
|                 | 3.  ID doctor                                    |
|                 |                                                  |
|                 | 4.  ID paciente                                  |
|                 |                                                  |
|                 | 5.  Título del consejo                           |
|                 |                                                  |
|                 | 6.  Descripción del consejo Mensajería:          |
|                 |                                                  |
|                 |     1.  ID de mensaje                            |
|                 |                                                  |
|                 |     2.  ID emisor                                |
|                 |                                                  |
|                 |     3.  ID receptor                              |
|                 |                                                  |
|                 |     4.  Contenido del mensaje                    |
|                 |                                                  |
|                 |     5.  *Timestamp*                              |
+-----------------+--------------------------------------------------+

+-----------------+--------------------------------------------------+
|                 | > 6\. Leído                                      |
+=================+==================================================+
| **Importancia** | Vital                                            |
+-----------------+--------------------------------------------------+
| **Estado**      | En construcción                                  |
+-----------------+--------------------------------------------------+
| **Estabilidad** | Alta                                             |
+-----------------+--------------------------------------------------+
| **Comentarios** | La mensajería requiere baja latencia para la     |
|                 | comunicación en tiempo real.                     |
+-----------------+--------------------------------------------------+

## Requisitos no funcionales

> []{#_bookmark18 .anchor}Tabla 11: Especificación del requisito no
> funcional NFR-0001: Seguridad y privacidad de los datos médicos

+-------------------+---------------------------------------------------+
| **NFR-0001**      | **Seguridad y privacidad de los datos médicos**   |
+===================+===================================================+
| **Versión**       | 1.0 (10/09/2025)                                  |
+-------------------+---------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                             |
+-------------------+---------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                            |
+-------------------+---------------------------------------------------+
| **Descripción**   | El sistema debe garantizar la confidencialidad e  |
|                   | integridad de la información médica sensible      |
|                   | transmitida y almacenada.                         |
+-------------------+---------------------------------------------------+
| **Restricciones** | 1.  Autenticación: Todo acceso a la API debe      |
|                   |     validarse mediante tokens con tiempo de       |
|                   |     expiración.                                   |
|                   |                                                   |
|                   | 2.  Almacenamiento: Las contraseñas no deben      |
|                   |     guardarse en texto plano, sino hasheadas.     |
|                   |                                                   |
|                   | 3.  Aislamiento: Un paciente solo puede acceder a |
|                   |     sus propios datos; un doctor solo puede       |
|                   |     acceder a los pacientes que tiene asignados.  |
+-------------------+---------------------------------------------------+
| **Importancia**   | Alta                                              |
+-------------------+---------------------------------------------------+
| **Estado**        | En construcción                                   |
+-------------------+---------------------------------------------------+
| **Estabilidad**   | Alta                                              |
+-------------------+---------------------------------------------------+
| **Comentarios**   | Es fundamental para cumplir con los estándares    |
|                   | éticos de aplicaciones de la salud.               |
+-------------------+---------------------------------------------------+

> []{#_bookmark19 .anchor}Tabla 12: Especificación del requisito no
> funcional NFR-0002: Eficiencia y tiempo real (*Biofeedback*)

  ------------------------------------------------------------------
  **NFR-0002**   **Eficiencia y tiempo real (*Biofeedback*)**
  -------------- ---------------------------------------------------
  **Versión**    1.0 (10/09/2025)

  **Autores**    Víctor Martín Fuentes
  ------------------------------------------------------------------

+-------------------+---------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                            |
+===================+===================================================+
| **Descripción**   | El sistema debe procesar los datos de la muleta   |
|                   | con una latencia mínima para que el visual sea    |
|                   | útil durante la sesión de rehabilitación.         |
+-------------------+---------------------------------------------------+
| **Restricciones** | 1.  Latencia bluetooth: La transmisión entre la   |
|                   |     muleta y la app debe tener una buena          |
|                   |     latencia.                                     |
|                   |                                                   |
|                   | 2.  Comunicación web: El chat entre doctor y      |
|                   |     paciente debe utilizar un sistema para        |
|                   |     garantizar la entrega inmediata de mensajes   |
|                   |     sin necesidad de recargar la página.          |
+-------------------+---------------------------------------------------+
| **Importancia**   | Alta                                              |
+-------------------+---------------------------------------------------+
| **Estado**        | En construcción                                   |
+-------------------+---------------------------------------------------+
| **Estabilidad**   | Alta                                              |
+-------------------+---------------------------------------------------+
| **Comentarios**   | Ninguno                                           |
+-------------------+---------------------------------------------------+

> []{#_bookmark20 .anchor}Tabla 13: Especificación del requisito no
> funcional NFR-0003: Usabilidad e interfaz de usuario

+-------------------+---------------------------------------------------+
| **NFR-0003**      | **Usabilidad e interfaz de usuario**              |
+===================+===================================================+
| **Versión**       | 1.0 (10/09/2025)                                  |
+-------------------+---------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                             |
+-------------------+---------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                            |
+-------------------+---------------------------------------------------+
| **Descripción**   | Las interfaces deben estar adaptadas al contexto  |
|                   | de uso: movimiento para el paciente y análisis    |
|                   | detallado para el doctor.                         |
+-------------------+---------------------------------------------------+
| **Restricciones** | 1.  App Móvil (Paciente): Durante la sesión de    |
|                   |     rehabilitación, la interfaz debe priorizar    |
|                   |     elementos visuales grandes y códigos de color |
|                   |     legibles.                                     |
|                   |                                                   |
|                   | 2.  Web (Doctor): El *dashboard* debe ser         |
|                   |     responsive y utilizar librerías de            |
|                   |     visualización de datos.                       |
+-------------------+---------------------------------------------------+
| **Importancia**   | Alta                                              |
+-------------------+---------------------------------------------------+
| **Estado**        | En construcción                                   |
+-------------------+---------------------------------------------------+
| **Estabilidad**   | Alta                                              |
+-------------------+---------------------------------------------------+
| **Comentarios**   | La interfaz móvil debe minimizar la carga         |
|                   | cognitiva del paciente mientras para que pueda    |
|                   | consultar rápidamente si está cargando el peso    |
|                   | que debe en cada paso.                            |
+-------------------+---------------------------------------------------+

> []{#_bookmark21 .anchor}Tabla 14: Especificación del requisito no
> funcional NFR-0004: Tiempo de aprendizaje

+-------------------+---------------------------------------------------+
| **NFR-0004**      | **Disponibilidad y conectividad de hardware**     |
+===================+===================================================+
| **Versión**       | 1.0 (10/09/2025)                                  |
+-------------------+---------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                             |
+-------------------+---------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                            |
+-------------------+---------------------------------------------------+
| **Descripción**   | El sistema debe ser robusto frente a              |
|                   | desconexiones y capaz de recuperar el estado      |
|                   | operativo.                                        |
+-------------------+---------------------------------------------------+
| **Restricciones** | > 1\. La app debe ser capaz de detectar la        |
|                   | > pérdida de conexión con la muleta.              |
+-------------------+---------------------------------------------------+
| **Importancia**   | Media                                             |
+-------------------+---------------------------------------------------+
| **Estado**        | En construcción                                   |
+-------------------+---------------------------------------------------+
| **Estabilidad**   | Alta                                              |
+-------------------+---------------------------------------------------+
| **Comentarios**   | Ninguno                                           |
+-------------------+---------------------------------------------------+

## Requisitos funcionales

> En esta sección se describen los servicios que el sistema debe
> proporcionar, cómo debe reaccionar a entradas particulares y cómo debe
> comportarse ante situaciones específicas.

1.  []{#_bookmark23 .anchor}Diagramas de actores

> []{#_bookmark24 .anchor}Tabla 15: Especificación del actor ACT-01:
> Paciente

+-----------------------+------------------------------------------------+
| **ACT-01**            | **Paciente**                                   |
+=======================+================================================+
| **Versión**           | 1.0 (10/09/2025)                               |
+-----------------------+------------------------------------------------+
| **Autores**           | Víctor Martín Fuentes                          |
+-----------------------+------------------------------------------------+
| **Fuentes**           | A. Durán, B. Bernárdez                         |
+-----------------------+------------------------------------------------+
| **Descripción**       | Usuario final que sufre una o varias           |
|                       | patologías en el tren inferior. Utiliza la     |
|                       | aplicación móvil iOS y la muleta inteligente.  |
+-----------------------+------------------------------------------------+
| **Responsabilidades** | 1.  Realizar las sesiones de rehabilitación.   |
|                       |                                                |
|                       | 2.  Conectar la muleta vía bluetooth.          |
|                       |                                                |
|                       | 3.  Visualizar su progreso y ajustar su marcha |
|                       |     según el feedback.                         |
|                       |                                                |
|                       | 4.  Comunicarse con el doctor vía chat.        |
+-----------------------+------------------------------------------------+
| **Comentarios**       | Ninguno                                        |
+-----------------------+------------------------------------------------+

[]{#_bookmark25 .anchor}Tabla 16: Especificación del actor ACT-02:
Doctor

+-----------------------+------------------------------------------------+
| **ACT-02**            | **Doctor**                                     |
+=======================+================================================+
| **Versión**           | 1.0 (10/09/2025)                               |
+-----------------------+------------------------------------------------+
| **Autores**           | Víctor Martín Fuentes                          |
+-----------------------+------------------------------------------------+
| **Fuentes**           | A. Durán, B. Bernárdez                         |
+-----------------------+------------------------------------------------+
| **Descripción**       | Profesional sanitario encargado de supervisar  |
|                       | la recuperación de sus pacientes. Utiliza la   |
|                       | plataforma web.                                |
+-----------------------+------------------------------------------------+
| **Responsabilidades** | 1.  Dar de alta a los pacientes en el sistema. |
|                       |                                                |
|                       | 2.  Configurar los parámetros de la muleta.    |
|                       |                                                |
|                       | 3.  Analizar las gráficas de evolución         |
|                       |                                                |
|                       | 4.  Enviar consejos y mensajes de seguimiento. |
+-----------------------+------------------------------------------------+
| **Comentarios**       | Ninguno                                        |
+-----------------------+------------------------------------------------+

> []{#_bookmark26 .anchor}Tabla 17: Especificación del actor ACT-03:
> Muleta inteligente

+-----------------+----------------------------------------------------+
| **ACT-03**      | **Muleta inteligente**                             |
+=================+====================================================+
| **Versión**     | 1.0 (10/09/2025)                                   |
+-----------------+----------------------------------------------------+
| **Autores**     | Víctor Martín Fuentes                              |
+-----------------+----------------------------------------------------+
| **Fuentes**     | A. Durán, B. Bernárdez                             |
+-----------------+----------------------------------------------------+
| **Descripción** | Dispositivo hardware externo (*IoT*) que actúa     |
|                 | como fuente de datos.                              |
+-----------------+----------------------------------------------------+
| **Responsabili  | 1.  Medir la fuerza aplicada en cada paso.         |
| dades**         |                                                    |
|                 | 2.  Transmitir la trama de datos vía bluetooth a   |
|                 |     la app.                                        |
+-----------------+----------------------------------------------------+
| **Comentarios** | Ninguno                                            |
+-----------------+----------------------------------------------------+

1.  []{#_bookmark27 .anchor}Diagramas de casos de uso

> A continuación, se enumeran los casos de uso del sistema agrupados por
> paquetes funcionales.
>
> ![](media/image2.png){width="3.701035651793526in"
> height="2.854478346456693in"}
>
> Ilustración 1: Diagrama de casos de uso completo del sistema

1.  []{#_bookmark28 .anchor}Gestión de acceso

![](media/image3.png){width="2.3605107174103237in" height="4.80375in"}

> Ilustración 2: Diagrama de casos de uso del paquete \"Gestión de
> acceso\"
>
> []{#_bookmark29 .anchor}Tabla 18: Especificación del caso de uso
> UC-0001: Iniciar sesión

+-------------------+------------------------------------------------------------------------+
| **UC-0001**       | **Iniciar sesión**                                                     |
+===================+===========================+============================================+
| **Versión**       | 1.0 (10/09/2025)                                                       |
+-------------------+------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                  |
+-------------------+------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                 |
+-------------------+------------------------------------------------------------------------+
| **Dependencias**  | OBJ-0001 Gestión Integral de Usuarios IRQ-0001 Datos de Usuarios y     |
|                   | Roles                                                                  |
|                   |                                                                        |
|                   | NFR-0001 Seguridad y Privacidad NFR-0003 Usabilidad e Interfaz         |
|                   |                                                                        |
|                   | NFR-0004 Escalabilidad (Concurrencia)                                  |
+-------------------+------------------------------------------------------------------------+
| **Descripción**   | El sistema debe validar las credenciales del usuario, generar un       |
|                   |                                                                        |
|                   | token de seguridad y redirigirlo a la interfaz correspondiente según   |
|                   | su rol (el panel web para doctores o app móvil para pacientes).        |
+-------------------+------------------------------------------------------------------------+
| **Precondición**  | El usuario debe estar registrado en la base de datos (tabla de         |
|                   | usuarios).                                                             |
+-------------------+---------------------------+--------------------------------------------+
| **Secuencia       | **Paso**                  | > **Acción**                               |
| normal**          |                           |                                            |
|                   +---------------------------+--------------------------------------------+
|                   | 1                         | > Un usuario anónimo accede a la pantalla  |
|                   |                           | > de login (web o app).                    |
|                   +---------------------------+--------------------------------------------+
|                   | 2                         | > El usuario introduce su email y          |
|                   |                           | > contraseña.                              |
|                   +---------------------------+--------------------------------------------+
|                   | 3                         | > El sistema verifica las credenciales     |
|                   |                           | > contra la tabla de usuarios              |
|                   |                           | > (desencriptando el hash).                |
|                   +---------------------------+--------------------------------------------+
|                   | 4                         | > El sistema identifica el rol (doctor o   |
|                   |                           | > paciente).                               |
|                   +---------------------------+--------------------------------------------+
|                   | 5                         | > El sistema genera y devuelve un token.   |
|                   +---------------------------+--------------------------------------------+
|                   | 6                         | > El cliente almacena el token y redirige  |
|                   |                           | > al *dashboard* (si es doctor) o a home   |
|                   |                           | > (si es paciente).                        |
+-------------------+---------------------------+--------------------------------------------+
| **Postcondición** | El usuario dispone de un Token válido almacenado en el cliente para    |
|                   | realizar peticiones autorizadas.                                       |
+-------------------+---------------------------+--------------------------------------------+
| **Excepciones**   | **Paso**                  | > **Acción**                               |
|                   +---------------------------+--------------------------------------------+
|                   | 3                         | > Si el email no existe o la contraseña es |
|                   |                           | > incorrecta, el sistema devuelve un error |
|                   |                           | > 401 y muestra \"Credenciales             |
|                   |                           | >                                          |
|                   |                           | > inválidas\".                             |
|                   +---------------------------+--------------------------------------------+
|                   | 3                         | > Si hay un error de conexión con la base  |
|                   |                           | > de datos, el sistema notifica \"Error    |
|                   |                           | > del servidor\".                          |
+-------------------+---------------------------+--------------------------------------------+
| **Importancia**   | Importante                                                             |
+-------------------+------------------------------------------------------------------------+
| **Estado**        | En construcción                                                        |
+-------------------+------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                   |
+-------------------+------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Comentarios**   Ninguno
  ----------------- ---------------------------------------------------

  ---------------------------------------------------------------------

[]{#_bookmark30 .anchor}Tabla 19: Especificación del caso de uso
UC-0002: Cerrar sesión

+-------------------+------------------------------------------------------------------------+
| **UC-0002**       | **Cerrar sesión**                                                      |
+===================+===========================+============================================+
| **Versión**       | 1.0 (10/09/2025)                                                       |
+-------------------+------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                  |
+-------------------+------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                 |
+-------------------+------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Login                                                          |
|                   |                                                                        |
|                   | NFR-0001 Seguridad y Privacidad                                        |
+-------------------+------------------------------------------------------------------------+
| **Descripción**   | El sistema debe permitir al usuario finalizar su sesión activa de      |
|                   | manera segura, eliminando las credenciales de acceso almacenadas       |
|                   | localmente para impedir el uso no autorizado de la cuenta en el        |
|                   |                                                                        |
|                   | dispositivo.                                                           |
+-------------------+------------------------------------------------------------------------+
| **Precondición**  | El usuario debe haber iniciado sesión previamente y disponer de un     |
|                   | token válido almacenado en el dispositivo.                             |
+-------------------+---------------------------+--------------------------------------------+
| **Secuencia       | > **Paso**                | **Acción**                                 |
| normal**          |                           |                                            |
|                   +---------------------------+--------------------------------------------+
|                   | 1                         | El usuario selecciona la opción \"Cerrar   |
|                   |                           | sesión\" en el menú de perfil.             |
|                   +---------------------------+--------------------------------------------+
|                   | 2                         | El sistema solicita confirmación (opcional |
|                   |                           | según interfaz).                           |
|                   +---------------------------+--------------------------------------------+
|                   | 3                         | El sistema elimina el token del            |
|                   |                           | almacenamiento local.                      |
|                   +---------------------------+--------------------------------------------+
|                   | 4                         | El sistema elimina cualquier dato de       |
|                   |                           | estado temporal (datos de usuario,         |
|                   |                           | gráficas en caché).                        |
|                   +---------------------------+--------------------------------------------+
|                   | 5                         | El sistema redirige al usuario a la        |
|                   |                           | pantalla de inicio de sesión pública.      |
+-------------------+---------------------------+--------------------------------------------+
| **Postcondición** | El dispositivo cliente ya no posee el token de acceso. Cualquier       |
|                   | intento de navegación a rutas protegidas será rechazado.               |
+-------------------+---------------------------+--------------------------------------------+
| **Excepciones**   | **Paso**                  | > **Acción**                               |
|                   +---------------------------+--------------------------------------------+
|                   | 1                         | > Si el token ya había expirado antes de   |
|                   |                           | > pulsar el botón, el                      |
|                   |                           | >                                          |
|                   |                           | > sistema realiza la limpieza (pasos 3-5)  |
|                   |                           | > igualmente para asegurar que la interfaz |
|                   |                           | > vuelve al estado inicial.                |
+-------------------+---------------------------+--------------------------------------------+
| **Importancia**   | Media                                                                  |
+-------------------+------------------------------------------------------------------------+
| **Urgencia**      |                                                                        |
+-------------------+------------------------------------------------------------------------+
| **Estado**        | En construcción                                                        |
+-------------------+------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                   |
+-------------------+------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Comentarios**   Dado que la autenticación es vía token, el cierre
                    de sesión no requiere necesariamente una petición
                    al *backend*, sino la destrucción segura del token
                    en el cliente.
  ----------------- ---------------------------------------------------

  ---------------------------------------------------------------------

[]{#_bookmark31 .anchor}Tabla 20: Especificación del caso de uso
UC-0004: Registrar Doctor

+-------------------+-------------------------------------------------------------------------+
| **UC-0003**       | **Registrar Doctor**                                                    |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | OBJ-0001 Gestión Integral de Usuarios IRQ-0001 Datos de Usuarios y      |
|                   | Roles                                                                   |
|                   |                                                                         |
|                   | NFR-0001 Seguridad (Encriptación contraseña)                            |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | El sistema debe permitir el registro de nuevos profesionales médicos en |
|                   | la plataforma web. El sistema recogerá sus datos personales y           |
|                   | profesionales, validará la unicidad del correo electrónico y generará   |
|                   |                                                                         |
|                   | las credenciales de acceso seguro.                                      |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El usuario debe poseer un código de doctor, el cual debe ser            |
|                   | proporcionado por la administración.                                    |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | Un usuario anónimo accede a la web y        |
|                   |                           | selecciona la opción de registrarse.        |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema muestra el formulario de alta.   |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El usuario introduce sus datos (nombre,     |
|                   |                           | email, contraseña...) y el código de        |
|                   |                           | doctor.                                     |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El usuario pulsa \"Crear cuenta\".          |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema valida que el código de doctor   |
|                   |                           | sea correcto y esté activo.                 |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema valida que el email no exista    |
|                   |                           | ya.                                         |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema encripta la contraseña y crea el |
|                   |                           | registro en la base de datos.               |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema confirma el registro y redirige  |
|                   |                           | al login.                                   |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Se ha creado una nueva cuenta de doctor activa.                         |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | Si el email ya existe, se notifica al       |
|                   |                           | usuario.                                    |
+-------------------+---------------------------+---------------------------------------------+

+-----------------+---------------------------+---------------------------------------------+
|                 | 4                         | Si el código de doctor es incorrecto, el    |
|                 |                           | sistema muestra el                          |
|                 |                           |                                             |
|                 |                           | error \"Código de autorización no válido\"  |
|                 |                           | y bloquea el registro.                      |
+=================+===========================+=============================================+
| **Importancia** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Estado**      | En construcción                                                         |
+-----------------+-------------------------------------------------------------------------+
| **Estabilidad** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Comentarios** | El código de doctor actúa como una llave maestra de seguridad para      |
|                 | evitar registros masivos o de personas ajenas a la organización médica. |
+-----------------+-------------------------------------------------------------------------+

> []{#_bookmark32 .anchor}Tabla 21: Especificación del caso de uso
> UC-0003: Registrar paciente

+------------------+-------------------------------------------------------------------------+
| **UC-0004**      | **Registrar paciente**                                                  |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (10/09/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                                                  |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | CU-01 Iniciar Sesión (doctor)                                           |
|                  |                                                                         |
|                  | IRQ-0001 Datos de usuarios y roles                                      |
|                  |                                                                         |
|                  | NFR-0001 Seguridad (encriptación contraseña)                            |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | El sistema debe permitir al usuario con rol de doctor dar de alta a un  |
|                  | nuevo paciente en la plataforma, creando sus credenciales de acceso y   |
|                  | su perfil clínico básico (altura, peso, edad) necesario para los        |
|                  |                                                                         |
|                  | cálculos de la muleta.                                                  |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El doctor debe haber iniciado sesión correctamente en el panel web.     |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El doctor selecciona la opción \"Nuevo      |
|                  |                           | paciente\" en el                            |
|                  |                           |                                             |
|                  |                           | *dashboard*.                                |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El sistema muestra un formulario de         |
|                  |                           | registro.                                   |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El doctor introduce los datos personales    |
|                  |                           | (nombre, email, DNI) y clínicos (altura,    |
|                  |                           | peso inicial, edad y descripción).          |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El doctor asigna una contraseña que se      |
|                  |                           | genera automáticamente.                     |
|                  +---------------------------+---------------------------------------------+
|                  | 5                         | El doctor pulsa \"Guardar\".                |
|                  +---------------------------+---------------------------------------------+
|                  | 6                         | El sistema valida que el email no esté ya   |
|                  |                           | registrado en la base de datos.             |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 7                         | El sistema crea el registro en la tabla de  |
|                   |                           | usuario, la relación y asigna el ID del     |
|                   |                           | doctor actual como supervisor.              |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema manda al paciente un correo      |
|                   |                           | electrónico a la dirección registrada con   |
|                   |                           | las credenciales del paciente.              |
|                   +---------------------------+---------------------------------------------+
|                   | 9                         | El sistema confirma el registro exitoso y   |
|                   |                           | muestra al nuevo paciente en el listado.    |
+===================+===========================+=============================================+
| **Postcondición** | Existe un nuevo registro en la base de datos con rol paciente y las     |
|                   | credenciales están activas para usar en la App móvil.                   |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | Si el email ya existe en el sistema, se     |
|                   |                           | muestra el error \"El usuario ya está       |
|                   |                           | registrado\" y no se guarda nada.           |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Ninguno                                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark33 .anchor}Tabla 22: Especificación del caso de uso
> UC-0005: Listar pacientes

+-------------------+-------------------------------------------------------------------------+
| **UC-0005**       | **Listar pacientes**                                                    |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Iniciar sesión (doctor) IRQ-0001 Datos de Usuarios              |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | El sistema debe mostrar al doctor un listado de todos los pacientes que |
|                   | tiene asignados bajo su supervisión, permitiendo visualizar sus datos   |
|                   |                                                                         |
|                   | principales y acceder a las opciones de gestión (editar, eliminar, ver  |
|                   | gráficas).                                                              |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor debe haber iniciado sesión correctamente.                     |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor accede a la sección \"Pacientes\" |
|                   |                           | en el menú principal.                       |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema consulta la base de datos        |
|                   |                           | filtrando los usuarios con rol de paciente  |
|                   |                           | asignados a este doctor.                    |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra una tabla con los        |
|                   |                           | resultados (nombre, email, DNI\...).        |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El doctor visualiza la lista actualizada de sus pacientes.              |
+-------------------+-------------------------------------------------------------------------+

+-----------------+---------------------------+---------------------------------------------+
| **Excepciones** | **Paso**                  | **Acción**                                  |
|                 +---------------------------+---------------------------------------------+
|                 | 2                         | Si el doctor no tiene pacientes asignados,  |
|                 |                           | el sistema muestra el mensaje \"No hay      |
|                 |                           | pacientes registrados\".                    |
+=================+===========================+=============================================+
| **Importancia** | Media                                                                   |
+-----------------+-------------------------------------------------------------------------+
| **Estado**      | En construcción                                                         |
+-----------------+-------------------------------------------------------------------------+
| **Estabilidad** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Comentarios** | Esta vista actúa como el punto de entrada para los casos de uso de      |
|                 | Editar y Eliminar.                                                      |
+-----------------+-------------------------------------------------------------------------+

> []{#_bookmark34 .anchor}Tabla 23: Especificación del caso de uso
> UC-0006: Editar paciente

+-------------------+-------------------------------------------------------------------------+
| **UC-0006**       | **Editar paciente**                                                     |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0005 Listar Pacientes IRQ-0001 Datos de Usuarios                     |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor modificar los datos físicos del paciente tras el      |
|                   |                                                                         |
|                   | registro inicial, en caso de cambios en la morfología del paciente      |
|                   | (cambio de peso, altura...) que afecten a la rehabilitación.            |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El Doctor debe estar "logueado" y haber seleccionado un paciente de la  |
|                   | lista.                                                                  |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor selecciona la opción \"Editar\"   |
|                   |                           | en la fila del paciente correspondiente.    |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema carga los datos actuales del     |
|                   |                           | paciente en un formulario.                  |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor modifica los campos necesarios    |
|                   |                           | (límites de peso y límites de pasos).       |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor pulsa \"Guardar cambios\".        |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema valida el formato de los datos.  |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema actualiza el registro en la base |
|                   |                           | de datos.                                   |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema notifica \"Paciente actualizado  |
|                   |                           | correctamente\".                            |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Los datos del paciente quedan actualizados persistentemente.            |
+-------------------+-------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Importancia**   Media
  ----------------- ---------------------------------------------------
  **Estado**        En construcción

  **Estabilidad**   Alta

  **Comentarios**   El doctor no puede modificar la contraseña del
                    paciente, el paciente debe hacerlo desde su propio
                    perfil.
  ---------------------------------------------------------------------

> []{#_bookmark35 .anchor}Tabla 24: Especificación del caso de uso
> UC-0007: Eliminar paciente

+-------------------+-------------------------------------------------------------------------+
| **UC-0007**       | **Eliminar paciente**                                                   |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0005 Listar Pacientes NFR-0001 Seguridad                             |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al Doctor eliminar definitivamente a un paciente del sistema.   |
|                   | Esta acción elimina también todo su historial clínico, sesiones,        |
|                   |                                                                         |
|                   | mensajes de chat y configuraciones asociadas (borrado en cascada).      |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El Doctor debe estar logueado y tener permisos sobre el paciente        |
|                   | seleccionado.                                                           |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor pulsa el botón \"Eliminar\" sobre |
|                   |                           | un paciente en el listado.                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema muestra un modal de advertencia  |
|                   |                           | solicitando confirmación.                   |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor confirma la eliminación.          |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema verifica la pertenencia del      |
|                   |                           | paciente al doctor.                         |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema ejecuta el borrado del usuario y |
|                   |                           | todos sus datos relacionados.               |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema actualiza la lista visualmente,  |
|                   |                           | eliminando la fila del paciente.            |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El usuario paciente deja de existir en el sistema y no podrá volver a   |
|                   | iniciar sesión.                                                         |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Si hay un error de integridad referencial o |
|                   |                           | de red, el sistema muestra \"No se pudo     |
|                   |                           | eliminar al paciente\".                     |
+-------------------+---------------------------+---------------------------------------------+

  ---------------------------------------------------------------------
  **Importancia**   Media
  ----------------- ---------------------------------------------------
  **Estado**        En construcción

  **Estabilidad**   Alta

  **Comentarios**   Se debe borrar en cascada en la base de datos para
                    asegurar que no quedan registros huérfanos
                    (sesiones sin usuario).
  ---------------------------------------------------------------------

> []{#_bookmark36 .anchor}Tabla 25: Especificación del caso de uso
> UC-0008: Ver perfil personal

+-------------------+-------------------------------------------------------------------------+
| **UC-0008**       | **Ver perfil personal**                                                 |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Inicio sesión (paciente) IRQ-0001 Datos de Usuarios             |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | El sistema debe permitir al usuario con rol de Paciente consultar su    |
|                   | ficha personal y clínica almacenada en el servidor. Esta vista es de    |
|                   |                                                                         |
|                   | solo lectura y sirve para que el paciente verifique sus datos           |
|                   | antropométricos que influyen en la rehabilitación.                      |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El Paciente debe haber iniciado sesión en la app móvil.                 |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El paciente accede a la pestaña \"Perfil\"  |
|                   |                           | en la app.                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema realiza una petición GET al      |
|                   |                           | endpoint de usuario.                        |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El *backend* devuelve los datos del         |
|                   |                           | paciente.                                   |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | 1.  El sistema renderiza en pantalla:       |
|                   |                           |                                             |
|                   |                           | > Datos personales: nombre, apellidos,      |
|                   |                           | > email, fecha de nacimiento, género y DNI. |
|                   |                           |                                             |
|                   |                           | 2.  Datos clínicos: Peso, altura y          |
|                   |                           |     descripción de la patología.            |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El paciente visualiza la información.       |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Ninguna                                                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | Si el servidor no devuelve los datos, el    |
|                   |                           | perfil no cargará.                          |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Media                                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Estabilidad**   Alta
  ----------------- ---------------------------------------------------
  **Comentarios**   El campo de username se corresponde con el DNI del
                    paciente, que actúa como identificador único
                    visual.

  ---------------------------------------------------------------------

> []{#_bookmark37 .anchor}Tabla 26: Especificación del caso de uso
> UC-0009: Cambiar contraseña

+-------------------+-------------------------------------------------------------------------+
| **UC-0009**       | **Cambiar contraseña**                                                  |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Inicio sesión (paciente o doctor) NFR-0001 Seguridad            |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite a cualquier usuario autenticado (doctor o paciente) modificar   |
|                   |                                                                         |
|                   | sus credenciales de acceso por motivos de seguridad o preferencia       |
|                   | personal.                                                               |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El usuario (doctor o paciente) debe estar logueado correctamente.       |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El usuario accede a la configuración de     |
|                   |                           | cuenta y selecciona \"Cambiar contraseña\". |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema solicita tres campos: Contraseña |
|                   |                           | actual, nueva contraseña y repetir nueva    |
|                   |                           | contraseña.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El usuario introduce los datos y confirma.  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema verifica que la \"Contraseña     |
|                   |                           | actual\" coincida con la almacenada         |
|                   |                           | (validación de hash).                       |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema verifica que las nuevas          |
|                   |                           | contraseñas coincidan entre sí.             |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema actualiza la contraseña en la    |
|                   |                           | base de datos aplicando encriptación.       |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema notifica \"Contraseña            |
|                   |                           | actualizada con éxito\".                    |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | La contraseña anterior queda invalidada. El usuario deberá usar la      |
|                   | nueva en el próximo inicio de sesión.                                   |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Si la contraseña actual es errónea, el      |
|                   |                           | sistema no realiza el cambio y muestra \"La |
|                   |                           | contraseña actual no es correcta\".         |
+-------------------+---------------------------+---------------------------------------------+

+-----------------+---------------------------+---------------------------------------------+
|                 | 4                         | Si las contraseñas nuevas no coinciden, el  |
|                 |                           | sistema no realiza el cambio y muestra      |
|                 |                           | \"Las contraseñas no coinciden\".           |
+=================+===========================+=============================================+
| **Importancia** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Estado**      | En construcción                                                         |
+-----------------+-------------------------------------------------------------------------+
| **Estabilidad** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Comentarios** | Es la única operación de escritura permitida al paciente sobre su       |
|                 | propia cuenta (el resto de datos los gestiona el doctor).               |
+-----------------+-------------------------------------------------------------------------+

1.  []{#_bookmark38 .anchor}Rehabilitación

![](media/image4.png){width="3.5896412948381453in"
height="3.4536450131233596in"}

> Ilustración 3: Diagrama de casos de uso del paquete \"Rehabilitación\"
>
> []{#_bookmark39 .anchor}Tabla 27: Especificación del caso de uso
> UC-0010: Conectar muleta

+------------------+-------------------------------------------------------------------------+
| **UC-0010**      | **Conectar muleta**                                                     |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (10/09/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                                                  |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | OBJ-0002 Integración Muleta Inteligente NFR-0002 Conectividad y         |
|                  | Latencia                                                                |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Permite a la aplicación móvil escanear el entorno en busca de           |
|                  | dispositivos bluetooth filtrar específicamente la muleta instrumentada  |
|                  | y establecer un canal de comunicación seguro para la transmisión de     |
|                  |                                                                         |
|                  | datos.                                                                  |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | 1.  El bluetooth del móvil debe estar encendido.                        |
|                  |                                                                         |
|                  | 2.  La muleta debe estar encendida y batería cargada.                   |
|                  |                                                                         |
|                  | 3.  La app tiene permisos de bluetooth concedidos por el sisema         |
|                  |     operativo.                                                          |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El paciente accede a la pestaña             |
|                  |                           | \"Conexión\" en la app.                     |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El sistema inicia el escaneo de periféricos |
|                  |                           | bluetooth cercanos.                         |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El sistema filtra los resultados mostrando  |
|                  |                           | solo los que sean muleta.                   |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El paciente selecciona su dispositivo en la |
|                  |                           | lista.                                      |
|                  +---------------------------+---------------------------------------------+
|                  | 5                         | El sistema solicita la conexión al          |
|                  |                           | periférico.                                 |
|                  +---------------------------+---------------------------------------------+
|                  | 6                         | La muleta acepta la conexión y el sistema   |
|                  |                           | descubre los servicios y características.   |
|                  +---------------------------+---------------------------------------------+
|                  | 7                         | El sistema muestra el estado \"Conectado\"  |
|                  |                           | y habilita el botón de \"Empezar sesión\".  |
+------------------+---------------------------+---------------------------------------------+

+-------------------+-------------------------------------------------------------------------+
| **Postcondición** | El canal de comunicación bluetooth está abierto y listo para recibir    |
|                   | tramas de datos.                                                        |
+===================+:=========================:+============================================:+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Si el Bluetooth del móvil está apagado, el  |
|                   |                           | sistema muestra una alerta solicitando      |
|                   |                           | activarlo.                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | Si no se encuentra ninguna muleta tras      |
|                   |                           | varios segundos, el sistema muestra \"No se |
|                   |                           | encontraron dispositivos\" y ofrece         |
|                   |                           |                                             |
|                   |                           | reintentar.                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Vital (Bloqueante)                                                      |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | El filtrado por nombre es una medida de seguridad y usabilidad para     |
|                   | evitar que el paciente intente conectarse por error a otros             |
|                   | dispositivos bluetooth.                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark40 .anchor}Tabla 28: Especificación del caso de uso
> UC-0011: Realizar sesión de rehabilitación

+------------------+-------------------------------------------------------------------------+
| **UC-0011**      | **Realizar sesión de rehabilitación**                                   |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (10/09/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                                                  |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0010 Conectar Muleta                                                 |
|                  |                                                                         |
|                  | IRQ-0003 Configuración Tratamiento NFR-0002 Tiempo Real                 |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Flujo principal donde el paciente camina utilizando la muleta           |
|                  | instrumentada. La aplicación procesa la carga soportada en cada paso,   |
|                  | la compara con los límites prescritos por el doctor y ofrece una señal  |
|                  | visual para que el paciente aprenda a ajustar su fuerza en los pasos    |
|                  |                                                                         |
|                  | siguientes.                                                             |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | 1.  La muleta está conectada vía bluetooth.                             |
|                  |                                                                         |
|                  | 2.  Existen límites de peso (mínimo y máximo) descargados previamente   |
|                  |     del servidor.                                                       |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El paciente se coloca la muleta y pulsa el  |
|                  |                           | botón \"Empezar sesión\".                   |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El paciente realiza un paso apoyando la     |
|                  |                           | muleta.                                     |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 3                         | La muleta detecta el pico de fuerza y lo    |
|                   |                           | envía a la app.                             |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | La app compara el valor recibido con los    |
|                   |                           | límites establecidos.                       |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | Feedback visual: La pantalla muestra        |
|                   |                           | inmediatamente un círculo de color:         |
|                   |                           |                                             |
|                   |                           | 1.  Verde: Carga dentro del rango.          |
|                   |                           |                                             |
|                   |                           | 2.  Rojo: Carga superior al límite máximo.  |
|                   |                           |                                             |
|                   |                           | 3.  Amarillo/Gris: Carga inferior al límite |
|                   |                           |     mínimo.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El contador de pasos totales se incrementa. |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El paciente observa el resultado y ajusta   |
|                   |                           | el peso que carga sobre la muleta para el   |
|                   |                           | siguiente paso.                             |
+===================+===========================+=============================================+
| **Postcondición** | Los datos de cada paso quedan almacenados temporalmente en la memoria   |
|                   | del teléfono a la espera de ser enviados.                               |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | Si se pierde la conexión bluetooth, la app  |
|                   |                           | detiene el contador y cancela la sesión.    |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Vital (Bloqueante)                                                      |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | El sistema muestra una gráfica con los pesos para que el usuario pueda  |
|                   | ver la cantidad de pasos que ha hecho correctamente.                    |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark41 .anchor}Tabla 29: Especificación del caso de uso
> UC-0012: Finalizar y guardar sesión

+------------------+---------------------------------------------------+
| **UC-0012**      | **Finalizar y guardar sesión**                    |
+==================+===================================================+
| **Versión**      | 1.0 (10/09/2025)                                  |
+------------------+---------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                             |
+------------------+---------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                            |
+------------------+---------------------------------------------------+
| **Dependencias** | UC-0011 Realizar Sesión                           |
|                  |                                                   |
|                  | IRQ-0002 Telemetría Sesiones                      |
+------------------+---------------------------------------------------+
| **Descripción**  | Proceso de consolidación de datos. Al terminar el |
|                  | ejercicio, la app empaqueta toda la información   |
|                  | capturada (array de datos, medias,                |
|                  |                                                   |
|                  | totales) y la envía a la base de datos para que   |
|                  | forme parte del historial clínico permanente.     |
+------------------+---------------------------------------------------+
| **Precondición** | Debe de haber pasos registrados en la sesión.     |
+------------------+---------------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El paciente pulsa el botón de finalizar.    |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | La app calcula las estadísticas finales:    |
|                   |                           | carga media, carga máxima, total de pasos y |
|                   |                           | duración.                                   |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | La app construye el objeto con la           |
|                   |                           | estructura requerida por la API.            |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El *backend* valida los datos y devuelve    |
|                   |                           | confirmación.                               |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | La App muestra \"Sesión guardada            |
|                   |                           | correctamente\" y vuelve a la pantalla de   |
|                   |                           | inicio.                                     |
+===================+===========================+=============================================+
| **Postcondición** | Los datos están persistidos en la base de datos MySQL y son accesibles  |
|                   | por el doctor y por el paciente                                         |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Si no hay conexión a Internet, la app       |
|                   |                           | muestra \"Error de conexión\" y ofrece      |
|                   |                           | reintentar.                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Ninguno                                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark42 .anchor}Tabla 30: Especificación del caso de uso
> UC-0013: Consultar progreso diario

+------------------+-------------------------------------------------------------------------+
| **UC-0013**      | **Consultar progreso diario**                                           |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (10/09/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                                                  |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | IRQ-0002 Telemetría                                                     |
|                  |                                                                         |
|                  | IRQ-0003 Objetivos (Pasos)                                              |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Permite al paciente visualizar su desempeño acumulado durante el día en |
|                  | curso. Muestra métricas para motivar el cumplimiento diario.            |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El paciente debe haber iniciado sesión en la app.                       |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El paciente accede a la pantalla            |
|                  |                           | \"Estadísticas\".                           |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El sistema recupera y suma los datos de     |
|                  |                           | todas las sesiones realizadas desde las     |
|                  |                           | 00:00h de hoy.                              |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | La app muestra dos indicadores principales: |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   |                           | 1.  Anillo de pasos: Pasos realizados /     |
|                   |                           |     Objetivo diario.                        |
|                   |                           |                                             |
|                   |                           | 2.  Carga promedio: Peso medio soportado en |
|                   |                           |     las sesiones de hoy.                    |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Al finalizar el día (cambio de fecha), las  |
|                   |                           | estadísticas se reinician automáticamente.  |
+===================+===========================+=============================================+
| **Postcondición** | Ninguna                                                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | En caso de que se produzca algún error en   |
|                   |                           | la lectura de los datos, se le notifica al  |
|                   |                           | usuario y el caso de uso finaliza.          |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Media                                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | A diferencia del panel del doctor, aquí no se muestra el histórico de   |
|                   | semanas anteriores, enfocando al paciente únicamente en el objetivo     |
|                   | \"de hoy\".                                                             |
+-------------------+-------------------------------------------------------------------------+

1.  []{#_bookmark43 .anchor}Gestión clínica

![](media/image5.png){width="2.0585072178477692in" height="3.67875in"}

> Ilustración 4: Diagrama de casos de uso del paquete \"Gestión clínica
> (web doctor)\"
>
> []{#_bookmark44 .anchor}Tabla 31: Especificación del caso de uso
> UC-0014: Consultar historial de sesiones

+-------------------+-------------------------------------------------------------------------+
| **UC-0014**       | **Consultar historial de sesiones**                                     |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0005 Listar Pacientes IRQ-0002 Telemetría                            |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor visualizar la evolución en la recuperación de un      |
|                   | paciente. El sistema ofrece una visión jerárquica: primero muestra un   |
|                   | listado de sesiones diarias (resumen del día) y permite acceder al      |
|                   |                                                                         |
|                   | detalle de todas las microsesiones (sesiones que se hacen con la        |
|                   | muleta) que componen ese día.                                           |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor debe haber seleccionado un paciente de su lista.              |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor accede a la pestaña \"Sesiones\"  |
|                   |                           | en la ficha del paciente.                   |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema muestra las gráficas con la      |
|                   |                           | evolución del peso y de los pasos a lo      |
|                   |                           | largo de las sesiones diarias, además de    |
|                   |                           | una tabla con el histórico de días (fecha,  |
|                   |                           | pasos totales del día,                      |
|                   |                           |                                             |
|                   |                           | carga media del día...)                     |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor pulsa \"Ver detalle\" en una      |
|                   |                           | fecha específica.                           |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema renderiza la gráfica detallada   |
|                   |                           | de esa con todas las microsesiones de la    |
|                   |                           | sección diaria seleccionada anteriormente y |
|                   |                           | despliega el listado de microsesiones       |
|                   |                           |                                             |
|                   |                           | realizadas ese día.                         |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El doctor analiza los datos para detectar   |
|                   |                           | fatiga o errores al caminar.                |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Ninguna                                                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Si el paciente no tiene datos registrados,  |
|                   |                           | se muestra \"Sin actividad registrada\".    |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Alta (Herramienta principal de diagnóstico)                             |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Comentarios**   La distinción entre Sesión diaria y microsesión es
                    vital para no saturar al médico con miles de datos
                    de golpe.
  ----------------- ---------------------------------------------------

  ---------------------------------------------------------------------

> []{#_bookmark45 .anchor}Tabla 32: Especificación del caso de uso
> UC-0015: Configurar límites y objetivos

+-------------------+-------------------------------------------------------------------------+
| **UC-0015**       | **Configurar límites y objetivos**                                      |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0005 Listar Pacientes                                                |
|                   |                                                                         |
|                   | IRQ-0003 Configuración Tratamiento                                      |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor establecer los parámetros clínicos que configuran el  |
|                   | comportamiento de la muleta. Se definen dos tipos de configuraciones:   |
|                   |                                                                         |
|                   | 1.  Límites de carga: Rango de peso (min/max).                          |
|                   |                                                                         |
|                   | 2.  Límites de pasos: Pasos máximos que un paciente puede dar en un     |
|                   |     día.                                                                |
|                   |                                                                         |
|                   | 3.  Objetivos: Meta de pasos diarios.                                   |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor debe haber seleccionado un paciente.                          |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor abre el panel de pacientes.       |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Selecciona el paciente al que quiere        |
|                   |                           | asignarle límites y/u objetivos.            |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | Selecciona si quiere asignar límite de peso |
|                   |                           | o asignar pasos.                            |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Rellena el formulario con los límites y/u   |
|                   |                           | objetivos pertinentes.                      |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El doctor pulsa el botón de asignar         |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema valida que Peso mínimo \< Peso   |
|                   |                           | máximo y/o que Pasos diarios \< Límite      |
|                   |                           | diario de pasos.                            |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema actualiza las tablas de pesos y  |
|                   |                           | pasos en la ficha del paciente.             |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema confirma el guardado.            |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Los nuevos parámetros están disponibles para que la app del paciente    |
|                   | los vea en el próximo inicio de sesión.                                 |
+-------------------+-------------------------------------------------------------------------+

+-----------------+---------------------------+---------------------------------------------+
| **Excepciones** | **Paso**                  | **Acción**                                  |
|                 +---------------------------+---------------------------------------------+
|                 | 6                         | Si el min es mayor que el max, el sistema   |
|                 |                           | muestra un error de validación.             |
+=================+===========================+=============================================+
| **Importancia** | Alta (Define la seguridad de la rehabilitación)                         |
+-----------------+-------------------------------------------------------------------------+
| **Estado**      | En construcción                                                         |
+-----------------+-------------------------------------------------------------------------+
| **Estabilidad** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Comentarios** | Ninguno                                                                 |
+-----------------+-------------------------------------------------------------------------+

> []{#_bookmark46 .anchor}Tabla 33: Especificación del caso de uso
> UC-0016: Crear lesión

+-------------------+-------------------------------------------------------------------------+
| **UC-0016**       | **Crear lesión**                                                        |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Iniciar Sesión (doctor)                                         |
|                   |                                                                         |
|                   | IRQ-0003 Configuración Tratamiento                                      |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor dar de alta una nueva patología en el catálogo        |
|                   | general del sistema. Esta lesión podrá ser asignada posteriormente a    |
|                   |                                                                         |
|                   | múltiples pacientes.                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor debe estar logueado.                                          |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor accede a la sección               |
|                   |                           | \"Patologías\" y pulsa \"Añadir lesión\".   |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema muestra un formulario vacío.     |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor introduce el \"Nombre de la       |
|                   |                           | lesión\" y una \"Descripción\" opcional.    |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor pulsa \"Guardar\".                |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema valida que el nombre de la       |
|                   |                           | lesión.                                     |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema crea el registro.                |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema actualiza el listado mostrando   |
|                   |                           | la nueva lesión.                            |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | La nueva lesión existe en la base de datos y está lista para ser        |
|                   | asignada.                                                               |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | Si el nombre está vacío o si la lesión ya   |
|                   |                           | existe en el sistema.                       |
+-------------------+---------------------------+---------------------------------------------+

  ---------------------------------------------------------------------
  **Importancia**   Media
  ----------------- ---------------------------------------------------
  **Estado**        En construcción

  **Estabilidad**   Alta

  **Comentarios**   Las lesiones se crean de forma genérica para poder
                    reutilizarlas en los pacientes que el doctor
                    quiera.
  ---------------------------------------------------------------------

> []{#_bookmark47 .anchor}Tabla 34: Especificación del caso de uso
> UC-0017: Editar lesión

+-------------------+-------------------------------------------------------------------------+
| **UC-0017**       | **Editar lesión**                                                       |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0016 Crear Lesión                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor modificar el nombre o la descripción de una           |
|                   |                                                                         |
|                   | patología existente en el catálogo, por ejemplo, para corregir un error |
|                   | o ampliar la información médica.                                        |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | La lesión debe existir en el sistema.                                   |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor selecciona una lesión del         |
|                   |                           | catálogo y pulsa \"Editar\".                |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema carga los datos actuales.        |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor modifica los campos deseados.     |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor pulsa \"Actualizar\".             |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema guarda los cambios en la base de |
|                   |                           | datos.                                      |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema notifica \"Lesión actualizada    |
|                   |                           | correctamente\".                            |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | La información de la lesión se actualiza.                               |
+-------------------+-------------------------------------------------------------------------+
| **Importancia**   | Baja                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Ninguno                                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark48 .anchor}Tabla 35: Especificación del caso de uso
> UC-0018: Eliminar lesión

  -----------------------------------------------------------------
  **UC-0018**   **Eliminar lesión**
  ------------- ---------------------------------------------------

  -----------------------------------------------------------------

+-------------------+-------------------------------------------------------------------------+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+===================+===========================+=============================================+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | NFR-0001 Seguridad (Integridad referencial)                             |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor borrar una patología del catálogo.                    |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | La lesión debe existir en el sistema.                                   |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor pulsa el icono de eliminar en una |
|                   |                           | lesión del listado.                         |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema solicita confirmación            |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor confirma.                         |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema elimina la lesión.               |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema actualiza la lista.              |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | La lesión desaparece del catálogo.                                      |
+-------------------+-------------------------------------------------------------------------+
| **Importancia**   | Baja                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Se recomienda no borrar lesiones que formen parte de un historial       |
|                   | clínico activo para no perder trazabilidad.                             |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark49 .anchor}Tabla 36: Especificación del caso de uso
> UC-0019: Asignar lesión a paciente

+------------------+-------------------------------------------------------------------------+
| **UC-0019**      | **Asignar lesión a paciente**                                           |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (10/09/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                                                  |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0005 Listar Pacientes UC-0016 Crear Lesión                           |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Permite vincular una patología existente en el catálogo con un paciente |
|                  | específico. Esto es fundamental para que el sistema sepa qué se está    |
|                  | tratando y para asociar futuros consejos médicos a dicha                |
|                  |                                                                         |
|                  | dolencia.                                                               |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | Deben existir tanto el paciente como la lesión en el sistema.           |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El doctor accede a la ficha de un paciente  |
|                  |                           | específico.                                 |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El doctor pulsa \"Asignar lesión\".         |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra un desplegable con las   |
|                   |                           | lesiones disponibles en el catálogo.        |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor selecciona la lesión adecuada y   |
|                   |                           | pulsa \"Asignar\".                          |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema crea un registro en una tabla    |
|                   |                           | intermedia.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema muestra la lesión en el perfil   |
|                   |                           | del paciente.                               |
+===================+===========================+=============================================+
| **Postcondición** | El paciente tiene asociada una nueva patología activa.                  |
+-------------------+-------------------------------------------------------------------------+
| **Importancia**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Si se le asigna a un paciente una lesión que ya tenía asignada, esta se |
|                   | actualizará con el comentario de la asignación más reciente.            |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark50 .anchor}Tabla 37: Especificación del caso de uso
> UC-0020: Consultar catálogo de lesiones

+------------------+-------------------------------------------------------------------------+
| **UC-0020**      | **Consultar catálogo de lesiones**                                      |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (10/09/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                                                  |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar Sesión (doctor)                                         |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Permite al doctor visualizar el listado completo de patologías          |
|                  | registradas en el sistema. Esta vista sirve como punto de entrada para  |
|                  | realizar operaciones de mantenimiento (editar, eliminar...) o           |
|                  | simplemente para verificar qué lesiones están disponibles para          |
|                  |                                                                         |
|                  | asignar.                                                                |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El doctor debe estar logueado.                                          |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El doctor accede a la sección               |
|                  |                           | \"Patologías\" del menú principal.          |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El sistema solicita al *backend* la lista   |
|                  |                           | de todas las lesiones activas.              |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El sistema muestra una tabla con el nombre  |
|                  |                           | y descripción de cada lesión.               |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El doctor puede filtrar o buscar una lesión |
|                  |                           | específica por nombre.                      |
+------------------+---------------------------+---------------------------------------------+

+-------------------+-------------------------------------------------------------------------+
| **Postcondición** | El doctor visualiza el catálogo.                                        |
+===================+:=========================:+============================================:+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Si no hay lesiones registradas, el sistema  |
|                   |                           | muestra el mensaje \"No se encontraron      |
|                   |                           | patologías\".                               |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Media                                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Es el paso previo necesario para poder seleccionar una lesión y         |
|                   | ejecutar editar (UC-0017) o eliminar (UC-0018).                         |
+-------------------+-------------------------------------------------------------------------+

1.  []{#_bookmark51 .anchor}Comunicación y gestión de consejos

![](media/image6.png){width="2.8326027996500436in"
height="3.6461450131233595in"}

> Ilustración 5: Diagrama de casos de uso del paquete \"Comunicación y
> gestión de consejos\"

[]{#_bookmark52 .anchor}Tabla 38: Especificación del caso de uso
UC-0021: Intercambio de mensajes (chat)

+-------------------+-------------------------------------------------------------------------+
| **UC-0021**       | **Intercambio de mensajes (chat)**                                      |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Iniciar Sesión NFR-0002 Tiempo Real                             |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite establecer una conversación fluida entre el doctor y el         |
|                   | Paciente. El sistema deberá utilizar un sistema para que los mensajes   |
|                   | aparezcan instantáneamente sin recargar la página, facilitando la       |
|                   |                                                                         |
|                   | resolución rápida de dudas.                                             |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | Ambos usuarios deben existir y tener una relación médico-paciente       |
|                   | establecida.                                                            |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El usuario accede a la sección \"Chat\".    |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema carga el historial de mensajes   |
|                   |                           | anteriores.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El usuario escribe un texto y pulsa         |
|                   |                           | \"Enviar\".                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema emite el mensaje                 |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El servidor guarda el mensaje y lo entrega  |
|                   |                           | al destinatario.                            |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El destinatario ve el mensaje aparecer      |
|                   |                           | inmediatamente.                             |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El mensaje queda persistido en el historial.                            |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Si el paciente no tiene datos registrados,  |
|                   |                           | se muestra "Sin actividad registrada".      |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Alta (Herramienta principal de diagnóstico)                             |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Ninguno                                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark53 .anchor}Tabla 39: Especificación del caso de uso
> UC-0022: Crear consejo médico

  -----------------------------------------------------------------
  **UC-0022**   **Crear consejo médico**
  ------------- ---------------------------------------------------
  **Versión**   1.0 (10/09/2025)

  -----------------------------------------------------------------

+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+===================+===========================+=============================================+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0005 Listar Pacientes UC-0019 Asignar Lesión                         |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor formalizar una recomendación médica. Según el diseño  |
|                   | de la interfaz, el consejo debe estar vinculado a un paciente           |
|                   | específico y a una patología concreta de este, asegurando que la        |
|                   |                                                                         |
|                   | recomendación tiene contexto clínico.                                   |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El paciente debe tener al menos una patología asignada (ver UC- 0019).  |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor pulsa \"Nuevo consejo\".          |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema abre un modal con el formulario  |
|                   |                           | de creación.                                |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor selecciona el paciente en el      |
|                   |                           | desplegable.                                |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema carga en el segundo desplegable  |
|                   |                           | las Patologías asignadas a ese paciente.    |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El doctor selecciona la Patología, escribe  |
|                   |                           | el \"Título\" y la \"Descripción\".         |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El doctor pulsa \"Guardar consejo\".        |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema valida los campos y registra el  |
|                   |                           | consejo.                                    |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema confirma la creación exitosa.    |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El consejo queda activo y visible en la app del paciente.               |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Si el paciente seleccionado no tiene        |
|                   |                           | patologías asignadas, el                    |
|                   |                           |                                             |
|                   |                           | sistema deshabilita el selector y avisa:    |
|                   |                           | \"Este paciente no tiene patologías         |
|                   |                           | asignadas\".                                |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Media                                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Ninguno                                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark54 .anchor}Tabla 40: Especificación del caso de uso
> UC-0023: Eliminar consejo

  -----------------------------------------------------------------
  **UC-0023**   **Eliminar consejo**
  ------------- ---------------------------------------------------
  **Versión**   1.0 (10/09/2025)

  -----------------------------------------------------------------

+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+===================+===========================+=============================================+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0022 Crear Consejo                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor borrar una recomendación.                             |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El consejo debe existir.                                                |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor visualiza la lista de consejos de |
|                   |                           | un paciente.                                |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El doctor pulsa el icono de eliminar        |
|                   |                           | (basura) en la tarjeta del consejo.         |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema solicita confirmación.           |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor confirma.                         |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema elimina el registro de la base   |
|                   |                           | de datos.                                   |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El consejo desaparece inmediatamente de la  |
|                   |                           | lista.                                      |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El paciente deja de ver ese consejo en su app.                          |
+-------------------+-------------------------------------------------------------------------+
| **Importancia**   | Baja                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Ninguno                                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark55 .anchor}Tabla 41: Especificación del caso de uso
> UC-0024: Consultar consejos (Paciente)

+------------------+-------------------------------------------------------------------------+
| **UC-0024**      | **Consultar consejos (Paciente)**                                       |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (10/09/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      | A. Durán, B. Bernárdez                                                  |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión (Paciente)                                       |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Permite al paciente acceder a la biblioteca de recomendaciones          |
|                  |                                                                         |
|                  | personalizadas creadas por su doctor. Funciona como un recordatorio de  |
|                  | las pautas médicas activas asociadas a su lesión.                       |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El paciente debe estar logueado.                                        |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El paciente pulsa el botón \"Consejos\".    |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El sistema solicita al *backend* la lista   |
|                  |                           | de consejos activos.                        |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra las tarjetas con título  |
|                   |                           | y patología asociada.                       |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El paciente pulsa una tarjeta para leer la  |
|                   |                           | descripción completa.                       |
+===================+===========================+=============================================+
| **Postcondición** | Ninguna                                                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Si no tiene consejos, muestra \"No hay      |
|                   |                           | recomendaciones pendientes\".               |
+-------------------+---------------------------+---------------------------------------------+
| **Importancia**   | Media                                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Estado**        | En construcción                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Ninguno                                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark56 .anchor}Tabla 42: Especificación del caso de uso
> UC-0025: Listar consejos (Doctor)

+-------------------+-------------------------------------------------------------------------+
| **UC-0025**       | **Listar consejos (Doctor)**                                            |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (10/09/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       | A. Durán, B. Bernárdez                                                  |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0005 Listar Pacientes                                                |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Permite al doctor visualizar el historial de recomendaciones activas    |
|                   | que ha asignado a un paciente específico. Esta vista es necesaria para  |
|                   | revisar el tratamiento pautado antes de añadir nuevas indicaciones o    |
|                   |                                                                         |
|                   | eliminar las obsoletas.                                                 |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor debe haber seleccionado un paciente de su lista.              |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El doctor accede a la ficha del paciente y  |
|                   |                           | selecciona la pestaña \"Consejos\".         |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema solicita al *backend* los        |
|                   |                           | consejos vinculados a ese ID de paciente.   |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra una lista de tarjetas    |
|                   |                           | con el nombre del paciente, DNI y el número |
|                   |                           | de consejos asignados.                      |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor visualiza los pacientes con       |
|                   |                           | consejos asignados.                         |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Ninguna                                                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
+-------------------+---------------------------+---------------------------------------------+

+-----------------+---------------------------+---------------------------------------------+
|                 | 2                         | Si el paciente no tiene consejos, el        |
|                 |                           | sistema muestra \"No hay pacientes con      |
|                 |                           | consejos\".                                 |
+=================+===========================+=============================================+
| **Importancia** | Media                                                                   |
+-----------------+-------------------------------------------------------------------------+
| **Estado**      | En construcción                                                         |
+-----------------+-------------------------------------------------------------------------+
| **Estabilidad** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Comentarios** | Desde esta lista se ejecutan las acciones de eliminar (UC-0023).        |
+-----------------+-------------------------------------------------------------------------+

# Matrices de rastreabilidad

> El propósito de estas matrices es asegurar la consistencia y la
> completitud del sistema Load Crutches, verificando que cada necesidad
> de negocio definida en los objetivos tiene su correspondencia técnica
> en los requisitos y su implementación final en los casos de uso.

## Matriz de rastreabilidad requisitos de información frente a objetivos

![](media/image7.jpeg){width="5.9018635170603675in"
height="0.5552077865266841in"}

> Ilustración 6: Matriz de rastreabilidad requisitos de información
> frente a objetivos (IRQ-OBJ)

## Matriz de rastreabilidad requisitos no funcionales frente a requisitos de información

![](media/image8.jpeg){width="4.82886811023622in"
height="0.7081244531933508in"}

> Ilustración 7: atriz de rastreabilidad requisitos no funcionales
> frente a requisitos de información (NFR-IRQ)

## Matriz de rastreabilidad requisitos no funcionales frente a requisitos no funcionales

## 

> ![](media/image9.jpeg){width="5.9149584426946635in"
> height="0.7081244531933508in"}
>
> Ilustración 8: Matriz de rastreabilidad requisitos no funcionales
> frente a requisitos no funcionales (NFR-NFR)

## Matriz de rastreabilidad requisitos no funcionales frente a objetivos

![](media/image10.jpeg){width="5.719292432195975in"
height="0.7081244531933508in"}

> Ilustración 9: Matriz de rastreabilidad requisitos no funcionales
> frente a objetivos (NFR-OBJ)

## Matriz de rastreabilidad requisitos funcionales frente a requisitos no funcionales

![](media/image11.png){width="5.943931539807524in"
height="3.5765616797900264in"}

> Ilustración 10: Matriz de rastreabilidad requisitos funcionales frente
> a requisitos no funcionales (UC-NFR)

## Matriz de rastreabilidad requisitos funcionales frente a requisitos de información

![](media/image12.png){width="4.709174321959755in"
height="3.5765616797900264in"}

> Ilustración 11: Matriz de rastreabilidad requisitos funcionales frente
> a requisitos de información (UC-IRQ)

## Matriz de rastreabilidad requisitos funcionales frente a requisitos funcionales

![](media/image13.png){width="5.8667060367454065in" height="3.23in"}

> Ilustración 12: Matriz de rastreabilidad requisitos funcionales frente
> a requisitos funcionales (UC-UC)

## Matriz de rastreabilidad requisitos funcionales frente a objetivos

![](media/image14.png){width="4.215417760279965in"
height="3.8106244531933506in"}

> Ilustración 13: Matriz de rastreabilidad requisitos funcionales frente
> a objetivos (UC-OBJ)

# Propuesta arquitectónica

> En este apartado se recoge una primera versión o aproximación, a
> partir de la información obtenida en el apartado de requisitos de este
> documento, de la propuesta de arquitectura. A continuación, se puede
> observar el esquema o diagrama en la **ilustración 14** que muestra el
> conjunto de paquetes del sistema.
>
> A modo de orientación se explicará brevemente el contenido de cada uno
> de los paquetes y su significado dentro de la solución:

- **Gestión de acceso y usuarios:** El contenido de este paquete hace
  referencia a todos los casos de uso transversales que abarcan la
  seguridad y la identificación dentro del sistema. Incluye el registro
  de profesionales y pacientes, la autenticación (*login*), el cierre de
  sesión seguro (*logout*) y la modificación de credenciales y perfiles
  personales. Este paquete actúa como base de seguridad para el resto de
  los módulos.

- **Rehabilitación (App móvil):** En este paquete estarán contenidos
  todos los casos de uso y lógica de negocio referentes al lado del
  paciente y su interacción con el hardware. Abarca la conexión
  Bluetooth con la muleta (*IoT*), la ejecución de las sesiones de
  *biofeedback* en tiempo real, el procesamiento local de los datos de
  la marcha y la visualización del progreso diario del usuario.

- **Gestión clínica (Web):** Este paquete abarca toda la información
  referente a la administración del tratamiento y el seguimiento médico.
  Incluye las herramientas para que el doctor visualice el historial de
  sesiones y gráficas evolutivas, así como la configuración de los
  parámetros de la muleta (límites de carga y objetivos) y la gestión
  del catálogo de lesiones (CRUD y asignación a pacientes).

- **Comunicación y consejos:** Este paquete agrupa las funcionalidades
  encargadas del intercambio de información cualitativa entre médico y
  paciente. Contiene los módulos de chat en tiempo real para la
  asistencia remota y el sistema de gestión de consejos médicos,
  permitiendo al doctor pautar recomendaciones específicas vinculadas a
  la patología del paciente.

![](media/image15.png){width="3.6103904199475068in" height="2.41in"}

> Ilustración 14: Primera propuesta arquitectónica del modelo

# Glosario

> A continuación, se definen los términos técnicos, siglas y conceptos
> específicos utilizados a lo largo de este documento para facilitar su
> comprensión.

- **API (*Application Programming Interface*):** Conjunto de reglas y
  especificaciones que permiten que la aplicación móvil y la web se
  comuniquen con el servidor para enviar y recibir datos.

- ***Backend*:** Parte de la arquitectura del sistema que se ejecuta en
  el servidor. Es responsable de la lógica de negocio, la seguridad, el
  procesamiento de datos y la gestión de la base de datos.

- ***Biofeedback*:** Técnica terapéutica empleada en el sistema mediante
  la cual se proporciona al paciente información inmediata (visual)
  sobre una función fisiológica (en este caso, la fuerza de apoyo),
  permitiéndole aprender a controlarla voluntariamente.

- **Bluetooth:** Tecnología de red inalámbrica utilizada para conectar
  la muleta instrumentada con el teléfono móvil del paciente.

- **CRUD (*Create, Read, Update, Delete*):** Acrónimo que refiere a las
  cuatro funciones básicas de bases de datos: Crear, Leer, Actualizar y
  Borrar registros. Se aplica, por ejemplo, a la gestión de pacientes o
  lesiones.

- **Frontend:** Parte de la aplicación con la que interactúa
  directamente el usuario (la interfaz gráfica de la App Móvil o el
  Panel Web del Doctor).

- **IoT (*Internet of Things*):** Interconexión digital de objetos
  cotidianos con internet. En este proyecto, hace referencia a la
  capacidad de la muleta para recolectar datos y enviarlos al sistema.

- **Token:** los tokens de acceso que permiten la transmisión segura de
  información entre partes. Se utiliza para autenticar a los usuarios
  (*login*) sin necesidad de mantener sesiones en el servidor.

- **Microsesión:** Unidad de actividad registrada por la muleta que
  comprende una ráfaga continua de pasos. Un día de rehabilitación se
  compone de la suma de múltiples microsesiones.

- **Feedback Visual:** Sistema de codificación por colores implementado
  en la app para indicar al paciente en tiempo real si la carga ejercida
  sobre la muleta está dentro de los límites pautados.

- **Telemetría:** Proceso automatizado de recopilación y transmisión de
  datos desde fuentes inaccesibles (la muleta en movimiento) hacia un
  sistema de monitoreo para su análisis.

# Bibliografía

> **No hay ninguna fuente en el documento actual.**
