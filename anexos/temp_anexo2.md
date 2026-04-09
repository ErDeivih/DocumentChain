> **LOAD CRUTCHES: SISTEMA DE SOPORTE EN LA RECUPERACIÓN DE PACIENTES
> QUE REQUIEREN USO DE MULETAS**
>
> **-**

LOAD CRUTCHES: SUPPORT SYSTEM FOR THE RECOVERY OF PATIENTS WHO REQUIRE
THE USE OF CRUTCHES

> Anexo II: Análisis y diseño del sistema

![](media/image1.png){width="4.535625546806649in" height="1.25125in"}

# Trabajo de Fin de Grado Grado en Ingeniería Informática

> **Alumno:**

# Víctor Martín Fuentes

> **Tutor:**

# Pablo Chamoso Santos

> Salamanca, enero de 2026
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

# Contenido

# 

[Índice de figuras 1](#índice-de-figuras)

[Índice de tablas 1](#índice-de-tablas)

1.  [Introducción 1](#introducción)

2.  [Ámbito del software 2](#ámbito-del-software)

3.  [Diseño de datos 4](#diseño-de-datos)

    1.  [Objetos de datos y estructuras de datos
        4](#objetos-de-datos-y-estructuras-de-datos)

    2.  [Estructuras de archivo y bases de datos
        6](#estructuras-de-archivo-y-bases-de-datos)

4.  [Diseño arquitectónico 13](#diseño-arquitectónico)

    1.  [Arquitectura de capas 15](#arquitectura-de-capas)

    2.  [Diagrama de clases de diseño 17](#diagrama-de-clases-de-diseño)

        1.  [Arquitectura del sistema 19](#_bookmark24)

5.  [Diseño de la interfaz 28](#diseño-de-la-interfaz)

    1.  [Representación de las interfaces del sistema
        28](#representación-de-las-interfaces-del-sistema)

    2.  [Prototipos de la interfaz de los componentes del sistema
        33](#prototipos-de-la-interfaz-de-los-componentes-del-sistema)

        1.  [Vista de inicio de sesión doctor (Panel web)
            33](#_bookmark33)

        2.  [Vista de registro de doctor (Panel web) 34](#_bookmark35)

        3.  [Dashboard (Panel web) 35](#_bookmark37)

        4.  [Vista de gestión de pacientes (Panel web) 36](#_bookmark39)

        5.  [Vista de gestión de patologías (Panel web)
            37](#_bookmark41)

        6.  [Vista de gestión de consejos (Panel web) 38](#_bookmark43)

        7.  [Vista de chat (Panel web) 40](#_bookmark45)

        8.  [Vista de sesiones y detalle de sesiones de un paciente
            (Panel web) 41](#_bookmark47)

        9.  [Vista de configuración (Panel web) 43](#_bookmark51)

        10. [Vista de inicio de sesión paciente (App móvil)
            44](#_bookmark53)

        11. [Vista de inicio (App móvil) 45](#_bookmark55)

        12. [Vista para realizar sesión (App móvil) 46](#_bookmark57)

        13. [Vista de Bluetooth (App móvil) 47](#_bookmark59)

        14. [Vista de estadísticas (App móvil) 48](#_bookmark61)

        15. [Vista de estadísticas de sesiones (App móvil)
            50](#_bookmark63)

        16. [Vista de consejos (App móvil) 51](#_bookmark65)

        17. [Vista de consejos (App móvil) 52](#_bookmark67)

        18. [Vista de chat (App móvil) 53](#_bookmark69)

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas. Load Crutches: support system for the
recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

19. [Vista de perfil (App móvil) 54](#_bookmark71)

<!-- -->

6.  [Diseño procedimental 55](#diseño-procedimental)

    1.  [Diagramas de secuencia (Vista de interacción)
        57](#diagramas-de-secuencia-vista-de-interacción)

    2.  [Diagramas de caso de uso-diseño
        69](#diagramas-de-caso-de-uso-diseño)

7.  [Referencia cruzada a los requisitos
    107](#referencia-cruzada-a-los-requisitos)

8.  [Plan de desarrollo e implementación
    109](#plan-de-desarrollo-e-implementación)

    1.  [Diagrama de despliegue 109](#diagrama-de-despliegue)

9.  [Glosario 115](#glosario)

[Bibliografía 117](#bibliografía)

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

# Índice de figuras

> [Ilustración 1: Diagrama de clases de análisis 4](#_bookmark6)
>
> [Ilustración 2: Diagrama de paquetes 16](#_bookmark21)
>
> [Ilustración 3: Diagrama de clases de diseño completo
> 17](#_bookmark23)
>
> [Ilustración 4: Arquitectura por componentes del sistema
> 20](#_bookmark25)
>
> [Ilustración 5: Representación del patrón abstract factory
> 24](#_bookmark26)
>
> [Ilustración 6: Arquitectura MVVM en Swift. Fuente:](#_bookmark27)
>
> [https://artsy.github.io/images/2015-09-24-mvvm-in-swift/selection.png
> 27](#_bookmark27)
>
> [Ilustración 7: Esquema del patrón MVC. Fuente:](#_bookmark28)
> [https://miro.medium.com/v2/resize:fit:720/format:webp/0\*7845RmQDC9VLFnN0.png](#_bookmark28)
>
> [. 28](#_bookmark28)
>
> [Ilustración 8: Vista de la pantalla de inicio de sesión (doctor)
> 34](#_bookmark34)
>
> [Ilustración 9: Vista de la pantalla de registro de doctor
> 35](#_bookmark36)
>
> [Ilustración 10: Vista de principal 36](#_bookmark38)
>
> [Ilustración 11: Vista de pacientes 37](#_bookmark40)
>
> [Ilustración 12: Vista de gestión de patologías 38](#_bookmark42)
>
> [Ilustración 13: Vista de gestión de consejos 39](#_bookmark44)
>
> [Ilustración 14: Vista de Chat 40](#_bookmark46)
>
> [Ilustración 15: Vista de sesiones 42](#_bookmark48)
>
> [Ilustración 16: Vista de detalle de sesiones 42](#_bookmark49)
>
> [Ilustración 17: Vista de detalles de microsesiones 42](#_bookmark50)
>
> [Ilustración 18: Vista de configuración 43](#_bookmark52)
>
> [Ilustración 19: Vista de la pantalla de inicio de sesión (paciente)
> 44](#_bookmark54)
>
> [Ilustración 20: Vista de inicio 45](#_bookmark56)
>
> [Ilustración 21: Vista de realizar sesión 47](#_bookmark58)
>
> [Ilustración 22: Vista de Bluetooth 48](#_bookmark60)
>
> [Ilustración 23: Vista de estadísticas 49](#_bookmark62)
>
> [Ilustración 24: Vista de sesiones 50](#_bookmark64)
>
> [Ilustración 25: Vista de consejos 51](#_bookmark66)
>
> [Ilustración 26: Vista de consejos 52](#_bookmark68)
>
> [Ilustración 27: Vista de chat 53](#_bookmark70)
>
> [Ilustración 28: Vista de perfil 55](#_bookmark72)
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> [Ilustración 29: Realización del diagrama de secuencia del caso de uso
> UC-0001: Iniciar](#_bookmark75) [sesión 57](#_bookmark75)
>
> [Ilustración 30: Realización del diagrama de secuencia del caso de uso
> UC-0002: Cerrar](#_bookmark76) [sesión 57](#_bookmark76)
>
> [Ilustración 31: Realización del diagrama de secuencia del caso de uso
> UC-0003:](#_bookmark77) [Registrar doctor 58](#_bookmark77)
>
> [Ilustración 32: Realización del diagrama de secuencia del caso de uso
> UC-0004:](#_bookmark78) [Registrar paciente 58](#_bookmark78)
>
> [Ilustración 33: Realización del diagrama de secuencia del caso de uso
> UC-0005: Listar](#_bookmark79) [pacientes 59](#_bookmark79)
>
> [Ilustración 34: Realización del diagrama de secuencia del caso de uso
> UC-0006: Editar](#_bookmark80) [paciente 59](#_bookmark80)
>
> [Ilustración 35: Realización del diagrama de secuencia del caso de uso
> UC-0007:](#_bookmark81) [Eliminar paciente 60](#_bookmark81)
>
> [Ilustración 36: Realización del diagrama de secuencia del caso de uso
> UC-0008: Ver](#_bookmark82) [perfil personal 60](#_bookmark82)
>
> [Ilustración 37: Realización del diagrama de secuencia del caso de uso
> UC-0009:](#_bookmark83) [Cambiar contraseña 61](#_bookmark83)
>
> [Ilustración 38: Realización del diagrama de secuencia del caso de uso
> UC-0010:](#_bookmark84) [Conectar muleta 61](#_bookmark84)
>
> [Ilustración 39: Realización del diagrama de secuencia del caso de uso
> UC-0011:](#_bookmark85) [Realizar sesión de rehabilitación
> 62](#_bookmark85)
>
> [Ilustración 40: Realización del diagrama de secuencia del caso de uso
> UC-0012:](#_bookmark86) [Realizar sesión de rehabilitación
> 62](#_bookmark86)
>
> [Ilustración 41: Realización del diagrama de secuencia del caso de uso
> UC-0013:](#_bookmark87) [Consultar progreso diario 63](#_bookmark87)
>
> [Ilustración 42: Realización del diagrama de secuencia del caso de uso
> UC-0014:](#_bookmark88) [Consultar historial de sesiones
> 63](#_bookmark88)
>
> [Ilustración 43: Realización del diagrama de secuencia del caso de uso
> UC-0015:](#_bookmark89) [Configurar límites y objetivos
> 64](#_bookmark89)
>
> [Ilustración 44: Realización del diagrama de secuencia del caso de uso
> UC-0016: Crear](#_bookmark90) [lesión 64](#_bookmark90)
>
> [Ilustración 45: Realización del diagrama de secuencia del caso de uso
> UC-0017: Editar](#_bookmark91) [lesión 65](#_bookmark91)
>
> [Ilustración 46: Realización del diagrama de secuencia del caso de uso
> UC-0018:](#_bookmark92) [Eliminar lesión 65](#_bookmark92)
>
> [Ilustración 47: Realización del diagrama de secuencia del caso de uso
> UC-0019:](#_bookmark93) [Asignar lesión a paciente 66](#_bookmark93)
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> [Ilustración 48: Realización del diagrama de secuencia del caso de uso
> UC-0020:](#_bookmark94) [Consultar catálogo de lesiones
> 66](#_bookmark94)
>
> [Ilustración 49: Realización del diagrama de secuencia del caso de uso
> UC-0021:](#_bookmark95) [Intercambio de mensajes (chat)
> 67](#_bookmark95)
>
> [Ilustración 50: Realización del diagrama de secuencia del caso de uso
> UC-0022: Crear](#_bookmark96) [consejo médico 67](#_bookmark96)
>
> [Ilustración 51: Realización del diagrama de secuencia del caso de uso
> UC-0023:](#_bookmark97) [Eliminar consejo médico 68](#_bookmark97)
>
> [Ilustración 52: Realización del diagrama de secuencia del caso de uso
> UC-0024:](#_bookmark98) [Consultar consejos médicos (paciente)
> 68](#_bookmark98)
>
> [Ilustración 53: Realización del diagrama de secuencia del caso de uso
> UC-0025: Listar](#_bookmark99) [consejos (doctor) 69](#_bookmark99)
>
> [Ilustración 54: Representación del diagrama de caso de uso-diseño
> UC-0001- Iniciar](#_bookmark101) [sesión 70](#_bookmark101)
>
> [Ilustración 55: Representación del diagrama de caso de uso-diseño
> UC-0002: Cerrar](#_bookmark102) [sesión 71](#_bookmark102)
>
> [Ilustración 56: Representación del diagrama de caso de uso-diseño
> UC-0003: Registrar](#_bookmark103) [doctor 72](#_bookmark103)
>
> [Ilustración 57: Representación del diagrama de caso de uso-diseño
> UC-0004: Registrar](#_bookmark104) [paciente 74](#_bookmark104)
>
> [Ilustración 58: Representación del diagrama de caso de uso-diseño
> UC-0005: Listar](#_bookmark105) [pacientes 76](#_bookmark105)
>
> [Ilustración 59: Representación del diagrama de caso de uso-diseño
> UC-0006: Editar](#_bookmark106) [paciente 77](#_bookmark106)
>
> [Ilustración 60: Representación del diagrama de caso de uso-diseño
> UC-0007: Eliminar](#_bookmark107) [paciente 78](#_bookmark107)
>
> [Ilustración 61: Representación del diagrama de caso de uso-diseño
> UC-0008: Ver perfil](#_bookmark108) [personal 79](#_bookmark108)
>
> [Ilustración 62: Representación del diagrama de caso de uso-diseño
> UC-0009: Cambiar](#_bookmark109) [contraseña 80](#_bookmark109)
>
> [Ilustración 63: Representación del diagrama de caso de uso-diseño
> UC-0010: Conectar](#_bookmark110) [muleta 81](#_bookmark110)
>
> [Ilustración 64: Representación del diagrama de caso de uso-diseño
> UC-0011: Realizar](#_bookmark111) [sesión de rehabilitación
> 82](#_bookmark111)
>
> [Ilustración 65: Representación del diagrama de caso de uso-diseño
> UC-0012: Finalizar](#_bookmark112) [y guardar sesión
> 84](#_bookmark112)
>
> [Ilustración 66: Representación del diagrama de caso de uso-diseño
> UC-0013: Consultar](#_bookmark113) [progreso diario 85](#_bookmark113)
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> [Ilustración 67: Representación del diagrama de caso de uso-diseño
> UC-0014: Consultar](#_bookmark114) [historial de sesiones
> 86](#_bookmark114)
>
> [Ilustración 68: Representación del diagrama de caso de uso-diseño
> UC-0015:](#_bookmark115) [Configurar límites y objetivos
> 88](#_bookmark115)
>
> [Ilustración 69: Representación del diagrama de caso de uso-diseño
> UC-0016: Crear](#_bookmark116) [lesión 90](#_bookmark116)
>
> [Ilustración 70: Representación del diagrama de caso de uso-diseño
> UC-0017: Editar](#_bookmark117) [lesión 92](#_bookmark117)
>
> [Ilustración 71: Representación del diagrama de caso de uso-diseño
> UC-0018: Eliminar](#_bookmark118) [lesión 93](#_bookmark118)
>
> [Ilustración 72: Representación del diagrama de caso de uso-diseño
> UC-0019: Asignar](#_bookmark119) [lesión a paciente 94](#_bookmark119)
>
> [Ilustración 73: Representación del diagrama de caso de uso-diseño
> UC-0020: Consultar](#_bookmark120) [catálogo de lesiones
> 96](#_bookmark120)
>
> [Ilustración 74: Representación del diagrama de caso de uso-diseño
> UC-0021:](#_bookmark121) [Intercambio de mensajes (chat)
> 98](#_bookmark121)
>
> [Ilustración 75: Representación del diagrama de caso de uso-diseño
> UC-0022: Crear](#_bookmark122) [consejo médico 100](#_bookmark122)
>
> [Ilustración 76: Representación del diagrama de caso de uso-diseño
> UC-0023: Eliminar](#_bookmark123) [consejo 102](#_bookmark123)
>
> [Ilustración 77: Representación del diagrama de caso de uso-diseño
> UC-0024: Consultar](#_bookmark124) [consejos (paciente)
> 104](#_bookmark124)
>
> [Ilustración 78: Representación del diagrama de caso de uso-diseño
> UC-0025: Listar](#_bookmark125) [consejos (doctor) 105](#_bookmark125)
>
> [Ilustración 79: Matriz de referencia cruzada entre los requisitos
> funcionales y las clases](#_bookmark127) [del diagrama de clases de
> análisis 107](#_bookmark127)
>
> [Ilustración 80: Matriz de referencia cruzada entre los requisitos
> funcionales y los](#_bookmark128) [paquetes de diseño
> 108](#_bookmark128)
>
> [Ilustración 81: Definición diagrama de despliegue 110](#_bookmark131)
>
> [Ilustración 82: Definición del servidor en diagrama de despliegue
> 111](#_bookmark132)
>
> [Ilustración 83: Definición del servidor de base de datos en diagrama
> de despliegue 113](#_bookmark133)
>
> [Ilustración 84: Definición del cliente web (doctor) en diagrama de
> despliegue 113](#_bookmark134)
>
> [Ilustración 85: Definición de la app móvil (paciente) en diagrama de
> despliegue 114](#_bookmark135)
>
> [Ilustración 86: Definición de la muleta inteligente en diagrama de
> despliegue 114](#_bookmark136)
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

# Índice de tablas

> [Tabla 1: Estructura de datos de la tabla de sesiones (session)
> 7](#_bookmark8)
>
> [Tabla 2: Estructura de datos de la tabla de datos de sesión
> (session_data) 7](#_bookmark9)
>
> [Tabla 3: Estructura de datos de la tabla de usuarios (user)
> 8](#_bookmark10)
>
> [Tabla 4: Estructura de datos de la tabla de pacientes (user_patient)
> 8](#_bookmark11)
>
> [Tabla 5: Estructura de datos de la tabla de doctores (user_doctor)
> 9](#_bookmark12)
>
> [Tabla 6: Estructura de datos de la tabla de configuración de límites
> (weight_limits) 10](#_bookmark13)
>
> [Tabla 7: Estructura de datos de la tabla lesiones (injuries)
> 11](#_bookmark14)
>
> [Tabla 8: Estructura de datos de la tabla de asignación de lesiones
> (injury_patient) 11](#_bookmark15)
>
> [Tabla 9: Estructura de datos de la tabla de consejos (advice)
> 12](#_bookmark16)
>
> [Tabla 10: Estructura de datos de la tabla de hilos de chat
> (chat_thread) 12](#_bookmark17)
>
> [Tabla 11: Estructura de datos de la tabla de hilos de chat
> (chat_thread) 13](#_bookmark18)
>
> [Tabla 12: Representación de las interfaces ofrecidas
> 29](#_bookmark31)
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

# Introducción

> En este anexo se detallará la especificación del diseño del sistema
> desarrollado en el proyecto **"Load Crutches: Sistema de soporte en la
> recuperación de pacientes que requieren el uso de muletas"**.
>
> Por una parte, a partir de las tablas de requisitos funcionales y no
> funcionales definidas en el anexo anterior, se planteará el modelo de
> dominio del problema y el enfoque de diseño del sistema. En los
> próximos puntos se explicarán las diferentes partes del modelo de
> análisis (derivado de los requisitos previamente mencionados) y,
> posteriormente, las del modelo de diseño (una vez definidas las clases
> del modelo de dominio y la arquitectura de análisis).
>
> Finalmente, como parte del modelo de diseño, se detallará un proceso
> iterativo cuya tarea es realizar una traducción de los requisitos en
> una representación software concreta. Asimismo, se abordará la
> traducción de los elementos del modelo de análisis a elementos del
> modelo de diseño a través de la etapa de abstracción; se comenzará
> especificando una abstracción más alta y, a medida que se sucedan las
> consecuentes iteraciones de diseño, se irán refinando y detallando los
> objetos hasta alcanzar un nivel de abstracción más bajo, planteando
> una solución técnica lista para implementarse (firmware, *backend* y
> clientes).
>
> El documento, abarcando los aspectos de estos dos modelos, se dividirá
> principalmente en cuatro secciones:

- **Diseño de datos:** Sección donde se especificará el diseño de las
  principales estructuras de datos (entidades como usuarios, sesiones,
  microsesiones, lesiones), la infraestructura de la base de datos
  relacional y el almacenamiento local en el dispositivo móvil. También
  se incluirá una representación de los objetos del modelo de análisis a
  partir de los requisitos obtenidos.

- **4.2.1:** En este apartado se describirá la propuesta de arquitectura
  del sistema, detallando la interacción entre los distintos nodos
  (muleta *IoT*, app móvil, Servidor *backend* y web doctor). Se
  explicarán los paradigmas de diseño, patrones de arquitectura (como
  cliente-servidor y *MVC/MVVM*) y las tecnologías de comunicación
  utilizadas.

- **Diseño de la interfaz:** Descripción de las interfaces de usuario
  para los dos entornos visuales del proyecto: la aplicación móvil
  (enfocada en el paciente y el feedback en tiempo real) y el panel web
  (enfocado en la gestión clínica para el doctor), incluyendo bocetos y
  flujos de navegación.

- **Diseño procedimental:** En este apartado se especificará la
  interacción y representación de los objetos a nivel del modelo de
  análisis y de diseño. Esto se llevará a cabo mediante diagramas de
  secuencia (especialmente críticos para los procesos de sincronización
  Bluetooth y telemetría) y diagramas de colaboración.

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

# Ámbito del software

> El sistema para diseñar se trata de una plataforma integral que
> permita monitorizar, recoger y almacenar datos biométricos procedentes
> de dispositivos de ayuda a la movilidad (muletas instrumentadas) para
> objetivar el proceso de rehabilitación de pacientes con patologías de
> tren inferior. Se busca que tanto pacientes como doctores puedan
> utilizar la tecnología IoT (*Internet of Things*) sin necesidad de
> tener nociones profundas sobre electrónica o procesamiento de señales,
> de forma que su uso quede totalmente transparente. Un sistema en el
> que se pretende favorecer la accesibilidad a datos clínicos precisos,
> la transparencia en la interacción entre el hardware y el software, y
> abstraer la complejidad de la transmisión de datos por Bluetooth y la
> sensorización, pudiendo realizar sesiones de rehabilitación guiadas y
> obteniendo un análisis evolutivo del tratamiento.
>
> A continuación, se detallarán los objetivos del sistema, de manera
> gradual:

- **Diseño e implementación de un sistema de *biofeedback* y
  monitorización móvil:** El subsistema móvil ofrece la posibilidad a
  los usuarios de conectar su dispositivo de asistencia (muleta) con su
  smartphone para realizar ejercicios de carga controlada. La aplicación
  actúa como interfaz directa con el hardware, procesando la información
  en tiempo real para guiar al paciente y, posteriormente, sincronizar
  los resultados con el servidor central.

  - **Abstracción de la comunicación *IoT*:** La complejidad del
    protocolo de comunicación Bluetooth y la decodificación de las
    tramas de datos crudos procedentes de los sensores de fuerza
    quedarán totalmente desacopladas de la experiencia de usuario. El
    sistema gestionará internamente la conexión, reconexión y
    calibración, presentando al usuario únicamente una interfaz visual
    intuitiva basada en códigos de colores (estilo semáforo).

  - **Procesamiento en tiempo real (*Biofeedback*):** El sistema será
    capaz de permitir a los usuarios recibir retroalimentación
    instantánea durante la marcha. Al igual que en el ejemplo de
    referencia se descargan entornos de ejecución, aquí la app descarga
    la \"configuración del tratamiento\" (límites de peso) y ejecuta un
    algoritmo local que compara cada paso con los parámetros médicos,
    alertando al paciente si excede o no llega a la carga prescrita.

  - **Persistencia local y sincronización:** Dado que la rehabilitación
    puede ocurrir en entornos sin conexión a internet, el sistema móvil
    implementará un mecanismo de almacenamiento local temporal. Una vez
    finalizada la sesión y recuperada la conectividad, los datos
    serializados de la telemetría se volcarán al servidor, garantizando
    la integridad de la sesión clínica.

- **Diseño e implementación de un sistema de gestión clínica:** El
  sistema de control ofrece a los profesionales sanitarios la capacidad
  de supervisar de forma remota a múltiples pacientes. A diferencia de
  un repositorio de modelos estáticos, este sistema gestiona flujos de
  datos dinámicos (evolución del paciente),

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> permitiendo visualizar y monitorizar las sesiones y modificar los
> parámetros del tratamiento (límites de carga y objetivos de pasos) que
> afectarán al comportamiento físico de la muleta en la siguiente
> conexión.

- **Almacenamiento de los datos clínicos:** El sistema será capaz de
  almacenar la información de los usuarios (doctores y pacientes), el
  catálogo de lesiones disponibles, así como la masiva cantidad de datos
  generados en cada microsesión (pasos, carga máxima, carga media,
  cadencia). Para el almacenamiento de los perfiles y toda la
  información relativa a la telemetría se realizará mediante el uso de
  una base de datos relacional en la que priman la consistencia, la
  seguridad y la integridad referencial de los datos, siguiendo un
  modelo CRUD para la gestión administrativa y un modelo de series
  temporales para los datos de los sensores

- **Diseño e implementación de un sistema de comunicación y
  teleasistencia:** Esta funcionalidad permitirá establecer un canal
  directo entre el experto (doctor) y el usuario final (paciente). El
  sistema integrará un módulo de mensajería instantánea (chat) y un
  gestor de consejos médicos asíncronos. De esta forma, el tratamiento
  se personaliza de forma individualizada, permitiendo al doctor enviar
  pautas específicas vinculadas a la patología del paciente sin
  necesidad de consultas presenciales constantes.

- Diseño **e implementación de un sistema seguro y accesible:** Esta
  funcionalidad permitirá que el *backend* del sistema esté alojado en
  la nube, siendo accesible desde cualquier ubicación, pero
  implementando estrictas políticas de seguridad. Al tratarse de
  información médica sensible, el sistema contará con un control de
  acceso basado en roles mediante tokens de autenticación, asegurando
  que cada usuario solo pueda acceder y hacer uso de las herramientas y
  datos para los que está autorizado (por ejemplo, un paciente no puede
  ver datos de otros pacientes, ni un doctor modificar la configuración
  de un paciente que no tiene asignado).

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

# Diseño de datos

> En este apartado se definirá el diseño de datos por medio de la
> representación de los objetos de datos mediante los diagramas de clase
> del modelo de análisis.

## Objetos de datos y estructuras de datos

> A continuación, en la [Ilustración *1*](#_bookmark6) se mostrará el
> diagrama de clases del modelo de análisis, que representa el diseño de
> datos para el proyecto en el modelo de análisis. Posteriormente se
> procederá a explicar cada una de las clases y su cometido dentro de la
> representación.

[]{#_bookmark6 .anchor}Ilustración 1: Diagrama de clases de análisis

![](media/image2.jpeg){width="5.905178258967629in"
height="4.065415573053368in"}

> A partir del diagrama anterior se procederá a describir cada clase
> definida a continuación:

- User **(Usuario):** Entidad interna que gestiona los identificadores
  globales.

  - **id_user:** Identificador único autoincremental del usuario. Es un
    número entero.

  - **user_type:** Discriminador del tipo de usuario (0 para paciente, 1
    para doctor). Es un número entero.

- Doctor**:** Entidad que representa al profesional sanitario.

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

- **id_user:** Clave foránea que lo vincula a la tabla global user. Es
  un número entero.

- **username:** Nombre de usuario para el login. Es una cadena de texto.

- **password:** Contraseña de acceso encriptada. Es una cadena de texto.

- **name:** Nombre de pila del doctor. Es una cadena de texto.

- **surname:** Apellidos del doctor. Es una cadena de texto.

- **email:** Dirección de correo electrónico. Es una cadena de texto.

<!-- -->

- Patient **(Paciente):** Entidad que representa a la persona en
  rehabilitación.

  - **id_user:** Clave foránea que lo vincula a la tabla global user. Es
    un número entero.

  - **username:** Nombre de usuario para el login. Es una cadena de
    texto.

  - **password:** Contraseña de acceso encriptada. Es una cadena de
    texto.

  - **name:** Nombre de pila del paciente. Es una cadena de texto.

  - **surname:** Apellidos del paciente. Es una cadena de texto.

  - **dni:** Documento Nacional de Identidad. Es una cadena de texto.

  - **birthdate:** Fecha de nacimiento. Es una fecha.

  - **email:** Dirección de correo electrónico. Es una cadena de texto.

  - **weight:** Peso corporal actual (kg). Es un número decimal.

  - **height:** Altura del paciente (cm). Es un número entero.

  - **gender:** Género del paciente (0: Hombre, 1: Mujer, 2: Otros). Es
    un número entero (Int).

  - **description:** Notas o descripción clínica del paciente. Es una
    cadena de texto.

- Session **(Sesión):** Representa el resumen de la actividad diaria.

  - **id_session:** Identificador único de la sesión. Es un número
    entero.

  - **id_user:** Identificador del paciente que realizó la sesión. Es un
    número entero.

  - **date:** Fecha en la que se realizó la actividad. Es una fecha.

  - **total_steps:** Pasos totales acumulados en el día. Es un número
    entero.

  - **av_daily_weight:** Peso medio soportado durante el día. Es un
    número decimal.

  - **min_limit:** Límite inferior configurado para ese día. Es un
    número decimal.

  - **max_limit:** Límite superior configurado para ese día. Es un
    número decimal.

- SessionData **(Datos de Sesión):** Detalle temporal de la sesión.

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

- **id_session:** Identificador de la sesión a la que pertenece el dato.
  Es un número entero.

- **timestamp:** Marca de tiempo exacta del registro (segundo a
  segundo). Es un número entero (Int).

- **steps:** Pasos dados en ese intervalo. Es un número entero.

- **av_weight:** Carga media en ese intervalo. Es un número decimal.

<!-- -->

- Injury **(Lesión):** Catálogo de patologías.

  - **id_injury:** Identificador único de la lesión. Es un número
    entero.

  - **injury_name:** Nombre de la lesión. Es una cadena de texto.

  - **injury_description:** Descripción médica de la lesión. Es una
    cadena de texto.

  - **id_doctor:** Identificador del doctor que creó la lesión en el
    catálogo. Es un número entero.

- Advice **(Consejo):** Recomendaciones médicas.

  - **id_advice:** Identificador único del consejo. Es un número entero.

  - **advice_title:** Título del consejo. Es una cadena de texto.

  - **advice_description:** Contenido del consejo. Es una cadena de
    texto.

  - **id_doctor:** Doctor que emite el consejo. Es un número entero.

  - **id_patient:** Paciente que recibe el consejo. Es un número entero.

  - **id_injury:** Lesión asociada al consejo. Es un número entero.

- ChatMessage **(Mensaje de Chat):** Mensajes intercambiados.

  - **id_message:** Identificador único del mensaje. Es un número
    entero.

  - **id_thread:** Identificador del hilo de conversación. Es un número
    entero.

  - **id_sender:** Identificador del usuario que envía el mensaje. Es un
    número entero.

  - **content:** Texto del mensaje. Es una cadena de texto.

  - **created_at:** Fecha y hora de envío. Es una fecha (datetime).

  - **read_at:** Fecha y hora de lectura. Es una fecha (datetime).

## Estructuras de archivo y bases de datos

> Como parte de la aplicación, se tiene como infraestructura de
> almacenamiento dos partes bien diferenciadas, ambas integradas dentro
> de un sistema de gestión de bases de datos relacional (MySQL).
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> Una parte está referida al almacenamiento de la información clínica y
> la telemetría generada por el dispositivo *IoT*. Esta sección es
> crítica ya que almacena tanto los resúmenes de actividad diaria como
> el desglose detallado de cada instante de la marcha, permitiendo el
> análisis evolutivo del tratamiento.
>
> La otra parte se refiere a la estructura de las tablas de gestión de
> usuarios, roles y perfiles específicos (doctores y pacientes), que
> garantizan la seguridad, la autenticación y la segmentación de la
> información médica.
>
> La primera tabla, hace referencia a la estructura de datos planteada
> para el almacenamiento de las sesiones diarias de rehabilitación
> (resúmenes).
>
> []{#_bookmark8 .anchor}Tabla 1: Estructura de datos de la tabla de
> sesiones (session)

+-----------------+----------------------+---------------------+
| > **Nombre**    | **Tipo**             | > **Descripción**   |
+=================+:====================:+=====================+
| id_session      | Número (Entero)      | Identificador único |
|                 |                      | de la sesión en la  |
|                 |                      | base de datos.      |
+-----------------+----------------------+---------------------+
| id_user         | Número (Entero)      | Identificador del   |
|                 |                      | paciente que ha     |
|                 |                      | realizado la        |
|                 |                      | sesión.             |
+-----------------+----------------------+---------------------+
| date            | Fecha                | Fecha en la que se  |
|                 |                      | llevó a cabo la     |
|                 |                      | actividad física.   |
+-----------------+----------------------+---------------------+
| total_steps     | Número (Entero)      | Cantidad total de   |
|                 |                      | pasos acumulados    |
|                 |                      | durante el día.     |
+-----------------+----------------------+---------------------+
| av_daily_weight | Número (Decimal)     | Carga media (kg)    |
|                 |                      | soportada           |
|                 |                      |                     |
|                 |                      | por la muleta       |
|                 |                      | durante toda la     |
|                 |                      | sesión.             |
+-----------------+----------------------+---------------------+
| min_limit       | Número (Decimal)     | Límite de carga     |
|                 |                      | inferior            |
|                 |                      | configurado en el   |
|                 |                      | momento             |
|                 |                      |                     |
|                 |                      | de la sesión.       |
+-----------------+----------------------+---------------------+
| max_limit       | Número (Decimal)     | Límite de carga     |
|                 |                      | superior            |
|                 |                      |                     |
|                 |                      | configurado en el   |
|                 |                      | momento de la       |
|                 |                      | sesión.             |
+-----------------+----------------------+---------------------+

> La [Tabla *2*](#_bookmark9) hace referencia a la estructura utilizada
> para almacenar la telemetría en bruto (micro sesiones). Debido a la
> alta frecuencia de muestreo de la muleta, esta tabla almacena los
> datos desglosados temporalmente para permitir la reconstrucción de
> gráficas detalladas.
>
> []{#_bookmark9 .anchor}Tabla 2: Estructura de datos de la tabla de
> datos de sesión (session_data)

+--------------+----------------------+---------------------+
| > **Nombre** | **Tipo**             | > **Descripción**   |
+==============+======================+=====================+

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

+------------+----------------------+---------------------+
| id_session | Número (Entero)      | Clave foránea que   |
|            |                      | vincula este dato   |
|            |                      | con la sesión       |
|            |                      | diaria              |
|            |                      |                     |
|            |                      | general.            |
+============+======================+=====================+
| timestamp  | Número (Entero)      | Marca de tiempo     |
|            |                      | exacta (segundos)   |
|            |                      | del registro de la  |
|            |                      |                     |
|            |                      | actividad.          |
+------------+----------------------+---------------------+
| av_weight  | Número (Decimal)     | Carga media         |
|            |                      | registrada en       |
|            |                      |                     |
|            |                      | ese intervalo de    |
|            |                      | tiempo específico.  |
+------------+----------------------+---------------------+
| steps      | Número (Entero)      | Pasos realizados en |
|            |                      | ese intervalo de    |
|            |                      | tiempo              |
|            |                      |                     |
|            |                      | específico.         |
+------------+----------------------+---------------------+

> La [Tabla *3*](#_bookmark10) hace referencia a la estructura de la
> tabla base de usuarios, encargada de la autenticación y roles. Por su
> parte, [Tabla *4*](#_bookmark11) detalla la información específica del
> perfil del paciente (datos antropométricos y clínicos), mientras que
> la [Tabla *5*](#_bookmark12) hace referencia a la estructura de datos
> extendida para los perfiles de los doctores (credenciales
> profesionales).
>
> []{#_bookmark10 .anchor}Tabla 3: Estructura de datos de la tabla de
> usuarios (user)

+--------------+-----------------------+----------------------+
| > **Nombre** | **Tipo**              | > **Descripción**    |
+==============+:=====================:+======================+
| id_user      | Número                | Identificador del    |
|              |                       | paciente.            |
+--------------+-----------------------+----------------------+
| user_type    | Número (Entero)       | Tipo de usuario (0   |
|              |                       | paciente, 1 doctor)  |
+--------------+-----------------------+----------------------+

> []{#_bookmark11 .anchor}Tabla 4: Estructura de datos de la tabla de
> pacientes (user_patient)

+--------------+------------------------+-----------------------+
| > **Nombre** | **Tipo**               | > **Descripción**     |
+==============+:======================:+=======================+
| id_user      | Número (Entero)        | Clave foránea que     |
|              |                        | vincula con la tabla  |
|              |                        | base user.            |
+--------------+------------------------+-----------------------+
| username     | Cadena de caracteres   | Nombre de usuario     |
|              |                        | único utilizado para  |
|              |                        | el inicio de          |
|              |                        |                       |
|              |                        | sesión.               |
+--------------+------------------------+-----------------------+
| password     | Cadena de caracteres   | Contraseña de acceso  |
|              |                        | cifrada.              |
+--------------+------------------------+-----------------------+
| name         | Cadena de caracteres   | Nombre de pila del    |
|              |                        | paciente.             |
+--------------+------------------------+-----------------------+
| surname      | Cadena de caracteres   | Apellidos del         |
|              |                        | paciente.             |
+--------------+------------------------+-----------------------+

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

+-------------+------------------------+-----------------------+
| dni         | Cadena de caracteres   | Documento Nacional de |
|             |                        | Identidad.            |
+=============+:======================:+=======================+
| birthdate   | Fecha                  | Fecha de nacimiento   |
|             |                        | para el cálculo de    |
|             |                        | edad.                 |
+-------------+------------------------+-----------------------+
| email       | Cadena de caracteres   | Correo electrónico    |
|             |                        | corporativo o de      |
|             |                        | contacto.             |
+-------------+------------------------+-----------------------+
| weight      | Número (Decimal)       | Peso corporal del     |
|             |                        | paciente (kg)         |
|             |                        |                       |
|             |                        | necesario para        |
|             |                        | cálculos de carga.    |
+-------------+------------------------+-----------------------+
| height      | Número (Entero)        | Altura del paciente   |
|             |                        | en centímetros.       |
+-------------+------------------------+-----------------------+
| gender      | Número (Entero)        | Género del paciente   |
|             |                        | (codificado           |
|             |                        | numéricamente).       |
+-------------+------------------------+-----------------------+
| description | Cadena de caracteres   | Notas clínicas o      |
|             |                        | descripción de la     |
|             |                        | situación del         |
|             |                        | paciente.             |
+-------------+------------------------+-----------------------+

> []{#_bookmark12 .anchor}Tabla 5: Estructura de datos de la tabla de
> doctores (user_doctor)

+--------------+------------------------+-----------------------+
| > **Nombre** | **Tipo**               | > **Descripción**     |
+==============+:======================:+=======================+
| id_user      | Número (Entero)        | Clave foránea que     |
|              |                        | vincula con la tabla  |
|              |                        | base user.            |
+--------------+------------------------+-----------------------+
| username     | Cadena de caracteres   | Nombre de usuario     |
|              |                        | único utilizado para  |
|              |                        | el inicio de          |
|              |                        |                       |
|              |                        | sesión.               |
+--------------+------------------------+-----------------------+
| password     | Cadena de caracteres   | Contraseña de acceso  |
|              |                        | cifrada.              |
+--------------+------------------------+-----------------------+
| name         | Cadena de caracteres   | Nombre de pila del    |
|              |                        | doctor.               |
+--------------+------------------------+-----------------------+
| surname      | Cadena de caracteres   | Apellidos del doctor. |
+--------------+------------------------+-----------------------+
| email        | Cadena de caracteres   | Correo electrónico    |
|              |                        | corporativo o de      |
|              |                        | contacto.             |
+--------------+------------------------+-----------------------+

> [Tabla *6*](#_bookmark13) hace referencia a la estructura de
> almacenamiento de la configuración de los límites de peso y parámetros
> de *biofeedback* que regulan el comportamiento de la muleta para cada
> paciente específico.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark13 .anchor}Tabla 6: Estructura de datos de la tabla de
> configuración de límites (weight_limits)

+--------------+----------------------+---------------------+
| > **Nombre** | **Tipo**             | > **Descripción**   |
+==============+:====================:+=====================+
| id_user      | Número (Entero)      | Identificador del   |
|              |                      | paciente al que se  |
|              |                      | aplican estos       |
|              |                      | límites.            |
+--------------+----------------------+---------------------+
| min_limit    | Número (Decimal)     | Umbral de peso      |
|              |                      | mínimo que el       |
|              |                      | paciente debe       |
|              |                      | apoyar.             |
+--------------+----------------------+---------------------+
| max_limit    | Número (Decimal)     | Umbral de peso      |
|              |                      | máximo que no se    |
|              |                      | debe exceder.       |
+--------------+----------------------+---------------------+

> La gestión de enfermedades se divide en dos partes: la [Tabla
> 7](#_bookmark14) hace referencia a la estructura del catálogo general
> de lesiones definidas en el sistema, mientras que la
> [Tabla](#_bookmark15) [8](#_bookmark15) hace referencia a la tabla
> intermedia que vincula dichas lesiones con los pacientes, almacenando
> el grado de severidad y los comentarios específicos de la asignación.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark14 .anchor}Tabla 7: Estructura de datos de la tabla
> lesiones (injuries)

+--------------------+---------------------+---------------------+
| > **Nombre**       | **Tipo**            | > **Descripción**   |
+====================+:===================:+=====================+
| id_injury          | Número (Entero)     | Identificador único |
|                    |                     | de la lesión en el  |
|                    |                     | catálogo.           |
+--------------------+---------------------+---------------------+
| injury_name        | Cadena de           | Nombre clínico de   |
|                    | caracteres          | la patología.       |
+--------------------+---------------------+---------------------+
| injury_description | Cadena de           | Descripción médica  |
|                    | caracteres          | detallada de la     |
|                    |                     | lesión.             |
+--------------------+---------------------+---------------------+
| id_doctor          | Número (Entero)     | Identificador del   |
|                    |                     | doctor que dio de   |
|                    |                     | alta la lesión en   |
|                    |                     | el                  |
|                    |                     |                     |
|                    |                     | sistema.            |
+--------------------+---------------------+---------------------+

> []{#_bookmark15 .anchor}Tabla 8: Estructura de datos de la tabla de
> asignación de lesiones (injury_patient)

+----------------+---------------------+---------------------+
| > **Nombre**   | **Tipo**            | > **Descripción**   |
+================+=====================+:====================+
| id_injury_user | Número (Entero)     | Identificador único |
|                |                     | autoincremental del |
|                |                     | registro de la      |
|                |                     | asignación en       |
|                |                     |                     |
|                |                     | la base de datos.   |
+----------------+---------------------+---------------------+
| id_user        | Número (Entero)     | Clave foránea que   |
|                |                     | identifica al       |
|                |                     | usuario (paciente)  |
|                |                     | al que se le        |
|                |                     |                     |
|                |                     | vincula la          |
|                |                     | patología.          |
+----------------+---------------------+---------------------+
| id_injury      | Número (Entero)     | Clave foránea que   |
|                |                     | referencia a la     |
|                |                     | lesión específica   |
|                |                     | dentro del catálogo |
|                |                     | de patologías       |
|                |                     |                     |
|                |                     | (injuries).         |
+----------------+---------------------+---------------------+
| comment        | Cadena de           | Texto descriptivo   |
|                | caracteres          | para indicar el     |
|                |                     | grado de gravedad,  |
|                |                     | detalles            |
|                |                     |                     |
|                |                     | específicos o notas |
|                |                     | médicas sobre la    |
|                |                     | lesión del          |
|                |                     | paciente.           |
+----------------+---------------------+---------------------+

> Para el seguimiento cualitativo, la [Tabla *9*](#_bookmark16) hace
> referencia a la estructura de datos de los consejos o recomendaciones
> médicas enviadas. Finalmente, el sistema de chat se estructura en dos
> niveles: la [Tabla *10*](#_bookmark17) hace referencia a la gestión de
> los hilos de conversación y estados de lectura, y la [Tabla
> *11*](#_bookmark18)detalla la estructura de almacenamiento de los
> mensajes individuales intercambiados cronológicamente.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark16 .anchor}Tabla 9: Estructura de datos de la tabla de
> consejos (advice)

+--------------------+---------------------+--------------------+
| > **Nombre**       | **Tipo**            | > **Descripción**  |
+====================+:===================:+====================+
| id_advice          | Número (Entero)     | Identificador      |
|                    |                     | único del consejo  |
|                    |                     | médico.            |
+--------------------+---------------------+--------------------+
| id_injury          | Número (Entero)     | Identificador de   |
|                    |                     | la lesión a la que |
|                    |                     | hace referencia el |
|                    |                     |                    |
|                    |                     | consejo.           |
+--------------------+---------------------+--------------------+
| id_doctor          | Número (Entero)     | Identificador del  |
|                    |                     | doctor que emite   |
|                    |                     | la recomendación.  |
+--------------------+---------------------+--------------------+
| id_patient         | Número (Entero)     | Identificador del  |
|                    |                     | paciente           |
|                    |                     | destinatario.      |
+--------------------+---------------------+--------------------+
| advice_title       | Cadena de           | Título breve o     |
|                    | caracteres          | asunto del         |
|                    |                     | consejo.           |
+--------------------+---------------------+--------------------+
| advice_description | Cadena de           | Contenido          |
|                    | caracteres          | detallado de la    |
|                    |                     | recomendación      |
|                    |                     | médica.            |
+--------------------+---------------------+--------------------+

> []{#_bookmark17 .anchor}Tabla 10: Estructura de datos de la tabla de
> hilos de chat (chat_thread)

+-----------------+---------------------+--------------------+
| > **Nombre**    | **Tipo**            | > **Descripción**  |
+=================+:===================:+====================+
| id_thread       | Número (Entero)     | Identificador      |
|                 |                     | único del hilo de  |
|                 |                     | conversación.      |
+-----------------+---------------------+--------------------+
| id_patient      | Número (Entero)     | Identificador del  |
|                 |                     | paciente           |
|                 |                     | participante en la |
|                 |                     |                    |
|                 |                     | conversación.      |
+-----------------+---------------------+--------------------+
| id_doctor       | Número (Entero)     | Identificador del  |
|                 |                     | doctor             |
|                 |                     |                    |
|                 |                     | participante en la |
|                 |                     | conversación.      |
+-----------------+---------------------+--------------------+
| last_message_at | Fecha               | Fecha y hora del   |
|                 |                     | último mensaje     |
|                 |                     | enviado (utilizado |
|                 |                     | para ordenar la    |
|                 |                     | lista de           |
|                 |                     |                    |
|                 |                     | chats).            |
+-----------------+---------------------+--------------------+
| patient_unread  | Número (Entero)     | Contador de        |
|                 |                     | mensajes que el    |
|                 |                     | paciente aún no ha |
|                 |                     | leído.             |
+-----------------+---------------------+--------------------+
| doctor_unread   | Número (Entero)     | Contador de        |
|                 |                     | mensajes que el    |
|                 |                     | doctor aún no ha   |
|                 |                     | leído.             |
+-----------------+---------------------+--------------------+

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark18 .anchor}Tabla 11: Estructura de datos de la tabla de
> hilos de chat (chat_thread)

+--------------+---------------------+--------------------+
| > **Nombre** | **Tipo**            | **Descripción**    |
+==============+:===================:+====================+
| id_message   | Número (Entero)     | Identificador      |
|              |                     | único del mensaje  |
|              |                     | individual.        |
+--------------+---------------------+--------------------+
| id_thread    | Número (Entero)     | Identificador del  |
|              |                     | hilo de            |
|              |                     |                    |
|              |                     | conversación al    |
|              |                     | que pertenece.     |
+--------------+---------------------+--------------------+
| id_sender    | Número (Entero)     | Identificador del  |
|              |                     | usuario            |
|              |                     |                    |
|              |                     | (doctor o          |
|              |                     | paciente) que      |
|              |                     | envió el mensaje.  |
+--------------+---------------------+--------------------+
| content      | Cadena de           | Texto del mensaje  |
|              | caracteres          | enviado.           |
+--------------+---------------------+--------------------+
| created_at   | Fecha               | Marca de tiempo    |
|              |                     | del envío del      |
|              |                     | mensaje.           |
+--------------+---------------------+--------------------+
| read_at      | Fecha               | Marca de tiempo de |
|              |                     | la lectura del     |
|              |                     | mensaje (puede     |
|              |                     |                    |
|              |                     | ser nulo).         |
+--------------+---------------------+--------------------+

# Diseño arquitectónico

> En este apartado se mostrarán las relaciones de control entre los
> distintos módulos descritos en la parte del modelo de análisis,
> combinando la estructura del programa con la estructura de datos y
> definiendo los esquemas e interfaces necesarios para entender el flujo
> del programa.
>
> Al seguir en este proyecto un paradigma de lenguajes orientados a
> objetos y una arquitectura distribuida (cliente-servidor), la
> descripción de la arquitectura se hará mediante una descripción de los
> paquetes que componen los módulos del sistema y sus relaciones.
> Posteriormente, se realizará una descripción detallada, a partir del
> diagrama de paquetes, de las clases de diseño encargadas de la lógica
> de negocio y sus interacciones.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

## Arquitectura de capas

> En la [Ilustración *2*](#_bookmark21) se muestra el diagrama de
> paquetes del sistema, de manera que se pueda entender el
> funcionamiento de la arquitectura del proyecto por división de los
> módulos.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark21 .anchor}Ilustración 2: Diagrama de paquetes

![](media/image3.jpeg){width="6.132232064741907in"
height="4.344791119860018in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

## Diagrama de clases de diseño

> Con respecto a la parte de diseño, se muestra en la [Ilustración
> *3*](#_bookmark23) el diagrama de clases de diseño definido a partir
> del diagrama de clases de la parte de análisis donde se define, en un
> nivel más cercano a la implementación, los métodos y atributos que
> tendrá cada clase siguiendo un paradigma orientado a objetos.
>
> ![](media/image4.jpeg){width="9.705426509186351in"
> height="3.0569652230971127in"}[]{#_bookmark23 .anchor}Ilustración 3:
> Diagrama de clases de diseño completo

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

1.  []{#_bookmark24 .anchor}Arquitectura del sistema

> En el sistema "Load Crutches" se han hecho uso de diversos patrones de
> diseño, cuyo objetivo es proporcionar una descripción clara de los
> elementos que componen el sistema, el tipo de relaciones existentes
> entre ellos y un conjunto de restricciones que regulan su interacción
> y uso. La aplicación de estos patrones permite estructurar el sistema
> de forma modular, facilitando su mantenimiento, escalabilidad y
> evolución futura.
>
> En este apartado se define la arquitectura del sistema separada en
> tres módulos principales: la lógica de negocio central, encargada de
> la gestión clínica del sistema (usuarios, sesiones de rehabilitación,
> parámetros de tratamiento, comunicación y control de acceso); el
> sistema de almacenamiento, responsable de la persistencia de la
> información administrativa, clínica y de la telemetría generada por
> los dispositivos *IoT*; y la capa de presentación, compuesta por la
> aplicación móvil del paciente y el panel web del doctor.
>
> La capa de presentación adopta un enfoque *MVC* estricto, separando la
> lógica de control, la interfaz de usuario y el acceso a datos y
> hardware. Por su parte, el servidor *backend* implementa el patrón
> *MVC*, centralizando la lógica de negocio y exponiendo sus
> funcionalidades mediante una *API REST* y servicios de comunicación en
> tiempo real.

1.  Arquitectura general. Arquitectura de microservicios

> Para el funcionamiento del flujo del sistema "Load Crutches" se ha
> planteado el diseño de una arquitectura distribuida orientada a
> servicios, en la que los distintos subsistemas que componen la
> plataforma operan de forma desacoplada y coordinada. En el contexto
> del proyecto, los componentes que interactúan en el sistema, como el
> dispositivo *IoT* instrumentado, la aplicación móvil del paciente, el
> servidor *backend* y el cliente web destinado al personal médico,
> presentan requisitos funcionales y tecnológicos heterogéneos,
> susceptibles de evolucionar de manera independiente.
>
> Esta diversidad y posible evolución de los distintos subsistemas,
> tanto a nivel de hardware como de software, justifica la adopción de
> un diseño modular y escalable, basado en la exposición de servicios
> bien definidos. Este enfoque permite aislar la captura de datos
> biomecánicos, el procesamiento local orientado al *biofeedback*, la
> lógica clínica centralizada y la visualización de la información,
> facilitando la incorporación de nuevas funcionalidades o la
> sustitución de componentes sin afectar al funcionamiento global del
> sistema.
>
> El diseño propuesto hace uso de diferentes patrones de diseño y
> principios de ingeniería del software, con el objetivo de simplificar
> el desarrollo y el mantenimiento de la aplicación, así como de
> desacoplar las dependencias existentes entre las fuentes de datos y la
> lógica de la aplicación. En particular, se evita el acceso directo a
> la capa de persistencia desde los clientes, centralizando toda la
> gestión de la información clínica y de telemetría en el servidor
> *backend*.
>
> A partir de este planteamiento arquitectónico se ha desarrollado un
> primer nivel de abstracción del sistema, reflejado en la
> descomposición por componentes y paquetes
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> presentada en los diagramas correspondientes. Esta descomposición
> permite observar la distribución de responsabilidades de cada
> subsistema a bajo nivel, proporcionando una visión clara de la
> arquitectura distribuida del sistema y de las interacciones que se
> producen entre sus distintos componentes.
>
> []{#_bookmark25 .anchor}Ilustración 4: Arquitectura por componentes
> del sistema

![](media/image5.jpeg){width="5.915403543307087in"
height="2.3879166666666665in"}

- **Aplicación móvil (Paciente)**: Este componente proporciona la
  interfaz principal de interacción con el sistema para el paciente. La
  aplicación móvil permite la visualización en tiempo real de la carga
  ejercida durante la marcha, el *feedback* visual inmediato y la
  consulta del progreso de rehabilitación. Asimismo, actúa como
  intermediario entre el dispositivo *IoT* y el servidor *backend*,
  gestionando la comunicación mediante Bluetooth Low Energy, el
  procesamiento local de los datos para el *biofeedback* y la
  persistencia temporal de la información en escenarios sin conectividad
  a internet. La interfaz se ha diseñado para ser intuitiva, accesible y
  robusta, permitiendo su uso por parte de pacientes sin conocimientos
  técnicos.

- **Aplicación web (Doctor)**: Este componente ofrece la visualización y
  gestión de la información clínica a través de un navegador web. El
  panel web permite al personal médico consultar la evolución de los
  pacientes, analizar gráficas de sesiones de rehabilitación, gestionar
  patologías y configurar los parámetros del tratamiento. La aplicación
  se ha desarrollado como una aplicación web de página única, con una
  interfaz dinámica y reactiva, delegando toda la lógica clínica y el
  acceso a datos en el servidor *backend*.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

- **Servidor *backend***: Este componente constituye el núcleo lógico
  del sistema "Load Crutches". Es responsable de la gestión de la lógica
  de negocio, el control de acceso y autenticación de usuarios, la
  coordinación de los distintos subsistemas y el tratamiento
  centralizado de los datos clínicos y de telemetría. El *backend*
  expone sus funcionalidades a través de una *API REST* y servicios de
  comunicación en tiempo real, siendo consumido tanto por la aplicación
  móvil como por el cliente web. Además, actúa como único punto de
  acceso a la capa de persistencia, garantizando la integridad y
  seguridad de la información médica.

- **Sistema de comunicación en tiempo real**: Este componente permite la
  comunicación bidireccional entre pacientes y doctores mediante
  mensajería instantánea, así como la actualización inmediata de
  información relevante en los clientes. Se basa en el uso de
  *WebSockets*, lo que permite gestionar eventos asíncronos de forma
  eficiente, como el intercambio de mensajes de chat o la notificación
  de cambios en el estado de las sesiones.

- **Dispositivo *IoT* (Muleta instrumentada)**: Este componente se
  encarga de la captura de datos biomecánicos durante la marcha del
  paciente. La muleta instrumentada incorpora sensores de fuerza que
  registran la carga aplicada y transmiten dicha información mediante
  Bluetooth Low Energy a la aplicación móvil. El dispositivo no almacena
  información clínica ni realiza procesamiento complejo, limitándose a
  la adquisición y transmisión de datos de forma eficiente y
  transparente para el usuario.

- **Base de datos clínica**: Este sistema de almacenamiento se encarga
  de persistir toda la información gestionada por el *backend* del
  sistema. Incluye datos de usuarios, información clínica, parámetros de
  tratamiento, sesiones de rehabilitación, telemetría detallada y
  mensajes intercambiados entre usuarios. Se ha optado por una base de
  datos relacional que garantiza la consistencia, integridad referencial
  y trazabilidad de los datos, permitiendo trabajar de forma segura y
  eficiente con grandes volúmenes de información médica.

> En el caso del proyecto "Load Crutches", se ha planteado una
> arquitectura cliente- servidor distribuida**,** capaz de soportar
> distintos tipos de clientes, como aplicaciones móviles y aplicaciones
> web, priorizando la escalabilidad y el desacoplamiento entre
> subsistemas. El sistema expone una *API* que puede ser consumida por
> diferentes clientes, facilitando la integración con futuras
> aplicaciones o servicios externos.
>
> El servidor *backend* gestiona las peticiones entrantes mediante
> protocolos síncronos y asíncronos, ejecutando la lógica de negocio
> correspondiente, accediendo a la base de datos y devolviendo
> respuestas estructuradas. Este enfoque permite una clara separación
> entre la lógica de negocio y la capa de presentación, favoreciendo la
> mantenibilidad del sistema.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> Teniendo en cuenta estas premisas y tal y como se ha reflejado en la
> arquitectura por componentes presentada, el diseño adoptado responde a
> una arquitectura distribuida orientada a servicios, en la que cada
> componente cumple una responsabilidad bien definida y se comunica con
> el resto a través de interfaces claras y estables. Este enfoque
> facilita la evolución progresiva del sistema, permitiendo escalar
> funcionalidades concretas o introducir nuevos servicios sin necesidad
> de reestructurar el sistema completo.
>
> La arquitectura planteada ofrece una serie de ventajas frente a una
> arquitectura monolítica tradicional:

- Alta mantenibilidad y disponibilidad, al separar claramente
  responsabilidades y facilitar la evolución independiente de los
  componentes.

- Bajo acoplamiento entre subsistemas, permitiendo modificar o ampliar
  funcionalidades sin afectar al resto del sistema.

- Escalabilidad, posibilitando la adaptación del sistema a un mayor
  número de usuarios o a un incremento del volumen de datos clínicos.

- Flexibilidad tecnológica, permitiendo la evolución independiente del
  hardware

> *IoT*, la aplicación móvil, el *backend* o el cliente web.

1.  Arquitectura de entornos virtuales. Patrón Abstract Factory

> Para la gestión de los distintos orígenes de datos y estrategias de
> procesamiento de forma totalmente transparente y desacoplada del resto
> del sistema, en "Load Crutches" se ha adoptado el patrón de diseño
> *Abstract Factory*. Este patrón permite proporcionar una interfaz
> común a través de la cual el sistema accede a los distintos mecanismos
> de adquisición y tratamiento de datos, sin necesidad de conocer los
> detalles concretos de su implementación.
>
> En el contexto del proyecto, este enfoque resulta especialmente útil
> para abstraer la interacción con el dispositivo *IoT*, el
> procesamiento local en la aplicación móvil y los posibles modos de
> simulación o extensión futura del sistema. De este modo, el resto de
> los componentes del sistema puede operar sobre una interfaz homogénea,
> independientemente de si los datos proceden de una muleta
> instrumentada real, de un entorno de pruebas o de futuras versiones
> del hardware.
>
> El uso del patrón *Abstract Factory* garantiza una elevada
> flexibilidad y extensibilidad, permitiendo sustituir o ampliar las
> implementaciones concretas sin afectar al código cliente. Las
> características específicas de cada fuente de datos o estrategia de
> procesamiento quedan completamente encapsuladas, lo que favorece el
> bajo acoplamiento entre subsistemas y mejora la mantenibilidad del
> sistema.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> Este patrón se basa en la definición de familias de clases que
> comparten un propósito común, pero que pueden presentar
> implementaciones distintas para resolver el mismo problema. Las
> instancias de estas familias son creadas mediante fábricas concretas,
> evitando la dependencia directa del sistema cliente respecto a las
> clases concretas.
>
> Para una mejor comprensión del funcionamiento de este patrón en el
> sistema "Load Crutches", a continuación, se describen los distintos
> componentes representados en la [Ilustración *5*](#_bookmark26):

- Client: Representa el componente del sistema que solicita la creación
  de los objetos abstractos. En "Load Crutches", este rol lo desempeñan
  principalmente los controladores de la aplicación móvil y los
  servicios del *backend* que requieren acceder a datos de carga, pasos
  o información procesada, sin conocer el origen concreto de dichos
  datos.

- AbstractFactory: Define la interfaz común de las fábricas encargadas
  de crear los distintos productos abstractos. En el sistema, esta
  interfaz establece los métodos necesarios para obtener instancias de
  adquisición de datos y de procesamiento, garantizando que el cliente
  trabaje siempre contra abstracciones.

- ConcreteFactory: Representa las fábricas concretas encargadas de crear
  las implementaciones específicas de cada familia de productos. En
  "Load Crutches" pueden existir, por ejemplo, fábricas asociadas a la
  adquisición de datos desde una muleta real, a un entorno de simulación
  o a un modo de pruebas, todas ellas respetando la misma interfaz
  definida por la fábrica abstracta.

- AbstractProduct (A, B): Corresponden a las interfaces que definen la
  estructura común de los productos que forman parte de una misma
  familia. En el contexto del proyecto, estos productos representan, por
  ejemplo, los mecanismos de adquisición de datos biomecánicos y los
  procesadores de datos de rehabilitación, independientemente de su
  implementación concreta.

- ConcreteProduct (A, B): Son las implementaciones concretas de los
  productos abstractos. Estas clases encapsulan la lógica específica
  para la lectura de datos mediante Bluetooth Low Energy, la simulación
  de datos o el procesamiento local de *biofeedback*, manteniendo
  siempre la interfaz común definida por los productos abstractos.

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark26 .anchor}Ilustración 5: Representación del patrón
> *abstract factory*

![](media/image6.jpeg){width="5.900936132983377in"
height="3.7491666666666665in"}

> De esta manera, en el subsistema de abstracción de adquisición y
> procesamiento de datos, a través del patrón *abstract factory*, se
> permite al sistema "Load Crutches" abstraer las características de los
> distintos orígenes de datos y estrategias de procesamiento utilizados
> durante la rehabilitación, independientemente de los requisitos
> específicos de cada uno, de sus características técnicas o de su
> implementación concreta.
>
> Se define una clase AbstractFactory que actúa como nivel de
> abstracción de los métodos necesarios para la creación de los
> componentes encargados de la adquisición y el procesamiento de los
> datos biomecánicos. De este modo, cada ConcreteFactory hace referencia
> a una implementación concreta del sistema, como la obtención de datos
> desde una muleta instrumentada real o desde un entorno de simulación o
> pruebas, manteniendo siempre una interfaz común para el resto del
> sistema.
>
> Asimismo, cada AbstractProduct representa una familia de componentes
> con una responsabilidad bien definida dentro del sistema, como pueden
> ser los mecanismos de lectura de datos de carga y pasos o los módulos
> de procesamiento y análisis de la información de rehabilitación. Estas
> abstracciones permiten encapsular completamente las particularidades
> de cada implementación, ya sea la comunicación mediante Bluetooth, la
> generación de datos simulados o el procesamiento local en tiempo real
> para el *biofeedback*.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> En conclusión, en función del origen de los datos y del modo de
> operación seleccionado, el sistema crea y gestiona dinámicamente una
> combinación concreta de componentes de adquisición y procesamiento,
> garantizando que el resto de los subsistemas de "Load Crutches"
> interactúen siempre a través de interfaces homogéneas y desacopladas.
> Este enfoque facilita la extensibilidad del sistema y permite
> incorporar futuras versiones del hardware o nuevos modos de
> funcionamiento sin necesidad de modificar el código cliente.

1.  Arquitectura de la vista. Patrón *MVVM*

> En este apartado se define la arquitectura *MVVM*
> (*Model--View--ViewModel*) empleada en los clientes de "Load
> Crutches", tanto en el cliente web, desarrollado mediante el
> *framework* Vue.js, como en la aplicación móvil iOS, desarrollada en
> Swift utilizando UIKit. En ambos casos, este patrón arquitectónico se
> ha utilizado en los subsistemas de visualización y gestión de datos
> clínicos, permitiendo una representación dinámica de la información
> procedente del servidor *backend* y favoreciendo la separación de
> responsabilidades entre los distintos componentes de la interfaz.
>
> En el cliente web, la arquitectura *MVVM* facilita el desacoplamiento
> entre la lógica de presentación y los datos clínicos, permitiendo que
> la interfaz reaccione automáticamente a los cambios de estado
> gestionados por la ViewModel. De forma análoga, en la aplicación móvil
> se adopta una variante del patrón *MVVM* que desacopla los
> ViewControllers de la lógica de negocio asociada a la interfaz,
> delegando dicha responsabilidad en clases ViewModel.
>
> La vista se encarga de mostrar al usuario la información contenida en
> el sistema, representando gráficamente los datos clínicos, las
> sesiones de rehabilitación y los parámetros de tratamiento. En la
> arquitectura *MVVM*, la Vista no conoce directamente el modelo y
> viceversa. La vista interactúa exclusivamente con la ViewModel, por lo
> que se considera una vista activa. Todas las acciones realizadas por
> el usuario, como la navegación, la consulta de datos o la modificación
> de parámetros, son interceptadas por la vista y delegadas a la
> ViewModel para su procesamiento. La vista no mantiene estado propio,
> sino que representa en todo momento el estado definido por la
> ViewModel.
>
> El componente ViewModel (VM) actúa como enlace entre el Modelo y la
> vista, concentrando toda la lógica necesaria para manipular los datos
> y preparar la información que será presentada al usuario. En "Load
> Crutches", las ViewModels coordinan la comunicación con los servicios
> del *backend*, procesan las respuestas recibidas, aplican validaciones
> y formatean los datos clínicos antes de su visualización. En el caso
> de la aplicación, las ViewModels gestionan además la interacción con
> servicios locales como la comunicación Bluetooth y el procesamiento de
> datos para el *biofeedback* en tiempo real. A diferencia de otras
> arquitecturas de tipo *MV*, la lógica asociada a la gestión del estado
> de la interfaz y a la interacción del usuario reside principalmente en
> la ViewModel, mientras que el modelo se mantiene deliberadamente
> simple.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> El modelo representa la capa de acceso a los datos de la aplicación,
> tanto en el cliente web como en la aplicación móvil. Contiene la
> información clínica, administrativa y de sesión que será presentada o
> manipulada a través de la interfaz. En esta arquitectura, el modelo no
> define lógica de negocio compleja, limitándose a la validación básica
> de los datos y a actuar como contenedor de la información gestionada
> por la ViewModel. Asimismo, el modelo no accede directamente al
> *backend* ni a servicios externos, ya que esta responsabilidad recae
> sobre la ViewModel y los servicios de comunicación asociados.
>
> En la ilustración correspondiente se muestra de forma esquemática el
> flujo de funcionamiento de la arquitectura *MVVM* dentro de los
> clientes de "Load Crutches", así como su integración dentro de los
> diagramas de diseño del proyecto.
>
> Para definir los componentes que conforman la arquitectura *MVVM*, a
> continuación, se describen los tres elementos principales sobre los
> que se estructura este patrón:

- Modelos: Son construcciones simples que almacenan los datos utilizados
  por la ViewModel y la aplicación. No contienen lógica de negocio más
  allá de la validación de datos y no acceden directamente a servicios
  externos. En el cliente web, los modelos se representan mediante
  objetos simples utilizados para estructurar la información recibida
  desde el *backend*, mientras que en la aplicación se implementan
  mediante estructuras o clases.

- Vistas: Se encargan de renderizar los datos proporcionados por la
  ViewModel y de capturar las acciones del usuario. En el cliente web,
  las vistas se definen mediante plantillas HTML enriquecidas con
  enlaces de datos y directivas propias de Vue.js, mientras que en la
  aplicación móvil las vistas están representadas por UIViewController y
  componentes UIView, responsables de reflejar el estado gestionado por
  la ViewModel. En ambos casos, la Vista permanece sincronizada con la
  ViewModel sin necesidad de manipulación directa del estado subyacente.

- ViewModels (VMs): Contienen la lógica de negocio relacionada con la
  interfaz de usuario y la gestión del estado de la aplicación. Las
  ViewModels definen propiedades observables vinculadas a los elementos
  de la Vista y métodos encargados de gestionar los eventos del usuario,
  así como de coordinar la comunicación con los servicios del *backend*
  y, en el caso de la aplicación móvil, con los servicios locales del
  dispositivo.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark27 .anchor}Ilustración 6: Arquitectura *MVVM* en Swift.
> Fuente: https://artsy.github.io/images/2015-09-24-mvvm-in-
> swift/selection.png

![](media/image7.png){width="3.522030839895013in"
height="2.9596872265966754in"}

1.  Arquitectura de la lógica de negocio. Patrón *MVC*

> Por otro lado, en el sistema "Load Crutches" se ha optado por la
> utilización del patrón *MVC* (*Model--View--Controller*) en el diseño
> del servidor *backend*. El objetivo principal de este patrón es
> desacoplar la capa de presentación de la capa de datos y de la lógica
> de negocio, con el fin de mejorar la mantenibilidad, reutilización y
> escalabilidad del código.
>
> En esta arquitectura, el modelo representa la estructura de los datos
> clínicos y administrativos del sistema, reflejada en el esquema de la
> base de datos relacional y en las entidades que encapsulan el acceso a
> dicha información. El controlador se encarga de gestionar las
> peticiones entrantes desde los distintos clientes, tanto la aplicación
> móvil como el panel web, ejecutando la lógica de negocio
> correspondiente y coordinando el acceso a los modelos. La vista, en el
> contexto del *backend*, se materializa en las respuestas estructuradas
> devueltas por la *API*, que son consumidas por los clientes del
> sistema.
>
> Este enfoque se utiliza en el módulo del sistema relacionado con el
> servidor central de "Load Crutches", donde se concentran
> funcionalidades como la gestión de usuarios, sesiones de
> rehabilitación, parámetros de tratamiento, comunicación en tiempo real
> y control de acceso. La adopción del patrón *MVC* permite organizar el
> código del *backend* de forma clara y modular, facilitando la
> evolución del sistema y la incorporación de nuevas funcionalidades
> clínicas.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark28 .anchor}Ilustración 7: Esquema del patrón *MVC*.
> Fuente:
> https://miro.medium.com/v2/resize:fit:720/format:webp/0\*7845RmQDC9VLFnN0.png

![](media/image8.png){width="3.347236439195101in"
height="1.8304155730533684in"}

# Diseño de la interfaz

> En este apartado se presenta el diseño y la preparación de las
> interfaces del sistema "Load Crutches" de cara a su implementación.
> Por un lado, se describen las interfaces de comunicación expuestas por
> el servidor *backend* para permitir el funcionamiento de las distintas
> funcionalidades del sistema. Por otro lado, se muestra la
> representación visual de las interfaces de usuario, a modo de esbozo o
> mockup, correspondientes tanto a la aplicación móvil del paciente como
> al panel web destinado al personal médico.
>
> El diseño de las interfaces de usuario se ha planteado con el objetivo
> de ofrecer una experiencia clara, intuitiva y accesible, teniendo en
> cuenta el perfil de los usuarios finales del sistema. En el caso de la
> aplicación móvil, se prioriza la simplicidad y la inmediatez del
> *feedback* visual durante la rehabilitación, mientras que en el panel
> web se favorece la visualización detallada de la información clínica y
> la gestión eficiente de los pacientes.

## Representación de las interfaces del sistema

> En el sistema Load Crutches, el servidor *backend* actúa como
> intermediario entre la capa de presentación y la lógica de negocio,
> exponiendo sus interfaces siguiendo los principios de la arquitectura
> *REST* mediante el uso del protocolo *HTTP*. Esta arquitectura, basada
> en el intercambio de recursos a través de URLs bien definidas y
> métodos *HTTP* estándar, se considera actualmente un enfoque
> ampliamente adoptado en el desarrollo de aplicaciones web y móviles.
>
> Las interfaces expuestas por el servidor permiten a los distintos
> clientes del sistema, la aplicación móvil y el cliente web, acceder de
> forma controlada a las funcionalidades del sistema, tales como la
> autenticación de usuarios, la gestión de sesiones de rehabilitación,
> la consulta y configuración de parámetros de tratamiento, el
> intercambio de mensajes y la visualización de la evolución clínica de
> los pacientes.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> Estas interfaces constituyen un elemento fundamental para la
> comprensión del funcionamiento del sistema y sirven como base para la
> elaboración de los diagramas de casos de uso y de diseño. Los
> *endpoints* expuestos por el servidor *backend*, se describen de forma
> detallada en las tablas correspondientes, donde se especifican las
> rutas disponibles y la funcionalidad asociada a cada una de ellas.
>
> []{#_bookmark31 .anchor}Tabla 12: Representación de las interfaces
> ofrecidas

+---------------------------------+--------------------+-------------------------+--------------------+
| **Endpoint**                    | **Método**         | > **Parámetros/Recursos | > **Descripción**  |
|                                 |                    | > en Body**             |                    |
+:===============================:+:==================:+:=======================:+:==================:+
| **GESTIÓN DE USUARIOS**                                                                             |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/loginPatient          | POST               | username, password      | Autenticación de   |
|                                 |                    |                         | un                 |
|                                 |                    |                         |                    |
|                                 |                    |                         | paciente y         |
|                                 |                    |                         | generación del     |
|                                 |                    |                         | token de sesión.   |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/loginDoctor           | POST               | username, password      | Autenticación de   |
|                                 |                    |                         | un doctor y        |
|                                 |                    |                         | generación del     |
|                                 |                    |                         |                    |
|                                 |                    |                         | token de sesión.   |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/addDoctor             | POST               | Datos del doctor        | Registro de un     |
|                                 |                    |                         | nuevo profesional  |
|                                 |                    |                         | sanitario en       |
|                                 |                    |                         |                    |
|                                 |                    |                         | el sistema.        |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/addPatient            | POST               | Datos clínicos y        | Registro de un     |
|                                 |                    | personales              | nuevo              |
|                                 |                    |                         |                    |
|                                 |                    |                         | paciente asociado  |
|                                 |                    |                         | a un doctor.       |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/updatePatientByDoctor | PATCH              | Datos modificados del   | Actualización de   |
|                                 |                    | paciente                | información        |
|                                 |                    |                         | clínica de un      |
|                                 |                    |                         | paciente por parte |
|                                 |                    |                         | del                |
|                                 |                    |                         |                    |
|                                 |                    |                         | doctor.            |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/deletePatientByDoctor | DELETE             | id_patient              | Eliminación de un  |
|                                 |                    |                         | paciente del       |
|                                 |                    |                         | sistema por        |
|                                 |                    |                         |                    |
|                                 |                    |                         | su doctor          |
|                                 |                    |                         | responsable.       |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/patientsByDoctor      | GET                | token                   | Recupera la lista  |
|                                 |                    |                         | de                 |
|                                 |                    |                         |                    |
|                                 |                    |                         | pacientes          |
|                                 |                    |                         | asociados a un     |
|                                 |                    |                         | doctor.            |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/getUserInformation    | GET                | \-                      | Obtiene la         |
|                                 |                    |                         | información del    |
|                                 |                    |                         | usuario            |
|                                 |                    |                         | autenticado.       |
+---------------------------------+--------------------+-------------------------+--------------------+
| /api/user/changepassword        | PATCH              | Contraseña antigua y    | Cambio de          |
|                                 |                    | nueva                   | contraseña de un   |
|                                 |                    |                         | paciente.          |
+---------------------------------+--------------------+-------------------------+--------------------+

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

+---------------------------------------+--------------------+--------------------+--------------------+
| /api/user/changeDoctorPassword        | PATCH              | Contraseña antigua | Cambio de          |
|                                       |                    | y nueva            | contraseña de un   |
|                                       |                    |                    | doctor.            |
+:=====================================:+:==================:+:==================:+:==================:+
| **GESTIÓN DE LESIONES**                                                                              |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/injuries/addInjury               | POST               | Nombre y           | Alta de una nueva  |
|                                       |                    | descripción        | lesión en el       |
|                                       |                    |                    | catálogo clínico.  |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/injuries/updateInjury            | PATCH              | Datos de la lesión | Modificación de    |
|                                       |                    |                    | una lesión         |
|                                       |                    |                    | existente.         |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/injuries/deleteInjury            | DELETE             | id_injury          | Eliminación de una |
|                                       |                    |                    | lesión del         |
|                                       |                    |                    | catálogo.          |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/injuries/addInjuryToPatient      | POST               | id_user,           | Asignación de una  |
|                                       |                    | id_injury,         | lesión a un        |
|                                       |                    | comentario         | paciente concreto. |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/injuries/removeInjuryFromPatient | DELETE             | id_patient,        | Eliminación de una |
|                                       |                    | id_injury          |                    |
|                                       |                    |                    | lesión asociada a  |
|                                       |                    |                    | un paciente.       |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/injuries/getInjuries             | GET                | \-                 | Recupera todas las |
|                                       |                    |                    | lesiones del       |
|                                       |                    |                    | sistema.           |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/injuries/getInjuriesByPatient    | GET                | id_patient         | Recupera las       |
|                                       |                    |                    | lesiones asociadas |
|                                       |                    |                    | a un paciente.     |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/injuries/getDataInjuryPatient    | GET                | id_injury          | Obtiene el detalle |
|                                       |                    |                    | clínico de una     |
|                                       |                    |                    | lesión asignada a  |
|                                       |                    |                    |                    |
|                                       |                    |                    | un paciente.       |
+---------------------------------------+--------------------+--------------------+--------------------+
| **GESTIÓN DE LIMITES DE PESO**                                                                       |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/limits/addLimits                 | POST               | id_user, límites   | Configuración de   |
|                                       |                    |                    | límites            |
|                                       |                    |                    |                    |
|                                       |                    |                    | de carga para un   |
|                                       |                    |                    | paciente.          |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/limits/deletelimits              | DELETE             | id_user            | Eliminación de los |
|                                       |                    |                    |                    |
|                                       |                    |                    | límites de carga   |
|                                       |                    |                    | de un paciente.    |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/limits/getLimitsPatient          | GET                | id                 | Obtiene los        |
|                                       |                    |                    | límites            |
|                                       |                    |                    | configurados para  |
|                                       |                    |                    | el                 |
|                                       |                    |                    |                    |
|                                       |                    |                    | paciente           |
|                                       |                    |                    | autenticado.       |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/limits/getLimitsDoctor           | GET                | id_user            | Obtiene los        |
|                                       |                    |                    | límites de un      |
|                                       |                    |                    |                    |
|                                       |                    |                    | paciente desde el  |
|                                       |                    |                    | rol doctor.        |
+---------------------------------------+--------------------+--------------------+--------------------+

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

+--------------------------------------------------------------------------------------------------------+
| **GESTIÓN DE PASOS DIARIOS**                                                                           |
+=========================================+====================+====================+====================+
| /api/steps/addDailySteps                | POST               | Datos de pasos     | Registro de        |
|                                         |                    |                    | objetivos y        |
|                                         |                    |                    |                    |
|                                         |                    |                    | pasos diarios de   |
|                                         |                    |                    | un paciente.       |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/steps/deleteSteps                  | DELETE             | id_user            | Eliminación del    |
|                                         |                    |                    | registro de pasos  |
|                                         |                    |                    | de un paciente.    |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/steps/getStepsPatient              | GET                | \-                 | Recupera los pasos |
|                                         |                    |                    | del paciente       |
|                                         |                    |                    | autenticado.       |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/steps/getStepsDoctor               | GET                | id_user            | Consulta de pasos  |
|                                         |                    |                    | de un paciente por |
|                                         |                    |                    | parte del          |
|                                         |                    |                    |                    |
|                                         |                    |                    | doctor.            |
+-----------------------------------------+--------------------+--------------------+--------------------+
| **GESTIÓN DE CONSEJOS**                                                                                |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/advice/AddAdvice                   | POST               | Datos del consejo  | Creación de un     |
|                                         |                    |                    | consejo médico     |
|                                         |                    |                    | personalizado.     |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/advice/deleteAdvice                | DELETE             | id_advice          | Eliminación de un  |
|                                         |                    |                    | consejo médico.    |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/advice/getAdvicesPatient           | GET                | \-                 | Recupera los       |
|                                         |                    |                    | consejos asignados |
|                                         |                    |                    | al paciente        |
|                                         |                    |                    |                    |
|                                         |                    |                    | autenticado.       |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/advice/getAdvicesDoctor            | GET                | id_user            | Consulta de        |
|                                         |                    |                    | consejos enviados  |
|                                         |                    |                    | a un paciente.     |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/advice/getPatientsWithAdvices      | GET                | \-                 | Obtiene pacientes  |
|                                         |                    |                    | con consejos       |
|                                         |                    |                    | activos.           |
+-----------------------------------------+--------------------+--------------------+--------------------+
| **GESTIÓN DE SESIONES**                                                                                |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/session/addSession                 | POST               | Telemetría de la   | Registro de datos  |
|                                         |                    | muleta             | de una             |
|                                         |                    |                    |                    |
|                                         |                    |                    | microsesión de     |
|                                         |                    |                    | rehabilitación.    |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/session/getTodayAllSessionsPatient | GET                | \-                 | Obtiene todas las  |
|                                         |                    |                    | microsesiones del  |
|                                         |                    |                    | día del            |
|                                         |                    |                    |                    |
|                                         |                    |                    | paciente.          |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/session/getTodaySessionPatient     | GET                | \-                 | Recupera el        |
|                                         |                    |                    | resumen diario de  |
|                                         |                    |                    | la sesión del      |
|                                         |                    |                    |                    |
|                                         |                    |                    | paciente.          |
+-----------------------------------------+--------------------+--------------------+--------------------+
| /api/session/getSessionsDoctorByDate    | GET                | id_session         | Consulta de        |
|                                         |                    |                    | sesiones de        |
|                                         |                    |                    |                    |
|                                         |                    |                    | un día concreto    |
|                                         |                    |                    | por el doctor.     |
+-----------------------------------------+--------------------+--------------------+--------------------+

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

+---------------------------------------+--------------------+--------------------+--------------------+
| /api/session/getHistoricSessionDoctor | GET                | id_user            | Obtiene el         |
|                                       |                    |                    | histórico de       |
|                                       |                    |                    | sesiones de un     |
|                                       |                    |                    | paciente.          |
+=======================================+====================+====================+====================+
| /api/session/getAllHistorySessions    | GET                | \-                 | Recupera todas las |
|                                       |                    |                    |                    |
|                                       |                    |                    | sesiones           |
|                                       |                    |                    | almacenadas en el  |
|                                       |                    |                    | sistema.           |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/session/getRecentSessionsHistory | GET                | \-                 | Obtiene las        |
|                                       |                    |                    | sesiones más       |
|                                       |                    |                    | recientes del      |
|                                       |                    |                    | sistema.           |
+---------------------------------------+--------------------+--------------------+--------------------+
| **CHAT**                                                                                             |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/chat/sendMessagePatient          | POST               | content            | Envía un mensaje   |
|                                       |                    |                    | desde el paciente  |
|                                       |                    |                    | al doctor          |
|                                       |                    |                    | asignado. Si no    |
|                                       |                    |                    | existe un          |
|                                       |                    |                    |                    |
|                                       |                    |                    | hilo previo, el    |
|                                       |                    |                    | sistema lo crea    |
|                                       |                    |                    | automáticamente.   |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/chat/sendMessageDoctor           | POST               | id_user, content   | Envía un mensaje   |
|                                       |                    |                    | desde el doctor a  |
|                                       |                    |                    | un paciente        |
|                                       |                    |                    | concreto           |
|                                       |                    |                    | identificado por   |
|                                       |                    |                    |                    |
|                                       |                    |                    | su id.             |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/chat/getMessagesPatient          | GET                | limit (opcional),  | Recupera los       |
|                                       |                    | before_id          | mensajes del chat  |
|                                       |                    | (opcional)         | entre el paciente  |
|                                       |                    |                    | autenticado y su   |
|                                       |                    |                    | doctor,            |
|                                       |                    |                    |                    |
|                                       |                    |                    | con soporte de     |
|                                       |                    |                    | paginación.        |
+---------------------------------------+--------------------+--------------------+--------------------+
| /api/chat/getMessagesDoctor           | GET                | id_user, limit     | Recupera los       |
|                                       |                    | (opcional),        | mensajes del chat  |
|                                       |                    | before_id          | entre el doctor    |
|                                       |                    | (opcional)         |                    |
|                                       |                    |                    | autenticado y un   |
|                                       |                    |                    | paciente           |
|                                       |                    |                    | específico.        |
+---------------------------------------+--------------------+--------------------+--------------------+

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

+-----------------------------------+------+----------------+-----------------+
| /api/chat/getUnreadMessagesDoctor | GET  | \-             | Devuelve el     |
|                                   |      |                | último mensaje  |
|                                   |      |                | no leído de     |
|                                   |      |                | cada paciente   |
|                                   |      |                | con mensajes    |
|                                   |      |                | pendientes para |
|                                   |      |                | el doctor       |
|                                   |      |                |                 |
|                                   |      |                | autenticado.    |
+===================================+======+================+=================+
| /api/chat/markAsRead              | POST | id_patient     | Marca los       |
|                                   |      | (doctor) / sin | mensajes del    |
|                                   |      | body           | hilo            |
|                                   |      | (paciente)     | correspondiente |
|                                   |      |                | como leídos y   |
|                                   |      |                | resetea los     |
|                                   |      |                |                 |
|                                   |      |                | contadores de   |
|                                   |      |                | mensajes        |
|                                   |      |                | pendientes.     |
+-----------------------------------+------+----------------+-----------------+

## Prototipos de la interfaz de los componentes del sistema

> A continuación, se presentan los prototipos de las interfaces de
> usuario del sistema "Load Crutches", elaborados a modo de boceto o
> mockup con el objetivo de ofrecer una primera aproximación visual a la
> implementación final de la aplicación. Estos prototipos permiten
> representar de forma gráfica los requisitos funcionales definidos en
> apartados anteriores, facilitando la comprensión del flujo de
> navegación y de la interacción entre el usuario y el sistema.
>
> Los diseños mostrados corresponden a los dos entornos visuales
> principales del sistema. Por un lado, la aplicación móvil, destinada a
> los pacientes que realizan las sesiones de rehabilitación mediante el
> uso de muletas instrumentadas. Por otro lado, el panel web, orientado
> al personal médico, desde el cual se lleva a cabo la supervisión
> clínica, la gestión de pacientes y la configuración de los
> tratamientos.
>
> Los prototipos no representan la implementación final de la interfaz,
> sino que constituyen una guía de diseño que sirve como referencia para
> la disposición de los elementos visuales, la navegación entre
> pantallas y la presentación de la información relevante en cada
> contexto de uso.

1.  []{#_bookmark33 .anchor}Vista de inicio de sesión doctor (Panel web)

> En [Ilustración *9*](#_bookmark36) se muestra la pantalla
> correspondiente al formulario de autenticación del panel web de "Load
> Crutches", destinada al acceso del personal médico autorizado al
> sistema. Para utilizar las funcionalidades de gestión clínica, el
> usuario debe autenticarse mediante su nombre de usuario y la
> contraseña definidos durante el proceso de registro.
>
> La interfaz presenta de forma clara y centralizada los campos
> necesarios para la introducción de las credenciales, incorporando
> validaciones básicas antes de enviar la solicitud de autenticación al
> servidor. Una vez introducidos los datos, el inicio de sesión se
> realiza mediante una llamada segura a la *API REST* del sistema.
>
> Adicionalmente, la pantalla incluye la opción de recordar las
> credenciales de acceso y un enlace para el registro de nuevos
> doctores, facilitando el alta de profesionales sanitarios en la
> plataforma. Esta vista se integra dentro del patrón *MVVM*, delegando
> la lógica de validación y comunicación con el *backend* en su
> correspondiente ViewModel, y priorizando un diseño sencillo, accesible
> y orientado a la seguridad.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark34 .anchor}Ilustración 8: Vista de la pantalla de inicio
> de sesión (doctor)

![](media/image9.png){width="5.924208223972004in"
height="4.5495833333333335in"}

2.  []{#_bookmark35 .anchor}Vista de registro de doctor (Panel web)

> En la [Ilustración *10*](#_bookmark38) se muestra la pantalla
> correspondiente al formulario de registro de doctores del panel web,
> destinada al alta de nuevos profesionales sanitarios en el sistema.
> Esta vista permite crear una nueva cuenta médica que habilita el
> acceso a las funcionalidades de gestión clínica de la plataforma.
>
> La interfaz presenta de forma vertical y ordenada los campos
> necesarios para el registro, incluyendo el nombre de usuario, la
> contraseña y su confirmación, así como los datos identificativos del
> profesional, tales como nombre, apellidos y correo electrónico.
> Adicionalmente, se incluye un campo específico para la introducción
> del código de doctor, utilizado como mecanismo de control para
> restringir el alta únicamente a profesionales autorizados.
>
> El formulario incorpora validaciones básicas que garantizan la
> correcta cumplimentación de los datos antes de enviar la solicitud de
> registro al servidor *backend* mediante una llamada segura a la *API
> REST* del sistema. Una vez completado el proceso, el usuario puede
> finalizar el registro a través del botón correspondiente.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> Finalmente, la pantalla incluye un enlace que permite volver a la
> vista de inicio de sesión, facilitando la navegación entre ambas
> interfaces. Al igual que el resto del panel web, esta vista se integra
> dentro del patrón *MVVM*, delegando la lógica de validación, gestión
> del estado y comunicación con el *backend* en su correspondiente
> ViewModel, y manteniendo una interfaz clara, accesible y coherente con
> el diseño global del sistema.
>
> []{#_bookmark36 .anchor}Ilustración 9: Vista de la pantalla de
> registro de doctor

![](media/image10.png){width="5.961532152230971in"
height="3.254166666666667in"}

3.  []{#_bookmark37 .anchor}Dashboard (Panel web)

> En la Ilustración correspondiente se muestra la vista principal del
> panel web de "Load Crutches", que actúa como punto de entrada a la
> plataforma una vez que el profesional sanitario ha iniciado sesión.
> Esta pantalla proporciona una visión general del estado del sistema y
> del seguimiento clínico de los pacientes registrados.
>
> La interfaz se estructura en una barra de navegación lateral, desde la
> cual se accede a las principales funcionalidades del sistema, tales
> como la gestión de pacientes, patologías, sesiones, consejos clínicos
> y el sistema de mensajería, así como a las opciones de configuración y
> cierre de sesión.
>
> En la zona central se presentan distintos paneles informativos que
> muestran indicadores clave, como el número total de pacientes, la
> distribución de pacientes por género, el número de pacientes por
> patología y la actividad reciente de los pacientes en los últimos
> días. Asimismo, se incluye un panel destinado a la visualización de
> mensajes no leídos, facilitando la comunicación entre el personal
> médico y los pacientes.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark38 .anchor}Ilustración 10: Vista de principal

![](media/image11.png){width="5.962560148731408in"
height="2.9929166666666664in"}

4.  []{#_bookmark39 .anchor}Vista de gestión de pacientes (Panel web)

> En la [Ilustración 12](#_bookmark42) se muestra la vista de gestión de
> pacientes del panel web, destinada a la visualización, búsqueda y
> administración de los pacientes asignados a un profesional sanitario.
> Esta pantalla permite acceder de forma estructurada al listado de
> pacientes registrados en el sistema.
>
> La interfaz incorpora un campo de búsqueda que facilita la
> localización rápida de pacientes por nombre o identificador, así como
> un selector de ordenación que permite organizar los resultados según
> distintos criterios. Adicionalmente, se incluye un botón para añadir
> nuevos pacientes, habilitando su registro dentro del sistema.
>
> Los pacientes se representan mediante tarjetas individuales, en las
> que se muestra información básica identificativa, como el nombre
> completo y un identificador asociado. La disposición en formato de
> rejilla permite una visualización clara y escalable del conjunto de
> pacientes.
>
> En la parte inferior de la vista se incluye un sistema de paginación,
> que permite navegar entre los distintos bloques de resultados cuando
> el número de pacientes es elevado.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark40 .anchor}*Ilustración 11: Vista de pacientes*

![](media/image12.png){width="5.918772965879265in"
height="3.7159372265966755in"}

5.  []{#_bookmark41 .anchor}Vista de gestión de patologías (Panel web)

> En la [Ilustración *13*](#_bookmark44) se muestra la vista de gestión
> de patologías del panel web, destinada a la administración del
> catálogo de lesiones y patologías clínicas utilizadas dentro del
> sistema. Esta pantalla permite al personal médico consultar, crear,
> modificar y eliminar patologías de forma centralizada.
>
> La interfaz incorpora un campo de búsqueda, que facilita la
> localización rápida de patologías por nombre, así como un mecanismo de
> ordenación que permite organizar los resultados según distintos
> criterios. Además, se incluye un botón para el registro de nuevas
> patologías dentro del sistema.
>
> Las patologías se representan mediante tarjetas individuales, que
> muestran el nombre de la patología y una breve descripción asociada.
> Cada tarjeta incluye acciones explícitas para la edición y eliminación
> de la patología, permitiendo una gestión directa e intuitiva de la
> información clínica.
>
> En la parte inferior de la vista se dispone un sistema de paginación,
> que permite navegar entre los distintos conjuntos de resultados cuando
> el número de patologías registradas es elevado.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark42 .anchor}Ilustración 12: Vista de gestión de patologías

![](media/image13.png){width="5.905836614173229in"
height="3.7061450131233595in"}

6.  []{#_bookmark43 .anchor}Vista de gestión de consejos (Panel web)

> En la [Ilustración *13*](#_bookmark44) se muestra la vista de gestión
> de consejos del panel web, destinada a la administración de las
> recomendaciones clínicas asociadas a los pacientes del sistema. Esta
> pantalla permite al profesional sanitario consultar de forma
> estructurada los pacientes que disponen de consejos médicos
> registrados, así como acceder a su gestión.
>
> La interfaz incluye un campo de búsqueda, que permite localizar
> pacientes por nombre o identificador, junto con un mecanismo de
> ordenación para organizar los resultados según distintos criterios.
> Asimismo, se dispone de un botón para la creación de nuevos consejos,
> facilitando la incorporación de recomendaciones personalizadas dentro
> del tratamiento del paciente.
>
> Los pacientes se representan mediante tarjetas individuales, en las
> que se muestra información identificativa básica y un indicador del
> número de consejos asociados a cada uno de ellos. Este enfoque permite
> una visión rápida del estado cualitativo del seguimiento clínico.
>
> La vista incorpora un sistema de paginación en la parte inferior, que
> permite navegar entre los distintos conjuntos de resultados cuando el
> número de pacientes es elevado.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark44 .anchor}Ilustración 13: Vista de gestión de consejos

![](media/image14.png){width="5.792766841644794in"
height="3.6272911198600175in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

7.  []{#_bookmark45 .anchor}Vista de chat (Panel web)

> En la [Ilustración *14*](#_bookmark46) se muestra la vista de chat del
> panel web, diseñada para facilitar la comunicación directa y asíncrona
> entre el profesional sanitario y los pacientes registrados en el
> sistema. Esta funcionalidad permite un seguimiento más cercano del
> proceso de rehabilitación, resolviendo dudas y proporcionando
> indicaciones adicionales fuera de las sesiones presenciales.
>
> La interfaz se estructura en dos áreas principales. En la parte
> izquierda se presenta un listado de pacientes, acompañado de un campo
> de búsqueda que permite filtrar rápidamente las conversaciones
> disponibles. Cada elemento del listado muestra información básica del
> paciente, permitiendo identificar de forma clara el interlocutor
> activo.
>
> La zona principal de la pantalla corresponde al área de conversación,
> donde se visualiza el historial de mensajes intercambiados con el
> paciente seleccionado, diferenciando los mensajes enviados y
> recibidos. En la parte inferior se dispone de un campo de entrada de
> texto, desde el cual el profesional puede redactar y enviar nuevos
> mensajes.
>
> []{#_bookmark46 .anchor}Ilustración 14: Vista de Chat

![](media/image15.png){width="5.831494969378828in"
height="3.368333333333333in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

8.  []{#_bookmark47 .anchor}Vista de sesiones y detalle de sesiones de
    un paciente (Panel web)

> La vista de sesiones de pacientes permite al personal médico consultar
> de forma centralizada aquellos pacientes que disponen de sesiones de
> rehabilitación registradas en el sistema. En esta pantalla se presenta
> un listado visual de pacientes, mostrando de forma resumida su
> identidad y el número total de sesiones asociadas a cada uno.
>
> La interfaz incluye una barra de búsqueda que facilita la localización
> de pacientes por nombre o identificador, así como un sistema de
> ordenación para mejorar la navegación cuando el volumen de datos es
> elevado. Cada paciente se representa mediante una tarjeta
> independiente, que actúa como punto de acceso a la vista de detalle de
> sesiones.
>
> La vista de detalle de sesiones del paciente muestra la información
> específica asociada a un paciente seleccionado previamente. En esta
> pantalla se presentan indicadores clave, como el número total de
> sesiones realizadas, valores medios de pasos y peso, así como filtros
> temporales que permiten acotar el periodo de análisis.
>
> Adicionalmente, la vista incluye representaciones gráficas que
> facilitan la interpretación de la evolución del paciente, como la
> progresión del peso y el número de pasos por sesión. Estos elementos
> permiten al profesional sanitario evaluar de forma visual la evolución
> clínica del paciente a lo largo del tiempo.
>
> Pulsar el botón "Ver detalles" de la sesión permite consultar de forma
> exhaustiva la información registrada durante una sesión concreta de
> rehabilitación de un paciente. Esta pantalla se accede desde el
> historial de microsesiones y proporciona una visión detallada de los
> datos recogidos en cada microsesión.
>
> En la parte superior se muestran indicadores resumen de la sesión,
> tales como el número total de pasos realizados, el peso medio
> registrado y el número de registros obtenidos durante la sesión. Estos
> indicadores permiten una evaluación rápida del rendimiento del
> paciente en dicha sesión.
>
> A continuación, la vista presenta representaciones gráficas de la
> evolución del peso y la evolución del número de pasos, facilitando el
> análisis visual de los cambios producidos a lo largo del tiempo. Estas
> gráficas permiten identificar tendencias y posibles desviaciones
> relevantes para el seguimiento clínico.
>
> Finalmente, se incluye una línea temporal en formato tabular que
> detalla los registros individuales de la sesión, indicando la hora, el
> número de pasos y el peso medio correspondiente a cada medición. Esta
> información permite al profesional sanitario realizar un análisis más
> preciso y detallado de la sesión.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark48 .anchor}Ilustración 15: Vista de sesiones

![](media/image16.png){width="5.230744750656168in"
height="2.5116666666666667in"}

> []{#_bookmark49 .anchor}Ilustración 16: Vista de detalle de sesiones

![](media/image17.png){width="5.277621391076115in"
height="2.6766666666666667in"}

> []{#_bookmark50 .anchor}Ilustración 17: Vista de detalles de
> microsesiones

![](media/image18.png){width="5.151027996500438in" height="2.6075in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

9.  []{#_bookmark51 .anchor}Vista de configuración (Panel web)

> La vista de configuración permite al usuario personalizar y gestionar
> distintos parámetros generales de la aplicación web. Esta pantalla se
> presenta como una ventana modal superpuesta al panel principal, lo que
> permite modificar la configuración sin abandonar el contexto de uso
> actual.
>
> En esta vista se agrupan las opciones de configuración en diferentes
> secciones. En primer lugar, se incluye la selección de idioma,
> permitiendo adaptar la interfaz a la lengua preferida del usuario. A
> continuación, se ofrece una sección de apariencia, donde se puede
> definir el tema visual de la aplicación, facilitando la adaptación a
> diferentes preferencias de visualización.
>
> Asimismo, la vista incorpora una sección de seguridad, desde la cual
> el usuario puede iniciar el proceso de cambio de contraseña. En la
> parte inferior de la ventana se presentan las acciones principales
> para guardar los cambios realizados o cancelar la operación,
> garantizando un control explícito sobre la modificación de la
> configuración.
>
> []{#_bookmark52 .anchor}Ilustración 18: Vista de configuración

![](media/image19.png){width="4.214668635170604in"
height="3.785416666666667in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

10. []{#_bookmark53 .anchor}Vista de inicio de sesión paciente (App
    móvil)

> La vista de inicio de sesión de la aplicación móvil constituye el
> punto de acceso principal para los usuarios del sistema desde
> dispositivos móviles. Esta pantalla está diseñada para ofrecer un
> proceso de autenticación sencillo, claro y adaptado al uso táctil,
> manteniendo la coherencia visual con el resto de la plataforma.
>
> La interfaz presenta de forma centralizada el logotipo de la
> aplicación y los campos necesarios para la introducción de las
> credenciales del usuario, concretamente el identificador personal y la
> contraseña. El campo de contraseña incorpora un control visual que
> permite alternar la visibilidad del texto introducido, mejorando la
> usabilidad durante el proceso de acceso.
>
> Adicionalmente, se incluye la opción de recordar al usuario,
> facilitando el acceso recurrente sin necesidad de introducir las
> credenciales en cada inicio de sesión. El proceso se completa mediante
> un botón principal de acceso que envía la información al *backend* de
> forma segura para su validación.
>
> []{#_bookmark54 .anchor}Ilustración 19: Vista de la pantalla de inicio
> de sesión (paciente)

![](media/image20.png){width="2.54375in" height="4.49625in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

11. []{#_bookmark55 .anchor}Vista de inicio (App móvil)

> La vista de inicio de la aplicación móvil constituye la pantalla
> principal a la que accede el paciente tras autenticarse en el sistema.
> Su objetivo es servir como punto de partida para la interacción con la
> muleta inteligente y con el resto de funcionalidades de la aplicación.
>
> En la parte superior se muestra una barra de estado que simula el
> entorno del sistema operativo móvil, junto con un encabezado que
> identifica la sección actual mediante el título Inicio. Desde esta
> barra se ofrece también el acceso a la opción de cierre de sesión,
> permitiendo al usuario abandonar la aplicación de forma explícita.
>
> El contenido central de la vista está dominado por una ilustración
> representativa del paciente utilizando una muleta, reforzando
> visualmente el propósito de la aplicación y facilitando la
> identificación del usuario con el sistema. Esta ilustración actúa como
> elemento informativo y contextual, sin funcionalidad directa.
>
> En la parte inferior de la pantalla se dispone un botón principal de
> acción, conectar muleta, que permite iniciar el proceso de conexión
> con el dispositivo físico mediante tecnología inalámbrica. Este botón
> representa la funcionalidad principal de la vista y el primer paso
> para la recogida de datos de la sesión.

Una vez haya una muleta conectada se podrá proceder a la vista donde se
realice la sesión.

> []{#_bookmark56 .anchor}Ilustración 20: Vista de inicio

![](media/image21.png){width="2.087411417322835in"
height="4.068853893263342in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

12. []{#_bookmark57 .anchor}Vista para realizar sesión (App móvil)

> Esta vista representa la pantalla activa durante el desarrollo o
> finalización de una sesión de uso de la muleta inteligente. Su función
> principal es mostrar de forma visual y resumida el estado de la sesión
> actual, así como permitir al usuario finalizarla de manera explícita.
>
> En la parte superior se muestran dos indicadores resumidos: uno
> correspondiente al estado general del dispositivo o sesión y otro
> asociado a la actividad registrada, representada mediante iconografía
> simple y valores genéricos. Estos indicadores permiten al usuario
> obtener una visión rápida del progreso sin necesidad de interpretar
> datos complejos.
>
> La zona central de la vista está reservada para un gráfico circular,
> que actúa como elemento principal de representación visual. Este
> gráfico permite mostrar de forma intuitiva la distribución del peso o
> del esfuerzo realizado durante la sesión, facilitando la comprensión
> del estado físico del paciente sin requerir conocimientos técnicos.
>
> Debajo del gráfico se dispone una leyenda compuesta por tres
> indicadores diferenciados, que clasifican el estado del peso o carga
> en tres categorías: sobrepeso, peso correcto e infrapeso. Estos
> elementos sirven como referencia visual para interpretar el gráfico
> circular de manera inmediata.
>
> Finalmente, en la parte inferior de la pantalla se incluye un botón de
> acción Finalizar sesión, que permite al usuario cerrar la sesión
> activa y dar por concluida la recogida de datos. Este botón representa
> la acción principal de la vista y marca el final del proceso de la
> sesión.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark58 .anchor}Ilustración 21: Vista de realizar sesión

![](media/image22.png){width="2.1369794400699913in"
height="4.205207786526684in"}

13. []{#_bookmark59 .anchor}Vista de Bluetooth (App móvil)

> La vista de Bluetooth de la aplicación móvil permite al paciente
> gestionar la conexión inalámbrica entre la aplicación y la muleta
> inteligente, constituyendo el paso previo necesario para iniciar una
> sesión de uso y registro de datos. Su objetivo principal es facilitar
> la detección y selección de dispositivos disponibles de forma clara y
> accesible.
>
> En la parte superior de la pantalla se muestra una barra de estado que
> simula el entorno del sistema operativo móvil, junto con un encabezado
> que identifica la sección actual mediante el título Bluetooth. Desde
> esta barra se mantiene también el acceso a la opción de cierre de
> sesión, garantizando la coherencia con el resto de vistas principales
> de la aplicación.
>
> El contenido central de la vista presenta un elemento destacado que
> indica el estado de la funcionalidad Bluetooth, representado mediante
> un bloque informativo con el nombre de la tecnología. Este bloque
> actúa como referencia visual para el usuario, confirmando que se
> encuentra en el apartado de conexión inalámbrica.
>
> Debajo de este elemento se incluye la sección dispositivos
> disponibles, destinada a listar las muletas cercanas detectados
> mediante Bluetooth. Esta lista permite al usuario identificar y
> seleccionar el dispositivo con el que desea establecer la conexión,
> sirviendo como punto de interacción principal de la vista.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> Finalmente, en la parte inferior de la pantalla se mantiene la barra
> de navegación de la aplicación, que proporciona acceso rápido a las
> distintas secciones disponibles (inicio, Bluetooth, estadísticas, chat
> y perfil), asegurando una navegación fluida y consistente en toda la
> aplicación.
>
> []{#_bookmark60 .anchor}Ilustración 22: Vista de Bluetooth

![](media/image23.png){width="1.9657195975503061in"
height="3.872811679790026in"}

14. []{#_bookmark61 .anchor}Vista de estadísticas (App móvil)

> La vista de estadísticas de la aplicación móvil permite al paciente
> acceder de forma centralizada a los distintos módulos de análisis y
> seguimiento de su evolución durante el proceso de rehabilitación. Esta
> pantalla actúa como punto de acceso a las métricas registradas por la
> muleta inteligente, organizando la información en bloques claramente
> diferenciados.
>
> En la parte superior se muestra una barra de estado que simula el
> entorno del sistema operativo móvil, junto con un encabezado que
> identifica la sección mediante el título Estadísticas. Desde esta
> barra se incluye también el acceso a la opción de cierre de sesión,
> permitiendo al usuario salir de la aplicación cuando lo desee.
>
> El contenido principal de la vista está compuesto por tres bloques de
> navegación de gran tamaño, presentados de forma vertical. Cada bloque
> representa una categoría de información distinta: sesiones, pasos y
> avisos. Estos elementos actúan como accesos

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

de muletas.

Anexo II: Análisis y diseño del sistema

> directos a vistas específicas donde se detalla la información
> correspondiente a cada categoría.
>
> Adicionalmente, se incluye un texto informativo en la parte inferior
> que orienta al usuario sobre la finalidad de los apartados de sesiones
> y pasos, destacando la presencia de desafíos diseñados para fomentar
> la mejora progresiva del bienestar y la recuperación del paciente.
>
> En la parte inferior de la pantalla se mantiene una barra de
> navegación persistente que permite al usuario desplazarse entre las
> diferentes secciones principales de la aplicación, garantizando una
> experiencia de uso consistente y accesible.
>
> []{#_bookmark62 .anchor}Ilustración 23: Vista de estadísticas

![](media/image24.png){width="2.1968996062992128in"
height="4.334374453193351in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

15. []{#_bookmark63 .anchor}Vista de estadísticas de sesiones (App
    móvil)

> La vista de sesiones de la aplicación móvil permite al paciente
> consultar la información asociada a una sesión concreta de uso de la
> muleta inteligente. Esta pantalla está orientada a la visualización de
> métricas básicas y a la evolución del peso registrado durante la
> sesión seleccionada.
>
> En la parte superior de la vista se muestra un texto informativo que
> indica al usuario que puede pulsar sobre una sesión para acceder a sus
> estadísticas, junto con un encabezado que identifica la métrica
> principal visualizada, correspondiente al peso medio de la sesión.
> Asimismo, se presenta la fecha asociada a la sesión seleccionada,
> facilitando la contextualización temporal de los datos.
>
> La zona central de la pantalla está dedicada a la representación
> gráfica de la evolución del peso durante la sesión. Este gráfico
> incluye líneas de referencia que marcan límites superior e inferior,
> así como puntos intermedios que representan mediciones realizadas a lo
> largo del tiempo. La visualización permite al usuario identificar de
> forma intuitiva tendencias y variaciones durante la sesión.
>
> En la parte inferior de la vista se muestra un resumen textual con el
> valor medio total del peso registrado durante el día, proporcionando
> una visión global complementaria a la información detallada del
> gráfico.
>
> []{#_bookmark64 .anchor}Ilustración 24: Vista de sesiones

![](media/image25.png){width="2.3637226596675416in"
height="4.657603893263342in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

16. []{#_bookmark65 .anchor}Vista de consejos (App móvil)

> La vista de pasos de la aplicación móvil permite al paciente consultar
> de forma visual y sencilla el progreso diario de su actividad física
> registrada mediante la muleta inteligente. Su objetivo principal es
> mostrar el grado de cumplimiento de los objetivos diarios de pasos y
> reforzar la motivación del usuario durante el proceso de
> rehabilitación.
>
> En la parte superior de la pantalla se mantiene la barra de estado que
> simula el entorno del sistema operativo móvil, junto con un encabezado
> identificativo de la sección correspondiente. Esta estructura
> proporciona coherencia visual con el resto de vistas de la aplicación
> y facilita la navegación.
>
> El elemento central de la vista está compuesto por un indicador
> gráfico circular que representa el progreso de los pasos realizados
> respecto al objetivo diario establecido. Este componente actúa como
> representación visual del estado actual del usuario, permitiendo
> identificar de un solo vistazo si el objetivo diario ha sido alcanzado
> o se encuentra en proceso.
>
> Junto al indicador gráfico se muestra un bloque informativo que
> identifica la métrica representada, reforzando la comprensión del dato
> mostrado. Bajo este elemento se incluye una breve nota aclaratoria que
> indica que el valor mostrado corresponde al máximo diario de pasos
> configurado.
>
> En la parte inferior de la vista se presenta un apartado de desafíos,
> donde se informa de los objetivos mínimos diarios establecidos para el
> paciente. Este bloque tiene como finalidad incentivar la actividad
> continuada y proporcionar retroalimentación positiva sobre el
> cumplimiento de los retos definidos.
>
> []{#_bookmark66 .anchor}Ilustración 25: Vista de consejos

![](media/image26.png){width="2.092656386701662in" height="3.63375in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

17. []{#_bookmark67 .anchor}Vista de consejos (App móvil)

> La vista de avisos de la aplicación móvil tiene como finalidad
> informar al paciente sobre recomendaciones, advertencias o
> notificaciones relevantes relacionadas con su proceso de
> rehabilitación y el uso de la muleta inteligente. Esta pantalla actúa
> como un canal de comunicación preventiva, orientado a mejorar la
> seguridad y el seguimiento clínico del usuario.
>
> En la parte superior de la vista se mantiene la estructura común de la
> aplicación, con una barra de estado que simula el entorno del sistema
> operativo móvil y un encabezado que identifica la sección actual. Este
> diseño homogéneo facilita la orientación del usuario dentro de la
> aplicación.
>
> Bajo el encabezado se muestra un breve texto informativo que indica al
> usuario la posibilidad de interactuar con los avisos para obtener
> información adicional. Este mensaje cumple una función aclaratoria y
> mejora la usabilidad de la interfaz.
>
> El contenido principal de la vista está compuesto por una lista de
> tarjetas de aviso. Cada tarjeta representa una notificación individual
> y muestra de forma resumida el contenido del aviso, incluyendo un
> título destacado y una breve descripción asociada.
>
> []{#_bookmark68 .anchor}Ilustración 26: Vista de consejos

![](media/image27.jpeg){width="2.5310017497812773in"
height="4.411457786526684in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

18. []{#_bookmark69 .anchor}Vista de chat (App móvil)

> La vista de chat de la aplicación móvil permite la comunicación
> directa entre el paciente y el personal sanitario, facilitando el
> seguimiento del proceso de rehabilitación y la resolución de dudas de
> forma ágil y accesible.
>
> En la parte superior de la pantalla se presenta la barra de estado que
> simula el entorno del sistema operativo móvil, junto con un encabezado
> que identifica claramente la sección mediante el título chat. Desde
> esta zona se mantiene la coherencia visual con el resto de vistas de
> la aplicación y se ofrece el acceso a la opción de cierre de sesión.
>
> El área central de la vista está dedicada al historial de mensajes,
> organizado de forma cronológica. Los mensajes se agrupan visualmente
> por fechas, permitiendo al usuario identificar fácilmente las
> distintas jornadas de conversación.
>
> En la parte inferior de la pantalla se sitúa el campo de entrada de
> texto, acompañado de un botón de envío. Este elemento permite al
> usuario redactar y enviar nuevos mensajes.
>
> []{#_bookmark70 .anchor}Ilustración 27: Vista de chat

![](media/image28.png){width="2.473426290463692in"
height="4.873333333333333in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

19. []{#_bookmark71 .anchor}Vista de perfil (App móvil)

> La vista de perfil permite al paciente consultar la información
> personal asociada a su cuenta dentro de la aplicación "Load Crutches".
> Esta pantalla tiene como objetivo ofrecer una visión clara y
> centralizada de los datos identificativos del usuario, así como
> facilitar el acceso a opciones relacionadas con la seguridad de la
> cuenta.
>
> En la parte superior se muestra una barra de estado que simula el
> entorno del sistema operativo móvil, junto con un encabezado que
> identifica la sección actual mediante el título Personal. Desde esta
> barra se ofrece también el acceso a la opción de cierre de sesión,
> permitiendo al usuario abandonar la aplicación de forma explícita.
>
> El contenido principal de la vista se organiza en una tarjeta
> informativa que agrupa los datos personales del usuario, tales como
> nombre, apellidos, identificador de usuario y correo electrónico. Esta
> información se presenta de forma estructurada y legible, acompañada de
> una ilustración representativa del paciente utilizando muletas,
> reforzando el carácter sanitario y contextual de la aplicación.
>
> Debajo de la tarjeta informativa se incluye un breve texto descriptivo
> que permite añadir observaciones o notas asociadas al perfil del
> paciente. A continuación, se dispone un botón de acción cambiar
> contraseña, que proporciona acceso a las funcionalidades de gestión de
> credenciales y refuerza la seguridad de la cuenta.
>
> Finalmente, en la parte inferior de la pantalla se muestra un aviso
> informativo relativo al cumplimiento del Reglamento General de
> Protección de Datos (RGPD), garantizando al usuario la
> confidencialidad y seguridad de sus datos personales y de salud. La
> vista se completa con la barra de navegación inferior, que permite
> acceder al resto de secciones principales de la aplicación.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark72 .anchor}*Ilustración 28: Vista de perfil*

![](media/image29.png){width="1.9655675853018373in"
height="3.8621872265966752in"}

# Diseño procedimental

> En este apartado se abordarán los detalles de la funcionalidad de los
> subsistemas del proyecto a partir de los requisitos funcionales
> planteados.
>
> Por una parte, a través de la vista de interacción, se crearán los
> diagramas de secuencia, a partir de los casos de uso de manera que se
> refleje una visión a alto nivel y más genérica desde la parte de
> análisis de los pasos a seguir en cada funcionalidad intrínseca del
> sistema.
>
> Y por otra parte, a través de los diagramas de caso de uso-diseño, y a
> partir del diagrama de clases de diseño realizado, se desglosarán los
> casos de uso pertinentes como reflejo de la funcionalidad del sistema,
> pero desde un punto de vista más cercano a la implementación y menos
> genérico.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

## Diagramas de secuencia (Vista de interacción)

> []{#_bookmark75 .anchor}*Ilustración 29: Realización del diagrama de
> secuencia del caso de uso UC-0001: Iniciar sesión*

![](media/image30.png){width="4.887708880139982in"
height="4.0056244531933505in"}

> []{#_bookmark76 .anchor}Ilustración 30: Realización del diagrama de
> secuencia del caso de uso UC-0002: Cerrar sesión

![](media/image31.png){width="4.7529199475065615in"
height="3.2795833333333335in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark77 .anchor}Ilustración 31: Realización del diagrama de
> secuencia del caso de uso UC-0003: Registrar doctor

![](media/image32.png){width="5.201514654418197in"
height="3.9520833333333334in"}

> []{#_bookmark78 .anchor}Ilustración 32: Realización del diagrama de
> secuencia del caso de uso UC-0004: Registrar paciente

![](media/image33.png){width="5.086248906386702in"
height="4.154583333333333in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark79 .anchor}Ilustración 33: Realización del diagrama de
> secuencia del caso de uso UC-0005: Listar pacientes

![](media/image34.png){width="5.663748906386702in"
height="3.5554166666666664in"}

> []{#_bookmark80 .anchor}Ilustración 34: Realización del diagrama de
> secuencia del caso de uso UC-0006: Editar paciente

![](media/image35.png){width="5.11987532808399in" height="4.06875in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark81 .anchor}Ilustración 35: Realización del diagrama de
> secuencia del caso de uso UC-0007: Eliminar paciente

![](media/image36.png){width="5.384481627296588in"
height="4.205728346456693in"}

> []{#_bookmark82 .anchor}Ilustración 36: Realización del diagrama de
> secuencia del caso de uso UC-0008: Ver perfil personal

![](media/image37.png){width="5.273694225721785in"
height="3.4846872265966753in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark83 .anchor}Ilustración 37: Realización del diagrama de
> secuencia del caso de uso UC-0009: Cambiar contraseña

![](media/image38.png){width="4.714009186351706in"
height="4.433333333333334in"}

> []{#_bookmark84 .anchor}Ilustración 38: Realización del diagrama de
> secuencia del caso de uso UC-0010: Conectar muleta

![](media/image39.png){width="4.6932239720035in"
height="3.7087489063867016in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark85 .anchor}Ilustración 39: Realización del diagrama de
> secuencia del caso de uso UC-0011: Realizar sesión de rehabilitación

![](media/image40.png){width="5.1345833333333335in"
height="3.8733333333333335in"}

> []{#_bookmark86 .anchor}Ilustración 40: Realización del diagrama de
> secuencia del caso de uso UC-0012: Realizar sesión de rehabilitación

![](media/image41.png){width="5.621245625546806in"
height="4.164061679790026in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark87 .anchor}Ilustración 41: Realización del diagrama de
> secuencia del caso de uso UC-0013: Consultar progreso diario

![](media/image42.png){width="5.22885498687664in"
height="3.0544783464566927in"}

> []{#_bookmark88 .anchor}Ilustración 42: Realización del diagrama de
> secuencia del caso de uso UC-0014: Consultar historial de sesiones

![](media/image43.png){width="5.336573709536308in" height="3.925in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark89 .anchor}Ilustración 43: Realización del diagrama de
> secuencia del caso de uso UC-0015: Configurar límites y objetivos

![](media/image44.png){width="5.30698053368329in"
height="4.009478346456693in"}

> []{#_bookmark90 .anchor}Ilustración 44: Realización del diagrama de
> secuencia del caso de uso UC-0016: Crear lesión

![](media/image45.png){width="4.763023840769904in"
height="4.0808333333333335in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark91 .anchor}Ilustración 45: Realización del diagrama de
> secuencia del caso de uso UC-0017: Editar lesión

![](media/image46.png){width="4.346456692913386in"
height="4.0752077865266845in"}

> []{#_bookmark92 .anchor}Ilustración 46: Realización del diagrama de
> secuencia del caso de uso UC-0018: Eliminar lesión

![](media/image47.png){width="5.0959383202099735in"
height="3.929270559930009in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark93 .anchor}Ilustración 47: Realización del diagrama de
> secuencia del caso de uso UC-0019: Asignar lesión a paciente

![](media/image48.png){width="4.738567366579177in" height="4.225in"}

> []{#_bookmark94 .anchor}Ilustración 48: Realización del diagrama de
> secuencia del caso de uso UC-0020: Consultar catálogo de lesiones

![](media/image49.png){width="5.139115266841645in" height="3.3225in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark95 .anchor}Ilustración 49: Realización del diagrama de
> secuencia del caso de uso UC-0021: Intercambio de mensajes (chat)

![](media/image50.png){width="4.80937445319335in"
height="4.102811679790026in"}

> []{#_bookmark96 .anchor}Ilustración 50: Realización del diagrama de
> secuencia del caso de uso UC-0022: Crear consejo médico

![](media/image51.png){width="4.56604002624672in"
height="3.694166666666667in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark97 .anchor}*Ilustración 51: Realización del diagrama de
> secuencia del caso de uso UC-0023: Eliminar consejo médico*

![](media/image52.png){width="4.658729221347332in"
height="3.9522911198600177in"}

> []{#_bookmark98 .anchor}Ilustración 52: Realización del diagrama de
> secuencia del caso de uso UC-0024: Consultar consejos médicos
> (paciente)

![](media/image53.png){width="5.510495406824147in" height="3.835in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark99 .anchor}Ilustración 53: Realización del diagrama de
> secuencia del caso de uso UC-0025: Listar consejos (doctor)

![](media/image54.png){width="4.662501093613298in" height="3.13125in"}

## Diagramas de caso de uso-diseño

> Los diagramas de caso de uso--diseño tienen como objetivo representar,
> de forma detallada, la interacción entre los distintos componentes
> software del sistema para la realización de cada caso de uso definido
> en la fase de análisis. A diferencia de los diagramas de casos de uso
> tradicionales, centrados en la funcionalidad desde el punto de vista
> del usuario, estos diagramas profundizan en la arquitectura interna
> del sistema y en la responsabilidad de cada uno de sus elementos.
>
> En este tipo de diagramas se describen las comunicaciones que se
> producen entre la interfaz de usuario, el servidor, las rutas de
> acceso, los controladores y la base de datos, reflejando el flujo
> lógico de las peticiones y respuestas que permiten llevar a cabo la
> funcionalidad correspondiente. De este modo, se establece una clara
> trazabilidad entre los requisitos funcionales y su implementación
> técnica.
>
> Cada diagrama de caso de uso--diseño se corresponde con un caso de uso
> concreto y muestra de manera secuencial las acciones realizadas por
> los distintos componentes, así como las posibles alternativas en
> función de las condiciones del sistema, como la validación de datos o
> la gestión de errores. Esto facilita la comprensión del comportamiento
> interno del sistema y sirve como apoyo tanto para la fase de
> desarrollo como para el mantenimiento y evolución futura de la
> aplicación.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark101 .anchor}Ilustración 54: Representación del diagrama
> de caso de uso-diseño UC-0001- Iniciar sesión

![](media/image55.png){width="7.2453904199475065in" height="4.995in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

[]{#_bookmark102 .anchor}Ilustración 55: Representación del diagrama de
caso de uso-diseño UC-0002: Cerrar sesión

![](media/image56.png){width="6.868437226596676in"
height="4.911561679790026in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

[]{#_bookmark103 .anchor}Ilustración 56: Representación del diagrama de
caso de uso-diseño UC-0003: Registrar doctor

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image57.png){width="7.88375in" height="5.220416666666667in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark104 .anchor}Ilustración 57: Representación del diagrama
> de caso de uso-diseño UC-0004: Registrar paciente

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image58.png){width="7.267502187226596in" height="5.27625in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark105 .anchor}Ilustración 58: Representación del diagrama
> de caso de uso-diseño UC-0005: Listar pacientes

![](media/image59.png){width="9.24074365704287in"
height="4.942707786526684in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark106 .anchor}Ilustración 59: Representación del diagrama
> de caso de uso-diseño UC-0006: Editar paciente

![](media/image60.png){width="7.01875in" height="5.225in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark107 .anchor}Ilustración 60: Representación del diagrama
> de caso de uso-diseño UC-0007: Eliminar paciente

![](media/image61.png){width="7.4159361329833775in"
height="4.548124453193351in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark108 .anchor}Ilustración 61: Representación del diagrama
> de caso de uso-diseño UC-0008: Ver perfil personal

![](media/image62.png){width="8.756663385826771in"
height="4.696353893263342in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark109 .anchor}Ilustración 62: Representación del diagrama
> de caso de uso-diseño UC-0009: Cambiar contraseña

![](media/image63.png){width="6.907252843394575in"
height="5.007707786526685in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark110 .anchor}Ilustración 63: Representación del diagrama
> de caso de uso-diseño UC-0010: Conectar muleta

![](media/image64.png){width="5.195312773403325in"
height="4.910311679790026in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark111 .anchor}Ilustración 64: Representación del diagrama
> de caso de uso-diseño UC-0011: Realizar sesión de rehabilitación

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image65.png){width="6.76041447944007in"
height="5.254687226596675in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark112 .anchor}Ilustración 65: Representación del diagrama
> de caso de uso-diseño UC-0012: Finalizar y guardar sesión

![](media/image66.png){width="7.322287839020123in" height="4.84in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark113 .anchor}Ilustración 66: Representación del diagrama
> de caso de uso-diseño UC-0013: Consultar progreso diario

![](media/image67.png){width="7.400803805774278in"
height="5.049166666666666in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark114 .anchor}Ilustración 67: Representación del diagrama
> de caso de uso-diseño UC-0014: Consultar historial de sesiones

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image68.png){width="7.130937226596675in" height="5.32in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

[]{#_bookmark115 .anchor}Ilustración 68: Representación del diagrama de
caso de uso-diseño UC-0015: Configurar límites y objetivos

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image69.png){width="7.058336614173228in"
height="5.144998906386702in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

[]{#_bookmark116 .anchor}Ilustración 69: Representación del diagrama de
caso de uso-diseño UC-0016: Crear lesión

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image70.png){width="6.888148512685914in"
height="5.140520559930009in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

[]{#_bookmark117 .anchor}Ilustración 70: Representación del diagrama de
caso de uso-diseño UC-0017: Editar lesión

![](media/image71.png){width="6.756610892388451in"
height="5.056248906386702in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

[]{#_bookmark118 .anchor}Ilustración 71: Representación del diagrama de
caso de uso-diseño UC-0018: Eliminar lesión

![](media/image72.png){width="9.54953302712161in" height="4.8in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark119 .anchor}Ilustración 72: Representación del diagrama
> de caso de uso-diseño UC-0019: Asignar lesión a paciente

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image73.png){width="7.156286089238845in" height="5.15in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark120 .anchor}Ilustración 73: Representación del diagrama
> de caso de uso-diseño UC-0020: Consultar catálogo de lesiones

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image74.png){width="8.764942038495189in"
height="5.1379166666666665in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark121 .anchor}Ilustración 74: Representación del diagrama
> de caso de uso-diseño UC-0021: Intercambio de mensajes (chat)

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image75.png){width="9.002976815398075in"
height="5.203124453193351in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark122 .anchor}Ilustración 75: Representación del diagrama
> de caso de uso-diseño UC-0022: Crear consejo médico

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image76.png){width="5.938771872265967in"
height="5.106353893263342in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark123 .anchor}Ilustración 76: Representación del diagrama
> de caso de uso-diseño UC-0023: Eliminar consejo

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

![](media/image77.png){width="9.28578302712161in"
height="5.222083333333333in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark124 .anchor}Ilustración 77: Representación del diagrama
> de caso de uso-diseño UC-0024: Consultar consejos (paciente)

![](media/image78.png){width="8.757355643044619in" height="4.70375in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark125 .anchor}Ilustración 78: Representación del diagrama
> de caso de uso-diseño UC-0025: Listar consejos (doctor)

![](media/image79.png){width="9.544286964129483in"
height="4.535415573053369in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

# Referencia cruzada a los requisitos

> En este apartado se presenta la trazabilidad de forma matricial de las
> relaciones existentes entre los requisitos funcionales del sistema y
> los elementos que componen el modelo de análisis y diseño. El objetivo
> de esta matriz es mostrar de manera clara las referencias cruzadas y
> verificar que todos los requisitos funcionales han sido correctamente
> cubiertos durante las fases de análisis y diseño del sistema.
>
> En primer lugar, se expone el cruce entre los casos de uso definidos y
> las clases identificadas en el diagrama de clases de análisis. Tal y
> como se refleja en la matriz correspondiente, se observa que los
> requisitos relacionados con la autenticación y la gestión de usuarios
> recaen principalmente en las clases asociadas a usuario, doctor,
> paciente y credenciales. Por otro lado, los casos de uso vinculados a
> la rehabilitación y al seguimiento clínico se apoyan fundamentalmente
> en las clases sesión, paso, muleta y configuración, que constituyen el
> núcleo funcional de la plataforma.
>
> []{#_bookmark127 .anchor}Ilustración 79: Matriz de referencia cruzada
> entre los requisitos funcionales y las clases del diagrama de clases
> de análisis

![](media/image80.png){width="5.902188320209974in"
height="2.9803116797900264in"}

> En segundo lugar, se presenta el cruce entre los requisitos
> funcionales y los paquetes definidos en el modelo de diseño del
> sistema, tal y como se muestra en la ilustración correspondiente. Esta
> matriz permite obtener una visión más global y estructurada del grado
> de cobertura de los requisitos, complementando el nivel de detalle
> ofrecido por la matriz de clases.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> En el caso de "Load Crutches", el paquete *api_backend* asume un papel
> central en la implementación de la mayoría de los requisitos
> funcionales, actuando como nexo entre las interfaces cliente
> (aplicación web y aplicación móvil) y los mecanismos de acceso a datos
> y lógica de negocio. Asimismo, el paquete *client* concentra la
> interacción directa con el usuario, mientras que *data_access* se
> encarga de la persistencia y recuperación de la información clínica y
> de sesión. Por último, el paquete *bluetooth_module* da soporte a los
> requisitos relacionados con la comunicación en tiempo real con la
> muleta inteligente, constituyendo un elemento clave para la
> funcionalidad principal del sistema.
>
> []{#_bookmark128 .anchor}Ilustración 80: Matriz de referencia cruzada
> entre los requisitos funcionales y los paquetes de diseño

![](media/image81.png){width="3.782504374453193in"
height="4.010624453193351in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

# Plan de desarrollo e implementación

> En este apartado se describe el plan de desarrollo, implementación y
> despliegue del sistema Load Crutches, detallando la arquitectura
> adoptada y la organización de los distintos componentes que lo
> integran.
>
> El desarrollo de Load Crutches se ha basado en una arquitectura
> cliente-servidor, en la cual los clientes (aplicación web para el
> doctor y aplicación móvil para el paciente) interactúan con el
> servidor mediante llamadas al protocolo *HTTP*, consumiendo los
> servicios expuestos por la *API REST* del sistema. Esta arquitectura
> permite una clara separación de responsabilidades entre la capa de
> presentación, la lógica de negocio y el acceso a datos, facilitando el
> mantenimiento y la escalabilidad del sistema.

## Diagrama de despliegue

> El despliegue del sistema de "Load Crutches" se realiza sobre un
> servidor central con capacidad suficiente para albergar la
> arquitectura completa del proyecto y garantizar su disponibilidad
> continua. Esta máquina integra todos los subsistemas principales:
> backend, base de datos y servicios auxiliares. La decisión de utilizar
> un único servidor responde a criterios de simplicidad y reducción de
> costes de mantenimiento, aunque la arquitectura ha sido diseñada de
> forma modular para permitir, en un futuro, una distribución de los
> subsistemas en diferentes máquinas o contenedores, mejorando así la
> escalabilidad y la tolerancia a fallos.
>
> En cuanto a las especificaciones físicas, el servidor debería disponer
> de 4 GB de memoria RAM y 1 TB de almacenamiento en disco, recursos
> adecuados para el volumen de datos y la carga prevista del sistema. El
> despliegue se realiza sobre el sistema operativo Debian 10, elegido
> por su estabilidad, compatibilidad y amplio soporte para las
> tecnologías empleadas.
>
> El entorno de despliegue cuenta con scripts de instalación
> automatizada que facilitan la configuración del sistema y la
> instalación de sus dependencias principales, entre las que destacan:

- **Base de datos**: sistema gestor de base de datos relacional
  encargado del almacenamiento persistente de la información del
  sistema, incluyendo usuarios, pacientes, doctores, sesiones de
  rehabilitación, configuraciones clínicas, mensajes de chat y consejos
  médicos.

- **Aplicación Web**: desplegada sobre el mismo servidor, proporciona al
  doctor acceso al panel de gestión de pacientes, sesiones, lesiones y
  consejos médicos mediante un navegador web.

- **Aplicación Móvil**: aunque se ejecuta en el dispositivo del
  paciente, se comunica de forma segura con el *backend* desplegado en
  el servidor para la autenticación, sincronización de datos clínicos y
  almacenamiento del historial de sesiones.

- **Módulo de comunicación Bluetooth**: integrado en la aplicación
  móvil, permite la conexión en tiempo real con la muleta inteligente
  para la recepción de datos de carga y pasos durante las sesiones de
  rehabilitación.

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> Finalmente, en las siguientes ilustraciones se presenta una visión
> general del diagrama de despliegue del sistema, en el que se
> distinguen claramente los dos grandes bloques que componen la
> arquitectura de la solución: la parte servidor y las aplicaciones
> cliente.
>
> La parte servidor corresponde a la infraestructura donde se aloja el
> *backend*, responsable de la lógica de negocio, la gestión de
> usuarios, el procesamiento de las sesiones de rehabilitación, la
> comunicación en tiempo real y el acceso a la base de datos clínica.
> Este servidor central actúa como núcleo del sistema, coordinando la
> interacción entre los distintos módulos y garantizando la seguridad y
> persistencia de la información.
>
> Por su parte, la parte cliente está formada tanto por la aplicación
> web utilizada por los doctores, accesible a través de un navegador web
> estándar, como por la aplicación móvil utilizada por los pacientes,
> encargada de la comunicación con la muleta inteligente mediante
> Bluetooth y de la visualización de los datos de rehabilitación. Ambos
> clientes interactúan con el servidor a través de peticiones seguras a
> la *API REST* expuesto.
>
> Al tratarse de una arquitectura basada en cliente-servidor, el sistema
> puede ser accedido de forma remota desde cualquier dispositivo con
> conexión a Internet.
>
> []{#_bookmark131 .anchor}Ilustración 81: Definición diagrama de
> despliegue

![](media/image82.jpeg){width="5.871907261592301in"
height="1.7468744531933509in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso de muletas.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark132 .anchor}Ilustración 82: Definición del servidor en
> diagrama de despliegue

![](media/image83.jpeg){width="9.978765310586176in"
height="4.296874453193351in"}

111

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema
>
> []{#_bookmark133 .anchor}Ilustración 83: Definición del servidor de
> base de datos en diagrama de despliegue

![](media/image84.png){width="3.7198589238845146in" height="3.6025in"}

> []{#_bookmark134 .anchor}Ilustración 84: Definición del cliente web
> (doctor) en diagrama de despliegue

![](media/image85.png){width="5.7706058617672795in"
height="3.7624989063867016in"}

> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> []{#_bookmark135 .anchor}Ilustración 85: Definición de la app móvil
> (paciente) en diagrama de despliegue

![](media/image86.png){width="5.544307742782152in"
height="2.823332239720035in"}

> []{#_bookmark136 .anchor}Ilustración 86: Definición de la muleta
> inteligente en diagrama de despliegue

![](media/image87.png){width="2.8222867454068243in" height="4.9525in"}

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

# Glosario

> **Aplicación móvil**: Cliente software desarrollado para dispositivos
> móviles que permite al paciente interactuar con el sistema. A través
> de esta aplicación se realiza la conexión con la muleta inteligente,
> la ejecución de sesiones de rehabilitación y la consulta de
> estadísticas, consejos médicos y perfil personal.
>
> **Aplicación web**: Interfaz accesible mediante navegador web
> destinada al personal médico. Permite la gestión de pacientes,
> sesiones, lesiones, consejos médicos y la visualización del progreso
> clínico de los pacientes.
>
> ***API REST***: Interfaz de programación de aplicaciones basada en el
> protocolo *HTTP* que permite la comunicación entre los clientes (web y
> móvil) y el servidor backend. Expone los endpoints necesarios para la
> gestión de usuarios, sesiones, datos clínicos y comunicación en tiempo
> real.
>
> **Autenticación**: Mecanismo de autenticación utilizado en "Load
> Crutches" para validar la identidad de los usuarios. El servidor
> genera un token firmado que el cliente almacena y envía en cada
> petición protegida.
>
> ***Backend***: Componente servidor del sistema "Load Crutches"
> encargado de la lógica de negocio, la validación de datos, la gestión
> de usuarios y el acceso a la base de datos.
>
> **Bluetooth:** Tecnología de comunicación inalámbrica utilizada para
> establecer la conexión entre la muleta inteligente y la aplicación
> móvil del paciente, permitiendo la transmisión continua de datos de
> carga durante las sesiones de rehabilitación.
>
> **Consejo médico**: Recomendación personalizada creada por el doctor y
> asociada a un paciente y a una lesión concreta. Los consejos médicos
> se muestran en la aplicación móvil del paciente como parte del
> seguimiento clínico.
>
> **Lesión (Patología)**: Entidad clínica que representa una afección o
> patología tratada durante la rehabilitación. Las lesiones pueden ser
> asignadas a uno o varios pacientes y sirven de contexto para la
> configuración del tratamiento y los consejos médicos.
>
> **Muleta inteligente**: Dispositivo físico instrumentado con sensores
> de carga y capacidad de comunicación Bluetooth. Permite medir la
> fuerza ejercida por el paciente en cada paso y enviar estos datos a la
> aplicación móvil en tiempo real.
>
> **Sesión de rehabilitación**: Periodo de tiempo en el que el paciente
> utiliza la muleta inteligente para realizar ejercicios de marcha.
> Durante la sesión se registran métricas como número de pasos, carga
> soportada y duración.
>
> **Sesión diaria**: Agrupación lógica de todas las sesiones de
> rehabilitación (microsesiones) realizadas por un paciente en un mismo
> día, utilizada para mostrar estadísticas resumidas y evolución
> clínica.
>
> Load Crutches: Sistema de soporte en la recuperación de pacientes que
> requieren el uso de muletas. Load Crutches: support system for the
> recovery of patients who require the use of Crutches.

Anexo II: Análisis y diseño del sistema

> **Token**: Credencial digital generada por el servidor tras una
> autenticación correcta. Se utiliza para autorizar el acceso a recursos
> protegidos del sistema sin necesidad de mantener estado en el
> servidor.
>
> **Usuario**: Persona registrada en el sistema. Puede tener el rol de
> doctor o paciente, cada uno con permisos y funcionalidades
> diferenciadas.

Load Crutches: Sistema de soporte en la recuperación de pacientes que
requieren el uso

> de muletas. Anexo II: Análisis y diseño del sistema

# Bibliografía

1.  «Mockflow,» \[En línea\]. Available:
    https://mockflow.com/app/#Wireframe.

2.  M. Akin-Ogundeji, «MY VUE ON MVVM,» *Medium,* 2015.
