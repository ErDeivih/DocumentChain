> **LOAD CRUTCHES: SISTEMA DE SOPORTE EN LA RECUPERACIÓN DE PACIENTES
> QUE REQUIEREN USO DE MULETAS**
>
> **-**

LOAD CRUTCHES: SUPPORT SYSTEM FOR THE RECOVERY OF PATIENTS WHO REQUIRE
THE USE OF CRUTCHES

Memoria principal del proyecto

![](media/image1.png){width="4.534323053368329in" height="1.25125in"}

> Trabajo de Fin de Grado Grado en Ingeniería Informática
>
> **Alumno:**
>
> Víctor Martín Fuentes
>
> **Tutor:**
>
> Pablo Chamoso Santos Salamanca, enero de 2026
>
> Contenido

1.  [Introducción 1](#introducción)

2.  [Metodologías de seguridad empleadas
    2](#metodologías-de-seguridad-empleadas)

    1.  [Análisis de riesgos y amenazas
        2](#análisis-de-riesgos-y-amenazas)

    2.  [Prevención y detección de vulnerabilidades
        2](#prevención-y-detección-de-vulnerabilidades)

    3.  [Pruebas de seguridad y auditoría
        3](#pruebas-de-seguridad-y-auditoría)

3.  [Protección de datos y privacidad
    4](#protección-de-datos-y-privacidad)

    1.  [Gestión de datos sensibles 4](#gestión-de-datos-sensibles)

    2.  [Encriptación y almacenamiento seguro
        4](#encriptación-y-almacenamiento-seguro)

    3.  [Control de acceso y autenticación
        5](#control-de-acceso-y-autenticación)

4.  [Componentes críticos del software
    6](#componentes-críticos-del-software)

    1.  [Backend y API REST 6](#_bookmark10)

    2.  [Base de datos y almacenamiento
        6](#base-de-datos-y-almacenamiento)

    3.  [Frontend y gestión de sesiones 6](#_bookmark12)

5.  [Aspectos legales y normativos 7](#aspectos-legales-y-normativos)

    1.  [RGPD y LOPD 7](#rgpd-y-lopd)

    2.  [Normativas sanitarias aplicables
        7](#normativas-sanitarias-aplicables)

    3.  [Consentimiento y derechos de los usuarios
        8](#consentimiento-y-derechos-de-los-usuarios)

6.  [Plan de mejora continua y monitorización
    9](#plan-de-mejora-continua-y-monitorización)

    1.  [Actualización de dependencias y parches
        9](#actualización-de-dependencias-y-parches)

7.  [Conclusiones 10](#conclusiones)

[Bibliografía 11](#bibliografía)

# Introducción

> La seguridad constituye un pilar fundamental en el desarrollo de "Load
> Crutches", un sistema de soporte a la recuperación de pacientes que
> requieren el uso de muletas inteligentes. Al tratarse de una
> aplicación orientada al ámbito sanitario, el sistema gestiona datos
> personales y clínicos sensibles, tales como información
> identificativa, parámetros antropométricos, registros de sesiones de
> rehabilitación y consejos médicos, lo que exige la aplicación de
> medidas de seguridad rigurosas tanto a nivel técnico como
> organizativo.
>
> El sistema ha sido diseñado considerando los riesgos inherentes a la
> exposición de servicios web, el uso de aplicaciones móviles, la
> comunicación inalámbrica mediante Bluetooth con un dispositivo físico
> y el almacenamiento persistente de información clínica. Estos
> elementos incrementan la superficie de ataque y hacen necesaria la
> adopción de mecanismos que garanticen la confidencialidad, integridad
> y disponibilidad de la información.
>
> Este plan de seguridad recoge las metodologías, prácticas y
> tecnologías empleadas a lo largo del desarrollo de "Load Crutches"
> para prevenir vulnerabilidades, proteger los datos frente a accesos no
> autorizados y asegurar el cumplimiento de la normativa vigente en
> materia de protección de datos, especialmente el Reglamento General de
> Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos y
> Garantía de los Derechos Digitales (LOPDGDD).
>
> La aplicación de estos principios permite ofrecer una solución robusta
> y fiable, adecuada para su uso en entornos sanitarios y preparada para
> afrontar los desafíos actuales y futuros relacionados con la seguridad
> informática y la protección de la privacidad de los usuarios.

# Metodologías de seguridad empleadas

> El desarrollo de "Load Crutches" ha seguido un enfoque proactivo en
> materia de seguridad, integrando buenas prácticas de desarrollo seguro
> desde las fases iniciales del proyecto. Este enfoque ha permitido
> identificar los componentes críticos del sistema. (*backend*,
> aplicación móvil, panel web, base de datos y comunicaciones) y aplicar
> controles adecuados en cada uno de ellos.
>
> Las metodologías empleadas están orientadas a la prevención, detección
> y mitigación de vulnerabilidades, asegurando que los riesgos se
> aborden de forma temprana y sistemática, especialmente en un contexto
> sanitario donde el impacto de una brecha de seguridad puede ser
> elevado.

## Análisis de riesgos y amenazas

> Desde la fase de inicio del proyecto se llevó a cabo un análisis de
> riesgos específico para la arquitectura y el contexto de uso de "Load
> Crutches". Entre las principales amenazas identificadas se encuentran:

- Acceso no autorizado a información clínica de los pacientes.

- Exposición o robo de credenciales de autenticación.

- Manipulación o pérdida de datos de sesiones de rehabilitación.

- Ataques sobre los *endpoints* del *backend* mediante peticiones
  maliciosas.

- Riesgos derivados de la comunicación Bluetooth con la muleta
  inteligente.

> Este análisis permitió priorizar las áreas de mayor criticidad y
> definir medidas de mitigación adaptadas a cada componente del sistema,
> estableciendo una base sólida para el diseño seguro de la aplicación.

## Prevención y detección de vulnerabilidades

> Para reducir la probabilidad de aparición de vulnerabilidades, se han
> aplicado diversas prácticas de desarrollo seguro a lo largo del
> proyecto, entre las que destacan:

- Validación estricta de las entradas recibidas por el *backend*,
  evitando la inyección de datos malformados o no esperados.

- Autenticación basada en tokens JWT, garantizando que únicamente los
  usuarios autenticados puedan acceder a los recursos protegidos del
  sistema.

- Control de acceso por roles, diferenciando claramente las operaciones
  permitidas a doctores y pacientes.

- Gestión segura de sesiones, eliminando las credenciales locales al
  cerrar sesión y evitando accesos persistentes no autorizados.

- Uso de cabeceras HTTP seguras.

- Mantenimiento de dependencias actualizadas, reduciendo la exposición a
  vulnerabilidades conocidas en librerías de terceros.

## Pruebas de seguridad y auditoría

> Durante el desarrollo y antes del despliegue final del sistema, se han
> llevado a cabo distintas tareas de verificación relacionadas con la
> seguridad, entre las que se incluyen:

- Revisión manual del código fuente para detectar posibles fallos de
  validación o control de accesos.

- Comprobación de la correcta configuración de permisos en la base de
  datos.

- Verificación del flujo completo de autenticación y autorización.

- Pruebas funcionales orientadas a detectar comportamientos anómalos
  ante accesos no autorizados o entradas incorrectas.

> Estas acciones han permitido identificar y corregir posibles
> debilidades antes de la puesta en producción, reforzando la seguridad
> global del sistema y garantizando un nivel de protección adecuado para
> los datos gestionados por "Load Crutches".

# Protección de datos y privacidad

> La protección de los datos personales y clínicos constituye uno de los
> aspectos más críticos en el desarrollo de "Load Crutches", dado que el
> sistema gestiona información sanitaria sensible relacionada con
> pacientes en proceso de rehabilitación. Para ello, se han implementado
> medidas técnicas y organizativas orientadas a garantizar la
> confidencialidad, integridad y disponibilidad de los datos, cumpliendo
> con la normativa legal vigente en materia de protección de datos.
>
> El diseño del sistema tiene en cuenta el principio de privacidad desde
> el diseño y por defecto, aplicando mecanismos de seguridad desde las
> primeras fases del desarrollo y limitando el acceso a la información
> únicamente a los actores autorizados.

## Gestión de datos sensibles

> "Load Crutches" almacena y procesa datos personales y clínicos,
> incluyendo información identificativa del paciente, parámetros
> antropométricos, registros de sesiones de rehabilitación, mensajes
> intercambiados con el doctor y configuraciones de tratamiento. Con el
> objetivo de minimizar los riesgos asociados al tratamiento de esta
> información, se ha adoptado una política de minimización de datos,
> almacenando únicamente aquellos datos estrictamente necesarios para el
> correcto funcionamiento del sistema.
>
> El acceso a los datos clínicos está limitado por rol, de modo que:

- El doctor puede consultar y gestionar la información clínica de los
  pacientes bajo su supervisión.

- El paciente únicamente puede acceder a su propia información y a los
  datos derivados de su rehabilitación.

> No se almacenan datos innecesarios ni información sensible ajena a los
> fines terapéuticos del sistema.

## Encriptación y almacenamiento seguro

> Las comunicaciones entre los distintos componentes del sistema se
> realizan mediante canales seguros, utilizando el protocolo HTTP para
> transmitir la información transmitida entre el panel web, la
> aplicación móvil y el *backend*.
>
> Las contraseñas de los usuarios se almacenan de forma segura
> utilizando algoritmos de hash robustos, evitando en todo momento el
> almacenamiento de credenciales en texto plano. Los tokens de
> autenticación se gestionan mediante JWT, reduciendo la exposición de
> credenciales persistentes.
>
> La base de datos utilizada por "Load Crutches" almacena la información
> de forma persistente y se encuentra protegida mediante mecanismos de
> control de acceso y políticas de seguridad del servidor. Asimismo, se
> contemplan medidas de respaldo y recuperación ante fallos para
> preservar la disponibilidad de los datos.

## Control de acceso y autenticación

> Las contraseñas de los usuarios se almacenan de forma segura
> utilizando algoritmos de hash robustos, evitando en todo momento el
> almacenamiento de credenciales en texto plano. Los tokens de
> autenticación se gestionan mediante JWT, reduciendo la exposición de
> credenciales persistentes.
>
> La base de datos utilizada por "Load Crutches" almacena la información
> de forma persistente y se encuentra protegida mediante mecanismos de
> control de acceso y políticas de seguridad del servidor. Asimismo, se
> contemplan medidas de respaldo y recuperación ante fallos para
> preservar la disponibilidad de los datos.

# Componentes críticos del software

> La seguridad global de "Load Crutches" depende en gran medida de la
> correcta protección y gestión de determinados componentes del sistema.
> Una vulnerabilidad en cualquiera de estos elementos podría comprometer
> la integridad de los datos clínicos o la privacidad de los usuarios.
> Por ello, se han identificado y reforzado los siguientes componentes
> críticos.

1.  []{#_bookmark10 .anchor}*Backend* y API REST

> El *backend* de "Load Crutches" actúa como núcleo del sistema y es
> responsable de la gestión de la lógica de negocio, la autenticación de
> usuarios, el almacenamiento de datos clínicos y la comunicación con
> los clientes. Todos los *endpoints* expuestos implementan controles de
> validación de datos, autenticación JWT y autorización por rol,
> asegurando que solo los usuarios con permisos adecuados puedan
> realizar operaciones sensibles.
>
> Además, se han aplicado medidas para evitar accesos indebidos, como la
> comprobación de pertenencia doctor-paciente antes de permitir acciones
> sobre datos clínicos y la validación exhaustiva de los parámetros
> recibidos.

## Base de datos y almacenamiento

> La base de datos constituye un componente crítico al almacenar
> información clínica, registros de sesiones y credenciales de usuario.
> Para proteger estos datos, se han configurado permisos de acceso
> restrictivos, garantizando que únicamente el *backend* pueda
> interactuar directamente con la base de datos.
>
> Asimismo, se contemplan mecanismos de copia de seguridad y control de
> integridad que permiten recuperar la información en caso de fallo o
> incidente, asegurando la disponibilidad y consistencia de los datos a
> lo largo del tiempo.

3.  []{#_bookmark12 .anchor}*Frontend* y gestión de sesiones

> El *frontend*, tanto en su versión de panel web para doctores como en
> la aplicación móvil para pacientes, incorpora mecanismos de gestión
> segura de sesiones. El almacenamiento de tokens se realiza de forma
> controlada y se eliminan automáticamente cuando el usuario cierra
> sesión o cuando la sesión expira.
>
> Además, se han aplicado medidas preventivas frente a ataques comunes
> en aplicaciones cliente, como la validación de entradas y el control
> de navegación, evitando accesos directos a vistas protegidas sin
> autenticación previa.

# Aspectos legales y normativos

> El tratamiento de datos personales y clínicos en "Load Crutches"
> requiere el cumplimiento estricto de la legislación vigente en materia
> de protección de datos, especialmente al tratarse de un sistema
> orientado al seguimiento de procesos de rehabilitación de pacientes.
> Durante el diseño y desarrollo del sistema se han tenido en cuenta los
> principales marcos legales y normativos aplicables, garantizando que
> el uso de la plataforma se realice de forma segura, transparente y
> conforme a la ley.

## RGPD y LOPD

> "Load Crutches" cumple con los principios establecidos en el
> Reglamento General de Protección de Datos (RGPD) y en la Ley Orgánica
> de Protección de Datos y Garantía de los Derechos Digitales (LOPDGDD).
> En particular, se respetan los principios de:

- Licitud, lealtad y transparencia en el tratamiento de los datos.

- Limitación de la finalidad, utilizando los datos únicamente con fines
  clínicos y de seguimiento de la rehabilitación.

- Minimización de datos, almacenando solo la información necesaria.

- Integridad y confidencialidad, mediante el uso de mecanismos técnicos
  de seguridad.

> Los usuarios son informados del tratamiento de sus datos durante el
> proceso de registro y se solicita el consentimiento explícito para el
> almacenamiento y procesamiento de información personal y clínica,
> especialmente en el caso de los pacientes.

## Normativas sanitarias aplicables

> Además de la normativa general de protección de datos, se han
> considerado las exigencias específicas del ámbito sanitario, que
> requieren un nivel elevado de confidencialidad y control en el
> tratamiento de datos clínicos. "Load Crutches" implementa medidas
> adicionales de seguridad, como el control de acceso por roles y la
> segregación de datos entre pacientes y doctores, garantizando que la
> información médica solo sea accesible por personal autorizado.
>
> Asimismo, el sistema mantiene trazabilidad sobre las operaciones
> relevantes realizadas sobre los datos clínicos, lo que facilita el
> seguimiento de la actividad y contribuye al cumplimiento de las
> normativas sanitarias aplicables en el contexto español y europeo.

## Consentimiento y derechos de los usuarios

> El sistema garantiza los derechos de los usuarios reconocidos por la
> normativa vigente, incluyendo el derecho de acceso, rectificación,
> supresión, limitación del tratamiento y oposición. Los pacientes
> pueden solicitar la eliminación de sus datos o la revocación del
> consentimiento otorgado, y el sistema contempla la eliminación segura
> de la información cuando sea legalmente posible.
>
> En todo momento se respeta la autonomía del usuario sobre sus datos
> personales, ofreciendo mecanismos claros para la gestión de
> consentimientos y asegurando la transparencia en el tratamiento de la
> información.

# Plan de mejora continua y monitorización

> La seguridad en un sistema sanitario como "Load Crutches" no puede
> considerarse un estado estático, sino un proceso continuo que debe
> adaptarse a nuevas amenazas y cambios tecnológicos. Por ello, se ha
> definido un plan de mejora continua y monitorización que permita
> mantener un nivel de seguridad adecuado a lo largo del tiempo.
>
> Este plan contempla la revisión periódica del sistema, la
> actualización de componentes software y la evaluación de posibles
> riesgos emergentes, garantizando la protección constante de los datos
> clínicos y personales.

## Actualización de dependencias y parches

> Se realiza una revisión periódica de las dependencias utilizadas en el
> *backend* y en los clientes del sistema, aplicando actualizaciones y
> parches de seguridad cuando están disponibles. Este proceso permite
> reducir la exposición a vulnerabilidades conocidas y mantener el
> sistema alineado con las buenas prácticas de seguridad.
>
> Asimismo, se contempla la monitorización de incidencias y la
> corrección temprana de posibles fallos detectados durante el uso del
> sistema, reforzando la estabilidad y la fiabilidad de la plataforma a
> largo plazo.

# Conclusiones

> El diseño y desarrollo de "Load Crutches" ha integrado la seguridad
> como un elemento transversal y prioritario en todas las fases del
> proyecto. La aplicación de metodologías de análisis de riesgos, la
> implementación de controles técnicos adecuados y el cumplimiento de
> las normativas legales vigentes han permitido construir un sistema
> robusto y fiable para el tratamiento de datos clínicos sensibles.
>
> La protección de los componentes críticos como el *backend*, la base
> de datos y las aplicaciones cliente se ha reforzado mediante
> mecanismos de autenticación segura, control de acceso por roles y
> gestión responsable de las sesiones de usuario.
>
> El compromiso con la mejora continua y la monitorización de la
> seguridad garantiza que "Load Crutches" pueda adaptarse a nuevas
> amenazas y exigencias legales, manteniendo la confianza de doctores y
> pacientes en el uso de la plataforma. Este plan de seguridad establece
> una base sólida para la evolución futura del sistema y para su posible
> despliegue en entornos reales del ámbito sanitario.

# Bibliografía

> \[1\] «Reglamento General de Protección de Datos (RGPD),» \[En
> línea\]. [https://eur-]{.underline}
> [lex.europa.eu/eli/reg/2016/679/oj]{.underline} \[Último acceso:
> 2025\].
