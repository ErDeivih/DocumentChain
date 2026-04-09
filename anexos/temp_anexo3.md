> **LOAD CRUTCHES: SISTEMA DE SOPORTE EN LA RECUPERACIÓN DE PACIENTES
> QUE REQUIEREN USO DE MULETAS**
>
> **-**

LOAD CRUTCHES: SUPPORT SYSTEM FOR THE RECOVERY OF PATIENTS WHO REQUIRE
THE USE OF CRUTCHES

> Anexo III: Estimación del tamaño y el esfuerzo

![](media/image1.png){width="4.535625546806649in" height="1.25125in"}

# Trabajo de Fin de Grado Grado en Ingeniería Informática

> **Alumno:**

# Víctor Martín Fuentes

> **Tutor:**
>
> Pablo Chamoso Santos Salamanca, enero de 2026
>
> Contenido

[Índice de figuras 2](#índice-de-figuras)

[Índice de tablas 3](#índice-de-tablas)

1.  [Introducción 1](#introducción)

2.  [Estudio de viabilidad del proyecto
    2](#estudio-de-viabilidad-del-proyecto)

    1.  [Objetivos del sistema 2](#objetivos-del-sistema)

    2.  [Factores de complejidad técnica y del entorno
        4](#factores-de-complejidad-técnica-y-del-entorno)

        1.  [Factores de complejidad técnica 4](#_bookmark6)

        2.  [Factores del entorno 6](#_bookmark7)

        3.  [Lista de casos de uso y representación de actores del
            sistema 8](#_bookmark8)

        4.  [Actores del sistema 9](#_bookmark9)

        5.  [Casos de uso 11](#_bookmark14)

        6.  [Conclusión y análisis de resultados 44](#_bookmark38)

3.  [Planificación temporal 49](#planificación-temporal)

    1.  [Descripción de tareas, subtareas e hitos
        49](#descripción-de-tareas-subtareas-e-hitos)

    2.  [Asignación de tiempo y recursos
        54](#asignación-de-tiempo-y-recursos)

    3.  [Calendario de trabajo 56](#calendario-de-trabajo)

    4.  [Esquema de tareas, subtareas y diagramas de Gantt
        56](#esquema-de-tareas-subtareas-y-diagramas-de-gantt)

4.  [Conclusiones 65](#conclusiones)

[Bibliografía 67](#bibliografía)

# Índice de figuras

> [Ilustración 1: Resultado de la estimación con EZEstimate
> 48](#_bookmark40)
>
> Ilustración 2: Modelo en cascada de la duración de las
> iteraciones**¡Error! Marcador no definido.**
>
> [Ilustración 3: Diagrama de Gantt fase Inicio - Iteración 1
> 57](#_bookmark48)
>
> [Ilustración 4: Diagrama de Gantt fase Inicio - Iteración 2
> 58](#_bookmark49)
>
> [Ilustración 5: Diagrama de Gantt fase Elaboración - Iteración 1
> 59](#_bookmark50)
>
> [Ilustración 6: Diagrama de Gantt fase Elaboración - Iteración 2
> 60](#_bookmark51)
>
> [Ilustración 7: Diagrama de Gantt fase Construcción - Iteración 1
> 61](#_bookmark52)
>
> [Ilustración 8: Diagrama de Gantt fase Construcción - Iteración 2
> 62](#_bookmark53)
>
> [Ilustración 9: Diagrama de Gantt fase Transición - Iteración 1
> 63](#_bookmark54)
>
> [Ilustración 10: Diagrama de Gantt fase Transición - Iteración 2
> 64](#_bookmark55)

# Índice de tablas

> [Tabla 1: Especificación del actor ACT-01: Doctor 9](#_bookmark10)
>
> [Tabla 2: Especificación del actor ACT-02: Paciente 9](#_bookmark11)
>
> [Tabla 3: Especificación del actor ACT-03: Muleta inteligente
> 10](#_bookmark12)
>
> [Tabla 4: Especificación del actor ACT-04: Servidor de correo
> electrónico 10](#_bookmark13)
>
> [Tabla 5: Especificación del caso de uso UC-0001: Iniciar sesión
> 11](#_bookmark15)
>
> [Tabla 6: Especificación del caso de uso UC-0002: Cerrar sesión
> 12](#_bookmark16)
>
> [Tabla 7: Especificación del caso de uso UC-0003: Registrar doctor
> 13](#_bookmark17)
>
> [Tabla 8: Especificación del caso de uso UC-0004: Registrar paciente
> 15](#_bookmark18)
>
> [Tabla 9: Especificación del caso de uso UC-0005: Listar pacientes
> 16](#_bookmark19)
>
> [Tabla 10: Especificación del caso de uso UC-0006: Editar paciente
> 17](#_bookmark20)
>
> [Tabla 11: Especificación del caso de uso UC-0007: Eliminar paciente
> 18](#_bookmark21)
>
> [Tabla 12: Especificación del caso de uso UC-0008: Ver perfil personal
> (paciente) 20](#_bookmark22)
>
> [Tabla 13: Especificación del caso de uso UC-0010: Conectar muleta
> 23](#_bookmark23)
>
> [Tabla 14: Especificación del caso de uso UC-0011: Realizar sesión de
> rehabilitación . 24](#_bookmark24) [Tabla 15: Especificación del caso
> de uso UC-0012: Finalizar y guardar sesión 26](#_bookmark25)
>
> [Tabla 16: Especificación del caso de uso UC-0013: Consultar progreso
> diario 27](#_bookmark26)
>
> [Tabla 17: Especificación del caso de uso UC-0014: Consultar historial
> de sesiones 28](#_bookmark27)
>
> [Tabla 18: Especificación del caso de uso UC-0016: Crear lesión
> 31](#_bookmark28)
>
> [Tabla 19: Especificación del caso de uso UC-0017: Editar lesión
> 32](#_bookmark29)
>
> [Tabla 20: Especificación del caso de uso UC-0018: Eliminar lesión
> 34](#_bookmark30)
>
> [Tabla 21: Especificación del caso de uso UC-0019: Asignar lesión a
> paciente 35](#_bookmark31)
>
> [Tabla 22: Especificación del caso de uso UC-0020: Consultar catálogo
> de lesiones 36](#_bookmark32)
>
> [Tabla 23: Especificación del caso de uso UC-0021: Intercambio de
> mensajes (chat) 37](#_bookmark33)
>
> [Tabla 24: Especificación del caso de uso UC-0022: Crear consejo
> médico 39](#_bookmark34)
>
> [Tabla 25: Especificación del caso de uso UC-0023: Eliminar consejo
> 41](#_bookmark35)
>
> [Tabla 26: Especificación del caso de uso UC-0024: Consultar consejos
> (Paciente) 42](#_bookmark36)
>
> [Tabla 27: Especificación del caso de uso UC-0025: Listar consejos
> (Doctor) 43](#_bookmark37)
>
> [Tabla 28: Casos de uso y actores y su relación de complejidad para la
> estimación 44](#_bookmark39)
>
> [Tabla 29: Descripción de tares y subtareas de la planificación
> 49](#_bookmark43)
>
> [Tabla 30: Asignación de tiempos a las distintas iteraciones
> 55](#_bookmark45)
>
> [Tabla 31: Descripción de las fases por iteraciones 65](#_bookmark57)

# Introducción

> En este anexo se detallan los aspectos relativos a la estimación del
> tamaño y del esfuerzo necesarios
>
> para el desarrollo del proyecto "Load Crutches: Sistema de soporte en
> la recuperación de pacientes que requieren el uso de muletas".
> Asimismo, se describen el modelo de ciclo de vida adoptado, la
> metodología empleada durante el proceso de desarrollo y la
> planificación temporal prevista para la implementación del sistema.
>
> El objetivo principal de este anexo es proporcionar una visión
> estructurada y justificada del esfuerzo requerido para llevar a cabo
> el proyecto.

# Estudio de viabilidad del proyecto

> En este apartado se describe el estudio de viabilidad del proyecto,
> detallando la descomposición del modelo de ciclo de vida en las
> distintas fases que se llevarán a cabo durante el desarrollo del
> sistema. Asimismo, se justifica la elección del modelo seguido, se
> explica la organización del proyecto en iteraciones y se sientan las
> bases para la posterior estimación del tamaño y esfuerzo del
> desarrollo.
>
> El objetivo de este análisis es evaluar la viabilidad técnica y
> organizativa del proyecto, teniendo en cuenta la complejidad funcional
> del sistema, la interacción entre múltiples perfiles de usuario
> (doctores y pacientes) y la integración de componentes software
> heterogéneos, como el panel web de gestión clínica, la aplicación
> móvil y el servidor *backend*.

## Objetivos del sistema

> Para el desarrollo de este trabajo de fin de grado se ha seguido el
> paradigma del Proceso Unificado, adoptando un modelo de ciclo de vida
> iterativo e incremental, que permite abordar progresivamente la
> complejidad del sistema y reducir riesgos mediante la validación
> continua de los resultados obtenidos en cada fase.
>
> Siguiendo el marco teórico del Proceso Unificado, el modelo de ciclo
> de vida se divide en cuatro fases principales, cada una de ellas
> finalizada por un hito que marca el cierre de la fase y la validación
> de los objetivos establecidos. A su vez, cada fase se compone de una o
> varias iteraciones, en las que se desglosan tareas y subtareas
> específicas orientadas a la construcción de los distintos subsistemas
> del proyecto. Cada fase representa un ciclo de desarrollo dentro de la
> vida del producto.
>
> A continuación, se describen brevemente las fases que componen el
> ciclo de vida del proyecto:

- **Fase de inicio**: Su finalidad es definir una visión general del
  proyecto, estableciendo de forma clara los objetivos y el alcance del
  sistema tanto desde un punto de vista funcional como técnico. Durante
  esta fase se lleva a cabo la identificación de los actores del
  sistema, la definición inicial de los requisitos funcionales y no
  funcionales, así como un planteamiento preliminar de la arquitectura
  del sistema. Asimismo, se analizan las tecnologías a utilizar y se
  evalúa la viabilidad global del proyecto

- **Fase de elaboración**: En esta fase se completa el análisis de los
  casos de uso y se define la arquitectura detallada del sistema. Se
  refinan los requisitos identificados en la fase anterior, se diseñan
  los principales componentes del sistema y se establecen las decisiones
  arquitectónicas clave. Esta fase proporciona una base sólida para el
  desarrollo posterior, reduciendo la incertidumbre técnica antes de
  comenzar la implementación.

- **Fase de construcción**: Constituye la fase más extensa del proyecto
  y se desarrolla a través de múltiples iteraciones, en las que se
  implementan progresivamente los

> distintos subsistemas que conforman "Load Crutches". Entre las
> principales iteraciones de esta fase se incluyen:

- **Iteración de gestión de usuarios y autenticación**: implementación
  de los mecanismos de inicio y cierre de sesión, gestión de roles
  (doctor y paciente) y control de acceso a las funcionalidades del
  sistema.

- **Iteración del panel web de gestión clínica**: desarrollo de las
  funcionalidades destinadas al personal médico, como la gestión de
  pacientes, asignación de lesiones, configuración de límites y
  objetivos, visualización de sesiones y creación de consejos médicos.

- **Iteración de la aplicación móvil del paciente**: desarrollo de la
  interfaz y funcionalidades de la app móvil, incluyendo la conexión con
  la muleta, la realización de sesiones de rehabilitación, la
  visualización de estadísticas y el acceso a consejos médicos.

- **Iteración de comunicación y mensajería**: implementación del sistema
  de intercambio de mensajes entre doctor y paciente en tiempo real.

- **Iteración de almacenamiento y tratamiento de sesiones**: gestión del
  registro, consolidación y consulta de los datos de las sesiones de
  rehabilitación generadas por la muleta.

<!-- -->

- **Fase de transición**: En esta fase se alcanza una versión completa y
  estable del sistema. Se realizan las pruebas finales de integración y
  validación funcional, asegurando que el sistema cumple con los
  requisitos definidos. Asimismo, se prepara el entorno de despliegue y
  se da por concluida la fase de producción del proyecto, dejando el
  sistema listo para su uso y evaluación final.

## Factores de complejidad técnica y del entorno

> A continuación, se presentan los factores de complejidad técnica y del
> entorno considerados para el proyecto, con el objetivo de evaluar la
> influencia de cada uno de ellos en el desarrollo del sistema y su
> impacto en la estimación del tamaño y esfuerzo.
>
> Cada factor se valora mediante una puntuación comprendida entre 0 y 5,
> donde un valor bajo indica una influencia mínima y un valor alto
> representa un aspecto crítico o esencial para el correcto
> funcionamiento del sistema.

1.  []{#_bookmark6 .anchor}Factores de complejidad técnica

    - [Sistemas distribuidos]{.underline}

      - **Nota:** 2.

      - **Justificación**: aunque el sistema sigue una arquitectura
        cliente-servidor, con separación clara entre la aplicación
        móvil, el panel web y el servidor *backend*, el despliegue se
        realiza sobre una infraestructura centralizada. No existe, por
        el momento, una distribución avanzada en múltiples nodos o
        servicios independientes, aunque sí una separación lógica de
        responsabilidades.

    - [Rendimiento]{.underline}

      - **Nota:** 4.

      - **Justificación**: el sistema debe ofrecer un alto rendimiento,
        especialmente en la aplicación móvil durante la realización de
        las sesiones de rehabilitación. El procesamiento de datos
        provenientes de la muleta inteligente y la respuesta visual en
        tiempo casi real son fundamentales para garantizar una
        experiencia de uso adecuada y segura para el paciente.

    - [Eficiencia del usuario final]{.underline}

      - **Nota:** 3.

    - [Procesamiento interno complejo]{.underline}

      - **Nota:** 4.

      - **Justificación**: el sistema integra múltiples flujos de
        procesamiento, incluyendo la gestión de sesiones de
        rehabilitación, el análisis de datos de carga y pasos, la
        comparación con límites clínicos configurados y la comunicación
        en tiempo real mediante Bluetooth y mensajería. Esta combinación
        de procesos incrementa notablemente la complejidad interna del
        sistema.

    - [Reusabilidad]{.underline}

      - **Nota:** 3.

      - **Justificación**: los distintos módulos del sistema (gestión de
        usuarios, pacientes, sesiones, lesiones y consejos médicos) han
        sido diseñados de forma modular y desacoplada, permitiendo su
        posible reutilización o adaptación en futuros proyectos
        relacionados con el ámbito sanitario o de rehabilitación.

    - [Facilidad de instalación]{.underline}

      - **Nota:** 2.

      - **Justificación**: desde el punto de vista del usuario final, la
        instalación es sencilla, ya que el panel web es accesible
        mediante navegador y la aplicación móvil se distribuye como una
        app estándar. Sin embargo, la instalación y configuración del
        entorno servidor requiere ciertos conocimientos técnicos, aunque
        se apoya en scripts y configuraciones predefinidas.

    - [Facilidad de uso]{.underline}

      - **Nota:** 4.

      - **Justificación**: el sistema pone un fuerte énfasis en la
        usabilidad, especialmente en la aplicación móvil, donde los
        pacientes deben interactuar con la interfaz durante la
        rehabilitación. Se emplean elementos visuales claros y
        *feedback* inmediato para facilitar la comprensión y reducir
        errores durante el uso.

    - [Portabilidad]{.underline}

      - **Nota:** 2.

      - **Justificación**: el sistema podría desplegarse en otros
        entornos servidor o ampliarse en el futuro, aunque no se ha
        diseñado inicialmente con un enfoque multiplataforma a nivel de
        *backend*. En cuanto al cliente, la aplicación móvil está
        pensada para ejecutarse en dispositivos iOS compatibles.

    - [Concurrencia]{.underline}

      - **Nota:** 3.

      - **Justificación**: el sistema debe soportar múltiples usuarios
        concurrentes, especialmente en el panel web donde varios
        doctores pueden acceder simultáneamente. No obstante, el volumen
        esperado de usuarios es moderado, por lo que no se prevén
        escenarios de carga extrema.

    - [Características especiales de seguridad]{.underline}

      - **Nota:** 5.

      - **Justificación**: el sistema gestiona información sensible de
        carácter personal y clínico, por lo que la seguridad es un
        aspecto crítico. Se emplean mecanismos de autenticación mediante
        tokens, control de acceso por roles, cifrado de contraseñas y
        comunicación segura para proteger los datos de doctores y
        pacientes.

    - [Acceso directo a terceras partes]{.underline}

      - **Nota:** 0.

      - **Justificación**: el sistema no está diseñado para ser
        consumido por aplicaciones de terceros ni para exponer sus
        funcionalidades de forma pública, limitándose el acceso a los
        clientes oficiales (panel web y aplicación móvil). Aunque en

> un futuro se podría estudiar la integración con sistemas de terceros
> utilizados en hospitales y clínicas.

- [Se requiere entrenamiento especial del usuario]{.underline}

  - **Nota:** 2.

  - **Justificación**: aunque el sistema es intuitivo, el uso de la
    muleta inteligente y la interpretación de los indicadores visuales
    durante la rehabilitación pueden requerir una breve explicación
    inicial por parte del personal médico, especialmente para pacientes
    con menor familiaridad tecnológica.

2.  []{#_bookmark7 .anchor}Factores del entorno

> En este apartado se analizan los factores relacionados con el entorno
> de desarrollo del proyecto, los cuales influyen directamente en la
> productividad del desarrollador y en el esfuerzo necesario para llevar
> a cabo el sistema. Al igual que en los factores técnicos, cada
> elemento se valora con una puntuación entre 0 y 5, según su impacto en
> el desarrollo.

- [Familiaridad con UML]{.underline}

  - **Nota:** 5.

  - **Justificación**: el desarrollador del proyecto posee formación
    académica en Ingeniería Informática y experiencia previa en el uso
    de UML, adquirida tanto durante el grado y el grado como en
    proyectos personales y profesionales. Esto facilita la correcta
    modelización del sistema y la elaboración de diagramas de análisis y
    diseño.

- [Trabajadores a tiempo parcial]{.underline}

  - **Nota:** 3.

  - **Justificación**: el desarrollo del sistema es llevado a cabo por
    un único desarrollador que dedica tiempo parcial al proyecto,
    compaginándolo con otras actividades académicas o profesionales.

- [Capacidad de los analistas]{.underline}

  - **Nota:** 4.

  - **Justificación**: el desarrollador ha participado previamente en el
    análisis y desarrollo de sistemas software completos, lo que le
    proporciona la capacidad necesaria para identificar requisitos,
    modelar procesos y tomar decisiones técnicas adecuadas durante el
    diseño e implementación.

- [Experiencia en la aplicación]{.underline}

  - **Nota:** 3.

  - **Justificación**: el desarrollador cuenta con experiencia
    profesional previa en gran parte de las tecnologías empleadas, como
    desarrollo *backend* y aplicaciones iOS. No obstante, algunos
    aspectos específicos, como el tratamiento de datos biométricos en
    tiempo real, suponen un reto adicional que requiere un proceso de
    aprendizaje.

- [Experiencia en orientación a objetos]{.underline}

  - **Nota:** 4.

  - **Justificación**: el desarrollador posee conocimientos sólidos en
    programación orientada a objetos, adquiridos mediante el uso de
    lenguajes como Java, Swift y JavaScript, así como a través de la
    formación académica recibida durante el grado.

- [Motivación]{.underline}

  - **Nota:** 5.

  - **Justificación**: "Load Crutches" aborda un problema real del
    ámbito sanitario y de la rehabilitación, con un enfoque innovador
    por el uso de un dispositivo inteligente. Este carácter aplicado y
    su potencial impacto positivo en la recuperación de pacientes, junto
    con las experiencias personales del desarrollador en este ámbito,
    incrementan notablemente su motivación.

- [Dificultad del lenguaje de programación]{.underline}

  - **Nota:** 2.

  - **Justificación**: aunque el proyecto utiliza varios lenguajes y
    tecnologías (*backend*, *frontend* web y aplicación móvil), estos se
    basan en herramientas y paradigmas conocidos por el desarrollador.
    Sin embargo, la integración entre sistemas y la comunicación con
    dispositivos Bluetooth añade cierta complejidad adicional.

- [Estabilidad de los requisitos]{.underline}

  - **Nota:** 4.

  - **Justificación**: los requisitos del sistema están bien definidos
    desde las fases iniciales del proyecto y se espera que permanezcan
    relativamente estables durante el desarrollo. Aun así, pueden surgir
    pequeños ajustes derivados de pruebas con usuarios reales o de la
    integración con la muleta inteligente.

3.  []{#_bookmark8 .anchor}Lista de casos de uso y representación de
    actores del sistema

> Para la realización de la estimación es necesario tener definidos los
> actores involucrados en el sistema, así como la lista de casos de uso,
> para poder asignarles un valor de complejidad en función de sus
> propiedades. Aunque estos aspectos forman parte del Anexo I de este
> proyecto, esta recopilación de actores y casos de uso servirá como
> base para aplicar los modelos de estimación empleados en los
> siguientes apartados, permitiendo obtener una aproximación razonable
> del tamaño y del esfuerzo necesario para el desarrollo completo del
> sistema.

4.  []{#_bookmark9 .anchor}Actores del sistema

[]{#_bookmark10 .anchor}Tabla 1: Especificación del actor ACT-01: Doctor

  ----------------------------------------------------------------------
  **ACT-01**        **Doctor**
  ----------------- ----------------------------------------------------
  **Versión**       1.0 (15/10/2025)

  **Autores**       Víctor Martín Fuentes

  **Fuentes**       

  **Descripción**   El actor representa al usuario con rol de doctor que
                    accede al sistema a través del panel web. Es el
                    responsable de la gestión clínica de los pacientes,
                    pudiendo registrar nuevos pacientes, editar y
                    eliminar sus datos, asignar patologías, configurar
                    límites y objetivos de rehabilitación, consultar el
                    historial de sesiones y crear o eliminar consejos
                    médicos.

  **Comentarios**   Es el actor principal del sistema desde el punto de
                    vista clínico y de supervisión del tratamiento.
  ----------------------------------------------------------------------

> []{#_bookmark11 .anchor}Tabla 2: Especificación del actor ACT-02:
> Paciente

  ----------------------------------------------------------------------
  **ACT-02**        **Paciente**
  ----------------- ----------------------------------------------------
  **Versión**       1.0 (15/10/2025)

  **Autores**       Víctor Martín Fuentes

  **Fuentes**       

  **Descripción**   El actor representa al usuario final del sistema que
                    utiliza la aplicación móvil. El paciente realiza
                    sesiones de rehabilitación utilizando la muleta
                    inteligente, consulta su progreso diario, visualiza
                    estadísticas, accede a su perfil personal y recibe
                    consejos médicos asignados por su doctor.

  **Comentarios**   El paciente no puede modificar datos clínicos ni de
                    tratamiento, salvo su contraseña, siendo un actor
                    principalmente consumidor de información y generador
                    de datos de sesión.
  ----------------------------------------------------------------------

> []{#_bookmark12 .anchor}Tabla 3: Especificación del actor ACT-03:
> Muleta inteligente

  ----------------------------------------------------------------------
  **ACT-03**        **Muleta inteligente**
  ----------------- ----------------------------------------------------
  **Versión**       1.0 (15/10/2025)

  **Autores**       Víctor Martín Fuentes

  **Fuentes**       

  **Descripción**   El actor representa el dispositivo físico
                    instrumentado que se comunica con la aplicación
                    móvil mediante tecnología Bluetooth. La muleta envía
                    de forma continua los datos de carga soportada en
                    cada paso, permitiendo al sistema analizar la
                    rehabilitación del paciente en tiempo real.

  **Comentarios**   Se trata de un actor externo al sistema software,
                    pero fundamental para la recogida de datos clínicos.
  ----------------------------------------------------------------------

> []{#_bookmark13 .anchor}Tabla 4: Especificación del actor ACT-04:
> Servidor de correo electrónico

  ----------------------------------------------------------------------
  **ACT-04**        **Servidor de correo electrónico**
  ----------------- ----------------------------------------------------
  **Versión**       1.0 (15/10/2025)

  **Autores**       Víctor Martín Fuentes

  **Fuentes**       

  **Descripción**   El actor representa el sistema externo encargado del
                    envío de correos electrónicos automáticos,
                    utilizados principalmente durante los procesos de
                    autenticación y registro, como el envío de
                    credenciales a los pacientes o notificaciones
                    relacionadas con el acceso al sistema.

  **Comentarios**   Su uso está restringido a procesos de autenticación
                    y alta de usuarios.
  ----------------------------------------------------------------------

5.  []{#_bookmark14 .anchor}Casos de uso

> []{#_bookmark15 .anchor}Tabla 5: Especificación del caso de uso
> UC-0001: Iniciar sesión

+------------------+------------------------------------------------------------------------+
| **UC-0001**      | **Iniciar sesión**                                                     |
+==================+===========================+============================================+
| **Versión**      | 1.0 (15/10/2025)                                                       |
+------------------+------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                  |
+------------------+------------------------------------------------------------------------+
| **Fuentes**      |                                                                        |
+------------------+------------------------------------------------------------------------+
| **Dependencias** | ACT-01 Doctor ACT-02 Paciente                                          |
|                  |                                                                        |
|                  | NFR-0001 Seguridad y privacidad                                        |
|                  |                                                                        |
|                  | NFR-0002 Gestión de autenticación                                      |
+------------------+------------------------------------------------------------------------+
| **Descripción**  | El sistema permite a un usuario registrado (doctor o paciente)         |
|                  | autenticarse mediante sus credenciales para acceder a las              |
|                  | funcionalidades correspondientes a su rol dentro de la plataforma.     |
+------------------+------------------------------------------------------------------------+
| **Precondición** | El usuario debe estar previamente registrado en el sistema.            |
+------------------+---------------------------+--------------------------------------------+
| **Secuencia      | **Paso**                  | > **Acción**                               |
| normal**         |                           |                                            |
|                  +---------------------------+--------------------------------------------+
|                  | 1                         | > El actor ACT-01 (doctor) o ACT-02        |
|                  |                           | > (paciente) accede a la pantalla de       |
|                  |                           | > inicio de sesión.                        |
|                  +---------------------------+--------------------------------------------+
|                  | 2                         | > El usuario introduce su nombre de        |
|                  |                           | > usuario y contraseña.                    |
|                  +---------------------------+--------------------------------------------+
|                  | 3                         | > El sistema envía las credenciales al     |
|                  |                           | > servidor *backend* para su validación.   |
|                  +---------------------------+--------------------------------------------+
|                  | 4                         | > El sistema verifica la existencia del    |
|                  |                           | > usuario y la validez de la contraseña.   |
|                  +---------------------------+--------------------------------------------+
|                  | 5                         | > El sistema genera un token de            |
|                  |                           | > autenticación y concede acceso a la      |
|                  |                           | > aplicación correspondiente (panel web o  |
|                  |                           | > app móvil).                              |
+------------------+---------------------------+--------------------------------------------+

+-------------------+------------------------------------------------------------------------+
| **Postcondición** | El usuario queda autenticado en el sistema y puede acceder a las       |
|                   | funcionalidades permitidas por su rol.                                 |
+===================+:=========================:+===========================================:+
| **Excepciones**   | **Paso**                  | > **Acción**                               |
|                   +---------------------------+--------------------------------------------+
|                   | 3                         | > Si el usuario no existe o la contraseña  |
|                   |                           | > es incorrecta, el sistema muestra un     |
|                   |                           | > mensaje de error y solicita de nuevo las |
|                   |                           | > credenciales.                            |
+-------------------+---------------------------+--------------------------------------------+
| **Importancia**   | Crítica                                                                |
+-------------------+------------------------------------------------------------------------+
| **Urgencia**      |                                                                        |
+-------------------+------------------------------------------------------------------------+
| **Estado**        | En construcción                                                        |
+-------------------+------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                   |
+-------------------+------------------------------------------------------------------------+
| **Comentarios**   | Caso de uso común tanto para doctor como para paciente,                |
|                   | diferenciándose posteriormente por rol.                                |
+-------------------+------------------------------------------------------------------------+

> []{#_bookmark16 .anchor}Tabla 6: Especificación del caso de uso
> UC-0002: Cerrar sesión

+------------------+------------------------------------------------------------------------+
| **UC-0002**      | **Cerrar sesión**                                                      |
+==================+===========================+============================================+
| **Versión**      | 1.0 (15/10/2025)                                                       |
+------------------+------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                  |
+------------------+------------------------------------------------------------------------+
| **Fuentes**      |                                                                        |
+------------------+------------------------------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión ACT-01 Doctor                                   |
|                  |                                                                        |
|                  | ACT-02 Paciente                                                        |
|                  |                                                                        |
|                  | NFR-0001 Seguridad y privacidad                                        |
+------------------+------------------------------------------------------------------------+
| **Descripción**  | El sistema permite al usuario autenticado finalizar su sesión activa   |
|                  | de forma segura, eliminando las credenciales almacenadas localmente    |
|                  | para evitar accesos no autorizados al sistema.                         |
+------------------+------------------------------------------------------------------------+
| **Precondición** | El usuario (doctor o paciente) debe haber iniciado sesión previamente. |
+------------------+---------------------------+--------------------------------------------+
|                  | > **Paso**                | **Acción**                                 |
+------------------+---------------------------+--------------------------------------------+

+-------------------+---------------------------+--------------------------------------------+
| **Secuencia       | 1                         | El actor ACT-01 (Doctor) o ACT-02          |
| normal**          |                           | (Paciente) selecciona la opción "Cerrar    |
|                   |                           | sesión".                                   |
|                   +---------------------------+--------------------------------------------+
|                   | 2                         | El sistema solicita confirmación de la     |
|                   |                           | acción (opcional según la interfaz).       |
|                   +---------------------------+--------------------------------------------+
|                   | 3                         | El sistema elimina el token de             |
|                   |                           | autenticación almacenado en el             |
|                   |                           | dispositivo.                               |
|                   +---------------------------+--------------------------------------------+
|                   | 4                         | El sistema limpia los datos temporales     |
|                   |                           | asociados a la sesión.                     |
|                   +---------------------------+--------------------------------------------+
|                   | 5                         | El sistema redirige al usuario a la        |
|                   |                           | pantalla pública de inicio de sesión.      |
+===================+===========================+============================================+
| **Postcondición** | El usuario queda completamente desconectado del sistema y no puede     |
|                   | acceder a rutas protegidas sin volver a autenticarse.                  |
+-------------------+---------------------------+--------------------------------------------+
| **Excepciones**   | **Paso**                  | > **Acción**                               |
|                   +---------------------------+--------------------------------------------+
|                   | 3                         | > Si el token ya ha expirado, el sistema   |
|                   |                           | > realiza igualmente la limpieza local y   |
|                   |                           | > redirige al usuario a la pantalla de     |
|                   |                           | > inicio.                                  |
+-------------------+---------------------------+--------------------------------------------+
| **Importancia**   | Media                                                                  |
+-------------------+------------------------------------------------------------------------+
| **Urgencia**      |                                                                        |
+-------------------+------------------------------------------------------------------------+
| **Estado**        | En construcción                                                        |
+-------------------+------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                   |
+-------------------+------------------------------------------------------------------------+
| **Comentarios**   | Al utilizar autenticación mediante JWT, el cierre de sesión se realiza |
|                   | principalmente en el cliente sin necesidad de comunicación con el      |
|                   | *backend*.                                                             |
+-------------------+------------------------------------------------------------------------+

> []{#_bookmark17 .anchor}Tabla 7: Especificación del caso de uso
> UC-0003: Registrar doctor

  -----------------------------------------------------------------
  **UC-0003**   **Registrar doctor**
  ------------- ---------------------------------------------------
  **Versión**   1.0 (15/10/2025)

  **Autores**   Víctor Martín Fuentes

  **Fuentes**   
  -----------------------------------------------------------------

+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Iniciar sesión ACT-01 Doctor                                    |
|                   |                                                                         |
|                   | IRQ-0001 Datos de usuarios y roles                                      |
|                   |                                                                         |
|                   | NFR-0001 Seguridad                                                      |
+===================+:==========================+:============================================+
| **Descripción**   | El sistema debe permitir el registro de nuevos doctores en la           |
|                   | plataforma, creando sus credenciales de acceso al panel web y           |
|                   | asignándoles el rol correspondiente para la gestión clínica de          |
|                   | pacientes.                                                              |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor administrador debe haber iniciado sesión correctamente en el  |
|                   | panel web.                                                              |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (Doctor administrador)      |
|                   |                           | accede a la opción "Registrar doctor".      |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema muestra el formulario de         |
|                   |                           | registro de doctor.                         |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor introduce los datos personales y  |
|                   |                           | de acceso del nuevo profesional.            |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor pulsa la opción "Guardar".        |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema valida que el correo electrónico |
|                   |                           | no esté previamente registrado.             |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema crea el nuevo usuario con rol de |
|                   |                           | doctor en la base de datos.                 |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema confirma el registro exitoso.    |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El nuevo doctor queda registrado en el sistema y puede iniciar sesión   |
|                   | en el panel web.                                                        |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | Si el correo electrónico ya existe, el      |
|                   |                           | sistema muestra un mensaje de error y no    |
|                   |                           | registra al doctor.                         |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | El alta de doctores se limita a usuarios con el código de doctor        |
|                   | proporcionado por el administrador del sistema.                         |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark18 .anchor}Tabla 8: Especificación del caso de uso
> UC-0004: Registrar paciente

+------------------+---------------------------------------------------+
| **UC-0004**      | **Registrar paciente**                            |
+==================+===================================================+
| **Versión**      | 1.0 (15/10/2025)                                  |
+------------------+---------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                             |
+------------------+---------------------------------------------------+
| **Fuentes**      |                                                   |
+------------------+---------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión ACT-01 Doctor              |
|                  |                                                   |
|                  | IRQ-0001 Datos de usuarios y roles NFR-0001       |
|                  | Seguridad                                         |
+------------------+---------------------------------------------------+

+------------------+-------------------------------------------------------------------------+
| **Descripción**  | El sistema debe permitir al usuario con rol de doctor registrar un      |
|                  | nuevo paciente en la plataforma, creando sus credenciales de acceso y   |
|                  | su perfil clínico básico, necesario para el correcto funcionamiento     |
|                  |                                                                         |
|                  | de la muleta inteligente y el seguimiento del proceso de                |
|                  | rehabilitación.                                                         |
+==================+===========================+=============================================+
| **Precondición** | El doctor debe haber iniciado sesión correctamente en el panel web.     |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El actor ACT-01 (doctor) selecciona la      |
|                  |                           | opción "Añadir paciente" desde el panel     |
|                  |                           | principal.                                  |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El sistema muestra el formulario de         |
|                  |                           | registro de paciente.                       |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El doctor introduce los datos personales    |
|                  |                           | del paciente (nombre, apellidos, email,     |
|                  |                           | DNI) y los datos clínicos básicos (altura,  |
|                  |                           | peso inicial, fecha de nacimiento, género y |
|                  |                           | descripción).                               |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El sistema genera automáticamente una       |
|                  |                           | contraseña inicial para el paciente.        |
|                  +---------------------------+---------------------------------------------+
|                  | 5                         | El doctor pulsa la opción "Añadir           |
|                  |                           | Paciente".                                  |
|                  +---------------------------+---------------------------------------------+
|                  | 6                         | El sistema valida que el correo electrónico |
|                  |                           | no esté registrado previamente.             |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 7                         | El sistema crea el nuevo usuario con rol de |
|                   |                           | paciente y lo asocia al doctor actual.      |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema envía un correo electrónico al   |
|                   |                           | paciente con sus credenciales de acceso.    |
|                   +---------------------------+---------------------------------------------+
|                   | 9                         | El sistema confirma el registro exitoso y   |
|                   |                           | muestra al nuevo paciente en el listado.    |
+===================+===========================+=============================================+
| **Postcondición** | El paciente queda registrado en el sistema con rol de paciente y puede  |
|                   | iniciar sesión en la aplicación móvil utilizando las credenciales       |
|                   |                                                                         |
|                   | enviadas por correo electrónico.                                        |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | Si el correo electrónico ya existe en el    |
|                   |                           | sistema, se muestra un mensaje de error y   |
|                   |                           | no se realiza el registro.                  |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | El envío de credenciales al paciente se realiza automáticamente         |
|                   | mediante el servidor de correo electrónico integrado en el sistema.     |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark19 .anchor}Tabla 9: Especificación del caso de uso
> UC-0005: Listar pacientes

+------------------+-------------------------------------------------------------------------+
| **UC-0005**      | **Listar pacientes**                                                    |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión ACT-01 Doctor                                    |
|                  |                                                                         |
|                  | IRQ-0001 Datos de usuarios                                              |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | El sistema debe permitir al doctor visualizar un listado de todos los   |
|                  | pacientes que tiene asignados bajo su supervisión, mostrando sus datos  |
|                  | principales y proporcionando acceso a las distintas opciones de         |
|                  |                                                                         |
|                  | gestión clínica.                                                        |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El doctor debe haber iniciado sesión correctamente en el panel web.     |
+------------------+---------------------------+---------------------------------------------+
|                  | > **Paso**                | **Acción**                                  |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | 1                         | El actor ACT-01 (Doctor) accede a la        |
| normal**          |                           | sección "Pacientes" desde el menú           |
|                   |                           | principal.                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema consulta la base de datos para   |
|                   |                           | obtener los pacientes asociados al doctor   |
|                   |                           | autenticado.                                |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra un listado con los datos |
|                   |                           | principales de cada paciente (Nombre,       |
|                   |                           | Email, DNI, etc.).                          |
+===================+===========================+=============================================+
| **Postcondición** | El doctor visualiza el listado actualizado de pacientes bajo su         |
|                   | supervisión.                                                            |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Si el doctor no tiene pacientes asignados,  |
|                   |                           | el sistema muestra el mensaje "No hay       |
|                   |                           | pacientes registrados".                     |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Este caso de uso actúa como punto de entrada para los casos de uso      |
|                   | "Editar paciente" y **"**Eliminar paciente".                            |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark20 .anchor}Tabla 10: Especificación del caso de uso
> UC-0006: Editar paciente

+------------------+-------------------------------------------------------------------------+
| **UC-0006**      | **Editar paciente**                                                     |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0005 Listar pacientes ACT-01 Doctor                                  |
|                  |                                                                         |
|                  | IRQ-0001 Datos de usuarios                                              |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Este caso de uso permite al doctor modificar los datos físicos y de     |
|                  | configuración clínica de un paciente previamente registrado, con el     |
|                  | objetivo de adaptar el tratamiento de rehabilitación ante cambios en    |
|                  |                                                                         |
|                  | la evolución del paciente.                                              |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El doctor debe haber iniciado sesión y haber seleccionado previamente   |
|                  | un paciente del listado.                                                |
+------------------+---------------------------+---------------------------------------------+
|                  | > **Paso**                | **Acción**                                  |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | 1                         | El actor ACT-01 (doctor) selecciona la      |
| normal**          |                           | opción "Editar" en la ficha del paciente.   |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema carga los datos actuales del     |
|                   |                           | paciente en un formulario editable.         |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El doctor modifica los campos necesarios    |
|                   |                           | (límites de peso y/o límites de pasos).     |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor modifica los campos necesarios    |
|                   |                           | (límites de peso y/o límites de pasos).     |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El doctor pulsa la opción "Guardar          |
|                   |                           | cambios".                                   |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema actualiza la información del     |
|                   |                           | paciente en la base de datos.               |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema actualiza la información del     |
|                   |                           | paciente en la base de datos.               |
+===================+===========================+=============================================+
| **Postcondición** | Los datos del paciente quedan actualizados de forma persistente en el   |
|                   | sistema.                                                                |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | Si los datos introducidos no son válidos,   |
|                   |                           | el sistema muestra un mensaje de error y no |
|                   |                           | realiza la actualización.                   |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | El doctor no puede modificar las credenciales de acceso del paciente    |
|                   | desde este caso de uso; el cambio de contraseña debe realizarlo el      |
|                   |                                                                         |
|                   | propio paciente desde su perfil.                                        |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark21 .anchor}Tabla 11: Especificación del caso de uso
> UC-0007: Eliminar paciente

  -----------------------------------------------------------------
  **UC-0007**   **Eliminar paciente**
  ------------- ---------------------------------------------------
  **Versión**   1.0 (15/10/2025)

  **Autores**   Víctor Martín Fuentes

  **Fuentes**   
  -----------------------------------------------------------------

+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0005 Listar pacientes ACT-01 Doctor                                  |
|                   |                                                                         |
|                   | NFR-0001 Seguridad                                                      |
+===================+:==========================+:============================================+
| **Descripción**   | Este caso de uso permite al doctor eliminar de forma definitiva a un    |
|                   | paciente del sistema. La eliminación implica el borrado completo del    |
|                   | usuario y de toda la información clínica asociada, incluyendo sesiones  |
|                   |                                                                         |
|                   | de rehabilitación, mensajes de chat y configuraciones, garantizando la  |
|                   | integridad de los datos mediante borrado en cascada.                    |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor debe haber iniciado sesión y tener permisos sobre el paciente |
|                   | seleccionado.                                                           |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (doctor) pulsa sobre el     |
|                   |                           | paciente que quiere eliminar.               |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El actor ACT-01 (doctor) pulsa la opción    |
|                   |                           | "Eliminar" del modal.                       |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra un mensaje de            |
|                   |                           | advertencia solicitando confirmación.       |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor confirma la eliminación del       |
|                   |                           | paciente.                                   |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema verifica que el paciente         |
|                   |                           | pertenece al doctor autenticado.            |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema elimina el usuario paciente y    |
|                   |                           | todos sus datos asociados en la base de     |
|                   |                           | datos.                                      |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema actualiza el listado de          |
|                   |                           | pacientes eliminando al paciente borrado.   |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El paciente deja de existir en el sistema y no puede volver a iniciar   |
|                   | sesión.                                                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Si se produce un error de integridad o de   |
|                   |                           | comunicación, el sistema muestra el mensaje |
|                   |                           | notificandolo.                              |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | El sistema utiliza mecanismos de borrado en cascada para evitar la      |
|                   | existencia de registros huérfanos asociados al paciente eliminado.      |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark22 .anchor}Tabla 12: Especificación del caso de uso
> UC-0008: Ver perfil personal (paciente)

+-------------------+-------------------------------------------------------------------------+
| **UC-0008**       | **Ver perfil personal (paciente)**                                      |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (15/10/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       |                                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Iniciar sesión ACT-02 Paciente                                  |
|                   |                                                                         |
|                   | IRQ-0001 Datos de Usuarios                                              |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Este caso de uso permite al paciente consultar su perfil personal y     |
|                   | clínico almacenado en el sistema. La información mostrada es de solo    |
|                   | lectura y tiene como objetivo que el paciente pueda verificar sus datos |
|                   | antropométricos y clínicos, los cuales influyen directamente en el      |
|                   |                                                                         |
|                   | proceso de rehabilitación con la muleta inteligente.                    |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El paciente debe haber iniciado sesión correctamente en la aplicación   |
|                   | móvil.                                                                  |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-02 (paciente) accede a la      |
|                   |                           | sección "Perfil" desde la aplicación móvil. |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema realiza una petición al          |
|                   |                           | *backend* para obtener los datos del        |
|                   |                           | paciente autenticado.                       |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El *backend* devuelve la información        |
|                   |                           | personal y clínica del paciente.            |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema muestra en pantalla los datos    |
|                   |                           | personales (nombre, apellidos, email, DNI,  |
|                   |                           | género, fecha de nacimiento) y los datos    |
|                   |                           | clínicos (peso y altura).                   |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El paciente visualiza la información de su  |
|                   |                           | perfil.                                     |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Ninguna                                                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | Si se produce un error en la respuesta del  |
|                   |                           | servidor, el sistema no cargará el perfil.  |
+-------------------+---------------------------+---------------------------------------------+

  ---------------------------------------------------------------------
  **Estabilidad**   Alta
  ----------------- ---------------------------------------------------
  **Comentarios**   El paciente no puede modificar los datos mostrados
                    en esta vista, salvo la contraseña desde el caso de
                    uso correspondiente.

  ---------------------------------------------------------------------

> Tabla 12: Especificación del caso de uso UC-0009: Borrar modelo

+------------------+-------------------------------------------------------------------------+
| **UC-0009**      | **Cambiar contraseña**                                                  |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión ACT-01 Doctor                                    |
|                  |                                                                         |
|                  | ACT-02 Paciente NFR-0001 Seguridad                                      |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Este caso de uso permite a cualquier usuario autenticado del sistema,   |
|                  | ya sea doctor o paciente, modificar su contraseña de acceso. Su         |
|                  | objetivo principal es mejorar la seguridad de la cuenta y permitir al   |
|                  | usuario actualizar sus credenciales cuando lo considere necesario.      |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El usuario (doctor o paciente) debe haber iniciado sesión correctamente |
|                  | en el sistema.                                                          |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El actor ACT-01 (doctor) o ACT-02           |
|                  |                           | (paciente) accede a la sección de           |
|                  |                           | configuración de cuenta.                    |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El sistema muestra el formulario de cambio  |
|                  |                           | de contraseña solicitando la contraseña     |
|                  |                           | actual y la nueva contraseña.               |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El usuario introduce la contraseña actual,  |
|                  |                           | la nueva contraseña y su confirmación.      |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El sistema valida que la contraseña actual  |
|                  |                           | coincide con la almacenada.                 |
|                  +---------------------------+---------------------------------------------+
|                  | 5                         | El sistema valida que la nueva contraseña y |
|                  |                           | su confirmación coinciden.                  |
|                  +---------------------------+---------------------------------------------+
|                  | 6                         | El sistema actualiza la contraseña del      |
|                  |                           | usuario aplicando los mecanismos de         |
|                  |                           | seguridad correspondientes.                 |
|                  +---------------------------+---------------------------------------------+
|                  | 7                         | El sistema notifica al usuario que la       |
|                  |                           | contraseña se ha actualizado correctamente. |
+------------------+---------------------------+---------------------------------------------+

+-------------------+-------------------------------------------------------------------------+
| **Postcondición** | La contraseña anterior queda invalidada y el usuario deberá utilizar la |
|                   | nueva contraseña en el próximo inicio de sesión.                        |
+===================+:=========================:+============================================:+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Si la contraseña actual no es correcta, el  |
|                   |                           | sistema muestra un mensaje de error y no    |
|                   |                           | realiza el cambio.                          |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | Si las nuevas contraseñas no coinciden, el  |
|                   |                           | sistema muestra un mensaje de error y no    |
|                   |                           | realiza el cambio.                          |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Es la única operación de modificación de credenciales permitida tanto   |
|                   | para doctores como para pacientes desde sus respectivas interfaces.     |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark23 .anchor}Tabla 13: Especificación del caso de uso
> UC-0010: Conectar muleta

+------------------+---------------------------------------------------+
| **UC-0010**      | **Conectar muleta**                               |
+==================+===================================================+
| **Versión**      | 1.0 (15/10/2025)                                  |
+------------------+---------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                             |
+------------------+---------------------------------------------------+
| **Fuentes**      |                                                   |
+------------------+---------------------------------------------------+
| **Dependencias** | ACT-02 Paciente                                   |
|                  |                                                   |
|                  | OBJ-0002 Integración Muleta Inteligente NFR-0002  |
|                  | Conectividad y Latencia                           |
+------------------+---------------------------------------------------+
| **Descripción**  | Este caso de uso permite a la aplicación móvil    |
|                  | detectar y conectar una muleta inteligente        |
|                  | mediante tecnología Bluetooth. El objetivo es     |
|                  | establecer un canal de comunicación seguro y      |
|                  | estable que permita la transmisión de los datos   |
|                  | de carga y pasos necesarios para la realización   |
|                  | de las sesiones de rehabilitación.                |
+------------------+---------------------------------------------------+
| **Precondición** | - El paciente debe haber iniciado sesión en la    |
|                  |   aplicación móvil.                               |
|                  |                                                   |
|                  | - El Bluetooth del dispositivo móvil debe estar   |
|                  |   activado.                                       |
|                  |                                                   |
|                  | - La muleta inteligente debe estar encendida y    |
|                  |   con batería suficiente.                         |
|                  |                                                   |
|                  | - La aplicación debe disponer de los permisos de  |
|                  |   Bluetooth y localización concedidos por el      |
|                  |   sistema operativo.                              |
+------------------+---------------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-02 (paciente) accede a la      |
|                   |                           | sección de conexión desde la aplicación     |
|                   |                           | móvil.                                      |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema inicia el escaneo de             |
|                   |                           | dispositivos Bluetooth cercanos.            |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema filtra los dispositivos          |
|                   |                           | detectados mostrando únicamente las muletas |
|                   |                           | inteligentes compatibles.                   |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El paciente selecciona su muleta de la      |
|                   |                           | lista de dispositivos disponibles.          |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema solicita el establecimiento de   |
|                   |                           | la conexión Bluetooth.                      |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | La muleta acepta la conexión y el sistema   |
|                   |                           | descubre los servicios y características    |
|                   |                           | necesarias.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema muestra el estado "Conectado" y  |
|                   |                           | habilita las opciones para iniciar una      |
|                   |                           | sesión de rehabilitación.                   |
+===================+===========================+=============================================+
| **Postcondición** | La muleta queda conectada correctamente a la aplicación móvil y el      |
|                   | canal de comunicación Bluetooth está listo para la transmisión de       |
|                   |                                                                         |
|                   | datos.                                                                  |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Si el Bluetooth del dispositivo está        |
|                   |                           | desactivado, el sistema solicita al usuario |
|                   |                           | que lo active.                              |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | Si no se detecta ninguna muleta tras un     |
|                   |                           | tiempo de espera, el sistema lo notifica.   |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | El filtrado por nombre o identificador del dispositivo evita conexiones |
|                   | erróneas con otros dispositivos Bluetooth ajenos al sistema.            |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark24 .anchor}Tabla 14: Especificación del caso de uso
> UC-0011: Realizar sesión de rehabilitación

  -----------------------------------------------------------------
  **UC-0011**   **Realizar sesión de rehabilitación**
  ------------- ---------------------------------------------------

  -----------------------------------------------------------------

+------------------+-------------------------------------------------------------------------+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+==================+===========================+=============================================+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0010 Conectar muleta ACT-02 Paciente                                 |
|                  |                                                                         |
|                  | IRQ-0003 Configuración del tratamiento NFR-0002 Tiempo real             |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Este caso de uso describe el flujo principal de rehabilitación del      |
|                  | paciente mediante el uso de la muleta inteligente. Durante la sesión,   |
|                  | la aplicación móvil recibe en tiempo real los datos de carga soportada  |
|                  | en cada paso, los compara con los límites establecidos por el doctor y  |
|                  | proporciona *feedback* visual inmediato para ayudar al paciente a       |
|                  |                                                                         |
|                  | corregir su apoyo.                                                      |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | - La muleta inteligente debe estar conectada correctamente a la         |
|                  |   aplicación móvil.                                                     |
|                  |                                                                         |
|                  | - Existen límites de carga y parámetros de rehabilitación previamente   |
|                  |   configurados y descargados desde el servidor.                         |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El actor ACT-02 (paciente) pulsa el botón   |
|                  |                           | "Empezar sesión" en la aplicación móvil.    |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El paciente realiza un paso apoyándose en   |
|                  |                           | la muleta.                                  |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | La muleta detecta la carga aplicada y envía |
|                  |                           | el valor a la aplicación móvil.             |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El sistema compara el valor recibido con    |
|                  |                           | los límites configurados para el paciente.  |
|                  +---------------------------+---------------------------------------------+
|                  | 5                         | El sistema muestra *feedback* visual        |
|                  |                           | inmediato indicando si la carga es          |
|                  |                           | correcta, excesiva o insuficiente.          |
|                  +---------------------------+---------------------------------------------+
|                  | 6                         | El sistema incrementa el contador de pasos  |
|                  |                           | de la sesión.                               |
|                  +---------------------------+---------------------------------------------+
|                  | 7                         | El paciente observa el resultado y ajusta   |
|                  |                           | el apoyo para el siguiente paso.            |
+------------------+---------------------------+---------------------------------------------+

+-------------------+-------------------------------------------------------------------------+
| **Postcondición** | Los datos de los pasos realizados durante la sesión quedan              |
|                   |                                                                         |
|                   | almacenados temporalmente en el dispositivo móvil a la espera de ser    |
|                   | enviados al servidor.                                                   |
+===================+:=========================:+============================================:+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | Si se pierde la conexión Bluetooth durante  |
|                   |                           | la sesión, el sistema detiene la captura de |
|                   |                           | datos y cancela la sesión.                  |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | El *feedback* visual en tiempo real es clave para garantizar una        |
|                   |                                                                         |
|                   | rehabilitación segura y eficaz, ayudando al paciente a corregir errores |
|                   | de carga de forma inmediata.                                            |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark25 .anchor}Tabla 15: Especificación del caso de uso
> UC-0012: Finalizar y guardar sesión

+------------------+-------------------------------------------------------------------------+
| **UC-0012**      | **Finalizar y guardar sesión**                                          |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0011 Realizar sesión de rehabilitación ACT-02 Paciente               |
|                  |                                                                         |
|                  | IRQ-0002 Telemetría de sesiones                                         |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Este caso de uso describe el proceso mediante el cual el paciente       |
|                  | finaliza una sesión de rehabilitación y el sistema consolida los datos  |
|                  | recogidos durante la misma. La aplicación móvil calcula las métricas    |
|                  | finales de la sesión y envía la información al *backend* para su        |
|                  | almacenamiento permanente en la base de datos.                          |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | Debe existir al menos un paso registrado durante la sesión de           |
|                  | rehabilitación activa.                                                  |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El actor ACT-02 (paciente) pulsa el botón   |
|                  |                           | "Finalizar".                                |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 2                         | La aplicación calcula las estadísticas      |
|                   |                           | finales de la sesión (carga media, carga    |
|                   |                           | máxima, total de pasos).                    |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | La aplicación construye el objeto JSON con  |
|                   |                           | los datos de la sesión.                     |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema envía los datos al servidor      |
|                   |                           | *backend* para su validación y              |
|                   |                           | almacenamiento.                             |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El *backend* valida la información recibida |
|                   |                           | y confirma el guardado de la sesión.        |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | La aplicación muestra un mensaje de         |
|                   |                           | confirmación                                |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema redirige al paciente a la        |
|                   |                           | pantalla de inicio de la aplicación móvil.  |
+===================+:==========================+:============================================+
| **Postcondición** | Los datos de la sesión quedan almacenados de forma persistente en la    |
|                   | base de datos y están disponibles para su consulta tanto por el         |
|                   | paciente como por el doctor.                                            |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Ninguno                                                                 |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark26 .anchor}Tabla 16: Especificación del caso de uso
> UC-0013: Consultar progreso diario

+------------------+---------------------------------------------------+
| **UC-0013**      | **Consultar progreso diario**                     |
+==================+===================================================+
| **Versión**      | 1.0 (15/10/2025)                                  |
+------------------+---------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                             |
+------------------+---------------------------------------------------+
| **Fuentes**      |                                                   |
+------------------+---------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión (Paciente) ACT-02 Paciente |
|                  |                                                   |
|                  | IRQ-0002 Telemetría de sesiones                   |
|                  |                                                   |
|                  | IRQ-0003 Objetivos de rehabilitación              |
+------------------+---------------------------------------------------+
| **Descripción**  | Este caso de uso permite al paciente consultar su |
|                  | progreso diario acumulado en la aplicación móvil. |
|                  | El sistema muestra métricas                       |
|                  |                                                   |
|                  | resumidas de las microsesiones realizadas durante |
|                  | el día en curso,                                  |
+------------------+---------------------------------------------------+

+-------------------+-------------------------------------------------------------------------+
|                   | facilitando el seguimiento del cumplimiento de los objetivos de         |
|                   | rehabilitación establecidos por el doctor.                              |
+:=================:+===========================+=============================================+
| **Precondición**  | El paciente debe haber iniciado sesión correctamente en la aplicación   |
|                   | móvil.                                                                  |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-02 (paciente) accede a la      |
|                   |                           | pantalla "Estadísticas".                    |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El actor ACT-02 (paciente) accede a la      |
|                   |                           | pantalla de pesos o de pasos.               |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema recupera los datos de todas las  |
|                   |                           | sesiones realizadas durante el día actual.  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema calcula las métricas diarias     |
|                   |                           | acumuladas.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | La aplicación muestra los indicadores       |
|                   |                           | principales de progreso.                    |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El paciente visualiza su desempeño diario y |
|                   |                           | el grado de cumplimiento de los objetivos   |
|                   |                           | establecidos.                               |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Ninguna                                                                 |
+-------------------+-------------------------------------------------------------------------+

+-----------------+---------------------------+---------------------------------------------+
| **Excepciones** | **Paso**                  | **Acción**                                  |
|                 +---------------------------+---------------------------------------------+
|                 | 2                         | Si se produce un error al recuperar los     |
|                 |                           | datos, el sistema notifica al paciente y    |
|                 |                           | finaliza el caso de uso.                    |
+=================+===========================+=============================================+
| **Estabilidad** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Comentarios** | Este caso de uso se centra exclusivamente en el progreso del día en     |
|                 | curso y no muestra históricos de días anteriores.                       |
+-----------------+-------------------------------------------------------------------------+

> []{#_bookmark27 .anchor}Tabla 17: Especificación del caso de uso
> UC-0014: Consultar historial de sesiones

  -----------------------------------------------------------------
  **UC-0014**   **Consultar historial de sesiones**
  ------------- ---------------------------------------------------
  **Versión**   1.0 (15/10/2025)

  **Autores**   Víctor Martín Fuentes
  -----------------------------------------------------------------

+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       |                                                                         |
+===================+===========================+=============================================+
| **Dependencias**  | UC-0005 Listar pacientes ACT-01 Doctor                                  |
|                   |                                                                         |
|                   | IRQ-0002 Telemetría de sesiones                                         |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Este caso de uso permite al doctor consultar el historial completo de   |
|                   | sesiones de rehabilitación de un paciente, con el objetivo de analizar  |
|                   | su evolución clínica. El sistema ofrece una vista jerárquica que        |
|                   | muestra un resumen diario de la actividad y permite acceder al detalle  |
|                   | de las sesiones individuales realizadas en cada día.                    |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor debe haber iniciado sesión y haber seleccionado previamente   |
|                   | un paciente de su lista.                                                |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (doctor) accede a la        |
|                   |                           | pestaña "Sesiones".                         |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El actor ACT-01 (doctor) selecciona al      |
|                   |                           | paciente del que quiere ver sus sesiones.   |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema recupera y muestra las gráficas  |
|                   |                           | de evolución de peso y pasos por día, junto |
|                   |                           | con una tabla resumen de sesiones diarias.  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor selecciona una fecha concreta y   |
|                   |                           | pulsa la opción "Ver detalles".             |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema carga la información detallada   |
|                   |                           | de la sesión diaria seleccionada, mostrando |
|                   |                           | las microsesiones realizadas.               |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El doctor analiza los datos mostrados para  |
|                   |                           | evaluar el progreso del paciente.           |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | Ninguna                                                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | Si el paciente no tiene sesiones            |
|                   |                           | registradas, el sistema no lo mostrará en   |
|                   |                           | el apartado de "Sesiones".                  |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Comentarios**   La diferenciación entre sesiones diarias y
                    microsesiones permite reducir la sobrecarga de
                    información y facilitar el análisis clínico por
                    parte del doctor.
  ----------------- ---------------------------------------------------

  ---------------------------------------------------------------------

> Tabla 18: Especificación del caso de uso UC-0015: Configurar límites y
> objetivos

+------------------+-------------------------------------------------------------------------+
| **UC-0015**      | **Configurar límites y objetivos**                                      |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0005 Listar pacientes ACT-01 Doctor                                  |
|                  |                                                                         |
|                  | IRQ-0003 Configuración del tratamiento                                  |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Este caso de uso permite al doctor definir y modificar los parámetros   |
|                  | clínicos que regulan el comportamiento de la muleta inteligente para un |
|                  | paciente concreto. Estos parámetros incluyen los límites de carga       |
|                  | soportada, los límites máximos de pasos diarios y los objetivos de      |
|                  | rehabilitación, garantizando la seguridad y eficacia del tratamiento.   |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El doctor debe haber iniciado sesión y haber seleccionado un paciente   |
|                  | de su lista.                                                            |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El actor ACT-01 (doctor) accede al panel de |
|                  |                           | pacientes.                                  |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El doctor selecciona el paciente al que     |
|                  |                           | desea asignar límites u objetivos.          |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El sistema muestra el formulario de         |
|                  |                           | configuración de tratamiento.               |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El doctor introduce los valores de límites  |
|                  |                           | de carga y/o pasos diarios, así como los    |
|                  |                           | objetivos de rehabilitación.                |
|                  +---------------------------+---------------------------------------------+
|                  | 5                         | El doctor pulsa la opción de guardar        |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 6                         | El sistema valida que los valores           |
|                   |                           | introducidos sean coherentes (peso mínimo   |
|                   |                           | menor que el máximo, objetivos dentro de    |
|                   |                           | los límites).                               |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema guarda la configuración en la    |
|                   |                           | base de datos.                              |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema confirma que la configuración se |
|                   |                           | ha realizado correctamente.                 |
+===================+:==========================+:============================================+
| **Postcondición** | Los nuevos límites y objetivos quedan almacenados y estarán disponibles |
|                   | para la aplicación móvil del paciente en su próxima sesión.             |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | Si los valores introducidos no son válidos, |
|                   |                           | el sistema muestra un mensaje de error y no |
|                   |                           | deja guardar los cambios.                   |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | La correcta configuración de estos parámetros es fundamental para       |
|                   | garantizar la seguridad del paciente durante la rehabilitación.         |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark28 .anchor}Tabla 18: Especificación del caso de uso
> UC-0016: Crear lesión

+------------------+---------------------------------------------------+
| **UC-0016**      | **Crear lesión**                                  |
+==================+===================================================+
| **Versión**      | 1.0 (15/10/2025)                                  |
+------------------+---------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                             |
+------------------+---------------------------------------------------+
| **Fuentes**      |                                                   |
+------------------+---------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión ACT-01 Doctor              |
|                  |                                                   |
|                  | IRQ-0003 Configuración del tratamiento            |
+------------------+---------------------------------------------------+
| **Descripción**  | Este caso de uso permite al doctor dar de alta    |
|                  | una nueva lesión o patología en el catálogo       |
|                  | general del sistema. Las lesiones registradas     |
|                  | podrán ser reutilizadas y asignadas               |
|                  | posteriormente a uno o varios pacientes,          |
|                  | facilitando la gestión clínica y la               |
|                  | estandarización de diagnósticos.                  |
+------------------+---------------------------------------------------+

+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El doctor debe haber iniciado sesión correctamente en el sistema.       |
+===================+:=========================:+============================================:+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (doctor) accede a la        |
|                   |                           | sección "Patologías".                       |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El doctor selecciona la opción "Añadir      |
|                   |                           | patología".                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra un formulario vacío de   |
|                   |                           | creación de lesión.                         |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor introduce el nombre de la lesión  |
|                   |                           | y una descripción opcional.                 |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El doctor pulsa la opción de guardar        |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema valida que el nombre de la       |
|                   |                           | lesión no esté vacío ni duplicado.          |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema crea el registro de la lesión en |
|                   |                           | la base de datos.                           |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema actualiza el listado de lesiones |
|                   |                           | mostrando la nueva patología.               |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | La nueva lesión queda registrada en el catálogo del sistema y puede ser |
|                   | asignada a pacientes.                                                   |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | Si el nombre está vacío o la lesión ya      |
|                   |                           | existe, el sistema muestra un mensaje de    |
|                   |                           | error y no guarda la información.           |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Las lesiones se crean de forma genérica para favorecer su reutilización |
|                   | en distintos pacientes y tratamientos.                                  |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark29 .anchor}Tabla 19: Especificación del caso de uso
> UC-0017: Editar lesión

  -----------------------------------------------------------------
  **UC-0017**   **Editar lesión**
  ------------- ---------------------------------------------------
  **Versión**   1.0 (15/10/2025)

  **Autores**   Víctor Martín Fuentes
  -----------------------------------------------------------------

+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       |                                                                         |
+===================+===========================+=============================================+
| **Dependencias**  | UC-0016 Crear lesión UC-0001 Iniciar sesión                             |
|                   |                                                                         |
|                   | ACT-01 Doctor                                                           |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Este caso de uso permite al doctor modificar la información de una      |
|                   | lesión existente en el catálogo del sistema, ya sea para corregir       |
|                   | errores, ampliar la descripción clínica o actualizar la información     |
|                   | asociada a dicha patología.                                             |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | La lesión debe existir previamente en el sistema y el doctor debe estar |
|                   | autenticado.                                                            |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (doctor) accede a la        |
|                   |                           | sección "Patologías".                       |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El doctor selecciona una lesión existente   |
|                   |                           | del listado y pulsa la opción "Editar".     |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema carga los datos actuales de la   |
|                   |                           | lesión en un formulario.                    |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor modifica el nombre y/o la         |
|                   |                           | descripción de la lesión.                   |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El doctor pulsa la opción de guardar        |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema valida los datos introducidos.   |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema guarda los cambios en la base de |
|                   |                           | datos.                                      |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema notifica que la lesión ha sido   |
|                   |                           | actualizada correctamente.                  |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | La información de la lesión queda actualizada y disponible para futuras |
|                   | asignaciones a pacientes.                                               |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | Si los datos introducidos no son válidos,   |
|                   |                           | el sistema muestra un mensaje de error y no |
|                   |                           | realiza la actualización.                   |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Comentarios**   Ninguno
  ----------------- ---------------------------------------------------

  ---------------------------------------------------------------------

> []{#_bookmark30 .anchor}Tabla 20: Especificación del caso de uso
> UC-0018: Eliminar lesión

+-------------------+-------------------------------------------------------------------------+
| **UC-0018**       | **Editar lesión**                                                       |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (15/10/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       |                                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Iniciar sesión ACT-01 Doctor                                    |
|                   |                                                                         |
|                   | NFR-0001 Seguridad (integridad referencial)                             |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Este caso de uso permite al doctor eliminar una lesión existente del    |
|                   | catálogo del sistema. La eliminación retira la patología de la lista de |
|                   | lesiones disponibles para futuras asignaciones.                         |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | La lesión debe existir previamente en el sistema y el doctor debe estar |
|                   | autenticado.                                                            |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (doctor) accede a la        |
|                   |                           | sección "Patologías".                       |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El doctor pulsa el icono de eliminar sobre  |
|                   |                           | una lesión del listado.                     |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra un mensaje de            |
|                   |                           | confirmación de la acción.                  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor confirma la eliminación.          |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema elimina la lesión del sistema.   |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El sistema actualiza el listado de          |
|                   |                           | lesiones.                                   |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | La lesión deja de estar disponible en el catálogo del sistema.          |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
+-------------------+---------------------------+---------------------------------------------+

+-----------------+---------------------------+---------------------------------------------+
|                 | 5                         | Si se produce un error, el sistema muestra  |
|                 |                           | un mensaje indicando que no se pudo         |
|                 |                           | eliminar la lesión.                         |
+=================+===========================+=============================================+
| **Estabilidad** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Comentarios** | Se recomienda no eliminar lesiones que formen parte de historiales      |
|                 | clínicos activos para evitar pérdidas de información del paciente.      |
+-----------------+-------------------------------------------------------------------------+

> []{#_bookmark31 .anchor}Tabla 21: Especificación del caso de uso
> UC-0019: Asignar lesión a paciente

+------------------+-------------------------------------------------------------------------+
| **UC-0019**      | **Asignar lesión a paciente**                                           |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0005 Listar pacientes UC-0016 Crear lesión                           |
|                  |                                                                         |
|                  | ACT-01 Doctor                                                           |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Este caso de uso permite al doctor asociar una lesión previamente       |
|                  | registrada en el catálogo del sistema a un paciente concreto. Esta      |
|                  | asociación es fundamental para contextualizar el tratamiento, las       |
|                  | sesiones de rehabilitación y los consejos médicos asignados al          |
|                  | paciente.                                                               |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | Deben existir tanto el paciente como la lesión en el sistema, y el      |
|                  | doctor debe haber iniciado sesión correctamente.                        |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El actor ACT-01 (doctor) accede a la        |
|                  |                           | sección "Pacientes".                        |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El actor ACT-01 (doctor) accede a la ficha  |
|                  |                           | de un paciente desde el listado de          |
|                  |                           | pacientes.                                  |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El doctor selecciona la opción "Asignar     |
|                  |                           | lesión".                                    |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El sistema muestra un desplegable con las   |
|                  |                           | lesiones disponibles en el catálogo.        |
+------------------+---------------------------+---------------------------------------------+

+------------+----+---------------------------------------------+
|            | 5  | El doctor selecciona la lesión              |
|            |    | correspondiente.                            |
|            +----+---------------------------------------------+
|            | 6  | El doctor confirma la asignación.           |
|            +----+---------------------------------------------+
|            | 7  | El sistema crea la relación entre el        |
|            |    | paciente y la lesión en la base de datos.   |
|            +----+---------------------------------------------+
|            | 8  | El sistema muestra la lesión asignada en el |
|            |    | perfil del paciente.                        |
+============+====+=============================================+

+-------------------+-------------------------------------------------------------------------+
| **Postcondición** | El paciente queda asociado a una nueva lesión activa dentro del         |
|                   | sistema.                                                                |
+===================+:=========================:+============================================:+
| **Excepciones**   | **Paso**                  | **Acción**                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | Si no existen lesiones registradas, el      |
|                   |                           | sistema muestra un mensaje informativo y no |
|                   |                           | permite la asignación.                      |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | Si la lesión ya estaba asignada al          |
|                   |                           | paciente, el sistema actualiza la           |
|                   |                           | información asociada a dicha asignación.    |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | La asignación de lesiones permite personalizar el tratamiento del       |
|                   | paciente y vincular correctamente los consejos médicos y objetivos de   |
|                   | rehabilitación.                                                         |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark32 .anchor}Tabla 22: Especificación del caso de uso
> UC-0020: Consultar catálogo de lesiones

+------------------+---------------------------------------------------+
| **UC-0020**      | **Consultar catálogo de lesiones**                |
+==================+===================================================+
| **Versión**      | 1.0 (15/10/2025)                                  |
+------------------+---------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                             |
+------------------+---------------------------------------------------+
| **Fuentes**      |                                                   |
+------------------+---------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión                            |
|                  |                                                   |
|                  | ACT-01 Doctor                                     |
+------------------+---------------------------------------------------+
| **Descripción**  | Este caso de uso permite al doctor consultar el   |
|                  | catálogo completo de lesiones registradas en el   |
|                  | sistema. Esta funcionalidad sirve como            |
+------------------+---------------------------------------------------+

+-------------------+-------------------------------------------------------------------------+
|                   | punto de entrada para la gestión de patologías, permitiendo su          |
|                   | visualización, búsqueda y posterior mantenimiento mediante edición o    |
|                   | eliminación.                                                            |
+===================+===========================+=============================================+
| **Precondición**  | El doctor debe haber iniciado sesión correctamente en el panel web.     |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (doctor) accede a la        |
|                   |                           | sección "Patologías" desde el menú          |
|                   |                           | principal.                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema solicita al *backend* el listado |
|                   |                           | de lesiones registradas.                    |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra una tabla con el nombre  |
|                   |                           | y la descripción de cada lesión.            |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor puede filtrar o buscar lesiones   |
|                   |                           | por nombre.                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El paciente queda asociado a una nueva lesión activa dentro del         |
|                   | sistema.                                                                |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | > **Acción**                                |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | > Si no existen lesiones registradas, el    |
|                   |                           | > sistema muestra un mensaje                |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Este caso de uso es previo a las operaciones de edición y eliminación   |
|                   | de lesiones.                                                            |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark33 .anchor}Tabla 23: Especificación del caso de uso
> UC-0021: Intercambio de mensajes (chat)

+------------------+---------------------------------------------------+
| **UC-0021**      | **Intercambio de mensajes (chat)**                |
+==================+===================================================+
| **Versión**      | 1.0 (15/10/2025)                                  |
+------------------+---------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                             |
+------------------+---------------------------------------------------+
| **Fuentes**      |                                                   |
+------------------+---------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión                            |
|                  |                                                   |
|                  | ACT-01 Doctor                                     |
+------------------+---------------------------------------------------+

+-------------------+-------------------------------------------------------------------------+
|                   | ACT-02 Paciente                                                         |
|                   |                                                                         |
|                   | NFR-0002 Tiempo real                                                    |
+===================+:==========================+:============================================+
| **Descripción**   | Este caso de uso permite establecer una comunicación bidireccional y en |
|                   | tiempo real entre el doctor y el paciente mediante un sistema de        |
|                   | mensajería. El objetivo es facilitar la resolución rápida de dudas, el  |
|                   | seguimiento del tratamiento y la comunicación continua durante el       |
|                   | proceso de rehabilitación.                                              |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | Ambos usuarios (doctor y paciente) deben existir en el sistema, haber   |
|                   | iniciado sesión y mantener una relación médico-paciente previamente     |
|                   | establecida.                                                            |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (doctor) o ACT-02           |
|                   |                           | (paciente) accede a la sección "Chat".      |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema carga el historial de mensajes   |
|                   |                           | previos entre ambos usuarios.               |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El usuario escribe un mensaje y pulsa el    |
|                   |                           | botón enviar o le da a la tecla "intro".    |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El sistema envía el mensaje al servidor     |
|                   |                           | mediante un canal de comunicación en tiempo |
|                   |                           | real.                                       |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El servidor registra el mensaje y lo        |
|                   |                           | entrega al destinatario.                    |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El destinatario visualiza el mensaje de     |
|                   |                           | forma inmediata en su interfaz.             |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El mensaje queda almacenado de forma persistente y pasa a formar parte  |
|                   | del historial de la conversación.                                       |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | > **Acción**                                |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | > Si no existen mensajes previos, el        |
|                   |                           | > sistema muestra una conversación vacía.   |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | > Si se pierde la conexión, el sistema no   |
|                   |                           | > envía el mensaje.                         |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Comentarios**   El uso de comunicación en tiempo real mejora la
                    experiencia de seguimiento clínico y reduce la
                    necesidad de consultas presenciales innecesarias.
  ----------------- ---------------------------------------------------

  ---------------------------------------------------------------------

> []{#_bookmark34 .anchor}Tabla 24: Especificación del caso de uso
> UC-0022: Crear consejo médico

+------------------+-------------------------------------------------------------------------+
| **UC-0022**      | **Crear consejo médico**                                                |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0005 Listar pacientes                                                |
|                  |                                                                         |
|                  | UC-0019 Asignar lesión a paciente ACT-01 Doctor                         |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Este caso de uso permite al doctor crear y asignar un consejo médico    |
|                  | personalizado a un paciente concreto, vinculándolo a una lesión         |
|                  | específica. El objetivo es proporcionar recomendaciones clínicas        |
|                  | contextualizadas que ayuden al paciente durante su proceso de           |
|                  | rehabilitación.                                                         |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El paciente debe existir en el sistema, haber sido seleccionado por el  |
|                  | doctor y tener al menos una lesión asignada.                            |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El actor ACT-01 (doctor) o ACT-02           |
|                  |                           | (paciente) accede a la sección "Consejos".  |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El doctor selecciona la opción "Nuevo       |
|                  |                           | consejo".                                   |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El sistema muestra un formulario de         |
|                  |                           | creación de consejo.                        |
|                  +---------------------------+---------------------------------------------+
|                  | 4                         | El doctor selecciona la lesión asociada al  |
|                  |                           | consejo.                                    |
|                  +---------------------------+---------------------------------------------+
|                  | 5                         | El doctor introduce el título y la          |
|                  |                           | descripción del consejo médico.             |
|                  +---------------------------+---------------------------------------------+
|                  | 6                         | El doctor pulsa la opción "Guardar          |
|                  |                           | consejo".                                   |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 7                         | El sistema valida los datos introducidos.   |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema registra el consejo médico en la |
|                   |                           | base de datos.                              |
|                   +---------------------------+---------------------------------------------+
|                   | 9                         | El sistema confirma la creación del         |
|                   |                           | consejo.                                    |
+===================+===========================+=============================================+
| **Postcondición** | El consejo médico queda registrado y visible para el paciente en la     |
|                   | aplicación móvil.                                                       |
+-------------------+---------------------------+---------------------------------------------+
| **Excepciones**   | **Paso**                  | > **Acción**                                |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | > Si el paciente no tiene lesiones          |
|                   |                           | > asignadas, el sistema muestra un mensaje  |
|                   |                           | > informativo y deshabilita la creación del |
|                   |                           | > consejo.                                  |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | > Si los campos obligatorios no están       |
|                   |                           | > completos, el sistema muestra un mensaje  |
|                   |                           | > de error.                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Los consejos médicos permiten reforzar el tratamiento clínico fuera de  |
|                   | las sesiones de rehabilitación supervisadas.                            |
+-------------------+-------------------------------------------------------------------------+

> []{#_bookmark35 .anchor}Tabla 25: Especificación del caso de uso
> UC-0023: Eliminar consejo

+-------------------+-------------------------------------------------------------------------+
| **UC-0023**       | **Eliminar consejo**                                                    |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (15/10/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       |                                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0022 Crear consejo médico UC-0005 Listar pacientes                   |
|                   |                                                                         |
|                   | ACT-01 Doctor                                                           |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Este caso de uso permite al doctor eliminar un consejo médico           |
|                   | previamente creado y asignado a un paciente, ya sea por obsolescencia   |
|                   | de la recomendación o cambio de tratamiento.                            |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El consejo médico debe existir y estar asociado a un paciente           |
|                   | seleccionado por el doctor.                                             |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-01 (doctor) accede a la        |
|                   |                           | sección "Consejos".                         |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El actor ACT-01 (doctor) accede a la ficha  |
|                   |                           | de un paciente.                             |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra la lista de consejos     |
|                   |                           | médicos asociados al paciente.              |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El doctor pulsa la opción "Eliminar" sobre  |
|                   |                           | un consejo.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema solicita confirmación de la      |
|                   |                           | acción.                                     |
|                   +---------------------------+---------------------------------------------+
|                   | 6                         | El doctor confirma la eliminación.          |
|                   +---------------------------+---------------------------------------------+
|                   | 7                         | El sistema elimina el consejo médico de la  |
|                   |                           | base de datos.                              |
|                   +---------------------------+---------------------------------------------+
|                   | 8                         | El sistema actualiza la lista de consejos   |
|                   |                           | en pantalla.                                |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El consejo eliminado deja de estar disponible y ya no es visible para   |
|                   | el paciente en la aplicación móvil.                                     |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+

  ---------------------------------------------------------------------
  **Comentarios**   La eliminación de consejos permite mantener
                    actualizado el tratamiento clínico del paciente.
  ----------------- ---------------------------------------------------

  ---------------------------------------------------------------------

> []{#_bookmark36 .anchor}Tabla 26: Especificación del caso de uso
> UC-0024: Consultar consejos (Paciente)

+-------------------+-------------------------------------------------------------------------+
| **UC-0024**       | **Consultar consejos (Paciente)**                                       |
+===================+===========================+=============================================+
| **Versión**       | 1.0 (15/10/2025)                                                        |
+-------------------+-------------------------------------------------------------------------+
| **Autores**       | Víctor Martín Fuentes                                                   |
+-------------------+-------------------------------------------------------------------------+
| **Fuentes**       |                                                                         |
+-------------------+-------------------------------------------------------------------------+
| **Dependencias**  | UC-0001 Iniciar sesión                                                  |
|                   |                                                                         |
|                   | UC-0022 Crear consejo médico ACT-02 Paciente                            |
+-------------------+-------------------------------------------------------------------------+
| **Descripción**   | Este caso de uso permite al paciente consultar los consejos médicos     |
|                   | personalizados que le han sido asignados por su doctor. Los consejos    |
|                   | sirven como recordatorio y guía de las pautas médicas activas asociadas |
|                   | a sus patologías.                                                       |
+-------------------+-------------------------------------------------------------------------+
| **Precondición**  | El paciente debe haber iniciado sesión correctamente en la aplicación   |
|                   | móvil.                                                                  |
+-------------------+---------------------------+---------------------------------------------+
| **Secuencia       | **Paso**                  | **Acción**                                  |
| normal**          |                           |                                             |
|                   +---------------------------+---------------------------------------------+
|                   | 1                         | El actor ACT-02 (paciente) accede a la      |
|                   |                           | sección "Consejos" desde el menú de la      |
|                   |                           | aplicación.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 2                         | El sistema solicita al *backend* la lista   |
|                   |                           | de consejos médicos activos asociados al    |
|                   |                           | paciente.                                   |
|                   +---------------------------+---------------------------------------------+
|                   | 3                         | El sistema muestra un listado de tarjetas   |
|                   |                           | con el título del consejo y la patología    |
|                   |                           | asociada.                                   |
|                   +---------------------------+---------------------------------------------+
|                   | 4                         | El paciente selecciona un consejo           |
|                   |                           | específico.                                 |
|                   +---------------------------+---------------------------------------------+
|                   | 5                         | El sistema muestra el contenido completo    |
|                   |                           | del consejo (título, descripción y          |
|                   |                           | patología).                                 |
+-------------------+---------------------------+---------------------------------------------+
| **Postcondición** | El paciente visualiza correctamente los consejos médicos asignados, sin |
|                   | poder modificar su contenido.                                           |
+-------------------+-------------------------------------------------------------------------+

+-----------------+---------------------------+---------------------------------------------+
| **Excepciones** | **Paso**                  | > **Acción**                                |
|                 +---------------------------+---------------------------------------------+
|                 | 2                         | > Si el paciente no tiene consejos          |
|                 |                           | > asignados, el sistema muestra un mensaje  |
|                 |                           | > indicándolo.                              |
+=================+===========================+=============================================+
| **Estabilidad** | Alta                                                                    |
+-----------------+-------------------------------------------------------------------------+
| **Comentarios** | Este caso de uso es de solo lectura y no permite al paciente modificar  |
|                 | ni eliminar consejos médicos.                                           |
+-----------------+-------------------------------------------------------------------------+

> []{#_bookmark37 .anchor}Tabla 27: Especificación del caso de uso
> UC-0025: Listar consejos (Doctor)

+------------------+-------------------------------------------------------------------------+
| **UC-0025**      | **Listar consejos (Doctor)**                                            |
+==================+===========================+=============================================+
| **Versión**      | 1.0 (15/10/2025)                                                        |
+------------------+-------------------------------------------------------------------------+
| **Autores**      | Víctor Martín Fuentes                                                   |
+------------------+-------------------------------------------------------------------------+
| **Fuentes**      |                                                                         |
+------------------+-------------------------------------------------------------------------+
| **Dependencias** | UC-0001 Iniciar sesión UC-0005 Listar pacientes                         |
|                  |                                                                         |
|                  | UC-0022 Crear consejo médico                                            |
|                  |                                                                         |
|                  | ACT-01 Doctor                                                           |
+------------------+-------------------------------------------------------------------------+
| **Descripción**  | Este caso de uso permite al doctor visualizar el conjunto de consejos   |
|                  | médicos que ha asignado a un paciente específico. Esta funcionalidad    |
|                  | facilita la revisión del tratamiento prescrito y sirve como punto de    |
|                  | partida para la eliminación o actualización de recomendaciones médicas. |
+------------------+-------------------------------------------------------------------------+
| **Precondición** | El doctor debe haber iniciado sesión correctamente en el panel web.     |
+------------------+---------------------------+---------------------------------------------+
| **Secuencia      | **Paso**                  | **Acción**                                  |
| normal**         |                           |                                             |
|                  +---------------------------+---------------------------------------------+
|                  | 1                         | El actor ACT-01 (doctor) accede a la        |
|                  |                           | sección "Consejos".                         |
|                  +---------------------------+---------------------------------------------+
|                  | 2                         | El actor ACT-01 (doctor) accede a la ficha  |
|                  |                           | de un paciente.                             |
|                  +---------------------------+---------------------------------------------+
|                  | 3                         | El sistema solicita al *backend* la lista   |
|                  |                           | de consejos médicos asociados al paciente.  |
+------------------+---------------------------+---------------------------------------------+

+-------------------+---------------------------+---------------------------------------------+
|                   | 4                         | El sistema muestra un listado de tarjetas   |
|                   |                           | con los consejos asignados, incluyendo      |
|                   |                           | título y patología relacionada.             |
+===================+===========================+=============================================+
| **Postcondición** | El paciente queda asociado a una nueva lesión activa dentro del         |
|                   | sistema.                                                                |
+-------------------+-------------------------------------------------------------------------+
| **Estabilidad**   | Alta                                                                    |
+-------------------+-------------------------------------------------------------------------+
| **Comentarios**   | Desde esta vista el doctor puede ejecutar el caso de uso UC-0023        |
|                   | Eliminar consejo, actuando como punto de entrada para la gestión de     |
|                   | recomendaciones médicas.                                                |
+-------------------+-------------------------------------------------------------------------+

1.  []{#_bookmark38 .anchor}Conclusión y análisis de resultados

> Para justificar la estimación del esfuerzo necesario en el desarrollo
> del proyecto "Load Crutches": Sistema de soporte en la recuperación de
> pacientes que requieren uso de muletas, se ha utilizado el método de
> *Use Case Points* (UCP) apoyado por la herramienta EZEstimate.
>
> Con este objetivo, se ha elaborado una tabla que recoge los actores y
> casos de uso del sistema, junto con su nivel de complejidad y el
> número de transacciones asociadas a cada caso de uso, parámetros
> necesarios para realizar el cálculo de la estimación de forma
> sistemática y justificada.
>
> Para el cálculo de la complejidad de los actores, se han utilizado los
> siguientes criterios:

- **Simple**: el actor es un sistema externo que se comunica mediante
  una API.

- **Medio**: el actor es un sistema que se comunica mediante un
  protocolo específico.

- **Complejo**: el actor es una persona que interactúa mediante una
  interfaz gráfica.

> En cuanto a la complejidad de los casos de uso, se han considerado los
> siguientes rangos:

- **Simple**: hasta 3 transacciones.

- **Medio**: entre 4 y 7 transacciones.

- **Complejo**: más de 8 transacciones.

> Los actores y casos de uso del sistema se describen en detalle en los
> anexos anteriores, mientras que a continuación se presenta la tabla
> resumen utilizada como entrada para la herramienta EZEstimate.
>
> []{#_bookmark39 .anchor}Tabla 28: Casos de uso y actores y su relación
> de complejidad para la estimación

+--------------+-------------------+-------------------+
| > **Número** | > **Complejidad** | > **Nº            |
|              |                   | > transacciones** |
+==============+===================+===================+

+------------------+-------------+----------------+
| > ACT-01         | Complejo    | (No tiene)     |
| >                |             |                |
| > Doctor         |             |                |
+==================+:===========:+:==============:+
| > ACT-02         | Complejo    | (No tiene)     |
| >                |             |                |
| > Paciente       |             |                |
+------------------+-------------+----------------+
| > ACT-03         | Medio       | (No tiene)     |
| >                |             |                |
| > Muleta         |             |                |
| > inteligente    |             |                |
+------------------+-------------+----------------+
| > ACT-04         | Simple      | (No tiene)     |
| >                |             |                |
| > Servidor de    |             |                |
| > correo         |             |                |
| >                |             |                |
| > electrónico    |             |                |
+------------------+-------------+----------------+
| > UC-0001        | Medio       | 5              |
| >                |             |                |
| > Iniciar sesión |             |                |
+------------------+-------------+----------------+
| > UC-0002        | Medio       | 5              |
| >                |             |                |
| > Cerrar sesión  |             |                |
+------------------+-------------+----------------+
| > UC-0003        | Medio       | 7              |
| >                |             |                |
| > Registrar      |             |                |
| > doctor         |             |                |
+------------------+-------------+----------------+
| > UC-0004        | Complejo    | 9              |
| >                |             |                |
| > Registrar      |             |                |
| > paciente       |             |                |
+------------------+-------------+----------------+
| > UC-0005        | Simple      | 3              |
| >                |             |                |
| > Listar         |             |                |
| > pacientes      |             |                |
+------------------+-------------+----------------+
| > UC-0006        | Medio       | 7              |
|                  |             |                |
| Editar paciente  |             |                |
+------------------+-------------+----------------+
| > UC-0007        | Medio       | 7              |
| >                |             |                |
| > Eliminar       |             |                |
| > paciente       |             |                |
+------------------+-------------+----------------+
| > UC-0008 Ver    | Simple      | 5              |
| >                |             |                |
| > perfil         |             |                |
| > personal       |             |                |
+------------------+-------------+----------------+
| > UC-0009        | Medio       | 7              |
| >                |             |                |
| > Cambiar        |             |                |
| > contraseña     |             |                |
+------------------+-------------+----------------+
| > UC-0010        | Complejo    | 7              |
| >                |             |                |
| > Conectar       |             |                |
| > muleta         |             |                |
+------------------+-------------+----------------+
| > UC-0011        | Medio       | 7              |
|                  |             |                |
| Realizar sesión  |             |                |
| de               |             |                |
|                  |             |                |
| > rehabilitación |             |                |
+------------------+-------------+----------------+
| > UC-0012        | Medio       | 7              |
| >                |             |                |
| > Finalizar y    |             |                |
| > guardar sesión |             |                |
+------------------+-------------+----------------+

+---------------+-------------+----------------+
| > UC-0013     | Medio       | 6              |
| >             |             |                |
| > Consultar   |             |                |
| > progreso    |             |                |
| > diario      |             |                |
+===============+=============+================+
| > UC-0014     | Medio       | 6              |
| >             |             |                |
| > Consultar   |             |                |
| > historial   |             |                |
| > de          |             |                |
| >             |             |                |
| > sesiones    |             |                |
+---------------+-------------+----------------+
| > UC-0015     | Complejo    | 8              |
| >             |             |                |
| > Configurar  |             |                |
| > límites y   |             |                |
| >             |             |                |
| > objetivos   |             |                |
+---------------+-------------+----------------+
| > UC-0016     | Medio       | 8              |
| >             |             |                |
| > Crear       |             |                |
| > lesión      |             |                |
+---------------+-------------+----------------+
| > UC-0017     | Medio       | 8              |
| >             |             |                |
| > Editar      |             |                |
| > lesión      |             |                |
+---------------+-------------+----------------+
| > UC-0018     | Medio       | 6              |
| >             |             |                |
| > Eliminar    |             |                |
| > lesión      |             |                |
+---------------+-------------+----------------+
| > UC-0019     | Complejo    | 8              |
| >             |             |                |
| > Asignar     |             |                |
| > lesión a    |             |                |
| > paciente    |             |                |
+---------------+-------------+----------------+
| > UC-0020     | Simple      | 4              |
| >             |             |                |
| > Consultar   |             |                |
| >             |             |                |
| > catálogo de |             |                |
| > lesiones    |             |                |
+---------------+-------------+----------------+
| > UC-0021     | Medio       | 6              |
| >             |             |                |
| > Intercambio |             |                |
| > de          |             |                |
| >             |             |                |
| > mensajes    |             |                |
| > (chat)      |             |                |
+---------------+-------------+----------------+
| > UC-0022     | Complejo    | 9              |
| >             |             |                |
| > Crear       |             |                |
| > consejo     |             |                |
| > médico      |             |                |
+---------------+-------------+----------------+
| > UC-0023     | Medio       | 8              |
| >             |             |                |
| > Eliminar    |             |                |
| > consejo     |             |                |
+---------------+-------------+----------------+
| > UC-0024     | Simple      | 4              |
| >             |             |                |
| > Consultar   |             |                |
| > consejos    |             |                |
| > (Paciente)  |             |                |
+---------------+-------------+----------------+
| > UC-0025     | Simple      | 4              |
|               |             |                |
| Listar        |             |                |
| consejos      |             |                |
| (Doctor)      |             |                |
+---------------+-------------+----------------+

> Una vez obtenidos y justificados los factores de complejidad técnica y
> de entorno correspondientes al proyecto "Load Crutches", se ha
> procedido a la utilización de la herramienta EZEstimate para
> introducir los datos relativos a los actores y a los casos de
>
> uso definidos para el sistema. Para cada caso de uso se ha calculado
> previamente el número de transacciones, atendiendo a la secuencia
> normal de acciones descrita en su especificación, así como la
> complejidad asociada tanto a los actores como a los propios casos de
> uso. A partir de estos valores, la herramienta permite obtener una
> estimación del esfuerzo necesario para llevar a cabo el desarrollo
> completo del sistema, expresada en número de horas.
>
> Antes de presentar el resultado final de la estimación es necesario
> tener en cuenta una serie de consideraciones. En primer lugar, se ha
> reducido el número de horas asignadas por caso de uso de 10 a 15
> horas, con el objetivo de obtener una estimación más ajustada al
> contexto académico del proyecto. Sin embargo, "Load Crutches" es un
> sistema con un nivel de complejidad elevado, tanto por el número de
> funcionalidades implementadas como por la integración de múltiples
> tecnologías, incluyendo una aplicación móvil, un *backend* con lógica
> de negocio, comunicación Bluetooth con hardware específico y la
> gestión de datos clínicos persistentes. Cada uno de estos módulos ha
> requerido tareas adicionales de análisis, investigación, integración y
> pruebas que no quedan completamente reflejadas en una estimación
> inicial basada únicamente en casos de uso.
>
> Por este motivo, la estimación debe entenderse como una referencia
> para la planificación del proyecto, ya que el esfuerzo real invertido
> ha sido superior al inicialmente calculado. Este incremento se debe
> principalmente a la necesidad de adquirir conocimientos específicos,
> resolver problemas derivados de la comunicación con la muleta
> inteligente, refinar la arquitectura del sistema y realizar ajustes
> continuos durante la fase de construcción.
>
> Como resultado final del proceso de estimación y teniendo en cuenta el
> esfuerzo real dedicado al desarrollo, el proyecto "Load Crutches" ha
> requerido un total de 1740,48 horas de trabajo. Esta cifra se traduce
> en 290 días de desarrollo, lo que equivale a 58 semanas completas o,
> de forma equivalente, 13 meses de dedicación continuada. Este cálculo
> se ha realizado considerando un único desarrollador, con una
> dedicación constante de 6 horas diarias, durante 5 días a la semana
> (excluyendo los sábados y domingos), desde finales del mes de
> noviembre de 2024 hasta finales del mes de diciembre de 2025. No se
> han contabilizado festivos ni jornadas excepcionales en las que el
> desarrollador haya podido dedicar un mayor número de horas al proyecto
> fuera del horario habitual.
>
> ![](media/image2.jpeg){width="3.1766797900262467in" height="3.525in"}
>
> []{#_bookmark40 .anchor}Ilustración 1: Resultado de la estimación con
> EZEstimate

# Planificación temporal

> En este apartado se muestra el esquema de tareas, subtareas e hitos
> dentro de la planificación temporal del proyecto y, a continuación, el
> diagrama de Gantt realizado.

## Descripción de tareas, subtareas e hitos

> A continuación, se mostrarán la distribución y descripción de las
> distintas tareas y subtareas que han conformado el proyecto y que han
> permitido llevar a cabo un seguimiento de este de forma ordenada. La
> presentación de las tareas y subtareas queda delegado y repartido en
> distintas iteraciones siguiendo el proceso unificado.

- Planificación y diseño

- App móvil

- *Backend* clínico

- Bluetooth / muleta inteligente

- Gestión de pacientes, sesiones, lesiones y consejos

- Documentación académica

> Al final de cada iteración se establecerá un hito, que indicará el fin
> de la iteración y el paso a la siguiente. A continuación, en la Tabla
> 29 se muestra una descripción de las tareas y subtareas de las
> distintas fases de la planificación temporal.
>
> []{#_bookmark43 .anchor}Tabla 29: Descripción de tares y subtareas de
> la planificación

+------------+--------------------+-----------------+-------------------------+
| **Número** | **Tarea o hito**   | **Precedencia** | **Descripción**         |
+============+====================+=================+=========================+
| 1          | Reunión inicial    | \-              | > Reunión inicial para  |
|            | con el tutor       |                 | > presentar la idea del |
|            |                    |                 | > proyecto "Load        |
|            |                    |                 | > Crutches",            |
|            |                    |                 | >                       |
|            |                    |                 | > definir objetivos     |
|            |                    |                 | > generales y alcance   |
|            |                    |                 | > funcional del         |
|            |                    |                 | > sistema.              |
+------------+--------------------+-----------------+-------------------------+
| 2          | > Análisis del     | 1               | > Estudio del contexto  |
|            | > dominio clínico  |                 | > sanitario y de        |
|            |                    |                 | > rehabilitación con    |
|            |                    |                 | > muletas,              |
|            |                    |                 | > identificando         |
|            |                    |                 | > necesidades reales de |
|            |                    |                 | >                       |
|            |                    |                 | > pacientes y doctores. |
+------------+--------------------+-----------------+-------------------------+
| 3          | > Análisis de      | 2               | > Revisión de           |
|            | > soluciones       |                 | > aplicaciones de       |
|            | > existentes       |                 | > rehabilitación,       |
|            |                    |                 | > dispositivos médicos  |
|            |                    |                 | > y sistemas similares  |
|            |                    |                 | > para detectar         |
|            |                    |                 | >                       |
|            |                    |                 | > carencias y           |
|            |                    |                 | > oportunidades.        |
+------------+--------------------+-----------------+-------------------------+
| 4          | > Identificación   | 3               | > Identificación de los |
|            | > de actores del   |                 | > actores principales   |
|            | > sistema          |                 | > del sistema (doctor,  |
|            |                    |                 | > paciente, muleta      |
|            |                    |                 | > inteligente y         |
|            |                    |                 | >                       |
|            |                    |                 | > servidor de correo).  |
+------------+--------------------+-----------------+-------------------------+
| 5          | > Identificación   | 4               | > Definición preliminar |
|            | > inicial de casos |                 | > de los casos de uso   |
|            | > de uso           |                 | > principales del       |
|            |                    |                 | > sistema               |
|            |                    |                 | >                       |
|            |                    |                 | > mediante UML.         |
+------------+--------------------+-----------------+-------------------------+

+------+--------------------+---------+-------------------------+
| 6    | > **Fin Iteración  | 5       | > Hito que marca el     |
|      | > 1 (Inicio)**     |         | > final de la primera   |
|      |                    |         | > iteración de la fase  |
|      |                    |         | > de inicio.            |
+======+====================+=========+=========================+
| 7    | > Investigación de | 6       | > Estudio de            |
|      | > tecnologías a    |         | > tecnologías para app  |
|      | > utilizar         |         | > móvil, *backend*,     |
|      |                    |         | > base de datos,        |
|      |                    |         | >                       |
|      |                    |         | > Bluetooth y           |
|      |                    |         | > comunicación en       |
|      |                    |         | > tiempo real.          |
+------+--------------------+---------+-------------------------+
| 8    | > Definición de    | 7       | > Identificación de     |
|      | > objetivos del    |         | > objetivos funcionales |
|      | > sistema          |         | > y clínicos del        |
|      |                    |         | > sistema "Load         |
|      |                    |         | > Crutches".            |
+------+--------------------+---------+-------------------------+
| 9    | > Identificación   | 8       | > Definición detallada  |
|      | > de requisitos    |         | > de las                |
|      | > funcionales      |         | > funcionalidades que   |
|      |                    |         | > debe ofrecer el       |
|      |                    |         | > sistema.              |
+------+--------------------+---------+-------------------------+
| 10   | > Identificación   | 9       | > Identificación de     |
|      | > de requisitos no |         | > requisitos de         |
|      | > funcionales      |         | > seguridad,            |
|      |                    |         | > rendimiento,          |
|      |                    |         | > usabilidad y          |
|      |                    |         | >                       |
|      |                    |         | > disponibilidad.       |
+------+--------------------+---------+-------------------------+
| 11   | > Análisis de      | 10      | > Identificación de los |
|      | > subsistemas      |         | > subsistemas           |
|      |                    |         | > principales: app      |
|      |                    |         | > móvil, *backend*,     |
|      |                    |         | > base de datos y       |
|      |                    |         | > dispositivo           |
|      |                    |         | >                       |
|      |                    |         | > hardware.             |
+------+--------------------+---------+-------------------------+
| 12   | > Diseño inicial   | 11      | > Primera definición de |
|      | > de la            |         | > la arquitectura       |
|      | > arquitectura     |         | > cliente-servidor y    |
|      |                    |         | > flujo de              |
|      |                    |         | >                       |
|      |                    |         | > comunicación entre    |
|      |                    |         | > subsistemas.          |
+------+--------------------+---------+-------------------------+
| 13   | > **Fin Iteración  | 12      | > Hito que marca el     |
|      | > 2 (Inicio)**     |         | > final de la segunda   |
|      |                    |         | > iteración de la fase  |
|      |                    |         | > de inicio.            |
+------+--------------------+---------+-------------------------+
| 14   | > **Fin Fase de    | 13      | > Finalización formal   |
|      | > Inicio**         |         | > de la fase de inicio  |
|      |                    |         | > del Proceso           |
|      |                    |         | > Unificado.            |
+------+--------------------+---------+-------------------------+
| 15   | > Reunión de       | 14      | > Revisión del análisis |
|      | > revisión con el  |         | > inicial, requisitos y |
|      | > tutor            |         | > arquitectura          |
|      |                    |         | > propuesta.            |
+------+--------------------+---------+-------------------------+
| 16   | > Elaboración de   | 15      | > Desarrollo completo   |
|      | > diagramas de     |         | > de los diagramas UML  |
|      | > casos de uso     |         | > de casos de uso del   |
|      |                    |         | > sistema.              |
+------+--------------------+---------+-------------------------+
| 17   | > Elaboración de   | 16      | > Redacción detallada   |
|      | > especificaciones |         | > de las tablas de      |
|      | > de casos de      |         | > especificación de     |
|      | >                  |         | > cada caso de uso.     |
|      | > uso              |         |                         |
+------+--------------------+---------+-------------------------+
| 18   | > Elaboración de   | 17      | > Modelado de las       |
|      | > diagramas de     |         | > clases principales    |
|      | > clases           |         | > del sistema desde el  |
|      | > (análisis)       |         | > punto de vista        |
|      |                    |         | >                       |
|      |                    |         | > del análisis.         |
+------+--------------------+---------+-------------------------+
| 19   | > Elaboración de   | 18      | > Representación de la  |
|      | > diagramas de     |         | > interacción           |
|      | > secuencia        |         | >                       |
|      |                    |         | > entre componentes     |
|      |                    |         | > para los casos de uso |
|      |                    |         | > principales.          |
+------+--------------------+---------+-------------------------+
| 20   | > Elaboración del  | 19      | > Definición de         |
|      | > glosario         |         | > términos clave        |
|      |                    |         | > utilizados en "Load   |
|      |                    |         | > Crutches".            |
+------+--------------------+---------+-------------------------+
| 21   | > **Fin Iteración  | 20      | > Hito que marca el     |
|      | > 1                |         | > final de la primera   |
|      | > (Elaboración)**  |         | > iteración de la fase  |
|      |                    |         | > de elaboración.       |
+------+--------------------+---------+-------------------------+

+------+---------------------+---------+-------------------------+
| 22   | > Revisión del      | 21      | > Revisión y            |
|      | > modelo de casos   |         | > refinamiento de los   |
|      | > de uso            |         | > casos                 |
|      |                     |         | >                       |
|      |                     |         | > de uso definidos tras |
|      |                     |         | > la primera iteración  |
|      |                     |         | > de elaboración.       |
+======+=====================+=========+=========================+
| 23   | > Revisión de       | 22      | > Validación de         |
|      | > requisitos        |         | > requisitos            |
|      |                     |         | > funcionales y no      |
|      |                     |         | > funcionales para      |
|      |                     |         | > asegurar              |
|      |                     |         | >                       |
|      |                     |         | > coherencia con los    |
|      |                     |         | > objetivos clínicos.   |
+------+---------------------+---------+-------------------------+
| 24   | > Diseño del modelo | 23      | > Diseño lógico de la   |
|      | > de datos          |         | > base de datos         |
|      |                     |         | >                       |
|      |                     |         | > para usuarios,        |
|      |                     |         | > pacientes, sesiones,  |
|      |                     |         | > lesiones, consejos y  |
|      |                     |         | > mensajes.             |
+------+---------------------+---------+-------------------------+
| 25   | > Elaboración del   | 24      | > Representación        |
|      | > diagrama          |         | > gráfica de las        |
|      | > entidad-relación  |         | > entidades y           |
|      |                     |         | > relaciones del        |
|      |                     |         | > sistema de            |
|      |                     |         | > persistencia.         |
+------+---------------------+---------+-------------------------+
| 26   | > Diseño de la      | 25      | > Definición de capas   |
|      | > arquitectura      |         | > del *backend* (rutas, |
|      | >                   |         | > controladores,        |
|      | > *backend*         |         | > servicios y acceso a  |
|      |                     |         | > datos).               |
+------+---------------------+---------+-------------------------+
| 27   | > Diseño de la      | 26      | > Definición de la      |
|      | > arquitectura de   |         | > estructura interna de |
|      | > la app móvil      |         | > la aplicación móvil y |
|      |                     |         | > navegación            |
|      |                     |         | >                       |
|      |                     |         | > entre vistas.         |
+------+---------------------+---------+-------------------------+
| 28   | > Diseño de la      | 27      | > Definición del        |
|      | > comunicación      |         | > protocolo de          |
|      | > Bluetooth         |         | > comunicación entre la |
|      |                     |         | > app móvil y la        |
|      |                     |         | >                       |
|      |                     |         | > muleta inteligente.   |
+------+---------------------+---------+-------------------------+
| 29   | > Diseño del        | 28      | > Diseño del flujo de   |
|      | > sistema de        |         | > autenticación basado  |
|      | > autenticación     |         | > en credenciales y     |
|      |                     |         | > token JWT.            |
+------+---------------------+---------+-------------------------+
| 30   | > Elaboración de    | 29      | > Desarrollo de         |
|      | > diagramas de      |         | > diagramas de diseño   |
|      | > diseño            |         | > (caso de uso--diseño  |
|      |                     |         | > y diagramas de        |
|      |                     |         | > despliegue).          |
+------+---------------------+---------+-------------------------+
| 31   | > Diseño del        | 30      | > Definición de la      |
|      | > sistema de        |         | > arquitectura del chat |
|      | > mensajería (chat) |         | > en tiempo real entre  |
|      |                     |         | > doctor y              |
|      |                     |         | >                       |
|      |                     |         | > paciente.             |
+------+---------------------+---------+-------------------------+
| 32   | > Diseño del        | 31      | > Modelado del flujo de |
|      | > sistema de        |         | > realización,          |
|      | > sesiones de       |         | > finalización y        |
|      | > rehabilitación    |         | > almacenamiento de     |
|      |                     |         | >                       |
|      |                     |         | > sesiones clínicas.    |
+------+---------------------+---------+-------------------------+
| 33   | > Diseño del        | 32      | > Definición de la      |
|      | > sistema de        |         | > lógica para límites   |
|      | > configuración de  |         | > de carga, pasos y     |
|      | > límites           |         | > objetivos diarios.    |
+------+---------------------+---------+-------------------------+
| 34   | > Revisión global   | 33      | > Revisión completa del |
|      | > del diseño        |         | > diseño del sistema    |
|      |                     |         | > antes de iniciar la   |
|      |                     |         | > implementación.       |
+------+---------------------+---------+-------------------------+
| 35   | > **Fin Iteración** | 34      | > Hito que marca el     |
|      | > **2**             |         | > final de la segunda   |
|      | >                   |         | > iteración de la fase  |
|      | > **(Elaboración)** |         | > de elaboración.       |
+------+---------------------+---------+-------------------------+
| 36   | > **Fin Fase de     | 35      | > Finalización formal   |
|      | > Elaboración**     |         | > de la fase de         |
|      |                     |         | > elaboración del       |
|      |                     |         | > Proceso Unificado.    |
+------+---------------------+---------+-------------------------+
| 37   | > Preparación del   | 36      | > Configuración de      |
|      | > entorno de        |         | > entornos locales para |
|      | > desarrollo        |         | > *backend*, app móvil  |
|      |                     |         | > y base de             |
|      |                     |         | >                       |
|      |                     |         | > datos.                |
+------+---------------------+---------+-------------------------+

+------+--------------------+---------+-------------------------+
| 38   | > Implementación   | 37      | > Creación de la        |
|      | > del *backend*    |         | > estructura base del   |
|      | >                  |         | >                       |
|      | > base             |         | > servidor (rutas,      |
|      |                    |         | > controladores y       |
|      |                    |         | > servicios).           |
+======+====================+=========+=========================+
| 39   | > Implementación   | 38      | > Desarrollo del inicio |
|      | > del sistema de   |         | > y cierre de           |
|      | > autenticación    |         | >                       |
|      |                    |         | > sesión con generación |
|      |                    |         | > y validación de       |
|      |                    |         | > tokens JWT.           |
+------+--------------------+---------+-------------------------+
| 40   | > Implementación   | 39      | > Desarrollo de altas,  |
|      | > de gestión de    |         | > edición y eliminación |
|      | > usuarios         |         | > de doctores y         |
|      |                    |         | > pacientes.            |
+------+--------------------+---------+-------------------------+
| 41   | > Implementación   | 40      | > Desarrollo del flujo  |
|      | > del sistema de   |         | > completo de alta de   |
|      | > registro de      |         | > pacientes y envío de  |
|      | > pacientes        |         | > credenciales          |
|      |                    |         | >                       |
|      |                    |         | > por correo.           |
+------+--------------------+---------+-------------------------+
| 42   | > Implementación   | 41      | > Desarrollo de la      |
|      | > del catálogo de  |         | > gestión de            |
|      | > lesiones         |         | >                       |
|      |                    |         | > patologías: crear,    |
|      |                    |         | > editar, eliminar y    |
|      |                    |         | > listar lesiones.      |
+------+--------------------+---------+-------------------------+
| 43   | > Implementación   | 42      | > Desarrollo de la      |
|      | > de asignación de |         | > vinculación entre     |
|      | > lesiones         |         | > pacientes y           |
|      |                    |         | > patologías.           |
+------+--------------------+---------+-------------------------+
| 44   | > Implementación   | 43      | > Desarrollo de         |
|      | > del sistema de   |         | > creación, consulta y  |
|      | > consejos médicos |         | > eliminación de        |
|      |                    |         | > consejos médicos.     |
+------+--------------------+---------+-------------------------+
| 45   | > Implementación   | 44      | > Desarrollo del        |
|      | > del sistema de   |         | > almacenamiento de     |
|      | > sesiones         |         | > sesiones y métricas   |
|      |                    |         | > clínicas.             |
+------+--------------------+---------+-------------------------+
| 46   | > Implementación   | 45      | > Desarrollo del        |
|      | > de estadísticas  |         | > cálculo de progreso   |
|      | > y progreso       |         | > diario y métricas     |
|      |                    |         | > acumuladas.           |
+------+--------------------+---------+-------------------------+
| 47   | > Implementación   | 46      | > Desarrollo del        |
|      | > del chat en      |         | > sistema de mensajería |
|      | > tiempo real      |         | >                       |
|      |                    |         | > usando comunicación   |
|      |                    |         | > en tiempo real.       |
+------+--------------------+---------+-------------------------+
| 48   | > Pruebas          | 47      | > Verificación          |
|      | > unitarias del    |         | > individual de los     |
|      | >                  |         | > servicios y           |
|      | > *backend*        |         | > controladores del     |
|      |                    |         | > servidor.             |
+------+--------------------+---------+-------------------------+
| 49   | > Implementación   | 48      | > Creación de la        |
|      | > de la app móvil  |         | > estructura principal  |
|      | > (estructura      |         | > de la aplicación      |
|      | > base)            |         | > móvil.                |
+------+--------------------+---------+-------------------------+
| 50   | > Implementación   | 49      | > Desarrollo del        |
|      | > de conexión      |         | > escaneo, conexión y   |
|      | > Bluetooth        |         | >                       |
|      |                    |         | > gestión del estado de |
|      |                    |         | > la muleta             |
|      |                    |         | > inteligente.          |
+------+--------------------+---------+-------------------------+
| 51   | > Implementación   | 50      | > Desarrollo de la      |
|      | > de sesiones en   |         | > captura de datos de   |
|      | > la app móvil     |         | > carga y pasos en      |
|      |                    |         | > tiempo real.          |
+------+--------------------+---------+-------------------------+
| 52   | > Implementación   | 51      | > Desarrollo del        |
|      | > del              |         | > sistema de colores y  |
|      | >                  |         | > visualización de      |
|      | > *feedback*       |         | > resultados por paso.  |
|      | > visual           |         |                         |
+------+--------------------+---------+-------------------------+
| 53   | > Implementación   | 52      | > Desarrollo de la      |
|      | > del perfil del   |         | > vista de perfil       |
|      | > paciente         |         | > personal y clínico.   |
+------+--------------------+---------+-------------------------+
| 54   | > Implementación   | 53      | > Desarrollo de         |
|      | > del progreso     |         | > gráficos y anillos de |
|      | > diario           |         | > progreso diario.      |
+------+--------------------+---------+-------------------------+
| 55   | > Pruebas          | 54      | > Pruebas de las        |
|      | > unitarias de la  |         | > funcionalidades       |
|      | > app móvil        |         | > principales de la     |
|      |                    |         | > aplicación móvil.     |
+------+--------------------+---------+-------------------------+

+------+----------------------+---------+-------------------------+
| 56   | > Integración app    | 55      | > Verificación de la    |
|      | > móvil --           |         | > comunicación entre la |
|      | >                    |         | > app móvil y el        |
|      | > *backend*          |         | > servidor.             |
+:====:+======================+:=======:+=========================+
| 57   | > Pruebas de         | 56      | > Pruebas conjuntas de  |
|      | > integración del    |         | > todos los módulos del |
|      | > sistema            |         | > sistema.              |
+------+----------------------+---------+-------------------------+
| 58   | > **Fin Iteración**  | 57      | > Hito que marca el     |
|      | > **1**              |         | > final de la primera   |
|      | >                    |         | > iteración de la fase  |
|      | > **(Construcción)** |         | > de construcción.      |
+------+----------------------+---------+-------------------------+
| 59   | > Optimización del   | 58      | > Mejora del            |
|      | > *backend*          |         | > rendimiento de las    |
|      |                      |         | > consultas y lógica de |
|      |                      |         | > negocio del servidor. |
+------+----------------------+---------+-------------------------+
| 60   | > Optimización de la | 59      | > Ajustes de            |
|      | > app móvil          |         | > rendimiento, consumo  |
|      |                      |         | > energético y fluidez  |
|      |                      |         | > de la interfaz.       |
+------+----------------------+---------+-------------------------+
| 61   | > Validación de      | 60      | > Revisión de           |
|      | > seguridad          |         | > autenticación,        |
|      |                      |         | > control               |
|      |                      |         | >                       |
|      |                      |         | > de accesos y          |
|      |                      |         | > protección de datos   |
|      |                      |         | > clínicos.             |
+------+----------------------+---------+-------------------------+
| 62   | > Pruebas de estrés  | 61      | > Simulación de         |
|      | > del sistema        |         | > múltiples usuarios y  |
|      |                      |         | > sesiones              |
|      |                      |         | > concurrentes.         |
+------+----------------------+---------+-------------------------+
| 63   | > Validación de      | 62      | > Pruebas prolongadas   |
|      | > comunicación       |         | > de estabilidad de     |
|      | > Bluetooth          |         | > conexión con la       |
|      |                      |         | > muleta                |
|      |                      |         | >                       |
|      |                      |         | > inteligente.          |
+------+----------------------+---------+-------------------------+
| 64   | > Corrección de      | 63      | > Resolución de errores |
|      | > incidencias        |         | > identificados durante |
|      | > detectadas         |         | > las pruebas.          |
+------+----------------------+---------+-------------------------+
| 65   | > Pruebas            | 64      | > Verificación del      |
|      | > funcionales        |         | > cumplimiento de todos |
|      | > completas          |         | > los casos de uso      |
|      |                      |         | > definidos.            |
+------+----------------------+---------+-------------------------+
| 66   | > Verificación de    | 65      | > Comprobación de       |
|      | > requisitos         |         | > requisitos            |
|      |                      |         | > funcionales y no      |
|      |                      |         | > funcionales.          |
+------+----------------------+---------+-------------------------+
| 67   | > Preparación de     | 66      | > Preparación de una    |
|      | > versión candidata  |         | > versión estable del   |
|      |                      |         | > sistema.              |
+------+----------------------+---------+-------------------------+
| 68   | > **Fin Iteración**  | 67      | > Hito que marca el     |
|      | > **2**              |         | > final de la segunda   |
|      | >                    |         | > iteración de la fase  |
|      | > **(Construcción)** |         | > de construcción.      |
+------+----------------------+---------+-------------------------+
| 69   | > **Fin              | 68      | > Hito que indica el    |
|      | > Construcción**     |         | > final completo de la  |
|      |                      |         | > fase de construcción. |
+------+----------------------+---------+-------------------------+
| 70   | > Preparación del    | 69      | > Configuración del     |
|      | > entorno de         |         | > servidor final para   |
|      | > despliegue         |         | > el despliegue del     |
|      |                      |         | > sistema.              |
+------+----------------------+---------+-------------------------+
| 71   | > Despliegue del     | 70      | > Instalación y         |
|      | > *backend*          |         | > configuración del     |
|      |                      |         | > servidor *backend*.   |
+------+----------------------+---------+-------------------------+
| 72   | > Despliegue de la   | 71      | > Configuración y       |
|      | > base de datos      |         | > despliegue de la base |
|      |                      |         | > de datos.             |
+------+----------------------+---------+-------------------------+
| 73   | > Despliegue de la   | 72      | > Preparación de la app |
|      | > aplicación móvil   |         | > móvil para su         |
|      |                      |         | > ejecución en          |
|      |                      |         | > dispositivos reales.  |
+------+----------------------+---------+-------------------------+
| 74   | > Pruebas en entorno | 73      | > Validación del        |
|      | > real               |         | > sistema completo en   |
|      |                      |         | > condiciones reales de |
|      |                      |         | > uso.                  |
+------+----------------------+---------+-------------------------+

+------+--------------------+---------+-------------------------+
| 75   | > Pruebas de       | 74      | > Evaluación del        |
|      | > usuario          |         | > sistema desde el      |
|      |                    |         | >                       |
|      |                    |         | > punto de vista del    |
|      |                    |         | > doctor y del          |
|      |                    |         | > paciente.             |
+======+====================+=========+=========================+
| 76   | > Ajustes finales  | 75      | > Correcciones menores  |
|      |                    |         | > detectadas durante    |
|      |                    |         | > las pruebas finales.  |
+------+--------------------+---------+-------------------------+
| 77   | > Elaboración del  | 76      | > Redacción de la       |
|      | > manual de        |         | > documentación de uso  |
|      | > usuario          |         | > del sistema.          |
+------+--------------------+---------+-------------------------+
| 78   | > Revisión final   | 77      | > Revisión global del   |
|      | > con el tutor     |         | > proyecto antes de la  |
|      |                    |         | > entrega final.        |
+------+--------------------+---------+-------------------------+
| 79   | > Entrega del      | 78      | > Entrega oficial del   |
|      | > proyecto         |         | > Trabajo Fin de Grado. |
+------+--------------------+---------+-------------------------+
| 80   | > **Fin            | 79      | > Hito que marca la     |
|      | > Transición**     |         | > finalización del      |
|      |                    |         | > proyecto "Load        |
|      |                    |         | > Crutches".            |
+------+--------------------+---------+-------------------------+

## Asignación de tiempo y recursos

> El sistema "Load Crutches" se compone de varios subsistemas claramente
> diferenciados, aunque estrechamente relacionados entre sí: el panel
> web para doctores, la aplicación móvil para pacientes, el *backend*
> encargado de la lógica de negocio y la persistencia de datos, la
> comunicación en tiempo real y la integración con la muleta inteligente
> mediante tecnología Bluetooth. Esta heterogeneidad tecnológica ha
> motivado una planificación del desarrollo basada en una asignación de
> tiempo y recursos progresiva, abordando cada subsistema de manera
> secuencial y controlada.
>
> Dado que el proyecto ha sido desarrollado por un único desarrollador,
> se ha optado por una estrategia de dedicación exclusiva a un
> subsistema en cada iteración, evitando la fragmentación del esfuerzo y
> reduciendo los riesgos derivados de cambios simultáneos en componentes
> ya estabilizados. Este enfoque ha permitido una mejor asimilación de
> la complejidad técnica del sistema, especialmente en aquellos módulos
> que han requerido investigación previa, pruebas iterativas e
> integración con hardware externo, como es el caso de la muleta
> inteligente.
>
> La planificación temporal del proyecto se ha realizado atendiendo
> tanto a las recomendaciones del tutor como a los resultados obtenidos
> mediante la herramienta EZEstimate, utilizada para la estimación del
> esfuerzo a partir de los actores, los casos de uso y los factores de
> complejidad técnica y del entorno previamente justificados. En base a
> dicha estimación y al esfuerzo real invertido durante el desarrollo,
> se ha obtenido un valor total de 1740,48 horas de trabajo.
>
> Este esfuerzo se traduce en 290 días de desarrollo, lo que equivale
> exactamente a 58 semanas completas, o de forma equivalente, 13 meses
> de dedicación continuada. El cálculo se ha realizado considerando un
> único desarrollador, con una dedicación constante de 6 horas diarias,
> durante 5 días a la semana (excluyendo los sábados y domingos), desde
> finales del mes de noviembre de 2024 hasta finales del mes de
>
> diciembre de 2025. No se han tenido en cuenta festivos ni jornadas
> excepcionales en las que se haya podido dedicar un mayor número de
> horas al proyecto fuera del horario habitual.
>
> La asignación de tiempos a las distintas fases del Proceso Unificado
> se ha llevado a cabo en semanas, ajustando la duración de cada
> iteración a la complejidad real de las tareas abordadas. De este modo,
> se ha logrado una planificación coherente con el tamaño y alcance del
> sistema, permitiendo distribuir el esfuerzo de manera equilibrada
> entre las fases de inicio, elaboración, construcción y transición, y
> sirviendo como base para el seguimiento y control del progreso del
> proyecto.
>
> []{#_bookmark45 .anchor}Tabla 30: Asignación de tiempos a las
> distintas iteraciones

+------------------+---------------------+---------------------+
| **Fase**         | **Iteración**       | **Tiempo (días)**   |
+==================+=====================+=====================+
| > Inicio         | Iteración 1         | 5                   |
|                  +---------------------+---------------------+
|                  | Iteración 2         | 10                  |
+------------------+---------------------+---------------------+
| > Elaboración    | Iteración 1         | 15                  |
|                  +---------------------+---------------------+
|                  | Iteración 2         | 20                  |
+------------------+---------------------+---------------------+
| > Construcción   | Iteración 1         | 160                 |
|                  +---------------------+---------------------+
|                  | Iteración 2         | 40                  |
+------------------+---------------------+---------------------+
| > Transición     | Iteración 1         | 15                  |
|                  +---------------------+---------------------+
|                  | Iteración 2         | 25                  |
+------------------+---------------------+---------------------+

## Calendario de trabajo

> Para definir con claridad el rumbo del desarrollo, se ha estructurado
> un cronograma de trabajo alineado con las etapas descritas
> previamente. El inicio de las actividades se sitúa el 20 de noviembre
> de 2024 y, considerando el periodo de ejecución previsto para este
> sistema, la fecha de finalización se estima 13 meses después,
> coincidiendo con el mes de diciembre de 2025. Dado que es un proyecto
> de carácter autónomo sin restricciones externas de jornada, se ha
> fijado un horario de dedicación de 6 horas diarias, de 18:00 a 00:00.
> Esta planificación responde a la necesidad del autor de compaginar el
> desarrollo con sus obligaciones académicas y laborales matutinas, las
> cuales impiden el avance del proyecto en otros tramos del día.

## Esquema de tareas, subtareas y diagramas de Gantt

> A continuación, se presenta la distribución de las tareas y subtareas
> por iteración, organizada según las distintas fases del Proceso
> Unificado y siguiendo la planificación descrita en apartados
> anteriores. Esta distribución se representa tanto de forma tabular
> como mediante diagramas de Gantt, lo que permite ofrecer una visión
> clara y estructurada del desarrollo temporal del proyecto.
>
> A lo largo de las distintas fases puede observarse cómo la duración y
> complejidad de las tareas aumenta progresivamente desde la fase de
> Inicio hasta la fase de Construcción, para posteriormente disminuir en
> la fase de Transición, coincidiendo con el cierre del desarrollo y el
> refinamiento final de los distintos apartados del proyecto.
>
> Las imágenes correspondientes a los diagramas de Gantt muestran de
> manera gráfica la secuencia temporal de las actividades, la
> precedencia entre tareas y la organización del trabajo en cada
> iteración. Cada iteración finaliza con un hito claramente identificado
> mediante un símbolo en forma de rombo, lo que facilita el seguimiento
> del progreso y la identificación de los puntos clave del desarrollo.
>
> ![](media/image3.png){width="9.542300962379702in"
> height="1.8856244531933508in"}

[]{#_bookmark48 .anchor}Ilustración 2: Diagrama de Gantt fase Inicio -
Iteración 1

> ![](media/image4.png){width="4.2323753280839895in"
> height="2.098957786526684in"}
> ![](media/image5.png){width="3.713804680664917in"
> height="2.1947911198600174in"}

[]{#_bookmark49 .anchor}Ilustración 3: Diagrama de Gantt fase Inicio -
Iteración 2

> ![](media/image6.png){width="9.576579177602799in" height="2.20375in"}

[]{#_bookmark50 .anchor}Ilustración 4: Diagrama de Gantt fase
Elaboración - Iteración 1

> ![](media/image7.png){width="5.246089238845144in" height="3.5475in"}
> ![](media/image8.png){width="4.165716316710411in"
> height="3.6693744531933508in"}

[]{#_bookmark51 .anchor}Ilustración 5: Diagrama de Gantt fase
Elaboración - Iteración 2

> ![](media/image9.png){width="9.451248906386702in"
> height="3.1390616797900264in"}

[]{#_bookmark52 .anchor}Ilustración 6: Diagrama de Gantt fase
Construcción - Iteración 1

> ![](media/image10.png)

[]{#_bookmark53 .anchor}Ilustración 7: Diagrama de Gantt fase
Construcción - Iteración 2

> ![](media/image12.png){width="9.4373676727909in"
> height="1.8218744531933508in"}

[]{#_bookmark54 .anchor}Ilustración 8: Diagrama de Gantt fase
Transición - Iteración 1

> ![](media/image13.png){width="5.292498906386702in"
> height="2.2660411198600174in"}
> ![](media/image14.png){width="3.8625470253718284in"
> height="2.3508333333333336in"}

[]{#_bookmark55 .anchor}Ilustración 9: Diagrama de Gantt fase
Transición - Iteración 2

# Conclusiones

> Una vez definida la estimación del coste de desarrollo del proyecto
> "Load Crutches" y establecida la planificación temporal detallada
> mediante las distintas tablas de asignación de tiempos y el cronograma
> de iteraciones, se puede concluir que se trata de un proyecto de
> grandes dimensiones tanto a nivel funcional como tecnológico. Esta
> complejidad no solo viene determinada por el número de casos de uso
> implementados, sino también por la integración de múltiples
> subsistemas heterogéneos que abarcan desde aplicaciones cliente hasta
> la comunicación con hardware específico.
>
> El proyecto "Load Crutches" combina una aplicación móvil para
> pacientes desarrollada en iOS debido a la experiencia del
> desarrollador en este entorno, reduciendo considerablemente el coste
> de tiempo de desarrollo de la aplicación, un panel web para doctores,
> un *backend* con lógica clínica y de gestión, comunicación Bluetooth
> con una muleta inteligente y tratamiento de datos clínicos sensibles.
> Cada uno de estos subsistemas ha requerido fases específicas de
> análisis, diseño, implementación y pruebas, siendo la fase de
> Construcción la más extensa y la que ha concentrado la mayor parte del
> esfuerzo total del proyecto.
>
> La estimación obtenida mediante la herramienta EZEstimate, con un
> total de 1740,48 horas, ha resultado coherente con el esfuerzo real
> finalmente dedicado al desarrollo. No obstante, es importante destacar
> que la estimación debe entenderse como una referencia orientativa para
> la planificación, ya que durante el desarrollo han surgido tareas
> adicionales no siempre reflejadas explícitamente en los casos de uso,
> tales como investigación tecnológica, resolución de problemas de
> integración bluetooth, ajustes de arquitectura, refactorizaciones y
> pruebas continuas de estabilidad y rendimiento.
>
> Este análisis pone de manifiesto la importancia de definir con
> precisión los requisitos y objetivos durante las fases iniciales del
> proyecto (Inicio y Elaboración), ya que estas fases han servido como
> base para minimizar esfuerzos y asegurar la coherencia del sistema
> durante la fase de Construcción. La correcta estructuración de las
> iteraciones y la separación clara de responsabilidades entre
> subsistemas han permitido abordar el desarrollo de forma progresiva y
> controlada.

[]{#_bookmark57 .anchor}Tabla 31: Descripción de las fases por
iteraciones

+----------------------------+------------------------------------+
| > **Fase (Iteración)**     | **Descripción**                    |
+============================+:===================================+
| **Inicio**                 | > En la primera iteración de la    |
|                            | > fase de inicio se llevó a cabo   |
| (Iteración 1)              | > una toma de contacto inicial con |
|                            | > el proyecto "Load Crutches". Se  |
|                            | > analizó el problema clínico que  |
|                            | > aborda el sistema, se estudiaron |
|                            | > soluciones existentes            |
|                            | > relacionadas con la              |
|                            | > rehabilitación asistida y        |
|                            | > dispositivos inteligentes, y se  |
|                            | > realizaron las primeras          |
|                            | > reuniones con el tutor para      |
|                            | > definir el alcance general       |
|                            | >                                  |
|                            | > y los objetivos principales del  |
|                            | > trabajo.                         |
+----------------------------+------------------------------------+
| **Inicio**                 | > En la segunda iteración de la    |
|                            | > fase de inicio se definieron con |
| (Iteración 2)              | > mayor detalle los objetivos del  |
|                            | > sistema, los actores implicados  |
|                            | > y los primeros casos de uso.     |
|                            | > Asimismo, se estableció una      |
|                            | > planificación inicial del        |
|                            | > proyecto y se identificaron las  |
|                            | > tecnologías                      |
|                            | >                                  |
|                            | > principales que se utilizarían   |
|                            | > durante el desarrollo.           |
+----------------------------+------------------------------------+

+----------------------------+------------------------------------+
| **Elaboración**            | > Durante esta iteración se        |
|                            | > realizó el análisis detallado    |
| (Iteración 1)              | > del sistema, definiendo los      |
|                            | > requisitos funcionales y no      |
|                            | > funcionales de "Load Crutches".  |
|                            | > También se diseñó la             |
|                            | > arquitectura general del         |
|                            | > sistema, identificando los       |
|                            | > distintos subsistemas            |
|                            | > (aplicación móvil, panel web,    |
|                            | > *backend* y base de datos) y sus |
|                            | >                                  |
|                            | > relaciones.                      |
+============================+:===================================+
| **Elaboración**            | > En la segunda iteración de la    |
|                            | > fase de elaboración se           |
| (Iteración 2)              | > completaron los aspectos         |
|                            | > teóricos del proyecto,           |
|                            | > incluyendo la especificación     |
|                            | > completa de los casos de uso, la |
|                            | > elaboración de los diagramas UML |
|                            | > (clases, secuencia y             |
|                            | > despliegue), el glosario y la    |
|                            | > documentación técnica. Además,   |
|                            | > se realizó una revisión global   |
|                            | > del trabajo antes de comenzar la |
|                            | > fase                             |
|                            | >                                  |
|                            | > de construcción.                 |
+----------------------------+------------------------------------+

+----------------------------+------------------------------------+
| **Construcción**           | > En la primera iteración de la    |
|                            | > fase de construcción se          |
| (Iteración Gestión de      | > desarrollaron los elementos      |
| entornos virtuales)        | > fundamentales del sistema,       |
|                            | > incluyendo la arquitectura base  |
|                            | > del *backend*, la gestión de     |
|                            | > usuarios y pacientes, la         |
|                            | > persistencia de datos y el panel |
|                            | > web del doctor. Se realizaron    |
|                            | > pruebas                          |
|                            | >                                  |
|                            | > funcionales para validar la      |
|                            | > correcta integración de estos    |
|                            | > componentes.                     |
+============================+:===================================+
| **Construcción**           | > En la segunda iteración de la    |
|                            | > fase de construcción se abordó   |
| (Iteración Análisis y      | > el desarrollo de la aplicación   |
| procesamiento de datos)    | > móvil del paciente, la           |
|                            | > integración Bluetooth con la     |
|                            | > muleta inteligente, la gestión   |
|                            | > de sesiones de rehabilitación y  |
|                            | > la comunicación en tiempo real   |
|                            | > mediante chat. Se realizaron     |
|                            | > pruebas de integración entre     |
|                            | > todos los                        |
|                            | >                                  |
|                            | > subsistemas.                     |
+----------------------------+------------------------------------+
| **Transición**             | > En la primera iteración de la    |
|                            | > fase de transición se llevaron a |
| (Iteración 1)              | > cabo pruebas globales del        |
|                            | > sistema para verificar el        |
|                            | > cumplimiento de los requisitos   |
|                            | > definidos. Se analizaron los     |
|                            | > resultados obtenidos y se        |
|                            | > realizaron ajustes y             |
|                            | > correcciones sobre los distintos |
|                            | > subsistemas                      |
|                            | >                                  |
|                            | > desarrollados.                   |
+----------------------------+------------------------------------+
| **Transición**             | > En la segunda iteración de la    |
|                            | > fase de transición se procedió   |
| (Iteración 2)              | > al despliegue final del sistema, |
|                            | > la revisión y cierre de la       |
|                            | > documentación, la ejecución de   |
|                            | > pruebas finales de integración y |
|                            | > la preparación de la entrega y   |
|                            | >                                  |
|                            | > defensa del Trabajo Fin de       |
|                            | > Grado.                           |
+----------------------------+------------------------------------+

# Bibliografía

> \[1\] «PlantUML,» \[En línea\]. Available:
> [https://plantuml.com/]{.underline} \[Último acceso: 2025\].
