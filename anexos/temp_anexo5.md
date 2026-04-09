> **LOAD CRUTCHES: SISTEMA DE SOPORTE EN LA RECUPERACIÓN DE PACIENTES
> QUE REQUIEREN USO DE MULETAS**
>
> **-**

LOAD CRUTCHES: SUPPORT SYSTEM FOR THE RECOVERY OF PATIENTS WHO REQUIRE
THE USE OF CRUTCHES

> Anexo V: Manuales de usuario

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
> Contenido

[Índice de figuras 1](#índice-de-figuras)

[Índice de tablas 1](#índice-de-tablas)

1.  [Introducción 1](#introducción)

2.  [Esquema de acceso 3](#esquema-de-acceso)

3.  [Manual de la aplicación web (Doctor)
    7](#manual-de-la-aplicación-web-doctor)

    1.  [Iniciar sesión / Registro 7](#iniciar-sesión-registro)

    2.  [Página principal 9](#página-principal)

        1.  [Configuración 10](#_bookmark13)

[Cambio de idioma 11](#_bookmark15)

[Cambio de apariencia (modo claro / modo oscuro) 11](#_bookmark16)

[Cambio de contraseña 11](#_bookmark17)

2.  [Cerrar sesión 12](#_bookmark19)

<!-- -->

3.  [Gestión de pacientes 13](#gestión-de-pacientes)

    1.  [Añadir paciente 14](#_bookmark23)

[Email con credenciales del paciente 15](#_bookmark25)

2.  [Ficha del paciente 16](#_bookmark27)

3.  [Eliminar paciente 17](#_bookmark29)

4.  [Asignar límite de pesos 17](#_bookmark31)

5.  [Asignar límites de pasos 18](#_bookmark33)

6.  [Asignar lesión 19](#_bookmark35)

7.  [Editar peso del paciente 19](#_bookmark37)

8.  [Editar altura del paciente 20](#_bookmark39)

9.  [Editar descripción del paciente 21](#_bookmark41)

10. [Eliminar límites de peso 21](#_bookmark43)

11. [Eliminar límites de pasos 22](#_bookmark45)

12. [Eliminar lesión 23](#_bookmark47)

<!-- -->

4.  [Gestión de patologías 24](#gestión-de-patologías)

    1.  [Añadir patología 25](#_bookmark51)

    2.  [Editar patología 26](#_bookmark53)

    3.  [Eliminar patología 27](#_bookmark55)

5.  [Gestión de consejos 28](#gestión-de-consejos)

    1.  [Añadir consejo 29](#_bookmark59)

    2.  [Ver consejo 30](#_bookmark61)

    3.  [Eliminar consejo 31](#_bookmark63)

6.  [Gestión de chat 32](#gestión-de-chat)

7.  [Gestión de sesiones 34](#gestión-de-sesiones)

    1.  [Historial de sesiones de paciente 36](#_bookmark70)

    2.  [Detalles de la sesión 38](#_bookmark72)

<!-- -->

4.  [Manual de la aplicación móvil (Paciente)
    40](#manual-de-la-aplicación-móvil-paciente)

    1.  [Iniciar sesión 40](#iniciar-sesión)

    2.  [Inicio de sesión de rehabilitación
        42](#inicio-de-sesión-de-rehabilitación)

        1.  [Pantalla sesión de rehabilitación 43](#_bookmark79)

    3.  [Conexión bluetooth 45](#conexión-bluetooth)

    4.  [Estadísticas 46](#estadísticas)

        1.  [Estadísticas de pesos 47](#_bookmark86)

        2.  [Estadísticas de pasos 48](#_bookmark88)

        3.  [Avisos 49](#_bookmark90)

    5.  [Chat 50](#chat)

    6.  [Perfil 52](#perfil)

        1.  [Cambiar contraseña 53](#_bookmark96)

[Bibliografía 55](#bibliografía)

# Índice de figuras

> [Ilustración 1: Iniciar sesión 7](#_bookmark8)
>
> [Ilustración 2: Registro 8](#_bookmark9)
>
> [Ilustración 3: Dashboard 9](#_bookmark11)
>
> [Ilustración 4: Dashboard modo oscuro 9](#_bookmark12)
>
> [Ilustración 5: Configuración 10](#_bookmark14)
>
> [Ilustración 6: Cambiar contraseña 11](#_bookmark18)
>
> [Ilustración 7: Cerrar sesión 12](#_bookmark20)
>
> [Ilustración 8: Gestión de pacientes 13](#_bookmark22)
>
> [Ilustración 9: Añadir paciente 14](#_bookmark24)
>
> [Ilustración 10: Email con credenciales 15](#_bookmark26)
>
> [Ilustración 11: Ficha paciente 16](#_bookmark28)
>
> [Ilustración 12: Eliminar paciente 17](#_bookmark30)
>
> [Ilustración 13: Asignar límite de peso 17](#_bookmark32)
>
> [Ilustración 14: Asignar límite de pasos 18](#_bookmark34)
>
> [Ilustración 15: Asignar lesión 19](#_bookmark36)
>
> [Ilustración 16: Editar peso 19](#_bookmark38)
>
> [Ilustración 17: Editar altura 20](#_bookmark40)
>
> [Ilustración 18: Editar descripción 21](#_bookmark42)
>
> [Ilustración 19: Eliminar límites de peso 21](#_bookmark44)
>
> [Ilustración 20: Eliminar límites de pasos 22](#_bookmark46)
>
> [Ilustración 21: Eliminar lesión 23](#_bookmark48)
>
> [Ilustración 22: Gestión de patologías 24](#_bookmark50)
>
> [Ilustración 23: Añadir patología 25](#_bookmark52)
>
> [Ilustración 24: Editar patología 26](#_bookmark54)
>
> [Ilustración 25: Eliminar patología 27](#_bookmark56)
>
> [Ilustración 26: Gestión de consejos 28](#_bookmark58)
>
> [Ilustración 27: Añadir consejo 29](#_bookmark60)
>
> [Ilustración 28: Ver consejo 30](#_bookmark62)
>
> [Ilustración 29: Eliminar consejo 31](#_bookmark64)
>
> [Ilustración 30: Gestión de chat 32](#_bookmark66)
>
> [Ilustración 31: Chat paciente 32](#_bookmark67)
>
> [Ilustración 32: Gestión de sesiones 34](#_bookmark69)
>
> [Ilustración 33: Historial de sesiones de paciente 36](#_bookmark71)
>
> [Ilustración 34: Detalles de la sesión 38](#_bookmark73)
>
> [Ilustración 35: Inicio de sesión en varios dispositivos
> 40](#_bookmark76)
>
> [Ilustración 36: Pantalla de inicio 42](#_bookmark78)
>
> [Ilustración 37: pantalla sesión de rehabilitación 43](#_bookmark80)
>
> [Ilustración 38: Confirmación para finalizar sesión 44](#_bookmark81)
>
> [Ilustración 39: Pantalla de conexión bluetooth 45](#_bookmark83)
>
> [Ilustración 40: Pantalla de estadísticas 46](#_bookmark85)
>
> [Ilustración 41: Estadísticas de pesos 47](#_bookmark87)
>
> [Ilustración 42: Estadísticas de pasos 48](#_bookmark89)
>
> [Ilustración 43: Avisos 49](#_bookmark91)
>
> [Ilustración 44: Chat 50](#_bookmark93)
>
> [Ilustración 45: Perfil 52](#_bookmark95)
>
> [Ilustración 46: Cambiar contraseña 53](#_bookmark97)

# Índice de tablas

> [Tabla 1: Esquema de recursos accesibles desde el panel web del doctor
> 3](#_bookmark4)
>
> [Tabla 2: Esquema de recursos accesibles desde la aplicación móvil del
> paciente 4](#_bookmark5)

# Introducción

> En este anexo se describen los criterios de uso y los pasos necesarios
> para interactuar con la aplicación desarrollada Load Crutches, con el
> objetivo de servir como guía para usuarios ajenos al sistema. Este
> manual pretende facilitar la comprensión y el correcto uso de las
> funcionalidades disponibles, tanto para el personal sanitario como
> para los pacientes que participan en el proceso de rehabilitación.
>
> A lo largo de este anexo se detallará el acceso a las distintas
> aplicaciones que conforman el sistema (panel web del doctor y
> aplicación móvil del paciente), así como los recursos, vistas y
> operaciones disponibles en cada una de ellas. Asimismo, se
> especificarán las restricciones de uso asociadas a los distintos roles
> del sistema, garantizando una interacción segura y acorde a las
> responsabilidades de cada usuario.
>
> Finalmente, mediante el apoyo de ilustraciones y descripciones
> funcionales, se ofrecerá una visión global de las principales
> pantallas que conforman la aplicación, mostrando de forma clara las
> opciones disponibles y los flujos de uso habituales. De este modo,
> este anexo proporciona una referencia práctica para el uso correcto
> del sistema Load Crutches en un entorno real de rehabilitación
> clínica.

1

# Esquema de acceso

> En este apartado se presenta el esquema de acceso a las distintas
> vistas y pantallas disponibles dentro del sistema Load Crutches, junto
> con una breve descripción de cada una de ellas y los permisos
> necesarios para su utilización. Dado que la plataforma está compuesta
> por un panel web destinado a los doctores y una aplicación móvil
> orientada a los pacientes, el acceso a las funcionalidades se
> encuentra condicionado al rol del usuario autenticado.
>
> A continuación, en las siguientes tablas, se recogen los principales
> recursos accesibles desde el panel web del doctor y desde la
> aplicación móvil, con el objetivo de que el usuario disponga de una
> visión clara sobre las restricciones de acceso existentes y las
> funcionalidades disponibles en cada vista. Cabe destacar que, aunque
> se enumeran las rutas de acceso, la navegación por las aplicaciones se
> realiza de forma intuitiva mediante los elementos gráficos de la
> interfaz, como menús, botones y enlaces.
>
> []{#_bookmark4 .anchor}Tabla 1: Esquema de recursos accesibles desde
> el panel web del doctor

+--------------------------+--------------------------+------------------------+
| > **Ruta / Endpoint**    | **Descripción**          | **Restricción**        |
+==========================+==========================+========================+
| /loginDoctor             | Autenticación del doctor | Accesible sin          |
|                          | en el sistema.           | autenticación          |
+--------------------------+--------------------------+------------------------+
| /addDoctor               | Registro de un nuevo     | Accesible sin          |
|                          | doctor en el sistema.    | autenticación          |
+--------------------------+--------------------------+------------------------+
| /patientsByDoctor        | Obtención del listado de | Requiere autenticación |
|                          | pacientes asociados al   | (rol doctor)           |
|                          | doctor.                  |                        |
+--------------------------+--------------------------+------------------------+
| /addPatient              | Registro de un nuevo     | Requiere autenticación |
|                          | paciente por parte del   | (rol doctor)           |
|                          | doctor.                  |                        |
+--------------------------+--------------------------+------------------------+
| /updatePatientByDoctor   | Modificación de los      | Requiere autenticación |
|                          | datos clínicos y         | (rol doctor)           |
|                          | personales de un         |                        |
|                          | paciente.                |                        |
+--------------------------+--------------------------+------------------------+
| /deletePatientByDoctor   | Eliminación de un        | Requiere autenticación |
|                          | paciente asociado al     | (rol doctor)           |
|                          | doctor.                  |                        |
+--------------------------+--------------------------+------------------------+
| /addInjury               | Creación de un nuevo     | Requiere autenticación |
|                          | tipo de lesión en el     | (rol doctor)           |
|                          | sistema.                 |                        |
+--------------------------+--------------------------+------------------------+
| /updateInjury            | Edición de la            | Requiere autenticación |
|                          | información de una       | (rol doctor)           |
|                          | lesión existente.        |                        |
+--------------------------+--------------------------+------------------------+
| /deleteInjury            | Eliminación de una       | Requiere autenticación |
|                          | lesión del sistema.      | (rol doctor)           |
+--------------------------+--------------------------+------------------------+
| /addInjuryToPatient      | Asociación de una lesión | Requiere autenticación |
|                          | concreta a un paciente.  | (rol doctor)           |
+--------------------------+--------------------------+------------------------+
| /removeInjuryFromPatient | Eliminación de una       | Requiere autenticación |
|                          | lesión asignada a un     | (rol doctor)           |
|                          | paciente.                |                        |
+--------------------------+--------------------------+------------------------+
| /getInjuriesByPatient    | Consulta de las lesiones | Requiere autenticación |
|                          | asociadas a un paciente. | (rol doctor)           |
+--------------------------+--------------------------+------------------------+
| /addLimits               | Definición de límites de | Requiere autenticación |
|                          | carga permitidos para un | (rol doctor)           |
|                          | paciente.                |                        |
+--------------------------+--------------------------+------------------------+
| /deletelimits            | Eliminación de los       | Requiere autenticación |
|                          | límites de carga         | (rol doctor)           |
|                          | establecidos.            |                        |
+--------------------------+--------------------------+------------------------+

3

  --------------------------------------------------------------------------------
  /getLimitsDoctor            Consulta de los límites de  Requiere autenticación
                              carga de un paciente.       (rol doctor)
  --------------------------- --------------------------- ------------------------
  /addDailySteps              Registro de límites y       Requiere autenticación
                              valores diarios de pasos.   (rol doctor)

  /getStepsDoctor             Consulta del historial de   Requiere autenticación
                              pasos de un paciente.       (rol doctor)

  /AddAdvice                  Creación de recomendaciones Requiere autenticación
                              clínicas para un paciente.  (rol doctor)

  /deleteAdvice               Eliminación de una          Requiere autenticación
                              recomendación médica.       (rol doctor)

  /getAdvicesDoctor           Consulta de recomendaciones Requiere autenticación
                              asociadas a un paciente.    (rol doctor)

  /getPatientsWithAdvices     Listado de pacientes con    Requiere autenticación
                              recomendaciones activas.    (rol doctor)

  /getHistoricSessionDoctor   Consulta del histórico de   Requiere autenticación
                              sesiones de un paciente.    (rol doctor)

  /getSessionsDoctorByDate    Consulta de sesiones por    Requiere autenticación
                              fecha concreta.             (rol doctor)

  /getAllHistorySessions      Consulta global del         Requiere autenticación
                              histórico de sesiones.      (rol doctor)

  /changeDoctorPassword       Cambio de contraseña del    Requiere autenticación
                              doctor.                     (rol doctor)

  /loginDoctor                Autenticación del doctor en Accesible sin
                              el sistema.                 autenticación
  --------------------------------------------------------------------------------

> []{#_bookmark5 .anchor}Tabla 2: Esquema de recursos accesibles desde
> la aplicación móvil del paciente

+-----------------------------+--------------------------+-----------------------+
| > **Ruta / Vista**          | **Descripción**          | **Restricción**       |
+=============================+==========================+=======================+
| /loginPatient               | Autenticación del        | > Accesible sin       |
|                             | paciente en la           | > autenticación       |
|                             | aplicación móvil.        |                       |
+-----------------------------+--------------------------+-----------------------+
| /getUserInformation         | Consulta de los datos    | > Requiere            |
|                             | personales del paciente. | > autenticación (rol  |
|                             |                          | > paciente)           |
+-----------------------------+--------------------------+-----------------------+
| /changepassword             | Cambio de contraseña del | > Requiere            |
|                             | paciente.                | > autenticación (rol  |
|                             |                          | > paciente)           |
+-----------------------------+--------------------------+-----------------------+
| /getLimitsPatient           | Consulta de los límites  | > Requiere            |
|                             | de carga asignados.      | > autenticación (rol  |
|                             |                          | > paciente)           |
+-----------------------------+--------------------------+-----------------------+
| /getStepsPatient            | Consulta del número de   | > Requiere            |
|                             | pasos diarios            | > autenticación (rol  |
|                             | registrados.             | > paciente)           |
+-----------------------------+--------------------------+-----------------------+
| /addSession                 | Envío de una sesión de   | > Requiere            |
|                             | uso de la                | > autenticación (rol  |
|                             |                          | > paciente)           |
|                             | muleta (peso medio,      |                       |
|                             | pasos, timestamp).       |                       |
+-----------------------------+--------------------------+-----------------------+
| /getTodaySessionPatient     | Consulta del resumen de  | > Requiere            |
|                             | la sesión del día        | > autenticación (rol  |
|                             | actual.                  | > paciente)           |
+-----------------------------+--------------------------+-----------------------+
| /getTodayAllSessionsPatient | Consulta detallada de    | > Requiere            |
|                             | todas las sesiones del   | > autenticación (rol  |
|                             | día.                     | > paciente)           |
+-----------------------------+--------------------------+-----------------------+
| /getDataInjuryPatient       | Consulta de los datos    | > Requiere            |
|                             | clínicos asociados a una | > autenticación (rol  |
|                             | lesión.                  | > paciente)           |
+-----------------------------+--------------------------+-----------------------+

> 4

+---------------------+--------------------------+-----------------------+
| /getAdvicesPatient  | Consulta de las          | > Requiere            |
|                     | recomendaciones médicas  | > autenticación (rol  |
|                     | recibidas.               | > paciente)           |
+=====================+==========================+=======================+
| /sendMessagePatient | Envío de mensajes al     | > Requiere            |
|                     | doctor mediante el chat. | > autenticación (rol  |
|                     |                          | > paciente)           |
+---------------------+--------------------------+-----------------------+

5

# Manual de la aplicación web (Doctor)

> En este apartado se detallará una guía básica de representación de la
> plataforma web y su uso mediante una serie de imágenes y pasos que se
> irán explicando a lo largo de la sección. A continuación, se irán
> explicando el contenido y los pasos a seguir dentro de cada vista.

## Iniciar sesión / Registro

> []{#_bookmark8 .anchor}Ilustración 1: Iniciar sesión

![](media/image2.jpeg){width="6.0in" height="3.025in"}

> La página de inicio de sesión permite el acceso al panel web de Load
> Crutches para los usuarios con rol de doctor. En esta vista, el
> profesional sanitario debe introducir sus credenciales para
> autenticarse en el sistema.
>
> El formulario de autenticación está compuesto por los siguientes
> elementos:

- **Usuario**: nombre de usuario del doctor registrado en la plataforma.

- **Contraseña**: contraseña asociada a la cuenta, mostrada de forma
  protegida.

- **Recordar contraseña**: opción que permite mantener la sesión activa
  en el navegador.

> Tras introducir las credenciales, el usuario debe pulsar el botón
> "Iniciar sesión". Si los datos son correctos, el sistema redirige al
> doctor a su panel principal. En caso contrario, se muestra un mensaje
> de error indicando que la autenticación no ha sido válida.
>
> Desde esta vista también se ofrece un enlace a la página de registro
> de doctor para aquellos profesionales que aún no dispongan de una
> cuenta.

7

> []{#_bookmark9 .anchor}Ilustración 2: Registro

![](media/image3.jpeg){width="5.072512029746282in"
height="3.556457786526684in"}

> La página de registro de doctor permite la creación de nuevas cuentas
> para profesionales sanitarios que deseen utilizar el sistema Load
> Crutches. El acceso a esta funcionalidad está restringido mediante un
> código de validación.
>
> El formulario de registro solicita la siguiente información:

- **Usuario**: nombre de usuario que identificará al doctor dentro del
  sistema y que se utilizará para el inicio de sesión.

- **Contraseña**: contraseña de acceso a la plataforma, que debe cumplir
  los requisitos mínimos de seguridad establecidos.

- **Repetir contraseña**: campo de confirmación que permite verificar
  que la contraseña ha sido introducida correctamente.

- **Nombre**: nombre del profesional sanitario.

- **Apellidos**: apellidos del profesional sanitario.

- **Email**: dirección de correo electrónico asociada a la cuenta del
  doctor.

- **Código de doctor**: código de validación que restringe el registro a
  profesionales autorizados.

> Una vez completados los campos, el usuario debe pulsar el botón
> "Registrar" para enviar los datos. El sistema valida la información
> introducida y, si es correcta, crea la cuenta del doctor. En caso de
> error, se muestran mensajes informativos indicando los campos que
> deben corregirse.
>
> La vista incluye un enlace "Volver al login" que permite regresar a la
> página de inicio de sesión.
>
> 8

## Página principal

![](media/image4.jpeg){width="5.905555555555556in"
height="3.1958333333333333in"}[]{#_bookmark11 .anchor}Ilustración 3:
Dashboard

[]{#_bookmark12 .anchor}Ilustración 4: Dashboard modo oscuro

> ![](media/image5.jpeg){width="5.954061679790026in"
> height="3.2220833333333334in"}

9

> La página principal del panel web de Load Crutches proporciona una
> visión general del estado clínico y de la actividad reciente de los
> pacientes asociados al doctor tras iniciar sesión.
>
> Desde esta vista, el usuario dispone de un menú lateral de navegación
> que permite acceder a las distintas secciones del sistema: inicio,
> pacientes, patologías, consejos, chat, sesiones, configuración y
> cierre de sesión.
>
> En la zona central del *dashboard* se muestran distintos paneles
> informativos:

- **Total de pacientes**: número de pacientes asignados al doctor.

- **Total de patologías**: número de patologías registradas en el
  sistema.

- **Pacientes por género**: gráfico circular con la distribución de
  pacientes según su género.

- **Pacientes por patología**: listado de patologías con el número de
  pacientes asociados.

- **Pacientes activos en los últimos 7 días**: gráfico que representa la
  actividad reciente de los pacientes.

- **Mensajes no leídos**: panel que muestra las conversaciones
  pendientes de lectura.

> Esta página permite al doctor obtener rápidamente una visión global de
> su actividad clínica sin necesidad de acceder a cada módulo de forma
> individual.

1.  []{#_bookmark13 .anchor}Configuración

> []{#_bookmark14 .anchor}Ilustración 5: Configuración

![](media/image6.jpeg){width="5.954061679790026in"
height="3.2220833333333334in"}

> La página de configuración permite al doctor personalizar distintos
> aspectos del sistema relacionados con el idioma, la apariencia y la
> seguridad de la cuenta. El acceso a esta vista se realiza desde el
> menú lateral del panel web.
>
> 10
>
> []{#_bookmark15 .anchor}Cambio de idioma
>
> El sistema permite seleccionar el idioma de la interfaz mediante un
> desplegable. Una vez seleccionado el idioma deseado, el cambio se
> aplica al conjunto de la aplicación al guardar la configuración.
>
> []{#_bookmark16 .anchor}Cambio de apariencia (modo claro / modo
> oscuro)
>
> En el apartado de apariencia, el usuario puede seleccionar el tema
> visual de la aplicación:

- **Modo claro**

- **Modo oscuro**

> Este ajuste modifica el aspecto visual del panel web para adaptarse a
> las preferencias del usuario y mejorar la comodidad de uso.
>
> []{#_bookmark17 .anchor}Cambio de contraseña
>
> []{#_bookmark18 .anchor}Ilustración 6: Cambiar contraseña

![](media/image7.jpeg){width="5.9587237532808395in"
height="3.2220833333333334in"}

> Desde el apartado de seguridad, el usuario puede acceder a la opción
> "Cambiar contraseña", que abre un formulario emergente con los
> siguientes campos:

- **Contraseña actual**

- **Nueva contraseña**

11

- **Confirmar nueva contraseña**

> Para completar el proceso, el usuario debe introducir correctamente la
> contraseña actual y confirmar la nueva. Si los datos son válidos, el
> sistema actualiza la contraseña de la cuenta. En caso contrario, se
> muestran mensajes de error informativos.

1.  []{#_bookmark19 .anchor}Cerrar sesión

> []{#_bookmark20 .anchor}Ilustración 7: Cerrar sesión

![](media/image8.jpeg){width="5.835416666666666in"
height="3.157811679790026in"}

> La opción de cerrar sesión permite finalizar de forma segura la sesión
> activa del doctor en el sistema. Al seleccionar esta opción desde el
> menú lateral, se muestra un cuadro de confirmación solicitando la
> validación de la acción.
>
> El usuario puede cancelar la operación o confirmar el cierre de
> sesión. En caso de confirmación, el sistema finaliza la sesión y
> redirige al usuario a la página de inicio de sesión.
>
> 12

## Gestión de pacientes

> []{#_bookmark22 .anchor}Ilustración 8: Gestión de pacientes

![](media/image9.jpeg){width="5.956891951006124in"
height="3.002082239720035in"}

> La sección de Pacientes permite al doctor visualizar y gestionar los
> pacientes registrados en el sistema Load Crutches. El acceso a esta
> vista se realiza desde el menú lateral del panel web.
>
> En esta página se muestra un listado de pacientes en formato de
> tarjetas, donde cada tarjeta incluye el nombre completo del paciente y
> su documento identificativo (DNI).
>
> La vista incorpora las siguientes funcionalidades:

- **Búsqueda de pacientes**: campo de búsqueda que permite localizar
  pacientes introduciendo su nombre o DNI.

- **Ordenación**: opción para ordenar el listado de pacientes según
  distintos criterios, como el nombre en orden alfabético.

- **Paginación**: controles que permiten navegar entre distintas páginas
  cuando el número de pacientes es elevado.

- **Añadir paciente**: botón que permite acceder al formulario de alta
  de un nuevo paciente.

> Esta vista facilita al doctor una gestión rápida y estructurada de los
> pacientes asociados a su cuenta.

13

1.  []{#_bookmark23 .anchor}Añadir paciente

> []{#_bookmark24 .anchor}Ilustración 9: Añadir paciente

![](media/image10.jpeg){width="5.955146544181977in"
height="3.002082239720035in"}

> La opción "Añadir paciente" permite al doctor registrar un nuevo
> paciente en el sistema. Al seleccionar esta opción, se muestra un
> formulario emergente para introducir los datos clínicos y personales
> del paciente.
>
> El formulario de alta solicita la siguiente información:

- **Nombre**

- **Apellidos**

- **DNI**

- **Fecha de nacimiento**

- **Email**

- **Género:** 0 hombre, 1 mujer, 2 otro

- **Peso (kg)**

- **Altura (cm)**

- **Descripción**: campo opcional para añadir información clínica
  relevante.

> Una vez completados los campos obligatorios, el doctor debe pulsar el
> botón "Añadir paciente". El sistema valida los datos introducidos y,
> si son correctos, registra al paciente y lo asocia al doctor
> correspondiente.
>
> En caso de error, se muestran mensajes informativos indicando los
> campos que deben corregirse. El formulario puede cerrarse sin guardar
> los datos mediante el botón "Cancelar".
>
> 14
>
> []{#_bookmark25 .anchor}Email con credenciales del paciente
>
> []{#_bookmark26 .anchor}Ilustración 10: Email con credenciales

![](media/image11.jpeg){width="5.865384951881015in"
height="3.0216666666666665in"}

> Cuando un doctor da de alta a un nuevo paciente desde el panel web, el
> sistema envía automáticamente un correo electrónico al paciente con
> sus credenciales de acceso a la plataforma.
>
> Este correo incluye:

- **Usuario**: identificador del paciente (DNI).

- **Contraseña temporal**: generada automáticamente por el sistema.

> El mensaje informa al paciente de que su cuenta ha sido creada
> correctamente y le indica que debe cambiar la contraseña al iniciar
> sesión por primera vez para garantizar la seguridad de la cuenta.
>
> Este mecanismo permite una incorporación sencilla y segura de los
> pacientes al sistema Load Crutches, asegurando el acceso controlado a
> la plataforma.

15

2.  []{#_bookmark27 .anchor}Ficha del paciente

> []{#_bookmark28 .anchor}Ilustración 11: Ficha paciente

![](media/image12.jpeg){width="5.517515310586177in"
height="4.972916666666666in"}

> La ficha del paciente permite al doctor consultar y gestionar de forma
> detallada la información clínica y personal de un paciente concreto.
> Se accede a esta vista seleccionando al paciente desde el listado
> general de pacientes.
>
> En la parte superior de la ficha se muestran los datos identificativos
> del paciente, incluyendo:

- **Género**

- **DNI**

- **Fecha de nacimiento**

- **Correo electrónico**

- **Peso**

- **Altura**

- **Descripción clínica**

> Algunos campos, como el peso, la altura y la descripción, pueden ser
> editados directamente mediante los controles disponibles en la
> interfaz.
>
> 16

3.  []{#_bookmark29 .anchor}Eliminar paciente

> []{#_bookmark30 .anchor}Ilustración 12: Eliminar paciente

![](media/image13.jpeg){width="5.782402668416448in" height="2.915in"}

> La ficha del paciente incluye la opción "Eliminar", que permite borrar
> de forma permanente al paciente del sistema.
>
> Al seleccionar esta opción, el sistema muestra un cuadro de
> confirmación indicando que la acción no se puede deshacer. El doctor
> puede cancelar la operación o confirmar la eliminación. En caso de
> confirmación, el paciente y toda su información asociada son
> eliminados del sistema.

4.  []{#_bookmark31 .anchor}Asignar límite de pesos

> []{#_bookmark32 .anchor}Ilustración 13: Asignar límite de peso

![](media/image14.jpeg){width="5.9005971128608925in"
height="2.9745833333333334in"}

17

> La opción "Asignar límite de peso" permite establecer los rangos de
> carga permitidos para un paciente durante su proceso de recuperación.
> Esta funcionalidad se gestiona mediante un formulario emergente.
>
> El formulario solicita los siguientes valores:

- **Límite mínimo de peso (kg)**: peso mínimo que el paciente puede
  soportar.

- **Límite máximo de peso (kg)**: peso máximo permitido.

> Una vez definidos los límites, el doctor debe pulsar el botón "Asignar
> límite de peso". El sistema guarda los valores y los muestra en la
> ficha del paciente para su seguimiento.

5.  []{#_bookmark33 .anchor}Asignar límites de pasos

> []{#_bookmark34 .anchor}Ilustración 14: Asignar límite de pasos

![](media/image15.jpeg){width="5.956466535433071in"
height="3.002082239720035in"}

> La opción "Asignar pasos" permite al doctor definir los objetivos de
> actividad física diaria para un paciente concreto. Al seleccionar esta
> opción desde la ficha del paciente, se muestra un formulario
> emergente.
>
> El formulario incluye los siguientes campos:

- **Pasos diarios**: número de pasos recomendados que el paciente debe
  realizar diariamente.

- **Límite diario de pasos**: número máximo de pasos permitidos al día.

> Una vez introducidos los valores, el doctor debe pulsar el botón
> "Asignar pasos diarios". El sistema valida los datos y, si son
> correctos, actualiza los parámetros de actividad del paciente.
>
> 18

6.  []{#_bookmark35 .anchor}Asignar lesión

> []{#_bookmark36 .anchor}Ilustración 15: Asignar lesión

![](media/image16.jpeg){width="5.95597987751531in"
height="3.002082239720035in"}

> La opción "Asignar lesiones" permite asociar una patología o lesión
> existente a un paciente. Al acceder a esta funcionalidad, se muestra
> un formulario emergente de asignación.
>
> El formulario contiene los siguientes campos:

- **Seleccionar lesión**: lista desplegable con las patologías
  disponibles en el sistema.

- **Comentario**: campo de texto para añadir información clínica
  adicional relacionada con la lesión asignada.

> Tras completar el formulario, el doctor debe pulsar el botón "Asignar
> lesión". La lesión queda asociada al paciente y pasa a mostrarse en el
> apartado de patologías de su ficha.

7.  []{#_bookmark37 .anchor}Editar peso del paciente

> []{#_bookmark38 .anchor}Ilustración 16: Editar peso

![](media/image17.png){width="5.042321741032371in"
height="1.5830205599300087in"}

19

> Desde la ficha del paciente, el doctor puede modificar el peso del
> paciente mediante la opción de edición correspondiente.
>
> Al seleccionar esta opción, se muestra un formulario con:

- **Peso**: campo numérico en el que se introduce el nuevo valor de peso
  del paciente en kilogramos.

> Para confirmar el cambio, el doctor debe pulsar el botón "Guardar". Si
> se desea descartar la modificación, puede utilizarse el botón
> "Cancelar". Una vez guardado, el nuevo peso se actualiza en la ficha
> del paciente.

8.  []{#_bookmark39 .anchor}Editar altura del paciente

> []{#_bookmark40 .anchor}Ilustración 17: Editar altura

![](media/image18.png){width="5.597949475065617in"
height="1.7569783464566928in"}

> La ficha del paciente permite editar la altura del paciente de forma
> directa. Al acceder a la edición, se muestra un formulario con:

- **Altura**: campo numérico donde se introduce la altura del paciente
  en centímetros.

> El cambio se aplica pulsando el botón "Guardar". El botón "Cancelar"
> permite cerrar el formulario sin aplicar modificaciones.
>
> 20

9.  []{#_bookmark41 .anchor}Editar descripción del paciente

> []{#_bookmark42 .anchor}Ilustración 18: Editar descripción

![](media/image19.png){width="4.599403980752406in"
height="2.109582239720035in"}

> El doctor puede actualizar la descripción clínica del paciente para
> reflejar información relevante sobre su estado o evolución.
>
> Al seleccionar la opción de edición, se muestra un campo de texto con:

- **Descripción**: área de texto libre para introducir o modificar la
  información clínica del paciente.

> Tras realizar los cambios, el doctor debe pulsar "Guardar" para
> actualizar la información. Si no se desea aplicar la modificación,
> puede seleccionarse "Cancelar".

10. []{#_bookmark43 .anchor}Eliminar límites de peso

> []{#_bookmark44 .anchor}Ilustración 19: Eliminar límites de peso

![](media/image20.jpeg){width="5.855341207349081in"
height="2.951770559930009in"}

21

> Desde la ficha del paciente, el doctor puede eliminar una lesión
> previamente asignada. Al seleccionar la opción de eliminación, el
> sistema muestra un cuadro de confirmación.
>
> El mensaje informa de que la eliminación de la lesión es una acción
> irreversible. El doctor puede:

- **Cancelar** la acción y mantener la lesión asociada.

- **Confirmar la eliminación**, lo que elimina la lesión de la ficha del
  paciente.

> Una vez confirmada, la lesión deja de aparecer en el apartado de
> patologías del paciente.

11. []{#_bookmark45 .anchor}Eliminar límites de pasos

> []{#_bookmark46 .anchor}Ilustración 20: Eliminar límites de pasos

![](media/image21.jpeg){width="5.957964785651794in"
height="3.002082239720035in"}

> La ficha del paciente permite eliminar la configuración de pasos
> diarios asignada previamente.
>
> Al seleccionar la opción de eliminación, el sistema muestra un mensaje
> de confirmación, indicando que la acción no se puede deshacer. Si el
> doctor confirma la eliminación, los valores de pasos diarios y límite
> diario dejan de estar asociados al paciente.
>
> 22

12. []{#_bookmark47 .anchor}Eliminar lesión

> []{#_bookmark48 .anchor}Ilustración 21: Eliminar lesión

![](media/image22.jpeg){width="5.955146544181977in"
height="3.002082239720035in"}

> Desde la ficha del paciente, el doctor puede eliminar una lesión
> previamente asignada. Al seleccionar la opción de eliminación, el
> sistema muestra un cuadro de confirmación.
>
> El mensaje informa de que la eliminación de la lesión es una acción
> irreversible. El doctor puede:

- **Cancelar** la acción y mantener la lesión asociada.

- **Confirmar la eliminación**, lo que elimina la lesión de la ficha del
  paciente.

> Una vez confirmada, la lesión deja de aparecer en el apartado de
> patologías del paciente.

23

## Gestión de patologías

> []{#_bookmark50 .anchor}Ilustración 22: Gestión de patologías

![](media/image23.jpeg){width="5.955146544181977in"
height="3.002082239720035in"}

> La sección Gestión de Patologías permite al profesional sanitario
> administrar las patologías disponibles en el sistema, que
> posteriormente podrán asignarse a los pacientes.
>
> Desde esta vista es posible crear, editar, eliminar y consultar
> patologías.
>
> La pantalla principal muestra un listado de tarjetas, cada una
> correspondiente a una patología registrada en el sistema.
>
> Funciones disponibles:

- **Buscar patología** mediante el campo de búsqueda.

- **Ordenar** las patologías por nombre.

- **Navegar entre páginas** si existen múltiples registros.

- **Editar** o **eliminar** una patología existente.

- **Crear una nueva patología** mediante el botón "Nueva Patología".

> 24

1.  []{#_bookmark51 .anchor}Añadir patología

> []{#_bookmark52 .anchor}Ilustración 23: Añadir patología

![](media/image24.jpeg){width="5.482706692913386in" height="2.76375in"}

> Al pulsar el botón "Nueva Patología" se abre un formulario modal para
> registrar una nueva patología.
>
> Campos del formulario:

- **Nombre de la patología**: nombre identificativo de la lesión o
  intervención.

- **Descripción**: información adicional o explicación clínica.

> Acciones disponibles:

- **Guardar**: crea la patología y la añade al listado.

- **Cancelar**: cierra el formulario sin guardar cambios.

25

2.  []{#_bookmark53 .anchor}Editar patología

> []{#_bookmark54 .anchor}Ilustración 24: Editar patología

![](media/image25.jpeg){width="5.7692968066491686in"
height="2.9069783464566927in"}

> El botón "Editar" abre un formulario modal con los datos actuales de
> la patología seleccionada.
>
> Desde este formulario se puede:

- **Modificar el nombre de la patología.**

- **Actualizar la descripción.**

> Acciones disponibles:

- **Guardar**: aplica los cambios realizados.

- **Cancelar**: descarta los cambios y cierra el formulario.

> 26

3.  []{#_bookmark55 .anchor}Eliminar patología

> []{#_bookmark56 .anchor}Ilustración 25: Eliminar patología

![](media/image26.jpeg){width="5.95597987751531in"
height="3.002082239720035in"}

> Al pulsar el botón "Eliminar", el sistema muestra un cuadro de
> confirmación para evitar eliminaciones accidentales.
>
> El mensaje advierte que:

- **La acción no se puede deshacer.**

> Opciones disponibles:

- **Cancelar**: cierra el aviso sin eliminar la patología.

- **Eliminar**: borra definitivamente la patología del sistema.

27

## Gestión de consejos

> []{#_bookmark58 .anchor}Ilustración 26: Gestión de consejos

![](media/image27.jpeg){width="5.956891951006124in"
height="3.002082239720035in"}

> La sección Gestión de Consejos permite al profesional sanitario
> administrar los consejos médicos disponibles en el sistema, que
> posteriormente podrán asignarse a los pacientes según su patología.
>
> Desde esta vista es posible crear, consultar y eliminar consejos
> asociados a pacientes.
>
> La pantalla principal muestra un listado de tarjetas, cada una
> correspondiente a un paciente con uno o más consejos registrados en el
> sistema.
>
> Funciones disponibles:

- **Buscar pacientes mediante el campo de búsqueda.**

- **Ordenar los registros por nombre.**

- **Navegar entre páginas si existen múltiples registros.**

- **Consultar los consejos asignados a un paciente.**

- **Eliminar un consejo existente.**

- **Crear un nuevo consejo mediante el botón "Nuevo Consejo".**

> 28

1.  []{#_bookmark59 .anchor}Añadir consejo

> []{#_bookmark60 .anchor}Ilustración 27: Añadir consejo

![](media/image28.jpeg){width="5.95597987751531in"
height="3.002082239720035in"}

> El sistema permite registrar un nuevo consejo mediante el botón "Nuevo
> Consejo". El formulario de creación solicita la siguiente información:

- **Paciente**: selección del paciente al que se asignará el consejo.

- **Patología**: patología asociada al consejo.

- **Título del consejo**: nombre identificativo del consejo.

- **Descripción**: contenido detallado del consejo médico.

> Una vez completados los campos obligatorios, el usuario debe pulsar
> "Guardar Consejo". Si los datos son válidos, el consejo queda
> registrado y asociado al paciente seleccionado.

29

2.  []{#_bookmark61 .anchor}Ver consejo

> []{#_bookmark62 .anchor}Ilustración 28: Ver consejo

![](media/image29.jpeg){width="5.95597987751531in"
height="3.002082239720035in"}

> En la vista principal de consejos se muestran tarjetas de pacientes
> que tienen consejos asignados.
>
> Cada tarjeta indica:

- **Nombre del paciente.**

- **DNI.**

- **Número total de consejos asociados.**

> Dentro de consejos asignados:

- **Título**

- **Breve descripción.**

> Esta vista permite al doctor revisar de forma rápida las
> recomendaciones activas del paciente.
>
> 30

3.  []{#_bookmark63 .anchor}Eliminar consejo

> []{#_bookmark64 .anchor}Ilustración 29: Eliminar consejo

![](media/image30.jpeg){width="5.95597987751531in"
height="3.002082239720035in"}

> Cada consejo dispone de una opción de eliminación. Al seleccionarla,
> el sistema muestra un cuadro de confirmación, indicando que la acción
> no se puede deshacer.
>
> El usuario puede:

- **Cancelar la acción.**

- **Confirmar la eliminación, eliminando definitivamente el consejo del
  paciente.**

31

## Gestión de chat

> ![](media/image31.jpeg){width="5.60902668416448in"
> height="2.9762106299212596in"}[]{#_bookmark66 .anchor}Ilustración 30:
> Gestión de chat
>
> []{#_bookmark67 .anchor}Ilustración 31: Chat paciente
>
> ![](media/image32.jpeg){width="5.962086614173228in" height="3.1625in"}
>
> 32
>
> La sección Chat permite la comunicación directa entre el profesional
> sanitario y los pacientes registrados en el sistema, facilitando el
> seguimiento y la atención en tiempo real.
>
> La pantalla se divide en dos áreas principales:

- **Listado de pacientes (panel izquierdo)**

- **Área de conversación (panel derecho)**

> Funciones disponibles:

- **Buscar pacientes mediante el campo de búsqueda.**

- **Visualizar el estado de conexión del sistema.**

- **Identificar mensajes no leídos mediante un indicador numérico.**

- **Seleccionar un paciente para iniciar o continuar una conversación.**

- **Enviar mensajes de texto al paciente seleccionado.**

> Funcionamiento:

- **Al acceder a la sección, se muestra el listado de pacientes
  disponibles.**

- **Si no hay ningún paciente seleccionado, aparece el mensaje
  "Selecciona un paciente".**

- **Al seleccionar un paciente, se carga el historial de mensajes en el
  panel central.**

- **El profesional puede escribir un mensaje en el campo inferior y
  enviarlo mediante el botón de envío.**

- **Los mensajes enviados y recibidos se muestran de forma cronológica
  con la hora correspondiente.**

> Esta funcionalidad permite una comunicación rápida y sencilla para
> resolver dudas, dar indicaciones o realizar seguimiento del estado del
> paciente.

33

## Gestión de sesiones

> []{#_bookmark69 .anchor}Ilustración 32: Gestión de sesiones

![](media/image33.jpeg){width="5.956891951006124in"
height="3.002082239720035in"}

> La sección Gestión de Sesiones permite al profesional sanitario
> consultar y analizar las sesiones registradas por los pacientes
> durante el uso de las muletas inteligentes Load Crutches.
>
> Desde esta vista es posible visualizar el listado de pacientes con
> sesiones registradas y acceder al detalle de cada sesión para su
> análisis.

- **Buscar pacientes mediante el campo de búsqueda.**

- **Ordenar los pacientes por nombre.**

- **Navegar entre páginas si existen múltiples registros.**

- **Acceder al historial de sesiones de un paciente seleccionado.**

> La pantalla principal de Sesiones de Pacientes muestra tarjetas
> correspondientes a cada paciente que ha registrado sesiones en el
> sistema.
>
> Cada tarjeta incluye:

- **Nombre del paciente.**

- **DNI.**

- **Número total de sesiones registradas.**

> Al pulsar sobre el botón "Ver sesiones", se accede al historial de
> sesiones del paciente seleccionado.
>
> La pantalla principal de Sesiones de Pacientes muestra tarjetas
> correspondientes a cada paciente que ha registrado sesiones en el
> sistema.
>
> 34
>
> Cada tarjeta incluye:

- **Nombre del paciente.**

- **DNI.**

- **Número total de sesiones registradas.**

> Al pulsar sobre el botón "Ver sesiones", se accede al historial de
> sesiones del paciente seleccionado.

35

1.  []{#_bookmark70 .anchor}Historial de sesiones de paciente

> []{#_bookmark71 .anchor}Ilustración 33: Historial de sesiones de
> paciente

![](media/image34.png){width="5.366100174978127in"
height="8.40739501312336in"}

> 36
>
> La vista de Historial de Sesiones muestra un resumen de todas las
> sesiones realizadas por un paciente.
>
> La pantalla incluye:

- **Número total de sesiones.**

- **Promedio de pasos registrados.**

- **Peso promedio aplicado.**

- **Gráficas de evolución del peso y los pasos.**

- **Tabla con el listado de sesiones realizadas.**

> Cada fila del historial muestra:

- **Fecha de la sesión.**

- **Número de pasos.**

- **Peso medio registrado.**

- **Botón "Ver detalles" para acceder al análisis completo de la
  sesión.**

37

2.  []{#_bookmark72 .anchor}Detalles de la sesión

> []{#_bookmark73 .anchor}Ilustración 34: Detalles de la sesión

![](media/image35.png){width="5.86529636920385in"
height="7.911666666666667in"}

> 38
>
> La vista Detalle de Sesión permite analizar en profundidad una sesión
> concreta del paciente.
>
> Incluye los siguientes elementos:

- **Total de pasos registrados en la sesión.**

- **Peso promedio aplicado.**

- **Número de registros realizados.**

> Gráficas disponibles:

- **Evolución del peso**: peso medio y los límites establecidos.

- **Evolución de pasos**: pasos registrados a lo largo del tiempo.

> Línea de tiempo:
>
> Se muestra una tabla cronológica con:

- **Hora del registro.**

- **Pasos realizados.**

- **Peso medio registrado en cada momento.**

> Esta información permite al profesional sanitario evaluar el
> cumplimiento de los límites establecidos y la evolución del paciente
> durante la sesión.

39

# Manual de la aplicación móvil (Paciente)

> La aplicación móvil de Load Crutches está dirigida a los pacientes y
> permite el seguimiento de su proceso de rehabilitación mediante el
> registro de pasos, peso aplicado y la consulta de información
> proporcionada por el profesional sanitario.
>
> La aplicación presenta una interfaz sencilla e intuitiva, pensada para
> facilitar su uso durante el día a día del paciente.
>
> Cabe destacar que ha implementado en toda la aplicación un modo
> oscuro.

## Iniciar sesión

> []{#_bookmark76 .anchor}Ilustración 35: Inicio de sesión en varios
> dispositivos

![](media/image36.jpeg)

> 40
>
> La aplicación móvil de Load Crutches dispone de una pantalla de inicio
> de sesión que permite al paciente acceder a su cuenta de forma segura.
>
> La ventana de inicio de sesión se adapta según el modelo de
> dispositivo que se esté usando. En ilustración 35, se muestra el
> inicio de sesión desde: iphone 13, iphone 15, iphone SE (3 gen.) y
> ipad 10.
>
> Esta pantalla está disponible en modo claro y modo oscuro, adaptándose
> automáticamente a la configuración del dispositivo.
>
> Campos disponibles:

- **Usuario**: identificador del paciente (DNI), proporcionado por el
  profesional sanitario.

- **Contraseña**: clave personal asociada a la cuenta del paciente.

- **Mostrar/Ocultar contraseña**: icono que permite visualizar u ocultar
  la contraseña introducida.

- **Recordarme**: opción que permite guardar las credenciales para
  futuros accesos.

- **Entrar**: botón para iniciar sesión en la aplicación.

> Funcionamiento:

1.  El paciente introduce su usuario y contraseña.

2.  Opcionalmente, puede activar la opción "Recordarme" para facilitar
    futuros accesos.

3.  Al pulsar el botón "Entrar", la aplicación valida las credenciales.

4.  Si los datos son correctos, el paciente accede a la pantalla
    principal de la aplicación.

5.  En caso de error, se muestra un mensaje informativo indicando que
    las credenciales no son válidas.

41

## Inicio de sesión de rehabilitación

> []{#_bookmark78 .anchor}Ilustración 36: Pantalla de inicio

![](media/image42.png){width="5.850757874015748in" height="3.17125in"}

> Al acceder a la aplicación y entrar en la sección Inicio, el paciente
> visualizará:

- Un botón principal en la parte inferior:

  - Conectar muleta o Comenzar sesión, dependiendo del estado.

- En la parte superior:

  - El título Inicio.

  - Un icono para cerrar sesión.

- En la barra inferior:

  - Accesos rápidos a las distintas secciones de la aplicación.

> Inicialmente, el botón se muestra en color gris y el contenido dice
> "Conectar muleta", si se pulsa se accede a la sección de Bluetooth,
> donde se podrá conectar el hardware para poder comenzar con la sesión
> de rehabilitación.
>
> Una vez conectada la muleta el botón se muestra en color naranja y el
> contenido dice "Comenzar sesión".
>
> Cuando el botón está activo:

1.  Pulsa el botón.

2.  La aplicación entra en modo sesión activa.

3.  Se muestra la pantalla de seguimiento en tiempo real.

> 42

1.  []{#_bookmark79 .anchor}Pantalla sesión de rehabilitación

> []{#_bookmark80 .anchor}Ilustración 37: pantalla sesión de
> rehabilitación

![](media/image43.png){width="5.769791119860018in"
height="3.119374453193351in"}

> Durante la sesión de rehabilitación, el paciente puede visualizar en
> todo momento:

- **Nivel de batería de la muleta (porcentaje).**

- **Número de pasos realizados durante la sesión.**

- **Peso aplicado sobre la muleta**: se muestra en kilogramos en el
  indicador central.

- **Indicador de estado del peso**: se base en los límites establecidos
  por el doctor

  - **Sobrepeso (rojo)**: peso superior al máximo permitido.

  - **Peso correcto (verde)**: peso dentro del rango recomendado.

  - **Infrapeso (azul)**: peso inferior al mínimo permitido.

> Este sistema proporciona *feedback* inmediato, ayudando al paciente a
> realizar correctamente la rehabilitación.
>
> En la parte inferior de la pantalla se encuentran dos botones
> principales:

- **Pausar sesión (amarillo)**: Detiene temporalmente la sesión,
  conservando los datos registrados hasta ese momento.

- **Finalizar sesión (rojo)**: Finaliza definitivamente la sesión de
  rehabilitación.

43

> []{#_bookmark81 .anchor}Ilustración 38: Confirmación para finalizar
> sesión

![](media/image44.jpeg)

> Al pulsar Finalizar sesión:

1.  Se muestra un mensaje de confirmación

2.  Los datos recogidos (pasos, peso y duración) se guardan
    automáticamente.

3.  La información queda disponible para su consulta posterior.

> 44

## Conexión bluetooth

> []{#_bookmark83 .anchor}Ilustración 39: Pantalla de conexión bluetooth

![](media/image46.png){width="3.305683508311461in"
height="3.574374453193351in"}

> El paciente puede acceder a la pantalla de Bluetooth pulsando el icono
> de Bluetooth situado en la barra de navegación inferior de la
> aplicación o con el botón "Conectar muleta" de la pantalla de inicio.
>
> En esta pantalla se muestran los siguientes elementos:

- **Estado del Bluetooth:** En la parte superior se indica si el
  Bluetooth del dispositivo móvil está activado o desactivado.

  - Si está activado, el icono aparece en color verde.

  - Si está desactivado, será necesario activarlo para poder continuar.

- **Lista de dispositivos disponibles**: Se muestra el listado de
  dispositivos Bluetooth detectados cercanos al móvil filtrando solo los
  dispositivos del tipo muleta.

  - **Nombre**: LoadCrutch_XXXXXX

  - **Estado**: Al principio desconectado (Una vez conectado, el estado
    cambiará automáticamente)

> Para conectar la muleta:

1.  Asegúrese de que la muleta esté encendida.

2.  Compruebe que el Bluetooth del teléfono está activado.

3.  Pulse sobre el dispositivo LoadCrutch en la lista de dispositivos
    disponibles.

4.  Espere unos segundos mientras se establece la conexión.

> Una vez completado el proceso, la muleta quedará vinculada a la
> aplicación y podrá utilizarse para iniciar sesiones de rehabilitación.

45

## Estadísticas

> []{#_bookmark85 .anchor}Ilustración 40: Pantalla de estadísticas

![](media/image47.png){width="3.778779527559055in"
height="4.089478346456693in"}

> La sección Estadísticas permite al paciente consultar de forma visual
> y sencilla la evolución de su rehabilitación, a partir de los datos
> recogidos durante las sesiones realizadas con la muleta inteligente.
>
> Desde esta pantalla se puede acceder a diferentes tipos de información
> estadística que ayudan a comprender el progreso y detectar posibles
> avisos durante el proceso de recuperación.
>
> Para acceder a esta sección:

1.  Pulse el icono de Estadísticas (gráfico de barras) situado en la
    barra de navegación inferior.

2.  Se mostrará la pantalla principal de estadísticas con tres opciones
    disponibles.

<!-- -->

1.  **Sesiones**

> Al pulsar el botón Sesiones, el usuario puede:

- Consultar el histórico de sesiones de rehabilitación realizadas.

- Visualizar información relacionada con el peso soportado durante las
  sesiones.

- Analizar la evolución general de la recuperación a lo largo del
  tiempo.

> Esta opción está representada por un botón azul con un icono de peso.
>
> 46

2.  **Pasos**

> Al pulsar el botón Pasos, el usuario puede:

- Consultar el número de pasos registrados durante las sesiones.

- Analizar la evolución de la actividad física a lo largo del proceso de
  rehabilitación.

- Identificar mejoras o cambios en el patrón de marcha.

> Esta opción está representada por un botón naranja con un icono de
> huellas.

3.  **Avisos**

> Al pulsar el botón Avisos, el usuario puede:

- Consultar advertencias o notificaciones relacionadas con su
  rehabilitación.

- Revisar posibles desviaciones respecto a los valores recomendados por
  el profesional sanitario.

- Estar informado de situaciones que requieren especial atención.

> Esta opción está representada por un botón amarillo con un icono de
> advertencia.

1.  []{#_bookmark86 .anchor}Estadísticas de pesos

> []{#_bookmark87 .anchor}Ilustración 41: Estadísticas de pesos

![](media/image48.png){width="5.742323928258967in"
height="3.0995833333333334in"}

> La sección Pesos permite al paciente consultar el control de carga
> aplicado durante sus sesiones de rehabilitación, comparándolo con los
> límites establecidos por el profesional sanitario.

47

> **Vista general**

- Se muestra un gráfico de evolución del peso aplicado a lo largo del
  tiempo.

- Las líneas discontinuas indican los límites configurados:

  - Límite superior (rojo).

  - Límite inferior (azul).

- En la parte superior aparece el **peso medio de la sesión** y la
  **fecha** seleccionada.

- En la parte inferior se indica el **peso medio total del día**.

> **Interacción**

- Al pulsar sobre un punto del gráfico, se muestra el detalle del
  registro, incluyendo el número de pasos asociados.

- Si no hay una sesión seleccionada, el peso medio aparece como "\-\--".

> **Interpretación de colores**

- **Verde**: peso dentro del rango correcto.

- **Rojo**: peso por encima del límite recomendado.

- **Azul**: peso por debajo del límite recomendado.

> Esta pantalla permite al paciente identificar si la carga aplicada
> durante la marcha se ajusta a las recomendaciones terapéuticas y
> seguir la evolución de su rehabilitación.

2.  []{#_bookmark88 .anchor}Estadísticas de pasos

> []{#_bookmark89 .anchor}Ilustración 42: Estadísticas de pasos

![](media/image49.png){width="3.6296227034120734in" height="3.92875in"}

> 48
>
> La sección Pasos permite al paciente consultar el número de pasos
> realizados durante el día y comprobar su progreso respecto a los
> objetivos establecidos por el profesional sanitario.
>
> En la parte superior se muestra un indicador circular de progreso, que
> representa los pasos dados frente al límite máximo diario, expresado
> en formato pasos realizados / pasos máximos.
>
> A la derecha del indicador se muestra el texto "Pasos dados",
> acompañado de un icono representativo de la actividad.
>
> Debajo del indicador se presenta el apartado Desafíos, donde se
> informa del cumplimiento de los objetivos diarios. Cuando el paciente
> alcanza el número mínimo de pasos configurado, el desafío aparece
> marcado como completado mediante un icono de confirmación.
>
> Esta vista permite al paciente realizar un seguimiento sencillo y
> visual de su actividad diaria, favoreciendo la adherencia al
> tratamiento y la recuperación progresiva.

3.  []{#_bookmark90 .anchor}Avisos

> []{#_bookmark91 .anchor}Ilustración 43: Avisos

![](media/image50.png){width="5.736517935258092in" height="3.10625in"}

> La sección Avisos muestra notificaciones informativas generadas por el
> sistema con el objetivo de guiar al paciente durante su proceso de
> recuperación.
>
> En la vista principal se presenta un listado de avisos, cada uno
> identificado por un título y una breve descripción relacionada con la
> patología o tratamiento asignado.
>
> En la parte superior se indica al usuario que puede pulsar sobre un
> aviso para ver más detalles**.**

49

> **Funcionamiento:**

- Al seleccionar un aviso, se abre una ventana emergente con información
  detallada.

- Esta ventana explica la recomendación o advertencia correspondiente,
  como por ejemplo tiempos de descanso o pautas de uso.

- El aviso puede cerrarse mediante el botón "Cerrar"**,** regresando a
  la lista principal.

> Los avisos permiten al paciente recibir recordatorios claros y
> personalizados, ayudando a prevenir sobreesfuerzos y a seguir
> correctamente las indicaciones médicas establecidas.

## Chat

> []{#_bookmark93 .anchor}Ilustración 44: Chat

![](media/image51.png){width="3.7945483377077864in"
height="4.102915573053369in"}

> La sección Chat permite al paciente comunicarse directamente con su
> profesional sanitario de forma sencilla y segura. A través de este
> canal, el paciente puede consultar dudas, informar sobre molestias o
> recibir indicaciones personalizadas durante su proceso de
> recuperación.
>
> Para acceder a esta sección:

1.  Desde la barra de navegación inferior de la aplicación, pulse el
    icono de chat.

2.  Se abrirá la pantalla principal del chat, donde se muestran los
    mensajes intercambiados con el profesional sanitario.

> En la pantalla de chat se distinguen los siguientes elementos: 50

- **Encabezado**:

  - Título "Chat" en la parte superior.

  - Icono de salida o regreso situado en la esquina superior derecha.

- **Zona de mensajes**:

  - Los mensajes enviados por el paciente aparecen alineados a la
    derecha, normalmente en color naranja.

  - Los mensajes recibidos del profesional sanitario aparecen alineados
    a la izquierda, en color morado.

  - Cada mensaje incluye la hora de envío.

  - Un separador con la palabra "Hoy" indica los mensajes del día
    actual.

- **Campo de texto**:

  - En la parte inferior se encuentra el cuadro "Escribe un mensaje..."
    para introducir el texto.

- **Botón de envío**:

  - Icono con forma de flecha, situado a la derecha del campo de texto,
    que permite enviar el mensaje escrito.

> **Envío de mensajes**

1.  Pulse sobre el campo "Escribe un mensaje..."**.**

2.  Introduzca el texto del mensaje.

3.  Pulse el botón de enviar (flecha verde).

4.  El mensaje aparecerá inmediatamente en la conversación con su hora
    correspondiente.

> **Recepción de mensajes**

- Las respuestas del profesional sanitario se muestran automáticamente
  en la conversación.

51

## Perfil

> []{#_bookmark95 .anchor}Ilustración 45: Perfil

![](media/image52.png){width="5.364987970253718in"
height="2.898020559930009in"}

> Desde la barra de navegación inferior, pulsa el icono de Perfil para
> acceder a tu información personal.
>
> En esta pantalla se muestra tu información básica:

- **Nombre**

- **Apellidos**

- **Usuario**

- **Correo electrónico**

- **Descripción clínica** (resumen del estado del paciente)

> Esta información es solo visual, no editable directamente desde esta
> pantalla.
>
> Al pulsar sobre la tarjeta central (peso y altura), se abre una
> ventana emergente donde se muestran:

- **Peso actual (kg)**

- **Altura (cm)**

> Una vez revisados los datos, pulsa el botón Aceptar para cerrar la
> ventana.
>
> En la parte inferior se muestra información relativa a la protección
> de datos, garantizando la confidencialidad según el Reglamento General
> de Protección de Datos (RGPD).
>
> Desde esta pantalla puedes acceder al cambio de contraseña pulsando el
> botón Cambiar contraseña.
>
> 52

1.  []{#_bookmark96 .anchor}Cambiar contraseña

> []{#_bookmark97 .anchor}Ilustración 46: Cambiar contraseña

![](media/image53.png){width="3.3933978565179355in"
height="3.6729166666666666in"}

> Desde el apartado Perfil, pulsa el botón Cambiar contraseña para
> acceder a la pantalla de modificación de credenciales.
>
> En esta pantalla encontrarás tres campos:

1.  **Contraseña anterior**: Introduce tu contraseña actual.

2.  **Nueva contraseña**: Introduce la nueva contraseña que deseas
    establecer.

3.  **Confirmar contraseña**: Vuelve a introducir la nueva contraseña
    para confirmarla.

> Cada campo dispone de un icono de ojo, que permite mostrar u ocultar
> el texto de la contraseña.

- El botón Confirmar se activará únicamente cuando todos los campos
  estén correctamente rellenados.

- Al pulsar Confirmar, la contraseña se actualizará de forma segura.

53

# Bibliografía

> **No hay ninguna fuente en el documento actual.**

55
