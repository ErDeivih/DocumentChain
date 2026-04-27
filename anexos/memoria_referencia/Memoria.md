> **LOAD CRUTCHES: SISTEMA DE SOPORTE EN LA RECUPERACIÓN DE PACIENTES
> QUE REQUIEREN USO DE MULETAS**
>
> **-**

LOAD CRUTCHES: SUPPORT SYSTEM FOR THE RECOVERY OF PATIENTS WHO REQUIRE
THE USE OF CRUTCHES

> Memoria principal del proyecto

![](memoria_referencia/media/image1.png){width="4.535625546806649in"
height="1.25125in"}

# Trabajo de Fin de Grado Grado en Ingeniería Informática

> **Alumno:**

# Víctor Martín Fuentes

> **Tutor:**

# Pablo Chamoso Santos

> Salamanca, enero de 2026
>
> Dr. Pablo Chamoso Santos, profesor del Departamento de Informática y
> Automática de la Universidad de Salamanca
>
> CERTIFICA:
>
> Que el trabajo titulado "Load Crutches: Sistema de soporte en la
> recuperación de pacientes que requieren el uso de muletas." ha sido
> realizado por D. Víctor Martín Fuentes, con DNI 70918498E y constituye
> el trabajo realizado de cara a la superación de la asignatura Trabajo
> de Fin de Grado de la titulación Grado Universitario en Ingeniería
> Informática de la Universidad de Salamanca.
>
> Y para que así conste a todos los efectos oportunos.
>
> En Salamanca, a jueves, 8 de enero de 2026
>
> D. Pablo Chamoso Santos Dpto. Informática y Automática Universidad de
> Salamanca

# Resumen

> En el ámbito de la rehabilitación y la recuperación funcional de
> pacientes con lesiones en miembros inferiores, el uso de muletas es
> una solución ampliamente extendida. Sin embargo, el control real de la
> carga aplicada durante la marcha suele depender únicamente de la
> percepción subjetiva del paciente y de revisiones clínicas puntuales,
> lo que puede derivar en una aplicación incorrecta del peso recomendado
> y, en consecuencia, en retrasos o complicaciones en el proceso de
> recuperación.
>
> Ante esta problemática surge "Load Crutches", un sistema integral cuyo
> objetivo es monitorizar de forma objetiva el uso de la muleta durante
> la rehabilitación, proporcionando información precisa sobre la carga
> aplicada, el número de pasos realizados y el cumplimiento de las
> pautas establecidas por el profesional sanitario. El proyecto combina
> una muleta inteligente equipada con sensores, una aplicación móvil
> orientada al paciente y una plataforma web destinada a los
> profesionales sanitarios.
>
> La estructura de la muleta incorpora una célula de carga para la
> medición del peso soportado en cada apoyo y sensores de movimiento
> para la detección de pasos, enviando la información mediante
> comunicación Bluetooth de bajo consumo a la aplicación móvil. Esta
> aplicación permite al paciente visualizar estadísticas, recibir
> avisos, comunicarse con su médico y llevar un seguimiento continuo de
> su rehabilitación. Por su parte, el portal web facilita al profesional
> sanitario la gestión de pacientes, la configuración de límites
> personalizados y el análisis de la evolución clínica basada en datos
> reales de uso.
>
> El resultado es un sistema que integra hardware y software de forma
> coherente, orientado a mejorar el seguimiento clínico, aumentar la
> adherencia terapéutica y aportar objetividad al proceso de
> rehabilitación asistida con muletas, sentando las bases para futuras
> mejoras y ampliaciones del sistema.
>
> **Palabras clave**: rehabilitación, muleta inteligente, sensores,
> carga biomecánica, Bluetooth, aplicación móvil, seguimiento clínico.

# Abstract

> In the field of rehabilitation and functional recovery of patients
> with lower limb injuries, the use of crutches is a widely adopted
> solution. However, the actual control of the load applied during
> walking usually relies on the patient's subjective perception and
> occasional clinical check-ups, which may lead to incorrect weight
> bearing and, consequently, delays or complications in the recovery
> process.
>
> In response to this issue, "Load Crutches" is proposed as an
> integrated system aimed at objectively monitoring crutch usage during
> rehabilitation, providing accurate information about the applied load,
> the number of steps taken and the compliance with the guidelines
> established by healthcare professionals. The project combines a smart
> crutch equipped with sensors, a mobile application designed for
> patients and a web platform for healthcare professionals.
>
> The crutch structure incorporates a load cell to measure the weight
> supported on each step and motion sensors for step detection,
> transmitting the collected data via low-energy Bluetooth communication
> to the mobile application. This application allows patients to
> visualize statistics, receive alerts, communicate with their doctor
> and continuously track their rehabilitation progress. Meanwhile, the
> web portal facilitates patient management for healthcare
> professionals, allowing for the configuration of personalized limits
> and the analysis of clinical progress based on real usage data.
>
> As a result, the system achieves a coherent integration of hardware
> and software, aiming to improve clinical monitoring, enhance
> therapeutic adherence and provide objective data to the
> crutch-assisted rehabilitation process, laying the groundwork for
> future extensions and improvements.
>
> **Keywords**: rehabilitation, smart crutch, sensors, biomechanical
> load, Bluetooth, mobile application, clinical monitoring.

# Glosario

> **API (Application Programming Interface)**: Conjunto de definiciones
> y protocolos que permiten la comunicación entre diferentes componentes
> software, facilitando el intercambio de datos y funcionalidades.
>
> **Backend**: Parte del sistema encargada de la lógica de negocio, el
> procesamiento de datos y la comunicación con la base de datos, no
> visible directamente por el usuario final.
>
> **BLE (Bluetooth Low Energy)**: Protocolo de comunicación inalámbrica
> diseñado para aplicaciones de bajo consumo energético, utilizado para
> la transmisión de datos entre la muleta inteligente y la aplicación
> móvil.
>
> **CRUD (Create, Read, Update, Delete)**: Conjunto de operaciones
> básicas utilizadas para la gestión de datos en sistemas de
> información: crear, leer, actualizar y eliminar registros.
>
> **DTO (Data Transfer Object)**: Objeto utilizado para transportar
> datos entre distintas capas o componentes de un sistema, desacoplando
> la estructura interna de los datos del formato de comunicación.
>
> **ESP32**: Microcontrolador desarrollado por Espressif que integra
> conectividad Bluetooth y Wi-Fi, empleado como núcleo del sistema
> embebido de la muleta inteligente.
>
> **Firmware**: Software de bajo nivel que se ejecuta directamente sobre
> el hardware de un dispositivo, encargado de controlar los periféricos
> y gestionar la comunicación con otros sistemas.
>
> **Frontend**: Parte del sistema encargada de la interfaz de usuario y
> la interacción directa con el usuario, tanto en la aplicación móvil
> como en la plataforma web.
>
> **IMU (Inertial Measurement Unit)**: Unidad de medición inercial
> compuesta por sensores como acelerómetros y giróscopos, utilizada para
> detectar movimiento y eventos de paso.
>
> **MVC (Model-View-Controller)**: Patrón arquitectónico de software que
> separa la lógica de negocio, la gestión de datos y la interfaz de
> usuario en tres componentes diferenciados.
>
> **MVVM (Model-View-ViewModel)**: Patrón de arquitectura software que
> desacopla la interfaz gráfica de la lógica de presentación,
> facilitando el mantenimiento y la gestión de estados en aplicaciones
> con interfaces dinámicas.
>
> **RGPD (Reglamento General de Protección de Datos)**: Normativa
> europea que regula la protección y el tratamiento de los datos
> personales, garantizando la privacidad y los derechos de los usuarios.
>
> **Sensor inercial**: Dispositivo capaz de medir magnitudes
> relacionadas con el movimiento, como aceleraciones y rotaciones,
> utilizado para el análisis de la marcha y la detección de pasos.
>
> **Sistema embebido**: Sistema de computación integrado en un
> dispositivo físico, diseñado para realizar funciones específicas con
> restricciones de tamaño, consumo y capacidad de procesamiento.
>
> **Wireframe / Mockup**: Representación visual simplificada de la
> estructura y diseño de una aplicación o página web, utilizada durante
> las fases de diseño y prototipado.

# Contenido

# 

[Resumen 3](#resumen)

[Abstract 4](#abstract)

[Glosario 5](#glosario)

[Índice de figuras 12](#índice-de-figuras)

[Índice de tablas 15](#índice-de-tablas)

1.  [Introducción 16](#introducción)

2.  [Objeto del proyecto 18](#objeto-del-proyecto)

    1.  [Objetivos del sistema 18](#objetivos-del-sistema)

        1.  [Diseñar e implementar una muleta inteligente
            18](#_bookmark9)

        2.  [Comunicar de forma inalámbrica para transmitir los datos
            18](#_bookmark10)

        3.  [Desarrollar la aplicación móvil para pacientes
            19](#_bookmark11)

        4.  [Persistir y gestionar los datos clínicos 19](#_bookmark12)

        5.  [Diseñar, implementar y desplegar una plataforma web para
            profesionales](#_bookmark13) [sanitarios 19](#_bookmark13)

        6.  [Integrar el sistema completo 19](#_bookmark14)

        7.  [Objetivos personales y formativos 20](#_bookmark15)

3.  [Antecedentes 21](#antecedentes)

    1.  [Rehabilitación funcional y carga parcial de peso
        21](#rehabilitación-funcional-y-carga-parcial-de-peso)

    2.  [Limitaciones del seguimiento tradicional en rehabilitación con
        muletas
        21](#limitaciones-del-seguimiento-tradicional-en-rehabilitación-con-muletas)

    3.  [Tendencia hacia la rehabilitación monitorizada y basada en
        datos
        22](#tendencia-hacia-la-rehabilitación-monitorizada-y-basada-en-datos)

    4.  [Necesidad de soluciones accesibles para pacientes y
        profesionales
        sanitarios](#necesidad-de-soluciones-accesibles-para-pacientes-y-profesionales-sanitarios)
        [22](#necesidad-de-soluciones-accesibles-para-pacientes-y-profesionales-sanitarios)

    5.  [Justificación del desarrollo de "Load Crutches"
        23](#justificación-del-desarrollo-de-load-crutches)

4.  [Descripción de la situación actual
    24](#descripción-de-la-situación-actual)

    1.  [Rehabilitación digital y monitorización
        24](#rehabilitación-digital-y-monitorización)

        1.  [Rehabilitación tradicional 24](#_bookmark24)

        2.  [Aparición de dispositivos wearables 25](#_bookmark25)

        3.  [Aplicaciones móviles y plataformas digitales de salud
            26](#_bookmark26)

    2.  [Soluciones existentes y alternativas actuales
        27](#soluciones-existentes-y-alternativas-actuales)

    3.  [Justificación del enfoque adoptado
        29](#justificación-del-enfoque-adoptado)

    4.  [Actores del sistema 29](#actores-del-sistema)

        1.  [Paciente 30](#_bookmark33)

        2.  [Doctor 31](#_bookmark35)

        3.  [Muleta inteligente 31](#_bookmark37)

5.  [Normas y referencias 33](#normas-y-referencias)

    1.  [Métodos de desarrollo 33](#métodos-de-desarrollo)

        1.  [Aplicación y conclusiones del uso de la metodología en el
            desarrollo 34](#_bookmark41)

    2.  [Herramientas 36](#herramientas)

        1.  [Swift UIKit 36](#_bookmark44)

        2.  [TypeScript 38](#_bookmark47)

        3.  [Node.js 39](#_bookmark49)

        4.  [Vue.js 40](#_bookmark51)

        5.  [C 41](#_bookmark53)

        6.  [PostgreSQL 42](#_bookmark54)

        7.  [Git 44](#_bookmark56)

        8.  [Mermaid.js 45](#_bookmark58)

        9.  [PlantUML 45](#_bookmark59)

        10. [Microsoft Excel 46](#_bookmark60)

        11. [EZEstimate 46](#_bookmark61)

        12. [Postman 47](#_bookmark63)

        13. [XAMPP 48](#_bookmark65)

    3.  [Modelado hardware 49](#modelado-hardware)

        1.  [Sistemas embebidos 49](#_bookmark67)

        2.  [Sensores 51](#sensores)

            1.  [Células de carga y galgas extensiométricas
                52](#células-de-carga-y-galgas-extensiométricas)

            2.  [Sensores inerciales y detección de pasos
                53](#sensores-inerciales-y-detección-de-pasos)

        3.  [Bluetooth 54](#bluetooth)

        4.  [Sistemas distribuidos 54](#sistemas-distribuidos)

    4.  [Modelado software 56](#modelado-software)

        1.  [MVC 56](#_bookmark77)

        2.  [MVVM 56](#_bookmark78)

    5.  [Patrones estructurales 57](#patrones-estructurales)

        1.  [Adapter o Wrapper 58](#_bookmark81)

    6.  [Prototipos 58](#prototipos)

        1.  [Storyboards 59](#_bookmark83)

[Storyboard 1: Realización de una sesión de rehabilitación por parte del
paciente.
59](#storyboard-1-realización-de-una-sesión-de-rehabilitación-por-parte-del-paciente)

[Storyboard 2: Seguimiento clínico y configuración del tratamiento por
parte
del](#storyboard-2-seguimiento-clínico-y-configuración-del-tratamiento-por-parte-del-profesional-sanitario)
[profesional sanitario
60](#storyboard-2-seguimiento-clínico-y-configuración-del-tratamiento-por-parte-del-profesional-sanitario)

2.  [Prototipado 61](#_bookmark88)

[Prototipo de baja fidelidad - Mockup - Web
61](#prototipo-de-baja-fidelidad---mockup---web)

[Vista de inicio de sesión 62](#vista-de-inicio-de-sesión)

[Vista de registro 62](#vista-de-registro)

[Vista principal 63](#vista-principal)

[Vista de gestión de paciente 64](#vista-de-gestión-de-paciente)

[Vista de gestión de patologías 65](#vista-de-gestión-de-patologías)

[Vista de gestión de consejos 66](#vista-de-gestión-de-consejos)

[Vista de chat 67](#vista-de-chat)

[Vistas de sesiones 68](#vistas-de-sesiones)

[Vista de configuración 70](#vista-de-configuración)

1.  [Tipografía y colores (Web) 71](#_bookmark110)

[Prototipo de baja fidelidad -- Mockup -- App
73](#prototipo-de-baja-fidelidad-mockup-app)

[Vista de iniciar sesión 74](#vista-de-iniciar-sesión)

[Vista de inicio 74](#vista-de-inicio)

[Vista para realizar sesión 76](#vista-para-realizar-sesión)

[Vista de Bluetooth 77](#vista-de-bluetooth)

[Vista de pasos 80](#vista-de-pasos)

[Vista de consejos 82](#vista-de-consejos)

[Vista de chat 83](#vista-de-chat-1)

[Vista de perfil 84](#vista-de-perfil)

2.  [Tipografía y colores (App) 85](#_bookmark133)

<!-- -->

7.  [Métricas 87](#métricas)

    1.  [Métricas funcionales 87](#_bookmark137)

[Métricas asociadas al paciente durante la rehabilitación
87](#métricas-asociadas-al-paciente-durante-la-rehabilitación)

[Métricas funcionales para el profesional sanitario
88](#métricas-funcionales-para-el-profesional-sanitario)

[Métricas de interacción y comunicación
89](#métricas-de-interacción-y-comunicación)

2.  [Métricas técnicas 89](#_bookmark141)

[Métricas técnicas asociadas al hardware de la muleta
89](#métricas-técnicas-asociadas-al-hardware-de-la-muleta)

[Métricas técnicas de comunicación Bluetooth
90](#métricas-técnicas-de-comunicación-bluetooth)

[Métricas técnicas del backend 90](#_bookmark144)

3.  [Métricas de validación 91](#_bookmark145)

[Validación funcional del sistema 91](#validación-funcional-del-sistema)

[Validación de coherencia de los datos
92](#validación-de-coherencia-de-los-datos)

[Validación de utilidad clínica percibida
92](#validación-de-utilidad-clínica-percibida)

[Validación de la integración de subsistemas
92](#validación-de-la-integración-de-subsistemas)

[Validación global del sistema 93](#validación-global-del-sistema)

6.  [Requisitos iniciales 94](#requisitos-iniciales)

    1.  [Objetivos funcionales 94](#objetivos-funcionales)

    2.  [Requisitos funcionales 97](#requisitos-funcionales)

        1.  [Gestión de acceso 98](#_bookmark158)

        2.  [Rehabilitación 99](#_bookmark160)

        3.  [Gestión clínica 100](#_bookmark162)

        4.  [Comunicación y gestión de consejos 101](#_bookmark164)

7.  [Hipótesis, restricciones y alcance
    103](#hipótesis-restricciones-y-alcance)

    1.  [Hipótesis de partida 103](#hipótesis-de-partida)

    2.  [Restricciones del proyecto 104](#restricciones-del-proyecto)

        1.  [Seguridad y privacidad de los datos médicos
            104](#_bookmark169)

        2.  [Eficiencia y procesamiento en tiempo real
            105](#_bookmark170)

        3.  [Usabilidad e interfaz de usuario 105](#_bookmark171)

        4.  [Disponibilidad y conectividad del hardware
            106](#_bookmark172)

    3.  [Alcance del trabajo 106](#alcance-del-trabajo)

    4.  [Impacto esperado 107](#impacto-esperado)

8.  [Estudio de alternativas y viabilidad
    108](#estudio-de-alternativas-y-viabilidad)

    1.  [Análisis de alternativas tecnológicas
        108](#análisis-de-alternativas-tecnológicas)

[Backend 108](#_bookmark177)

[Arquitectura de la API y modelo de comunicación 109](#_bookmark178)

[Comunicación en tiempo real 110](#_bookmark179)

[Base de datos 111](#_bookmark180)

[Aplicación móvil 112](#_bookmark181)

[Frontend web 112](#_bookmark182)

9.  [Descripción de solución propuesta
    114](#descripción-de-solución-propuesta)

    1.  [Panel web Doctor 114](#panel-web-doctor)

        1.  [Dashboard 115](#_bookmark186)

        2.  [Gestión de pacientes 116](#_bookmark189)

        3.  [Gestión de patologías y consejos 118](#_bookmark193)

        4.  [Comunicación y seguimiento 120](#_bookmark198)

        5.  [Análisis de sesiones de rehabilitación 121](#_bookmark200)

    2.  [Aplicación móvil pacientes 125](#aplicación-móvil-pacientes)

        1.  [Sesión de rehabilitación 126](#_bookmark206)

        2.  [Conexión Bluetooth con la muleta 127](#_bookmark209)

        3.  [Estadísticas y consejos 128](#_bookmark211)

        4.  [Comunicación con doctor 131](#_bookmark216)

        5.  [Perfil 131](#_bookmark218)

    3.  [Despliegue del sistema 132](#despliegue-del-sistema)

    4.  [Video demostrativo 135](#video-demostrativo)

10. [Análisis de riesgos 136](#análisis-de-riesgos)

    1.  [Matriz de riesgos 136](#matriz-de-riesgos)

[Criterios de evaluación 136](#_bookmark228)

2.  [Análisis DAFO 137](#análisis-dafo)

    1.  [Debilidades 137](#_bookmark231)

    2.  [Amenazas 138](#_bookmark232)

    3.  [Fortalezas 138](#_bookmark233)

    4.  [Oportunidades 139](#_bookmark234)

3.  [Registro de riesgos 139](#registro-de-riesgos)

<!-- -->

11. [Organización y gestión del proyecto
    141](#organización-y-gestión-del-proyecto)

    1.  [Arquitectura del sistema 141](#arquitectura-del-sistema)

        1.  [Componentes del sistema 142](#_bookmark240)

[Aspectos relevantes asociados al backend 142](#_bookmark241)

[Aspectos relevantes asociados al frontend 143](#_bookmark242)

[Aspectos relevantes asociados a la aplicación móvil 145](#_bookmark243)

[Aspectos relevantes asociados a la base de datos 146](#_bookmark244)

[Aspectos relevantes asociados al hardware 148](#_bookmark246)

2.  [Descripción del desarrollo 149](#_bookmark247)

3.  [Descripción de las pruebas 151](#_bookmark248)

<!-- -->

2.  [Gestión del proyecto 152](#gestión-del-proyecto)

    1.  [Recursos humanos y colaboraciones 153](#_bookmark250)

    2.  [Recursos humanos y colaboraciones 153](#_bookmark251)

    3.  [Planificación temporal 154](#_bookmark252)

<!-- -->

12. [Conclusiones y trabajo futuro 164](#conclusiones-y-trabajo-futuro)

    1.  [Conclusiones 164](#conclusiones)

    2.  [Líneas de trabajo futuro 165](#líneas-de-trabajo-futuro)

[Bibliografía 167](#bibliografía)

# Índice de figuras

> [Ilustración 1: Esquema del flujo de funcionamiento del sistema
> 17](#_bookmark6)
>
> [Ilustración 2: Cinta de correr instrumentada con plataforma de fuerza
> de AMTI 27](#_bookmark28)
>
> [Ilustración 3: Plantillas instrumentadas de Moticon 28](#_bookmark29)
>
> [Ilustración 4: Representación del diagrama de casos de uso general
> 30](#_bookmark32)
>
> [Ilustración 5: Storyboard de "Load Crutches" 37](#_bookmark45)
>
> [Ilustración 6: Fragmento de código Swift 38](#_bookmark46)
>
> [Ilustración 7: Fragmento de código Typescript 39](#_bookmark48)
>
> [Ilustración 8: Captura del comando npm run dev 40](#_bookmark50)
>
> [Ilustración 9: Fragmento de un template hecho con Vue.js
> 41](#_bookmark52)
>
> [Ilustración 10: Tablas de la base de datos MySQL de "Load Crutches"
> 43](#_bookmark55)
>
> [Ilustración 11: Repositorio de Git de la aplicación iOS
> 44](#_bookmark57)
>
> [Ilustración 12: Resultado de la estimación del proyecto con
> EZEstimate 47](#_bookmark62)
>
> [Ilustración 13: Colección de Postman del proyecto 48](#_bookmark64)
>
> [Ilustración 14: Muleta instrumentada 50](#_bookmark68)
>
> [Ilustración 15: Esquema galga estequiométrica 53](#_bookmark71)
>
> [Ilustración 16: Esquema de la muleta 55](#_bookmark75)
>
> [Ilustración 17: MVVM en "Load Crutches" 57](#_bookmark79)
>
> [Ilustración 18: Storyboard de la realización de una sesión de
> rehabilitación por parte del](#_bookmark85) [paciente
> 60](#_bookmark85)
>
> [Ilustración 19: Storyboard de seguimiento clínico y configuración del
> tratamiento por](#_bookmark87) [parte del profesional sanitario
> 61](#_bookmark87)
>
> [Ilustración 20: Vista de la pantalla de inicio de sesión doctor
> 62](#_bookmark91)
>
> [Ilustración 21: Vista de la pantalla de registro de doctor
> 63](#_bookmark93)
>
> [Ilustración 22: Vista de principal 64](#_bookmark95)
>
> [Ilustración 23: Vista de pacientes 65](#_bookmark97)
>
> [Ilustración 24: Vista de gestión de patologías 66](#_bookmark99)
>
> [Ilustración 25: Vista de gestión de consejos 67](#_bookmark101)
>
> [Ilustración 26: Vista de Chat 68](#_bookmark103)
>
> [Ilustración 27: Vista de sesiones 69](#_bookmark105)
>
> [Ilustración 28: Vista de detalle de sesiones 70](#_bookmark106)
>
> [Ilustración 29: Vista de detalles de microsesiones 70](#_bookmark107)
>
> [Ilustración 30: Vista de configuración 71](#_bookmark109)
>
> [Ilustración 31: Muestra de caracteres de la tipografía Inter
> 72](#_bookmark111)
>
> [Ilustración 32: Paleta de colores utilizada en la aplicación web
> 73](#_bookmark112)
>
> [Ilustración 33: Paleta de colores utilizada en la base de la
> aplicación web 73](#_bookmark113)
>
> [Ilustración 34: Vista de la pantalla de inicio de sesión
> 74](#_bookmark116)
>
> [Ilustración 35: Vista de inicio 75](#_bookmark118)
>
> [Ilustración 36: Vista de realizar sesión 77](#_bookmark120)
>
> [Ilustración 37: Vista de Bluetooth 78](#_bookmark122)
>
> [Ilustración 38: Vista de estadísticas 79](#_bookmark123)
>
> [Ilustración 39: Vista de sesiones 80](#_bookmark124)
>
> [Ilustración 40: Vista de consejos 81](#_bookmark126)
>
> [Ilustración 41: Vista de consejos 82](#_bookmark128)
>
> [Ilustración 42: Vista de chat 83](#_bookmark130)
>
> [Ilustración 43: Vista de perfil 85](#_bookmark132)
>
> [Ilustración 44: Muestra de caracteres de la tipografía SF
> 86](#_bookmark134)
>
> [Ilustración 45: Paleta de colores utilizada en la base de la
> aplicación móvil 87](#_bookmark135)
>
> [Ilustración 46: Diagrama de casos de uso del paquete "Gestión de
> acceso" 99](#_bookmark159)
>
> [Ilustración 47: Diagrama de casos de uso del paquete "Rehabilitación"
> 100](#_bookmark161)
>
> [Ilustración 48: Diagrama de casos de uso del paquete "Gestión clínica
> (web doctor)"101](#_bookmark163)
>
> [Ilustración 49: Diagrama de casos de uso del paquete "Comunicación y
> gestión de](#_bookmark165) [consejos" 102](#_bookmark165)
>
> [Ilustración 50: Iniciar sesión 115](#_bookmark185)
>
> [Ilustración 51: Dashboard 116](#_bookmark187)
>
> [Ilustración 52: Dashboard modo oscuro 116](#_bookmark188)
>
> [Ilustración 53: Gestión de pacientes 117](#_bookmark190)
>
> [Ilustración 54: Añadir paciente 117](#_bookmark191)
>
> [Ilustración 55: Ficha paciente 118](#_bookmark192)
>
> [Ilustración 56: Gestión de patologías 119](#_bookmark194)
>
> [Ilustración 57: Añadir patología 119](#_bookmark195)
>
> [Ilustración 58: Gestión de consejos 120](#_bookmark196)
>
> [Ilustración 59: Añadir consejo 120](#_bookmark197)
>
> [Ilustración 60: Chat paciente 121](#_bookmark199)
>
> [Ilustración 61: Gestión de sesiones 122](#_bookmark201)
>
> [Ilustración 62: Historial de sesiones de paciente 123](#_bookmark202)
>
> [Ilustración 63: Detalles de la sesión 124](#_bookmark203)
>
> [Ilustración 64: Inicio de sesión en varios dispositivos
> 126](#_bookmark205)
>
> [Ilustración 65: Pantalla de inicio (sesión de rehabilitación)
> 126](#_bookmark207)
>
> [Ilustración 66: pantalla sesión de rehabilitación 127](#_bookmark208)
>
> [Ilustración 67: Pantalla de conexión bluetooth 128](#_bookmark210)
>
> [Ilustración 68: Pantalla de estadísticas 129](#_bookmark212)
>
> [Ilustración 69: Estadísticas de pesos 129](#_bookmark213)
>
> [Ilustración 70: Estadísticas de pasos 130](#_bookmark214)
>
> [Ilustración 71: Avisos 130](#_bookmark215)
>
> [Ilustración 72: Chat 131](#_bookmark217)
>
> [Ilustración 73: Perfil 132](#_bookmark219)
>
> [Ilustración 74: XAMPP 133](#_bookmark221)
>
> [Ilustración 75: phpMyAdmin 133](#_bookmark222)
>
> [Ilustración 76: Xcode 134](#_bookmark223)
>
> [Ilustración 77: Definición diagrama de despliegue 135](#_bookmark224)
>
> [Ilustración 78: Matriz de riesgos 137](#_bookmark229)
>
> [Ilustración 79: Arquitectura por componentes del sistema
> 142](#_bookmark239)
>
> [Ilustración 80: Estructura de la base de datos 147](#_bookmark245)
>
> [Ilustración 81: Diagrama de Gantt fase Inicio - Iteración 1
> 156](#_bookmark254)
>
> [Ilustración 82: Diagrama de Gantt fase Inicio - Iteración 2
> 157](#_bookmark255)
>
> [Ilustración 83: Diagrama de Gantt fase Elaboración - Iteración 1
> 158](#_bookmark256)
>
> [Ilustración 84: Diagrama de Gantt fase Elaboración - Iteración 2
> 159](#_bookmark257)
>
> [Ilustración 85: Diagrama de Gantt fase Construcción - Iteración 1
> 160](#_bookmark258)
>
> [Ilustración 86: Diagrama de Gantt fase Construcción - Iteración 2
> 161](#_bookmark259)
>
> [Ilustración 87: Diagrama de Gantt fase Transición - Iteración 1
> 162](#_bookmark260)
>
> [Ilustración 88: Diagrama de Gantt fase Transición - Iteración 2
> 163](#_bookmark261)

# Índice de tablas

> [Tabla 1: Especificación del actor ACT-01: Paciente 30](#_bookmark34)
>
> [Tabla 2: Especificación del actor ACT-02: Doctor 31](#_bookmark36)
>
> [Tabla 3: Especificación del actor ACT-03: Muleta inteligente
> 31](#_bookmark38)
>
> [Tabla 4: Descripción de las iteraciones de las fases del proyecto
> 34](#_bookmark42)
>
> [Tabla 5: Especificación del objetivo OBJ-0001: Gestionar usuarios y
> seguridad 94](#_bookmark153)
>
> [Tabla 6: Especificación del objetivo OBJ-0002: Integrar muleta
> inteligente y gestionar](#_bookmark154) [monitorización biomédica
> 95](#_bookmark154)
>
> [Tabla 7: Especificación del objetivo OBJ-0003: Definir trazabilidad
> clínica y visual de](#_bookmark155) [rehabilitación 95](#_bookmark155)
>
> [Tabla 8: Especificación del objetivo OBJ-0004: Personalizar
> tratamiento paciente 96](#_bookmark156)
>
> [Tabla 9: Registro de riesgos 139](#_bookmark236)
>
> [Tabla 10: Asignación de tiempos a las distintas iteraciones
> 155](#_bookmark253)

# Introducción

> En el ámbito de la rehabilitación clínica, especialmente en pacientes
> con lesiones en miembros inferiores, el uso de muletas constituye una
> herramienta fundamental para facilitar la movilidad y favorecer la
> recuperación progresiva. No obstante, el correcto uso de este tipo de
> ayudas técnicas depende en gran medida del cumplimiento de las pautas
> establecidas por el profesional sanitario, tales como la carga máxima
> permitida o el número de apoyos recomendados. En la práctica clínica
> habitual, el control de estos parámetros se realiza de forma
> subjetiva, basándose en la percepción del paciente y en revisiones
> periódicas, lo que dificulta un seguimiento preciso y continuo del
> proceso de rehabilitación.
>
> La motivación principal para la realización de este proyecto surge de
> la necesidad de mejorar el seguimiento objetivo del proceso de
> rehabilitación, reduciendo la dependencia de la percepción subjetiva
> del paciente y facilitando al profesional sanitario herramientas
> basadas en datos reales para la toma de decisiones clínicas.
>
> El contexto social y tecnológico actual, caracterizado por una
> creciente digitalización del ámbito sanitario y por la integración de
> sistemas inteligentes en dispositivos de uso cotidiano, ha impulsado
> el desarrollo de soluciones orientadas a la monitorización objetiva
> del estado y comportamiento del paciente. En este escenario surge la
> necesidad de diseñar sistemas capaces de recopilar datos reales de
> uso, analizarlos y ponerlos a disposición tanto del paciente como del
> profesional sanitario de manera accesible y comprensible.
>
> En este sentido, "Load Crutches" plantea una solución integral basada
> en la combinación de hardware y software, cuyo objetivo es monitorizar
> el uso de una muleta durante el proceso de rehabilitación. El sistema
> se apoya en una muleta inteligente equipada con sensores de carga y
> movimiento, capaces de medir el peso aplicado en cada apoyo y detectar
> los pasos realizados por el usuario. Estos datos son enviados mediante
> comunicación Bluetooth de bajo consumo a una aplicación móvil
> orientada al paciente, que actúa como interfaz principal de
> visualización, seguimiento y comunicación.
>
> Adicionalmente, el sistema incorpora una plataforma web destinada a
> profesionales sanitarios, desde la cual es posible gestionar
> pacientes, configurar límites personalizados de carga y pasos, asignar
> recomendaciones y analizar la evolución del paciente a partir de los
> datos recogidos. Todo el ecosistema se completa con un *backend* que
> centraliza la información, garantiza su persistencia y facilita la
> comunicación entre los distintos componentes del sistema.
>
> El flujo general de funcionamiento de "Load Crutches" comienza en el
> hardware de la muleta, que actúa como fuente primaria de datos
> biomecánicos. Estos datos se transmiten a la aplicación móvil, donde
> son procesados y mostrados al paciente, y posteriormente se
> sincronizan con el *backend* para su análisis y consulta desde la
> plataforma web. Este flujo permite un seguimiento continuo, objetivo y
> remoto del proceso de rehabilitación, mejorando la toma de decisiones
> clínicas y fomentando una mayor adherencia terapéutica por parte del
> paciente.
>
> Existen actualmente distintas soluciones tecnológicas orientadas a la
> monitorización de la actividad física y la rehabilitación, como
> dispositivos wearables o aplicaciones móviles, aunque muchas de ellas
> no permiten un control específico y objetivo del uso de muletas
> durante la marcha.
>
> La [Ilustración 1](#_bookmark6) muestra de forma esquemática el flujo
> de funcionamiento del sistema "Load Crutches", desde la captura de
> datos en la muleta hasta su visualización y gestión en las distintas
> interfaces del sistema.

![](memoria_referencia/media/image2.jpeg){width="5.769648950131233in"
height="2.92875in"}

> []{#_bookmark6 .anchor}Ilustración 1: Esquema del flujo de
> funcionamiento del sistema
>
> El presente documento constituye la memoria del Trabajo de Fin de
> Grado titulado "Load Crutches: Sistema inteligente de monitorización
> para rehabilitación asistida con muletas", desarrollado para la
> obtención del correspondiente título universitario. La memoria se
> estructura en varias secciones: en primer lugar, se presentan los
> objetivos del proyecto; a continuación, se describen los conceptos
> teóricos necesarios para su comprensión; posteriormente, se detallan
> las tecnologías y herramientas empleadas; seguidamente, se expone el
> desarrollo del sistema y las decisiones de diseño adoptadas; y
> finalmente, se recogen las conclusiones obtenidas, junto con una
> valoración de los resultados y posibles líneas de mejora futura.
>
> La presente memoria se acompaña de varios anexos que amplían y
> detallan la información presentada en el documento principal. El Anexo
> I recoge las especificaciones del sistema, incluyendo los requisitos
> definidos para el proyecto. En el Anexo II se desarrolla el análisis y
> diseño del sistema, mientras que el Anexo III documenta la estimación
> del tamaño y esfuerzo del proyecto, así como la planificación
> asociada. El Anexo IV está dedicado al plan de seguridad del sistema.
> Por último, el Anexo V incluye los manuales de usuario de las
> aplicaciones desarrolladas y el Anexo V.2 recoge la documentación
> relativa a la muleta parametrizada utilizada en el sistema.

# Objeto del proyecto

> En este apartado se describen los objetivos que se marcaron al inicio
> del proyecto "Load Crutches" y que han guiado el desarrollo del
> sistema, así como una breve mención a los objetivos de carácter
> personal y formativo asociados al Trabajo de Fin de Grado.

## Objetivos del sistema

> El objetivo principal de este proyecto es diseñar e implementar un
> sistema integral de rehabilitación basado en una muleta inteligente,
> capaz de medir de forma objetiva el uso real de la muleta por parte
> del paciente, procesar dicha información y ponerla a disposición tanto
> del propio usuario como del profesional sanitario.
>
> El sistema desarrollado combina hardware, aplicación móvil, *backend*
> y plataforma web, permitiendo capturar datos biomecánicos durante la
> marcha, analizarlos y utilizarlos como apoyo en el seguimiento clínico
> del proceso de recuperación.
>
> Para alcanzar este objetivo principal, se han definido una serie de
> objetivos específicos que, en conjunto, han permitido obtener una
> solución funcional y coherente. A continuación, se detallan los
> objetivos específicos del sistema de forma progresiva:

1.  []{#_bookmark9 .anchor}Diseñar e implementar una muleta inteligente

> Diseñar e integrar un sistema hardware embebido en una muleta
> convencional que permita:

- Medir la carga aplicada en cada apoyo mediante un sensor de fuerza.

- Detectar eventos de paso y movimiento durante el uso de la muleta.

- Garantizar robustez, ergonomía y fiabilidad para un uso cotidiano en
  entornos reales de rehabilitación.

> El hardware actúa como la fuente primaria de datos, capturando
> información biomecánica objetiva que no puede obtenerse mediante
> observación clínica tradicional.

1.  []{#_bookmark10 .anchor}Comunicar de forma inalámbrica para
    transmitir los datos

> Implementar un sistema de comunicación basado en BLE (*Bluetooth Low
> Energy*) que permita:

- Enviar los datos capturados por la muleta a una aplicación móvil de
  forma periódica.

- Transmitir información estructurada sobre peso, pasos, batería,
  alertas y marcas temporales.

- Garantizar un consumo energético reducido y una experiencia de uso
  transparente para el paciente.

  1.  []{#_bookmark11 .anchor}Desarrollar la aplicación móvil para
      pacientes

> Diseñar e implementar una aplicación móvil que actúe como
> intermediaria entre el hardware y el *backend*, permitiendo al
> paciente:

- Visualizar datos de uso de la muleta en tiempo real o de forma
  histórica.

- Recibir avisos y notificaciones relacionadas con el proceso de
  rehabilitación.

- Comunicarse con el profesional sanitario mediante un sistema de
  mensajería.

- Gestionar su perfil personal y la configuración básica del sistema.

  1.  []{#_bookmark12 .anchor}Persistir y gestionar los datos clínicos
      Desarrollar un *backend* centralizado capaz de:

<!-- -->

- Almacenar de forma persistente los datos generados por la muleta.

- Gestionar usuarios, sesiones, avisos y consejos terapéuticos.

- Garantizar la integridad, confidencialidad y trazabilidad de la
  información, cumpliendo con la normativa de protección de datos
  (RGPD).

> El sistema sigue un modelo CRUD (*Create, Read, Update, Delete*) para
> la gestión de la información clínica y administrativa, facilitando su
> mantenimiento y escalabilidad.

1.  []{#_bookmark13 .anchor}Diseñar, implementar y desplegar una
    plataforma web para profesionales sanitarios

> Diseñar una plataforma web orientada al personal sanitario que
> permita:

- Consultar el historial de uso de la muleta de cada paciente.

- Analizar métricas objetivas sobre carga, frecuencia de pasos y
  evolución temporal.

- Gestionar patologías, consejos y avisos personalizados.

- Facilitar la toma de decisiones clínicas basadas en datos reales y
  continuos.

  1.  []{#_bookmark14 .anchor}Integrar el sistema completo

> Lograr una integración coherente entre todos los componentes del
> sistema:

- Muleta inteligente (hardware).

- Aplicación móvil (paciente).

- *Backend* (lógica y almacenamiento).

- Plataforma web (profesional sanitario).

> Esta integración permite que "Load Crutches" funcione como un
> ecosistema completo de apoyo a la rehabilitación, donde cada
> componente cumple un rol claramente definido.

1.  []{#_bookmark15 .anchor}Objetivos personales y formativos

> Desde el punto de vista académico y personal, este proyecto ha tenido
> como objetivos:

- Aplicar de forma práctica conocimientos adquiridos durante el grado en
  áreas como sistemas embebidos, comunicaciones, desarrollo de
  aplicaciones y arquitectura software.

- Realizar el diseño de un sistema real, multidisciplinar y orientado al
  ámbito sanitario.

- Desarrollar capacidades de análisis, diseño, documentación técnica y
  toma de decisiones.

- Obtener una visión global del ciclo completo de desarrollo de un
  producto tecnológico, desde el hardware hasta la experiencia de
  usuario final.

# Antecedentes

> El uso de muletas constituye una de las ayudas técnicas más habituales
> en los procesos de rehabilitación funcional tras lesiones
> musculoesqueléticas, intervenciones quirúrgicas o patologías que
> afectan a la movilidad del miembro inferior. Su finalidad principal es
> permitir la descarga parcial o total del peso corporal sobre una
> extremidad lesionada, facilitando la deambulación del paciente durante
> las distintas fases de recuperación. Sin embargo, pese a su uso
> extendido y a su importancia clínica, el seguimiento del uso correcto
> de las muletas sigue basándose, en la mayoría de los casos, en
> indicaciones subjetivas y en la percepción individual del paciente y
> del profesional sanitario.

## Rehabilitación funcional y carga parcial de peso

> En numerosos procesos de rehabilitación, especialmente tras cirugías
> ortopédicas (fracturas, prótesis, reconstrucciones de ligamentos o
> intervenciones articulares), se prescribe una carga parcial controlada
> durante la marcha. El objetivo de esta pauta es estimular la
> recuperación progresiva del tejido sin provocar sobrecargas que puedan
> comprometer la evolución clínica o generar recaídas.
>
> Diversos estudios en el ámbito de la fisioterapia y la traumatología
> señalan que uno de los principales problemas durante estas fases es la
> dificultad del paciente para interpretar y aplicar correctamente la
> carga prescrita. Indicaciones como "apoyar un 30 % del peso corporal"
> o "cargar lo mínimo posible" resultan abstractas y difíciles de
> traducir a una acción motora concreta durante la marcha diaria. Como
> consecuencia, es frecuente que el paciente:

- Sobrecargue la extremidad lesionada por exceso de confianza o
  desconocimiento.

- Descargue en exceso, ralentizando la recuperación funcional.

- Aplique patrones de marcha incorrectos que pueden derivar en
  compensaciones musculares y nuevas lesiones.

> Esta problemática se ve agravada fuera del entorno clínico, donde el
> profesional sanitario no puede supervisar directamente la ejecución
> del ejercicio terapéutico.

## Limitaciones del seguimiento tradicional en rehabilitación con muletas

> El seguimiento convencional del proceso de rehabilitación con muletas
> se apoya principalmente en:

- Revisiones periódicas en consulta.

- Observación directa de la marcha durante sesiones presenciales.

- Declaraciones subjetivas del paciente sobre su evolución y
  sensaciones.

> Este enfoque presenta limitaciones importantes. En primer lugar, la
> información obtenida es puntual y no continua, lo que impide conocer
> cómo se comporta el paciente durante su actividad diaria real. En
> segundo lugar, depende en gran medida de la percepción
>
> subjetiva, tanto del paciente como del profesional, lo que introduce
> un alto grado de variabilidad y dificulta la toma de decisiones basada
> en datos objetivos.
>
> Además, el aumento de la carga asistencial en los sistemas sanitarios
> y la reducción del tiempo disponible por paciente limitan la
> posibilidad de realizar un seguimiento exhaustivo y personalizado,
> especialmente en procesos de rehabilitación prolongados.

## Tendencia hacia la rehabilitación monitorizada y basada en datos

> En los últimos años, el ámbito de la rehabilitación ha experimentado
> un creciente interés por la incorporación de tecnologías que permitan
> objetivar el proceso terapéutico. La utilización de sensores,
> dispositivos portables y sistemas de monitorización remota ha
> demostrado ser una herramienta eficaz para mejorar el control de la
> evolución del paciente, aumentar la adherencia al tratamiento y
> facilitar la toma de decisiones clínicas fundamentadas en datos.
>
> En este contexto, la monitorización de variables como la carga
> aplicada, la frecuencia de uso de ayudas técnicas o la detección de
> patrones de marcha anómalos se considera especialmente relevante.
> Estos datos permiten evaluar de forma cuantitativa si el paciente
> sigue las pautas prescritas y detectar desviaciones que puedan
> requerir una intervención temprana.
>
> Sin embargo, muchas de las soluciones existentes se centran en
> dispositivos complejos, costosos o poco integrados en la práctica
> clínica habitual, lo que limita su adopción generalizada. Además, en
> numerosos casos, la información generada no se presenta de forma clara
> ni adaptada a las necesidades reales del paciente y del profesional
> sanitario.

## Necesidad de soluciones accesibles para pacientes y profesionales sanitarios

> La problemática descrita pone de manifiesto la necesidad de
> desarrollar sistemas que permitan:

- Monitorizar de forma objetiva el uso de muletas durante la
  rehabilitación.

- Facilitar al paciente información clara y comprensible sobre su
  comportamiento.

- Proporcionar al profesional sanitario herramientas de seguimiento
  remoto y análisis de la evolución.

- Integrarse de manera natural en el flujo de trabajo clínico sin añadir
  complejidad innecesaria.

> En este sentido, una muleta instrumentada, capaz de registrar datos de
> carga y uso, combinada con aplicaciones software orientadas tanto al
> paciente como al profesional, representa una oportunidad para mejorar
> la calidad del proceso rehabilitador. Este tipo de enfoque permite
> transformar un elemento pasivo, como es la muleta tradicional, en una
> fuente activa de información clínica relevante.

## Justificación del desarrollo de "Load Crutches"

> El proyecto "Load Crutches" surge como respuesta a las limitaciones
> identificadas en los métodos tradicionales de rehabilitación con
> muletas y a la necesidad de introducir mecanismos de seguimiento
> objetivo y continuo. A partir de la colaboración con el ámbito
> universitario y clínico, y apoyándose en la experiencia acumulada en
> el desarrollo de prototipos de muletas instrumentadas, el sistema
> plantea una solución integral que conecta el dispositivo físico con
> aplicaciones software orientadas a distintos perfiles de usuario.
>
> Desde el punto de vista conceptual, "Load Crutches" se apoya en la
> idea de que la rehabilitación puede beneficiarse de la recopilación y
> análisis sistemático de datos biomecánicos simples, pero clínicamente
> significativos. La posibilidad de registrar el peso aplicado en cada
> apoyo y los eventos de paso permite disponer de una visión más precisa
> del comportamiento del paciente, tanto durante sesiones concretas como
> a lo largo del tiempo.
>
> En consecuencia, este proyecto se enmarca dentro de la tendencia hacia
> una rehabilitación más personalizada, basada en datos y apoyada por
> tecnologías accesibles, contribuyendo a reducir la brecha existente
> entre la prescripción clínica y la ejecución real del tratamiento por
> parte del paciente.

# Descripción de la situación actual

> En este apartado se describe el estado actual del ámbito en el que se
> enmarca el proyecto "Load Crutches", abordando la evolución de las
> soluciones existentes relacionadas con la rehabilitación funcional, la
> monitorización del paciente y el uso de tecnologías digitales
> aplicadas a la salud. El objetivo es contextualizar el trabajo dentro
> del panorama actual, identificar las limitaciones de las soluciones
> existentes y justificar la necesidad y el enfoque adoptado en el
> desarrollo del TFG.
>
> Dado que "Load Crutches" se sitúa en la intersección entre
> rehabilitación clínica, dispositivos físicos de apoyo y sistemas
> digitales de seguimiento, resulta necesario analizar tanto la
> evolución histórica de la rehabilitación tradicional como la aparición
> progresiva de herramientas tecnológicas orientadas a la monitorización
> del movimiento y la salud.

## Rehabilitación digital y monitorización

> La rehabilitación funcional ha experimentado en los últimos años una
> evolución significativa impulsada por la incorporación de tecnologías
> digitales en el ámbito sanitario. Tradicionalmente, los procesos de
> rehabilitación se han basado en la supervisión presencial del paciente
> y en la evaluación subjetiva del cumplimiento de las pautas
> terapéuticas, lo que limita la capacidad de realizar un seguimiento
> continuo y preciso fuera del entorno clínico.
>
> La progresiva digitalización de la salud ha favorecido la aparición de
> soluciones orientadas a la monitorización remota del paciente,
> permitiendo la recogida sistemática de datos relacionados con la
> actividad física, el movimiento y determinados parámetros
> biomecánicos. Estas soluciones facilitan el seguimiento del proceso de
> recuperación en contextos cotidianos, proporcionando información
> objetiva que complementa la evaluación clínica tradicional.
>
> En este contexto, los dispositivos de monitorización, como sensores
> portables y sistemas embebidos, desempeñan un papel clave al permitir
> la captura automática de datos durante la realización de actividades
> funcionales. La información recogida puede ser procesada y analizada
> para identificar patrones de uso, detectar desviaciones respecto a las
> pautas establecidas y generar métricas de interés clínico. Este
> enfoque contribuye a mejorar la adherencia terapéutica y a optimizar
> la toma de decisiones por parte del personal sanitario.
>
> La integración de plataformas digitales, aplicaciones móviles y
> sistemas *backend* ha ampliado las posibilidades de la rehabilitación
> digital, permitiendo no solo la visualización de datos en tiempo real,
> sino también el almacenamiento histórico de la información y su
> análisis longitudinal. De este modo, la monitorización deja de ser un
> proceso puntual para convertirse en una herramienta continua de apoyo
> al tratamiento, favoreciendo un seguimiento más personalizado y basado
> en datos objetivos.

1.  []{#_bookmark24 .anchor}Rehabilitación tradicional

> Históricamente, los procesos de rehabilitación funcional han estado
> basados en un modelo presencial y manual, en el que el seguimiento del
> paciente dependía casi
>
> exclusivamente de la observación directa del profesional sanitario y
> de la comunicación verbal con el propio paciente. En el caso concreto
> del uso de muletas, la prescripción clínica se apoyaba en indicaciones
> generales sobre la carga permitida, el número de apoyos o la duración
> del uso, sin disponer de mecanismos objetivos para verificar el
> cumplimiento de dichas pautas fuera del entorno clínico.
>
> Este enfoque tradicional presenta varias limitaciones. En primer
> lugar, el control del proceso rehabilitador se limita a momentos
> puntuales, como las sesiones de fisioterapia o las revisiones médicas.
> En segundo lugar, la evaluación del progreso del paciente se basa en
> gran medida en la experiencia del profesional y en la percepción
> subjetiva del propio paciente, lo que dificulta la detección temprana
> de desviaciones respecto al tratamiento prescrito. Finalmente, este
> modelo no permite recoger información continua sobre el comportamiento
> real del paciente en su entorno cotidiano, donde se produce la mayor
> parte de la actividad funcional.
>
> A pesar de estas limitaciones, la rehabilitación tradicional sigue
> siendo el modelo predominante en muchos sistemas sanitarios,
> principalmente por su simplicidad, su bajo coste tecnológico y la
> falta histórica de alternativas accesibles y fiables.

2.  []{#_bookmark25 .anchor}Aparición de dispositivos wearables

> Con el avance de la tecnología y la progresiva miniaturización de los
> componentes electrónicos, comenzaron a desarrollarse dispositivos
> portables o wearables orientados a la monitorización continua de
> variables fisiológicas y de movimiento. En una primera etapa, estos
> dispositivos se centraron en parámetros generales como la frecuencia
> cardíaca, el número de pasos, la distancia recorrida o el gasto
> energético, popularizándose principalmente en el ámbito del deporte y
> la actividad física.
>
> Ejemplos representativos de esta primera generación de wearables son
> pulseras y relojes inteligentes como Fitbit, Garmin o Apple Watch, que
> incorporan sensores ópticos de frecuencia cardíaca, acelerómetros y
> giroscopios. Estos dispositivos permitieron por primera vez el
> seguimiento continuo de la actividad diaria del usuario, fomentando
> hábitos saludables y proporcionando métricas accesibles al público
> general.
>
> El uso de wearables evolucionó hacia la salud con sistemas avanzados
> (como APDM o Xsens) que utilizan sensores inerciales para analizar la
> marcha en entornos clínicos. Sin embargo, estas soluciones suelen ser
> costosas y complejas, lo que limita su uso a la investigación. Además,
> al aplicarse a la rehabilitación con muletas, los dispositivos
> comerciales resultan insuficientes: se centran en métricas genéricas y
> no miden variables clave como la carga sobre la ayuda técnica,
> careciendo del contexto clínico necesario para el profesional
> sanitario.
>
> Por otro lado, aunque existen sensores de fuerza y sistemas de
> análisis más avanzados, estos suelen funcionar de manera aislada, sin
> integrarse en un sistema completo que combine la captura de datos, su
> almacenamiento, su visualización y su análisis clínico. Esta
> fragmentación reduce su utilidad en procesos de rehabilitación
> prolongados, donde es fundamental disponer de un seguimiento
> estructurado y accesible tanto para el paciente como para el
> profesional.

3.  []{#_bookmark26 .anchor}Aplicaciones móviles y plataformas digitales
    de salud

> De forma paralela al desarrollo de los dispositivos wearables, se
> produjo una expansión significativa de las aplicaciones móviles y
> plataformas digitales orientadas a la salud. La generalización del uso
> de smartphones y tabletas, junto con la disponibilidad de sensores
> integrados como acelerómetros, giroscopios o cámaras, permitió el
> desarrollo de aplicaciones capaces de registrar datos, ofrecer
> recomendaciones personalizadas, generar estadísticas de uso y, en
> algunos casos, compartir información con profesionales sanitarios.
>
> En este contexto surgieron aplicaciones ampliamente conocidas como
> Apple Health, Google Fit o Samsung Health, que actúan como plataformas
> centralizadas de recogida y visualización de datos relacionados con la
> actividad física, el sueño o determinados parámetros fisiológicos.
> Estas aplicaciones permiten agregar información procedente de
> distintos dispositivos y ofrecer una visión global del estado del
> usuario, aunque su enfoque principal está orientado al bienestar
> general y la promoción de hábitos saludables.
>
> Dentro del ámbito específico de la rehabilitación, comenzaron a
> desarrollarse aplicaciones orientadas al seguimiento de ejercicios
> terapéuticos y programas de recuperación funcional. Ejemplos de este
> tipo de soluciones son PhysiApp, Kaia Health o ReHub, que ofrecen
> planes de ejercicios guiados, recordatorios de sesiones y contenido
> educativo para el paciente. Algunas de estas aplicaciones incorporan
> funcionalidades básicas de monitorización mediante los sensores del
> propio dispositivo móvil, utilizando el acelerómetro o el giroscopio
> para evaluar la correcta ejecución de los movimientos.
>
> Asimismo, han surgido plataformas digitales más completas orientadas a
> la telerehabilitación, como Hinge Health o Sword Health, que combinan
> aplicaciones móviles con sensores externos y permiten el seguimiento
> remoto del paciente por parte de profesionales sanitarios. Estas
> soluciones representan un avance significativo en la digitalización de
> la rehabilitación, especialmente en contextos de atención
> domiciliaria.
>
> No obstante, la mayoría de estas aplicaciones presentan carencias
> relevantes cuando se analizan desde la perspectiva del uso de muletas
> como ayuda técnica durante la rehabilitación. En primer lugar, muchas
> de ellas no están integradas directamente con el hardware utilizado
> por el paciente, lo que impide medir de forma precisa variables
> clínicas fundamentales como la carga aplicada sobre la muleta o la
> distribución del peso durante la marcha. En su lugar, se basan en
> estimaciones indirectas que no reflejan con exactitud el
> comportamiento real del paciente.
>
> En segundo lugar, gran parte de estas aplicaciones están diseñadas
> principalmente para el usuario final, priorizando la experiencia del
> paciente, mientras que las herramientas específicas para el
> profesional sanitario suelen ser limitadas. Funcionalidades clave como
> la visualización longitudinal de datos, el análisis de tendencias, la
> detección de incumplimientos de pautas o la configuración
> personalizada de límites terapéuticos no siempre están presentes o se
> ofrecen de forma muy básica.
>
> Además, muchas aplicaciones comerciales están orientadas al ámbito del
> fitness o del bienestar general y no han sido diseñadas
> específicamente para su uso en contextos clínicos supervisados. Esto
> limita su validez desde el punto de vista sanitario y dificulta
>
> su integración en procesos de rehabilitación estructurados, donde es
> imprescindible contar con datos fiables, contextualizados y fácilmente
> interpretables por el personal médico.

## Soluciones existentes y alternativas actuales

> En el mercado actual existen diversas soluciones orientadas a la
> monitorización del proceso de rehabilitación y del apoyo a la marcha,
> aunque la mayoría de ellas se centran en aspectos parciales del
> problema y no ofrecen una integración completa entre hardware,
> software y seguimiento clínico.
>
> Dentro del ámbito clínico especializado, son habituales sistemas como
> las plataformas de fuerza de fabricantes como AMTI o Bertec,
> utilizadas para medir cargas, distribución del peso y parámetros
> biomecánicos durante la marcha. Estas soluciones ofrecen una gran
> precisión, pero están diseñadas para su uso exclusivo en laboratorios
> o consultas especializadas, requieren equipamiento voluminoso,
> personal cualificado y no permiten un seguimiento continuo del
> paciente en su entorno cotidiano.

![](memoria_referencia/media/image3.jpeg){width="3.1087128171478566in"
height="2.6125in"}

> []{#_bookmark28 .anchor}Ilustración 2: Cinta de correr instrumentada
> con plataforma de fuerza de AMTI
>
> Otra aproximación ampliamente utilizada son las plantillas
> instrumentadas, como las desarrolladas por empresas como Moticon o
> Tekscan. Estas plantillas permiten medir la presión plantar y analizar
> patrones de apoyo durante la marcha. Aunque aportan información
> relevante, su enfoque está centrado en el pie y no en las ayudas
> técnicas como las muletas, que son fundamentales en muchos procesos de
> rehabilitación tras cirugías o lesiones. Además, su coste y la
> necesidad de calibración limitan su uso prolongado fuera de entornos
> controlados.
>
> ![](memoria_referencia/media/image4.jpeg){width="3.7395811461067368in"
> height="2.0885411198600177in"}
>
> []{#_bookmark29 .anchor}Ilustración 3: Plantillas instrumentadas de
> Moticon
>
> En el ámbito del análisis de la marcha mediante wearables, existen
> dispositivos comerciales como sensores inerciales de empresas como
> Xsens o APDM Wearable Technologies. Estos sistemas permiten registrar
> movimiento, aceleraciones y patrones de marcha, pero suelen estar
> orientados a estudios clínicos o de investigación y no a un uso
> sencillo por parte del paciente final. Asimismo, no están
> específicamente diseñados para monitorizar la carga aplicada sobre una
> muleta ni para integrarse de forma directa en el flujo de trabajo de
> una rehabilitación con ayudas técnicas.
>
> Respecto a las muletas instrumentadas, se han desarrollado diversos
> prototipos en el ámbito académico y de investigación, en los que se
> integran galgas extensiométricas o sensores de fuerza para medir la
> carga aplicada. Sin embargo, en la mayoría de los casos se trata de
> desarrollos experimentales, sin una continuidad comercial clara ni una
> integración completa con aplicaciones móviles y plataformas web que
> permitan al profesional sanitario analizar la evolución del paciente
> de forma estructurada. Estos prototipos suelen limitarse a la recogida
> de datos, sin ofrecer una experiencia de usuario pensada para su uso
> real y prolongado.
>
> Por otro lado, en el mercado de aplicaciones móviles de salud existen
> numerosas apps de rehabilitación y seguimiento de actividad, como
> PhysiApp, Kaia Health o MyRehab. Estas aplicaciones permiten registrar
> ejercicios, establecer rutinas y visualizar el progreso del paciente,
> pero dependen en gran medida de la introducción manual de datos o de
> sensores genéricos. En la mayoría de los casos no existe una conexión
> directa con el hardware utilizado por el paciente, lo que reduce la
> fiabilidad de la información y su valor clínico.
>
> Frente a estas alternativas, el enfoque adoptado en "Load Crutches"
> apuesta por una solución integrada y específica para el contexto de la
> rehabilitación con muletas. El sistema combina una muleta
> instrumentada, una aplicación móvil orientada al paciente y una
> plataforma web para el profesional sanitario, formando un ecosistema
> coherente que permite la recogida objetiva de datos, su almacenamiento
> y su análisis clínico.

## Justificación del enfoque adoptado

> A partir del análisis del estado actual, se puede concluir que existe
> una necesidad real de sistemas que permitan monitorizar de forma
> objetiva y continua el uso de muletas durante la rehabilitación, sin
> introducir complejidad excesiva ni depender de infraestructuras
> clínicas avanzadas.
>
> El camino elegido en este TFG se justifica por la combinación de
> varios factores: la integración directa del hardware en la ayuda
> técnica utilizada por el paciente, la utilización de aplicaciones
> digitales accesibles y la orientación tanto al paciente como al
> profesional sanitario. Este enfoque permite abordar las limitaciones
> detectadas en las soluciones existentes y sentar las bases para una
> rehabilitación más controlada, personalizada y basada en datos.
>
> No obstante, es importante señalar que el alcance del proyecto se
> limita exclusivamente al diseño y desarrollo de un sistema de
> adquisición, transmisión y visualización de datos, sin entrar en la
> interpretación clínica de los mismos ni en la definición de
> diagnósticos, tratamientos o decisiones médicas. "Load Crutches" no
> pretende sustituir ni automatizar la labor del profesional sanitario,
> sino proporcionar una herramienta tecnológica que facilite la
> obtención de información objetiva sobre el uso de la muleta durante el
> proceso de rehabilitación.
>
> En este contexto, "Load Crutches" se posiciona como una propuesta
> alineada con la evolución actual de la rehabilitación digital,
> aportando una solución que, sin sustituir el papel del profesional
> sanitario, actúa como una herramienta de apoyo para mejorar el
> seguimiento y la toma de decisiones clínicas.

## Actores del sistema

> El sistema "Load Crutches" está diseñado para ser utilizado por
> distintos actores que interactúan con la plataforma desde perspectivas
> y responsabilidades diferenciadas. La identificación de estos actores
> resulta fundamental para comprender las funcionalidades del sistema y
> la forma en que se estructuran los requisitos iniciales.
>
> ![](memoria_referencia/media/image5.png){width="3.6469674103237097in"
> height="2.811874453193351in"}
>
> []{#_bookmark32 .anchor}Ilustración 4: Representación del diagrama de
> casos de uso general

1.  []{#_bookmark33 .anchor}Paciente

> El paciente es el usuario final principal del sistema y el
> destinatario directo del proceso de rehabilitación. Utiliza la muleta
> inteligente durante su actividad diaria y accede al sistema a través
> de la aplicación móvil. Desde esta aplicación, el paciente puede
> realizar sesiones de rehabilitación, visualizar información
> relacionada con su actividad y su progreso, y recibir
> retroalimentación sobre el uso de la muleta. Asimismo, el paciente
> puede comunicarse con el profesional sanitario responsable de su
> tratamiento y consultar recomendaciones o avisos asociados a su
> proceso de recuperación.
>
> []{#_bookmark34 .anchor}Tabla 1: Especificación del actor ACT-01:
> Paciente

+-------------------------+------------------------------------------------+
| > **ACT-01**            | > **Paciente**                                 |
+=========================+================================================+
| > **Versión**           | > 1.0 (10/09/2025)                             |
+-------------------------+------------------------------------------------+
| > **Autores**           | > Víctor Martín Fuentes                        |
+-------------------------+------------------------------------------------+
| > **Fuentes**           | > A. Durán, B. Bernárdez                       |
+-------------------------+------------------------------------------------+
| > **Descripción**       | > Usuario final que sufre una o varias         |
|                         | > patologías en el tren inferior. Utiliza la   |
|                         | > aplicación móvil iOS y la muleta             |
|                         | > inteligente.                                 |
+-------------------------+------------------------------------------------+
| > **Responsabilidades** | 1.  Realizar las sesiones de rehabilitación.   |
|                         |                                                |
|                         | 2.  Conectar la muleta vía bluetooth.          |
|                         |                                                |
|                         | 3.  Visualizar su progreso y ajustar su marcha |
|                         |     según el feedback.                         |
|                         |                                                |
|                         | 4.  Comunicarse con el doctor vía chat.        |
+-------------------------+------------------------------------------------+

+-------------------+------------------------------------------------+
| > **Comentarios** | > Ninguno                                      |
+===================+================================================+

1.  []{#_bookmark35 .anchor}Doctor

> El doctor, que puede ser un médico o fisioterapeuta, es el encargado
> de supervisar y gestionar el proceso de rehabilitación de los
> pacientes. Accede al sistema mediante una plataforma web desde la cual
> puede consultar la información clínica y de uso generada por los
> pacientes, analizar el historial de sesiones y evaluar su evolución a
> lo largo del tiempo. Además, el profesional sanitario puede configurar
> parámetros terapéuticos personalizados, como límites de carga o pautas
> de rehabilitación, y comunicarse con los pacientes para ofrecer
> seguimiento, orientación y recomendaciones clínicas.

[]{#_bookmark36 .anchor}Tabla 2: Especificación del actor ACT-02: Doctor

+-------------------------+------------------------------------------------+
| > **ACT-02**            | > **Doctor**                                   |
+=========================+================================================+
| > **Versión**           | > 1.0 (10/09/2025)                             |
+-------------------------+------------------------------------------------+
| > **Autores**           | > Víctor Martín Fuentes                        |
+-------------------------+------------------------------------------------+
| > **Fuentes**           | > A. Durán, B. Bernárdez                       |
+-------------------------+------------------------------------------------+
| > **Descripción**       | > Profesional sanitario encargado de           |
|                         | > supervisar la recuperación de sus pacientes. |
|                         | > Utiliza la plataforma web.                   |
+-------------------------+------------------------------------------------+
| > **Responsabilidades** | 1.  Dar de alta a los pacientes en el sistema. |
|                         |                                                |
|                         | 2.  Configurar los parámetros de la muleta.    |
|                         |                                                |
|                         | 3.  Analizar las gráficas de evolución         |
|                         |                                                |
|                         | 4.  Enviar consejos y mensajes de seguimiento. |
+-------------------------+------------------------------------------------+
| > **Comentarios**       | > Ninguno                                      |
+-------------------------+------------------------------------------------+

1.  []{#_bookmark37 .anchor}Muleta inteligente

> La muleta inteligente actúa como un actor no humano dentro del sistema
> y constituye el origen de los datos biomecánicos utilizados para el
> seguimiento de la rehabilitación. Este dispositivo integra sensores
> que permiten capturar información objetiva relacionada con la carga
> aplicada durante los apoyos y el movimiento del paciente. Los datos
> generados por la muleta se transmiten de forma inalámbrica a la
> aplicación móvil, desde donde son procesados y enviados al *backend*
> para su almacenamiento y análisis posterior. La muleta inteligente
> desempeña, por tanto, un papel esencial en la obtención de información
> fiable y continua sobre el uso real de la ayuda técnica en el entorno
> cotidiano del paciente.
>
> []{#_bookmark38 .anchor}Tabla 3: Especificación del actor ACT-03:
> Muleta inteligente

+-------------------+----------------------------------------------------+
| > **Versión**     | > 1.0 (10/09/2025)                                 |
+===================+====================================================+
| > **Autores**     | > Víctor Martín Fuentes                            |
+-------------------+----------------------------------------------------+
| > **Fuentes**     | > A. Durán, B. Bernárdez                           |
+-------------------+----------------------------------------------------+
| > **Descripción** | > Dispositivo hardware externo (*IoT*) que actúa   |
|                   | > como fuente de datos.                            |
+-------------------+----------------------------------------------------+
| > **Responsabili  | 1.  Medir la fuerza aplicada en cada paso.         |
| > dades**         |                                                    |
|                   | 2.  Transmitir la trama de datos vía bluetooth a   |
|                   |     la app.                                        |
+-------------------+----------------------------------------------------+
| > **Comentarios** | > Ninguno                                          |
+-------------------+----------------------------------------------------+

# Normas y referencias

> En este apartado se recogen los aspectos más relevantes del desarrollo
> del proyecto "Load Crutches" a modo de síntesis y recapitulación. El
> objetivo de esta sección es justificar el proceso seguido a lo largo
> del proyecto y explicar las decisiones metodológicas que han conducido
> a la solución final implementada.
>
> Dado el carácter multidisciplinar de "Load Crutches", que integra
> hardware, aplicación móvil, plataforma web y *backend*, ha sido
> necesario adoptar un enfoque de desarrollo estructurado que permitiera
> gestionar la complejidad del sistema de forma progresiva. La
> planificación, la división en subsistemas y la definición clara de
> interfaces han sido aspectos clave para garantizar la coherencia del
> conjunto y la correcta integración de todos los componentes.

## Métodos de desarrollo

> Para el desarrollo completo del sistema "Load Crutches" se ha seguido
> la metodología del Proceso Unificado, una de las metodologías de
> gestión de proyectos más utilizadas en el ámbito del desarrollo de
> software. Esta metodología resulta especialmente adecuada para
> proyectos de tamaño medio o grande, en los que intervienen múltiples
> componentes y tecnologías heterogéneas.
>
> Uno de los principios fundamentales del Proceso Unificado es su
> carácter iterativo. El desarrollo del sistema se organiza en
> iteraciones sucesivas, permitiendo planificar y construir el proyecto
> de manera incremental. Dada la magnitud de "Load Crutches", este
> enfoque ha permitido dividir el sistema en distintos subsistemas que
> pueden desarrollarse de forma relativamente independiente, manteniendo
> al mismo tiempo una visión global del sistema final.
>
> En el caso de "Load Crutches", el proyecto se ha planteado desde el
> inicio como un sistema compuesto por varios subsistemas claramente
> diferenciados, como el hardware de la muleta inteligente, la
> aplicación móvil para el paciente, el *backend* del sistema y la
> plataforma web para los profesionales sanitarios. Cada uno de estos
> subsistemas ha sido abordado en iteraciones específicas dentro de las
> distintas fases del desarrollo, permitiendo centrarse en sus
> requisitos particulares y reducir inicialmente la interdependencia
> entre ellos.
>
> Otro de los principios del Proceso Unificado es su enfoque centrado en
> la arquitectura. En un sistema como "Load Crutches", que combina
> componentes físicos y software, resulta esencial definir una
> arquitectura general desde las primeras fases del proyecto. Esta
> arquitectura recoge las ideas básicas del sistema, las
> responsabilidades de cada subsistema y las interfaces de comunicación
> entre ellos. Gracias a esta aproximación, el desarrollo ha sido más
> comprensible y ordenado, facilitando la reutilización de componentes y
> dejando abierta la posibilidad de futuras ampliaciones o mejoras.
>
> El tercer principio relevante de esta metodología es que está dirigida
> por los casos de uso. En "Load Crutches", los casos de uso han servido
> como elemento central para definir las funcionalidades del sistema y
> las interacciones entre los distintos actores, como pacientes
>
> y profesionales sanitarios. Estos casos de uso, detallados en el Anexo
> II del proyecto, han permitido identificar de forma clara los
> requisitos funcionales, las restricciones y los objetivos del sistema,
> sirviendo como guía durante el desarrollo.
>
> Como resultado de la aplicación del Proceso Unificado, el ciclo de
> vida adoptado en "Load Crutches" puede considerarse iterativo e
> incremental. El sistema ha ido evolucionando mediante ciclos cortos de
> desarrollo, en los que se han implementado, probado y refinado
> progresivamente las distintas funcionalidades, hasta alcanzar la
> solución final presentada en este proyecto.

1.  []{#_bookmark41 .anchor}Aplicación y conclusiones del uso de la
    metodología en el desarrollo

> Como resultado del proyecto se han cumplido las iteraciones propuestas
> inicialmente para cada una de las fases. En concreto, se plantearon
> cuatro fases:

- Inicio

- Elaboración

- Construcción

- Transición

> Se puede observar una descripción del trabajo realizado en cada una de
> las iteraciones de las fases del proyecto en la [Tabla
> 4,](#_bookmark42) visualizando así el marco de trabajo seguido en el
> desarrollo de este.
>
> []{#_bookmark42 .anchor}Tabla 4: Descripción de las iteraciones de las
> fases del proyecto

+----------------------------+------------------------------------+
| > **Fase (Iteración)**     | > **Descripción**                  |
+============================+:===================================+
| > **Inicio**               | > En la primera iteración de la    |
| >                          | > fase de inicio se llevó a cabo   |
| > (Iteración 1)            | > una toma de contacto inicial con |
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
| > **Inicio**               | > En la segunda iteración de la    |
| >                          | > fase de inicio se definieron con |
| > (Iteración 2)            | > mayor detalle los objetivos del  |
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
| > **Elaboración**          | > Durante esta iteración se        |
| >                          | > realizó el análisis detallado    |
| > (Iteración 1)            | > del sistema, definiendo los      |
|                            | > requisitos funcionales y no      |
|                            | > funcionales de "Load Crutches".  |
|                            | > También se                       |
+----------------------------+------------------------------------+

+----------------------------+------------------------------------+
|                            | > diseñó la arquitectura general   |
|                            | > del sistema, identificando los   |
|                            | > distintos subsistemas            |
|                            | > (aplicación móvil, panel web,    |
|                            | > *backend* y base de datos) y sus |
|                            | >                                  |
|                            | > relaciones.                      |
+============================+:===================================+
| > **Elaboración**          | > En la segunda iteración de la    |
| >                          | > fase de elaboración se           |
| > (Iteración 2)            | > completaron los aspectos         |
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
| > **Construcción**         | > En la primera iteración de la    |
| >                          | > fase de construcción se          |
| > (Iteración Gestión de    | > desarrollaron los elementos      |
| > entornos virtuales)      | > fundamentales del sistema,       |
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
| > **Construcción**         | > En la segunda iteración de la    |
| >                          | > fase de construcción se abordó   |
| > (Iteración Análisis y    | > el desarrollo de la aplicación   |
| > procesamiento de datos)  | > móvil del paciente, la           |
|                            | > integración Bluetooth con la     |
|                            | > muleta inteligente, la gestión   |
|                            | > de sesiones de rehabilitación y  |
|                            | > la comunicación en tiempo real   |
|                            | > mediante chat. Se                |
|                            | >                                  |
|                            | > realizaron pruebas de            |
|                            | > integración entre todos los      |
|                            | > subsistemas.                     |
+----------------------------+------------------------------------+
| > **Transición**           | > En la primera iteración de la    |
| >                          | > fase de transición se llevaron a |
| > (Iteración 1)            | > cabo pruebas globales del        |
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
| > **Transición**           | > En la segunda iteración de la    |
| >                          | > fase de transición se procedió   |
| > (Iteración 2)            | > al despliegue final del sistema, |
|                            | > la revisión y cierre de la       |
|                            | > documentación, la ejecución de   |
|                            | > pruebas finales de integración y |
|                            | > la preparación de la entrega y   |
|                            | >                                  |
|                            | > defensa del Trabajo Fin de       |
|                            | > Grado.                           |
+----------------------------+------------------------------------+

> Como resultado del desarrollo del proyecto "Load Crutches", se ha
> alcanzado el número de iteraciones inicialmente planteado en la
> planificación, distribuidas a lo largo de las distintas fases del
> Proceso Unificado. Tal y como se ha descrito en las iteraciones de
> cada fase, el desarrollo del sistema ha seguido un ciclo de vida
> iterativo e incremental, permitiendo la evolución progresiva del
> proyecto hasta alcanzar la solución final.
>
> Durante el desarrollo, algunos de los subsistemas requirieron una
> dedicación mayor de la prevista inicialmente y, en determinados casos,
> fue necesario ajustar el enfoque planteado sin alterar la estructura
> general del ciclo de vida adoptado. Este comportamiento es habitual en
> proyectos que integran hardware y software, donde la interacción entre
> componentes físicos y lógicos puede generar dependencias y ajustes no
> completamente previsibles en las fases iniciales de planificación.
>
> Aunque el proyecto se planificó teniendo en cuenta posibles errores
> durante la implementación y la ejecución de pruebas conjuntas,
> aspectos como la integración del hardware de la muleta inteligente, la
> comunicación Bluetooth y el tratamiento de datos en tiempo casi real
> han requerido iteraciones adicionales de refinamiento. El desarrollo
> continuo de estos subsistemas dentro de una única iteración habría
> supuesto un avance excesivamente apresurado, por lo que fue necesario
> distribuir su implementación y mejora a lo largo de varias iteraciones
> sucesivas.
>
> Este enfoque permitió ir ajustando progresivamente el firmware de la
> muleta, la lógica de la aplicación móvil y la comunicación con el
> *backend*, asegurando un funcionamiento estable y coherente del
> sistema. De este modo, fue posible mantener el calendario global del
> proyecto sin comprometer la calidad del resultado final.

## Herramientas

> En esta sección se describen con un mayor nivel de detalle las
> herramientas y tecnologías empleadas en el desarrollo del proyecto
> "Load Crutches". A partir de los conceptos teóricos expuestos en el
> capítulo anterior, este apartado permite contextualizar las decisiones
> técnicas adoptadas y definir de forma precisa cada uno de los
> componentes que conforman el sistema.
>
> El proyecto combina el desarrollo de hardware embebido con
> aplicaciones software distribuidas, lo que ha requerido el uso de
> distintas tecnologías y enfoques de diseño para garantizar una
> correcta integración entre todos los elementos del sistema.

1.  []{#_bookmark44 .anchor}Swift UIKit

> Swift es un lenguaje de programación moderno desarrollado por Apple,
> orientado al desarrollo de aplicaciones para plataformas iOS. Se
> caracteriza por su sintaxis clara, su fuerte tipado y su enfoque en la
> seguridad y el rendimiento. En "Load Crutches", Swift se ha utilizado
> como el lenguaje principal para el desarrollo de la aplicación móvil
> destinada al paciente, junto con el *framework* UIKit para la
> construcción de la interfaz gráfica.
>
> El desarrollo de la aplicación se ha llevado a cabo utilizando Xcode
> como entorno de desarrollo integrado (IDE). Xcode proporciona un
> conjunto completo de herramientas para la programación en Swift, la
> gestión de proyectos, la compilación, la depuración y la ejecución de
> aplicaciones en dispositivos físicos y simuladores. El uso de este
> entorno ha permitido iterar de forma ágil durante el desarrollo,
> detectar errores de manera temprana y validar el correcto
> funcionamiento de la aplicación en diferentes escenarios.
>
> Swift resulta especialmente adecuado para aplicaciones móviles que
> requieren una interacción fluida con el usuario y una gestión
> eficiente de recursos, aspectos fundamentales en una aplicación que
> recibe datos en tiempo casi real desde un dispositivo físico. La
> integración con UIKit permite desarrollar interfaces nativas,
> optimizadas y coherentes con las guías de diseño del sistema operativo
> iOS.
>
> Durante el desarrollo de la aplicación móvil de "Load Crutches", Swift
> ha permitido implementar de forma eficiente la lógica de presentación,
> la gestión de estados de la aplicación, la comunicación Bluetooth y la
> interacción con el *backend*. Además, su sistema de tipos ayuda a
> reducir errores comunes durante el desarrollo y mejora la
> mantenibilidad del código.

![](memoria_referencia/media/image6.jpeg){width="5.270891294838146in"
height="2.880103893263342in"}

> []{#_bookmark45 .anchor}Ilustración 5: Storyboard de "Load Crutches"
>
> ![](memoria_referencia/media/image7.jpeg){width="5.346139545056868in"
> height="2.9069783464566927in"}
>
> []{#_bookmark46 .anchor}Ilustración 6: Fragmento de código Swift
>
> Entre algunas de las principales ventajas de Swift se encuentran:

- Lenguaje seguro y robusto, con control de valores nulos y errores en
  tiempo de compilación.

- Alto rendimiento, comparable al de lenguajes compilados tradicionales.

- Sintaxis clara y legible, que facilita el mantenimiento del código.

- Integración nativa con el ecosistema iOS y con *frameworks* como
  UIKit.

- Amplia documentación y soporte por parte de la comunidad y de Apple.

  1.  []{#_bookmark47 .anchor}TypeScript

> En el proyecto "Load Crutches", TypeScript se ha utilizado como
> lenguaje principal para el desarrollo del backend basado en Node.js.
> La elección de esta tecnología responde a la necesidad de construir un
> servidor robusto, mantenible y fácil de evolucionar, capaz de
> gestionar lógica de negocio, comunicación con clientes y acceso a
> datos de forma fiable.
>
> El principal motivo para utilizar TypeScript ha sido la seguridad y
> claridad en el desarrollo. Al trabajar con entidades bien definidas
> como usuarios, pacientes, sesiones de rehabilitación, mensajes o
> configuraciones clínicas, la tipificación proporcionada por TypeScript
> ha permitido detectar errores en fases tempranas del desarrollo,
> evitando problemas habituales en tiempo de ejecución y reduciendo el
> tiempo dedicado a depuración.
>
> ![](memoria_referencia/media/image8.jpeg){width="5.1872353455818025in"
> height="2.79125in"}
>
> []{#_bookmark48 .anchor}Ilustración 7: Fragmento de código Typescript
>
> En el proyecto "Load Crutches", TypeScript se ha utilizado
> principalmente en el desarrollo del *backend* basado en Node.js, donde
> actúa como lenguaje principal para la implementación de la lógica de
> negocio y la gestión de los datos. Su uso ha permitido desarrollar un
> servidor más robusto, mantenible y preparado para futuras
> ampliaciones, facilitando la integración entre la aplicación móvil, la
> plataforma web y el sistema de almacenamiento de datos.

2.  []{#_bookmark49 .anchor}Node.js

> Node.js es un entorno de ejecución de JavaScript orientado al
> desarrollo de aplicaciones web, servicios de tiempo real y servidores
> capaces de gestionar un elevado número de peticiones concurrentes. En
> el proyecto "Load Crutches", Node.js se ha utilizado como base del
> *backend* del sistema, actuando como el elemento central que coordina
> la comunicación entre la aplicación móvil, la plataforma web y la base
> de datos.
>
> Este entorno es el encargado de procesar las peticiones recibidas
> desde el *frontend* web y la aplicación móvil, gestionar la lógica de
> negocio del sistema y controlar el acceso a la información almacenada.
> De este modo, Node.js centraliza el funcionamiento del sistema,
> permitiendo la integración de los distintos subsistemas que componen
> "Load Crutches".
>
> Node.js está basado en el motor JavaScript V8 de Google, diseñado
> originalmente para la ejecución de código JavaScript de forma
> extremadamente rápida. La tecnología que sustenta Node.js permite que
> este motor se ejecute en el lado del servidor, ampliando
> significativamente las posibilidades del desarrollo de aplicaciones
> web modernas.
>
> Para lograr un funcionamiento eficiente, Node.js emplea un modelo de
> ejecución asíncrono y orientado a eventos. En lugar de crear un hilo
> independiente para cada solicitud, delega las tareas en un sistema de
> subprocesos gestionado internamente, permitiendo que las operaciones
> de entrada y salida se realicen de forma no bloqueante. Este enfoque
> resulta especialmente adecuado para aplicaciones que deben manejar
> múltiples conexiones simultáneas.
>
> ![](memoria_referencia/media/image9.png){width="4.784241032370954in"
> height="1.94625in"}
>
> []{#_bookmark50 .anchor}Ilustración 8: Captura del comando npm run dev
>
> En sistemas como "Load Crutches", donde pueden coexistir múltiples
> pacientes y profesionales sanitarios accediendo de forma concurrente a
> la plataforma, este modelo permite gestionar un gran volumen de
> solicitudes sin un consumo excesivo de recursos del servidor. Además,
> al tratarse de un sistema en el que predominan las operaciones de
> entrada y salida, como consultas a la base de datos o intercambio de
> información con clientes, Node.js ofrece un rendimiento adecuado.

3.  []{#_bookmark51 .anchor}Vue.js

> Vue.js es un *framework* progresivo de JavaScript orientado a la
> creación de interfaces de usuario. Puede entenderse como una capa
> añadida sobre JavaScript que incorpora herramientas, convenciones de
> desarrollo y un enfoque estructurado que permite crear aplicaciones
> web de forma rápida, clara y eficiente.
>
> Se trata de un *framework* de desarrollo *frontend* que permite la
> construcción de páginas web completas, abarcando desde aplicaciones
> sencillas hasta interfaces complejas capaces de gestionar
> funcionalidades avanzadas mediante paneles de control o *dashboards*
> interactivos. Esta versatilidad lo convierte en una solución adecuada
> para aplicaciones que requieren una visualización continua y
> organizada de la información.
>
> Dentro del propósito del proyecto "Load Crutches", Vue.js se ha
> utilizado junto con JavaScript como *framework* principal para el
> desarrollo de las vistas y pantallas del subsistema de visualización
> de la aplicación web. Esta plataforma web está orientada a
> profesionales sanitarios y permite la gestión de pacientes, la
> consulta de estadísticas, la configuración de límites y el seguimiento
> del proceso de rehabilitación.
>
> Una de las características principales de Vue.js es su sistema de
> reactividad. La aplicación responde automáticamente a los cambios en
> los datos modificando el DOM de la página web sin necesidad de
> recargarla. Este comportamiento resulta fundamental para mejorar la
> usabilidad y la experiencia de usuario, ya que la información se
> actualiza de forma fluida y en tiempo real. Esto es posible debido a
> que los modelos del *framework* están basados en objetos de
> JavaScript, de modo que cualquier modificación en los datos provoca
> una actualización automática de la vista.
>
> ![](memoria_referencia/media/image10.jpeg){width="3.895564304461942in"
> height="2.5483333333333333in"}
>
> []{#_bookmark52 .anchor}Ilustración 9: Fragmento de un template hecho
> con Vue.js
>
> Además, Vue.js introduce un enfoque basado en componentes. Un
> componente es una unidad independiente en la que se encapsula código
> reutilizable, incluyendo fragmentos de HTML, JavaScript y CSS. Esta
> característica permite modularizar el proyecto, facilitando su
> escalabilidad y mantenimiento. Asimismo, si surge la necesidad de
> modificar una parte concreta de la interfaz, un componente puede ser
> reemplazado o actualizado de forma sencilla y rápida, sin afectar al
> resto de la aplicación.

4.  []{#_bookmark53 .anchor}C

> El lenguaje de programación C es uno de los lenguajes más utilizados
> en el desarrollo de sistemas embebidos debido a su cercanía al
> hardware, su eficiencia en el uso de recursos y su capacidad para
> ofrecer un control preciso sobre la ejecución del programa. Estas
> características resultan especialmente relevantes en dispositivos
> basados en microcontroladores, donde la memoria, la capacidad de
> procesamiento y el consumo energético están limitados.
>
> En el proyecto "Load Crutches", el lenguaje C se ha empleado para el
> desarrollo del firmware que se ejecuta sobre la placa base ESP32 de
> Espressif. Este firmware constituye la capa de software de más bajo
> nivel del sistema y es responsable de la interacción directa con el
> hardware de la muleta inteligente.
>
> El uso de C permite acceder de forma directa a los periféricos
> internos del ESP32, tales como los conversores analógico-digitales,
> los buses de comunicación, los temporizadores, las interrupciones y
> los módulos de comunicación inalámbrica. Gracias a este control de
> bajo nivel, el firmware puede gestionar de forma eficiente la
> adquisición de datos de los sensores y la transmisión de información
> al resto del sistema.
>
> En "Load Crutches", el firmware desarrollado en C realiza las
> siguientes funciones técnicas principales:

- Inicialización y configuración del microcontrolador, incluyendo la
  configuración de pines, periféricos y módulos internos.

- Lectura periódica de la célula de carga mediante conversión
  analógico-digital, obteniendo valores brutos que posteriormente son
  procesados y calibrados para su conversión a unidades físicas de peso.

- Lectura de los datos proporcionados por el sensor inercial, utilizados
  para la detección de eventos de paso mediante el análisis de
  variaciones en las señales de aceleración.

- Procesamiento básico de las señales adquiridas, incluyendo filtrado,
  cálculo de umbrales y generación de eventos relevantes.

- Gestión del módulo Bluetooth Low Energy, configurando el dispositivo
  como periférico y controlando el envío periódico de datos.

- Construcción de las tramas de datos en formato estructurado,
  incluyendo valores de peso, pasos, estado de la batería y marcas
  temporales.

- Control del estado del sistema y gestión del consumo energético,
  ajustando el comportamiento del firmware en función de la actividad
  detectada.

> El desarrollo del firmware se ha realizado utilizando el entorno de
> desarrollo del ESP32, apoyándose en librerías específicas que
> facilitan la configuración de los periféricos y la comunicación
> Bluetooth, manteniendo al mismo tiempo la flexibilidad y el control
> que ofrece el lenguaje C. Este enfoque permite optimizar el
> rendimiento del sistema y garantizar tiempos de respuesta adecuados
> para una aplicación de monitorización en tiempo casi real.
>
> Desde un punto de vista técnico, el uso de C en "Load Crutches" aporta
> ventajas clave como:

- Ejecución eficiente y determinista, adecuada para tareas de
  adquisición de datos periódicas.

- Control preciso sobre la memoria y los recursos del microcontrolador.

- Posibilidad de optimizar el consumo energético del sistema.

- Amplia compatibilidad con herramientas y librerías para sistemas
  embebidos.

- Lenguaje ampliamente estandarizado y utilizado en el ámbito académico
  e industrial.

> En conjunto, el firmware desarrollado en C constituye la base técnica
> sobre la que se apoya todo el sistema "Load Crutches", siendo el
> encargado de convertir las señales físicas captadas por los sensores
> en datos digitales fiables que posteriormente son procesados,
> almacenados y visualizados por los distintos componentes software del
> sistema.

1.  []{#_bookmark54 .anchor}PostgreSQL

> MySQL es un sistema gestor de bases de datos relacional, de código
> abierto y ampliamente utilizado en aplicaciones web y sistemas
> cliente-servidor. En el proyecto "Load Crutches", MySQL ha sido
> seleccionado como sistema de almacenamiento principal debido a su
> fiabilidad, sencillez de uso y adecuada integración con el *backend*.
>
> La elección de MySQL responde principalmente a su idoneidad para
> gestionar información estructurada, como usuarios, pacientes, sesiones
> de rehabilitación, datos de telemetría y comunicaciones entre paciente
> y profesional sanitario. El modelo relacional de MySQL encaja de forma
> directa con las entidades definidas en el *backend*, facilitando la
> organización de los datos y garantizando su integridad mediante claves
> primarias, claves foráneas y restricciones relacionales.
>
> Desde el punto de vista del desarrollo, MySQL ofrece una integración
> sencilla con el entorno Node.js utilizado en el *backend* del sistema,
> permitiendo implementar de forma clara y mantenible las operaciones de
> creación, consulta, actualización y eliminación de datos. Esta
> compatibilidad ha permitido centrar el esfuerzo del proyecto en la
> lógica de negocio y en la correcta integración de los distintos
> componentes del sistema, sin introducir complejidad innecesaria en la
> capa de persistencia.
>
> Otro factor relevante en la elección de MySQL ha sido su facilidad de
> despliegue en entornos locales, utilizando herramientas como XAMPP, lo
> que resulta especialmente adecuado en el contexto académico del
> proyecto. Esta configuración ha permitido disponer de un entorno de
> desarrollo controlado y reproducible, facilitando las pruebas de
> integración entre *backend*, *frontend* y aplicación móvil.

![](memoria_referencia/media/image11.png){width="5.856829615048119in"
height="2.383332239720035in"}

> []{#_bookmark55 .anchor}Ilustración 10: Tablas de la base de datos
> MySQL de "Load Crutches"
>
> En el contexto de "Load Crutches", MySQL se utiliza como repositorio
> central de toda la información persistente del sistema. En particular,
> se emplea para:

- El almacenamiento de usuarios y credenciales de acceso.

- La gestión de pacientes y su información clínica asociada.

- El registro de sesiones de rehabilitación y los datos capturados por
  la muleta inteligente.

- La gestión de mensajes, consejos clínicos y configuraciones
  terapéuticas.

  1.  []{#_bookmark56 .anchor}Git

> Git se ha utilizado como herramienta de control de versiones durante
> todo el desarrollo de "Load Crutches", permitiendo gestionar de forma
> ordenada y segura la evolución del proyecto. Su uso ha sido clave para
> mantener un histórico completo de los cambios realizados en el código
> y facilitar el trabajo progresivo sobre un sistema compuesto por
> múltiples subsistemas.
>
> A lo largo del desarrollo, Git ha permitido organizar el proyecto en
> diferentes ramas asociadas a los principales componentes del sistema,
> como el backend, la aplicación móvil, el frontend web y el firmware
> del dispositivo. Este enfoque ha facilitado trabajar de manera
> independiente en cada parte, integrar cambios de forma controlada y
> evitar conflictos entre funcionalidades en desarrollo.
>
> Gracias al control de versiones, ha sido posible experimentar con
> distintas soluciones técnicas, revertir cambios cuando una
> implementación no ofrecía los resultados esperados y mantener siempre
> una versión estable del sistema. Esto ha resultado especialmente útil
> en un proyecto de carácter iterativo, donde los requisitos y
> decisiones de diseño han ido refinándose progresivamente.

![](memoria_referencia/media/image12.jpeg){width="5.964818460192476in"
height="3.065624453193351in"}

> []{#_bookmark57 .anchor}Ilustración 11: Repositorio de Git de la
> aplicación iOS
>
> El uso de Git ha permitido organizar el desarrollo de "Load Crutches"
> de forma incremental, gestionando cada subsistema en ramas
> independientes dentro de un repositorio principal. Este enfoque ha
> facilitado la implementación progresiva de funcionalidades y el
> cumplimiento de las iteraciones de desarrollo previstas, tal y como se
> describe en la planificación temporal del proyecto.

2.  []{#_bookmark58 .anchor}Mermaid.js

> Mermaid.js es una herramienta basada en JavaScript que permite la
> generación de diagramas y representaciones gráficas a partir de código
> declarativo en formato textual. Esta característica facilita la
> creación de esquemas técnicos de forma sencilla y reproducible, sin
> necesidad de utilizar herramientas gráficas externas.
>
> En el proyecto "Load Crutches", Mermaid.js se ha utilizado como
> herramienta de apoyo para la documentación técnica del sistema,
> permitiendo definir diagramas de arquitectura y despliegue que
> representan de manera clara la distribución de los distintos
> componentes del sistema y sus relaciones. Entre estos componentes se
> incluyen el backend, la base de datos, la aplicación móvil, la
> plataforma web y la comunicación Bluetooth con la muleta inteligente.
>
> Mediante el uso de Mermaid.js ha sido posible modelar el flujo de
> funcionamiento del sistema, facilitando la comprensión de cómo
> interactúan los distintos módulos software y hardware que conforman
> "Load Crutches". Estos diagramas permiten visualizar el recorrido de
> los datos desde su captura en la muleta, su transmisión a la
> aplicación móvil y su posterior envío al *backend* para almacenamiento
> y análisis.
>
> Otra de las ventajas destacadas del uso de Mermaid.js es su capacidad
> para documentar decisiones de diseño de manera clara y mantenible. Al
> generarse los diagramas a partir de código declarativo integrado
> directamente en la documentación del proyecto, resulta sencillo
> mantenerlos actualizados conforme evoluciona la arquitectura del
> sistema. Este enfoque permite que la documentación visual forme parte
> del propio control de versiones del proyecto, garantizando la
> coherencia entre el diseño descrito y la implementación real.

3.  []{#_bookmark59 .anchor}PlantUML

> PlantUML es una herramienta de generación de diagramas basada en texto
> que permite definir representaciones UML mediante un lenguaje
> declarativo sencillo. A partir de una descripción textual, PlantUML
> genera automáticamente diagramas normalizados, lo que facilita la
> documentación técnica de sistemas software de forma clara y
> mantenible.
>
> En el proyecto "Load Crutches", PlantUML se ha utilizado como
> herramienta de apoyo para la documentación de los aspectos funcionales
> y de interacción del sistema, concretamente para la elaboración de
> diagramas de secuencia y diagramas de casos de uso. Estos tipos de
> diagramas resultan especialmente adecuados para describir el
> comportamiento del sistema y la interacción entre los distintos
> actores y componentes.
>
> Los diagramas de secuencia se han empleado para modelar el flujo
> temporal de las interacciones entre los distintos elementos de "Load
> Crutches", como la muleta inteligente, la aplicación móvil, el
> *backend* y la plataforma web. Mediante estos diagramas es posible
> representar de forma clara el orden en el que se producen las
> comunicaciones, las solicitudes y las respuestas, facilitando la
> comprensión del funcionamiento interno del sistema y del intercambio
> de información entre módulos software y hardware.
>
> Por otro lado, los diagramas de casos de uso se han utilizado para
> describir las funcionalidades principales del sistema desde el punto
> de vista de los distintos actores que intervienen en "Load Crutches",
> como el paciente y el profesional sanitario. Estos diagramas permiten
> identificar de manera visual las acciones que cada tipo de usuario
> puede realizar, así como las relaciones entre las distintas
> funcionalidades del sistema.
>
> El uso de PlantUML aporta varias ventajas relevantes en el contexto
> del proyecto. Al igual que otras herramientas basadas en código
> declarativo, los diagramas pueden integrarse directamente en la
> documentación.

4.  []{#_bookmark60 .anchor}Microsoft Excel

> Microsoft Excel se ha utilizado como herramienta de apoyo para la
> planificación temporal y la organización del calendario de trabajo del
> proyecto "Load Crutches". Su elección se debe a su flexibilidad y a su
> capacidad para representar de forma clara y estructurada información
> relacionada con la gestión del tiempo y las tareas del proyecto.
>
> En el desarrollo de "Load Crutches", Excel se ha empleado para
> elaborar el cronograma del proyecto, organizando las distintas fases,
> iteraciones y actividades a lo largo del tiempo. A partir de la
> planificación definida, se han distribuido las tareas en un calendario
> de trabajo, permitiendo visualizar las fechas de inicio y finalización
> de cada actividad y su relación con los hitos principales del
> proyecto.
>
> Esta herramienta ha facilitado la representación gráfica de la
> planificación temporal, permitiendo detectar solapamientos entre
> tareas, dependencias y posibles desviaciones respecto al calendario
> previsto. Asimismo, ha servido como soporte para realizar ajustes en
> la planificación conforme avanzaba el desarrollo del proyecto.
>
> El uso de Microsoft Excel ha permitido mantener una visión global y
> actualizada del progreso del proyecto, contribuyendo a una mejor
> organización del trabajo y a un seguimiento más preciso del
> cumplimiento de los plazos establecidos.

5.  []{#_bookmark61 .anchor}EZEstimate

> EZEstimate es una herramienta basada en el método de Puntos de Caso de
> Uso (UCP) diseñada para estimar el tamaño y esfuerzo de proyectos
> software mediante el análisis de actores, casos de uso y factores de
> complejidad. En el marco del proyecto "Load Crutches", esta
> herramienta se ha utilizado como eje central para cuantificar la
> especificación funcional del sistema, transformando los diagramas UML
> en una estimación concreta de horas de trabajo que justifica la
> planificación temporal y la viabilidad del desarrollo.
>
> La metodología aplicada comienza con la clasificación de la
> complejidad de los actores (distinguiendo entre usuarios humanos con
> interfaz gráfica y sistemas externos) y la evaluación de los casos de
> uso según el número de transacciones que involucran. Esta
> categorización permite obtener los Puntos de Caso de Uso sin ajustar,
> estableciendo una base métrica sólida que refleja tanto las
> interacciones del médico y el paciente como la comunicación con la
> muleta inteligente y otros servicios externos.
>
> Finalmente, la estimación base se refina incorporando factores
> técnicos y del entorno, los cuales tienen un peso significativo en
> "Load Crutches" debido a la integración de
>
> subsistemas heterogéneos como la aplicación móvil, el *backend*
> clínico y la comunicación Bluetooth en tiempo real. El resultado final
> proporciona un cálculo total de horas de desarrollo que respalda
> metodológicamente la dedicación requerida, alineando el esfuerzo
> estimado con la complejidad técnica y el contexto académico del
> proyecto.

![](memoria_referencia/media/image13.jpeg){width="3.1766797900262467in"
height="3.525in"}

> []{#_bookmark62 .anchor}Ilustración 12: Resultado de la estimación del
> proyecto con EZEstimate

6.  []{#_bookmark63 .anchor}Postman

> Postman es una herramienta ampliamente utilizada para el desarrollo,
> prueba y documentación de servicios web basados en APIs REST. Permite
> enviar peticiones HTTP de distintos tipos, analizar las respuestas del
> servidor y validar el correcto funcionamiento de los *endpoints*
> definidos en un *backend*.
>
> En el proyecto "Load Crutches", Postman se ha utilizado como
> herramienta de apoyo durante el desarrollo y validación del *backend*,
> facilitando la comprobación de la comunicación entre la aplicación
> móvil, la plataforma web y el servidor. Su uso ha permitido probar de
> forma independiente los distintos endpoints de la API sin necesidad de
> utilizar las interfaces finales del sistema.
>
> Mediante Postman ha sido posible enviar peticiones HTTP de tipo GET,
> POST, PUT y DELETE, simulando las acciones que realizan los distintos
> clientes del sistema, como el registro e inicio de sesión de usuarios,
> la creación y gestión de pacientes, el envío de datos de sesiones de
> rehabilitación o la recuperación de estadísticas. Esta verificación ha
> resultado especialmente útil para detectar errores en fases tempranas
> del desarrollo.
>
> Otra de las funcionalidades relevantes de Postman es la posibilidad de
> incluir cabeceras personalizadas y datos en formato JSON en el cuerpo
> de las peticiones. Esto ha permitido comprobar que el *backend* de
> "Load Crutches" procesa correctamente la información enviada desde la
> aplicación móvil y la plataforma web, asegurando la coherencia del
> formato de intercambio de datos y el correcto tratamiento de los
> parámetros recibidos.

![](memoria_referencia/media/image14.jpeg){width="3.3069247594050744in"
height="4.170207786526684in"}

> []{#_bookmark64 .anchor}Ilustración 13: Colección de Postman del
> proyecto

7.  []{#_bookmark65 .anchor}XAMPP

> XAMPP es un paquete de software multiplataforma que integra un
> conjunto de herramientas necesarias para el desarrollo y prueba de
> aplicaciones web en entornos locales. Incluye un servidor web, un
> sistema gestor de bases de datos y utilidades adicionales que permiten
> simular de forma sencilla un entorno de servidor sin necesidad de
> realizar configuraciones complejas.
>
> En el proyecto "Load Crutches", XAMPP se ha utilizado como entorno de
> desarrollo local para la puesta en marcha y validación del *backend* y
> de la base de datos durante las fases iniciales del desarrollo. Su uso
> ha permitido disponer de un entorno controlado en el que probar la
> aplicación sin necesidad de desplegarla directamente en un servidor
> remoto.

## Modelado hardware

> En este apartado se describen los modelos hardware empleados en el
> desarrollo de "Load Crutches", responsables de la captura de datos
> físicos durante el uso real de la muleta. Estos modelos constituyen la
> base del sistema de medición y permiten transformar la interacción del
> paciente con la ayuda técnica en información digital útil para su
> posterior procesamiento y análisis.
>
> El diseño hardware se ha planteado con el objetivo de integrarse de
> forma efectiva en una muleta convencional, manteniendo un equilibrio
> entre precisión de medida, robustez mecánica y bajo consumo
> energético. Para ello, se ha optado por un enfoque práctico,
> seleccionando componentes electrónicos y sensores que permitan obtener
> datos fiables sin alterar de forma significativa la ergonomía ni el
> uso habitual del dispositivo.
>
> El modelado hardware se centra principalmente en dos aspectos: la
> medición de la carga aplicada sobre la muleta durante el apoyo y la
> detección de eventos básicos de movimiento asociados a la marcha.
> Estos modelos permiten registrar de forma continua el comportamiento
> real del paciente durante la rehabilitación, tanto en sesiones
> controladas como en entornos cotidianos.

1.  []{#_bookmark67 .anchor}Sistemas embebidos

> Un sistema embebido es un sistema de computación diseñado para
> realizar una o varias funciones específicas dentro de un sistema
> mayor, generalmente bajo estrictas restricciones de tamaño, consumo
> energético, capacidad de procesamiento y coste. A diferencia de los
> sistemas de propósito general, como los ordenadores personales, los
> sistemas embebidos están optimizados para una tarea concreta y
> funcionan de manera continua, interactuando directamente con el
> entorno físico.
>
> Este tipo de sistemas es especialmente habitual en dispositivos
> electrónicos de uso cotidiano, en el ámbito industrial y, cada vez con
> mayor presencia, en aplicaciones relacionadas con la salud y la
> rehabilitación, donde se requiere una integración discreta, fiable y
> de bajo consumo.
>
> ![](memoria_referencia/media/image15.png){width="4.839395231846019in"
> height="4.528437226596675in"}
>
> []{#_bookmark68 .anchor}Ilustración 14: Muleta instrumentada
>
> En el contexto del proyecto "Load Crutches", la muleta inteligente
> integra un sistema embebido cuyo núcleo es un microcontrolador. Este
> sistema constituye el elemento central del dispositivo físico y es
> responsable de coordinar todas las operaciones internas de la muleta.
> Entre sus principales funciones se encuentran:

- **Adquisición de datos**: lectura continua de la información
  proporcionada por los sensores integrados en la muleta, principalmente
  el sensor de carga y el sensor de movimiento.

- **Procesamiento básico de la información**: tratamiento inicial de las
  señales capturadas, incluyendo tareas como filtrado, conversión de
  señales analógicas a digitales, cálculo de valores representativos
  (por ejemplo, carga aplicada en cada apoyo) y generación de eventos de
  paso.

- **Gestión de la comunicación inalámbrica**: envío periódico de los
  datos procesados a la aplicación móvil mediante tecnología Bluetooth
  Low Energy, siguiendo una estructura de datos definida.

- **Control del consumo energético**: optimización del uso de recursos
  del sistema para maximizar la autonomía del dispositivo, reduciendo el
  consumo cuando no se detecta actividad.

> El uso de un sistema embebido en "Load Crutches" permite que la muleta
> funcione de manera autónoma, sin necesidad de una conexión permanente
> a un sistema externo, y garantiza que la captura de datos se realice
> de forma transparente para el usuario. Además,
>
> este enfoque facilita la integración física de la electrónica en la
> estructura de la muleta, manteniendo un diseño compacto, ligero y
> adecuado para un uso cotidiano durante el proceso de rehabilitación.

## Sensores

> Los sensores biomecánicos son dispositivos diseñados para medir
> magnitudes físicas relacionadas con el movimiento, la postura y la
> interacción del cuerpo humano con su entorno. En el ámbito de la
> rehabilitación y la monitorización de la salud, estos sensores
> permiten obtener información objetiva y cuantificable sobre el
> comportamiento del paciente, complementando la evaluación clínica
> tradicional basada en la observación y la percepción subjetiva.
>
> El uso de sensores biomecánicos resulta especialmente relevante en
> procesos de recuperación funcional, donde es fundamental conocer cómo
> el paciente utiliza ayudas técnicas, como muletas, y si respeta las
> cargas y pautas prescritas por el profesional sanitario.
>
> En el proyecto "Load Crutches", los sensores biomecánicos constituyen
> la principal fuente de información del sistema, ya que permiten
> transformar el uso físico de la muleta en datos digitales que pueden
> ser almacenados, analizados y visualizados. Concretamente, el sistema
> está orientado a la captación de dos tipos de magnitudes
> fundamentales:

- **Medición de carga**: cuantificación de la fuerza o peso aplicado por
  el paciente sobre la muleta en cada apoyo. Esta información es clave
  para evaluar si el usuario respeta los límites de carga establecidos
  durante la rehabilitación.

- **Detección de movimiento y pasos**: identificación de eventos de
  apoyo durante la marcha mediante sensores inerciales, lo que permite
  contabilizar pasos y analizar patrones básicos de uso de la muleta.

> La incorporación de sensores biomecánicos en "Load Crutches" aporta
> varias ventajas significativas frente a métodos tradicionales de
> seguimiento:

- Permite obtener datos objetivos y continuos, sin depender
  exclusivamente de la percepción del paciente.

- Facilita el seguimiento remoto del proceso de rehabilitación por parte
  del personal sanitario.

- Proporciona métricas cuantificables que pueden ser utilizadas para
  generar estadísticas, alertas y recomendaciones personalizadas.

> En conjunto, el empleo de sensores biomecánicos convierte a la muleta
> en un dispositivo activo dentro del proceso terapéutico, capaz de
> registrar información relevante sobre el comportamiento real del
> paciente durante su vida diaria y no únicamente en entornos clínicos
> controlados.

## Células de carga y galgas extensiométricas

> Una célula de carga es un tipo de sensor de fuerza diseñado para
> convertir una carga mecánica aplicada en una señal eléctrica
> proporcional. Este tipo de sensores es ampliamente utilizado en
> aplicaciones de medición de peso y fuerza debido a su fiabilidad,
> precisión y robustez. El principio de funcionamiento más habitual de
> las células de carga se basa en el uso de galgas extensiométricas.
>
> Las galgas extensiométricas son elementos resistivos que modifican su
> resistencia eléctrica cuando se deforman. Al aplicarse una fuerza
> sobre la estructura mecánica de la célula de carga, se produce una
> deformación mínima del material, que provoca una variación en la
> resistencia de las galgas. Esta variación se traduce en una señal
> eléctrica proporcional a la fuerza aplicada.
>
> En el proyecto "Load Crutches" se emplea una célula de carga axial de
> tensión y compresión, diseñada para medir fuerzas aplicadas a lo largo
> de un único eje. Este tipo de sensor resulta especialmente adecuado
> para su integración en una muleta, ya que la fuerza ejercida por el
> usuario durante el apoyo se transmite principalmente en dirección
> axial. Entre las principales ventajas de esta elección destacan:

- Medición directa de la carga transmitida durante el apoyo, sin
  necesidad de mecanismos adicionales.

- Alta robustez mecánica, adecuada para un uso repetitivo y prolongado.

- Buena relación entre precisión, tamaño y coste, lo que facilita su
  integración en un dispositivo portátil.

> La señal generada por la célula de carga es de naturaleza analógica,
> normalmente expresada en milivoltios por voltio (mV/V), lo que hace
> necesario el uso de circuitos de acondicionamiento y un proceso de
> calibración. Mediante la calibración, esta señal eléctrica se
> convierte en valores físicos reales de peso, expresados en kilogramos,
> que posteriormente pueden ser utilizados por el sistema para generar
> estadísticas y avisos.
>
> Gracias al uso de células de carga basadas en galgas extensiométricas,
> "Load Crutches" es capaz de obtener mediciones precisas y repetibles
> de la carga aplicada por el paciente, proporcionando información clave
> para el seguimiento objetivo del proceso de rehabilitación.
>
> ![](memoria_referencia/media/image16.jpeg){width="4.458579396325459in"
> height="2.6939577865266844in"}
>
> []{#_bookmark71 .anchor}Ilustración 15: Esquema galga estequiométrica

## Sensores inerciales y detección de pasos

> Los sensores inerciales son dispositivos capaces de medir magnitudes
> relacionadas con el movimiento, como aceleraciones lineales y
> variaciones de orientación en uno o varios ejes. Entre los sensores
> inerciales más utilizados se encuentran los acelerómetros y las
> unidades de medición inercial (IMU), que combinan acelerómetros y
> giróscopos en un mismo dispositivo.
>
> Este tipo de sensores se emplea de forma habitual en aplicaciones de
> análisis del movimiento humano, ya que permiten registrar patrones
> dinámicos asociados a actividades como caminar, correr o realizar
> apoyos repetitivos. En el ámbito de la rehabilitación, su uso facilita
> la obtención de información objetiva sobre la actividad física del
> paciente fuera del entorno clínico.
>
> En el sistema "Load Crutches", el sensor inercial se utiliza
> principalmente para la detección de pasos durante el uso de la muleta.
> A partir de las señales de aceleración registradas, el sistema es
> capaz de identificar eventos característicos que se producen cuando el
> usuario apoya la muleta en el suelo. Estos eventos se corresponden con
> variaciones bruscas y repetitivas en la señal, que pueden asociarse a
> un apoyo válido.
>
> La información proporcionada por el sensor de movimiento se emplea
> para:

- Detectar eventos de paso de forma automática.

- Estimar la frecuencia de uso de la muleta durante una sesión.

- Analizar patrones básicos de marcha asociados al proceso de
  rehabilitación.

> La detección de pasos se basa en el análisis de umbrales y patrones
> temporales en las señales de aceleración, permitiendo discriminar los
> apoyos reales de pequeñas vibraciones o movimientos no significativos.
> Aunque este método no pretende sustituir a
>
> sistemas avanzados de análisis de la marcha, ofrece una solución
> suficientemente precisa y de bajo coste computacional para el
> seguimiento diario del paciente.
>
> La integración de sensores inerciales en "Load Crutches" complementa
> la información obtenida por el sensor de carga, proporcionando una
> visión más completa del uso de la muleta y permitiendo relacionar la
> carga aplicada con el número de apoyos realizados durante la
> rehabilitación.

## Bluetooth

> La comunicación inalámbrica es un elemento fundamental en sistemas
> portátiles y dispositivos de monitorización, ya que permite la
> transmisión de datos sin necesidad de conexiones físicas, aumentando
> la comodidad y la usabilidad del sistema. En dispositivos alimentados
> por batería, como es el caso de una muleta inteligente, resulta
> especialmente importante emplear tecnologías de comunicación con bajo
> consumo energético.
>
> BLE (*Bluetooth Low Energy*) es un protocolo de comunicación
> inalámbrica diseñado específicamente para este tipo de aplicaciones.
> BLE permite el intercambio de pequeñas cantidades de datos de forma
> periódica, reduciendo significativamente el consumo energético en
> comparación con otras tecnologías inalámbricas tradicionales. Entre
> sus principales características se encuentran:

- Bajo consumo de energía, adecuado para dispositivos portátiles.

- Alcance suficiente para comunicaciones de corto alcance, como entre
  una muleta y un teléfono móvil.

- Amplia compatibilidad con dispositivos móviles actuales.

- Latencia reducida para la transmisión de datos en tiempo casi real.

> En el sistema "Load Crutches", BLE se utiliza como medio de
> comunicación entre la muleta inteligente y la aplicación móvil del
> paciente. El sistema embebido integrado en la muleta actúa como emisor
> de datos, mientras que la aplicación móvil funciona como receptor e
> intérprete de la información transmitida.
>
> La muleta envía de forma periódica tramas de datos estructuradas que
> incluyen información relacionada con la carga aplicada, la detección
> de pasos, el estado de la batería y marcas temporales. Esta
> información es recibida por la aplicación móvil, donde se procesa y se
> presenta al usuario de manera comprensible.
>
> El uso de Bluetooth Low Energy en "Load Crutches" permite que la
> transmisión de datos se realice de manera transparente para el
> paciente, sin necesidad de intervención constante, y garantiza una
> experiencia de uso fluida durante las sesiones de rehabilitación,
> manteniendo al mismo tiempo una autonomía adecuada del dispositivo.

## Sistemas distribuidos

> Un sistema distribuido es aquel en el que distintos componentes
> independientes cooperan entre sí a través de una red para ofrecer un
> servicio conjunto. En este tipo de sistemas, las tareas de captura de
> datos, procesamiento, almacenamiento y visualización se reparten
>
> entre varios elementos, lo que permite mejorar la escalabilidad, la
> flexibilidad y la mantenibilidad de la solución.
>
> En el ámbito de la salud digital, los sistemas distribuidos resultan
> especialmente relevantes, ya que permiten separar físicamente los
> dispositivos de adquisición de datos del resto de componentes del
> sistema, facilitando el seguimiento remoto de pacientes y la gestión
> centralizada de la información clínica.
>
> "Load Crutches" se apoya en una arquitectura distribuida en la que
> cada componente cumple una función específica dentro del ecosistema
> del sistema. Esta arquitectura está formada por los siguientes
> elementos principales:

- Un dispositivo físico, la muleta inteligente, encargado de la captura
  de datos biomecánicos durante el uso real del paciente.

- Una aplicación móvil que actúa como intermediaria entre el hardware y
  el resto del sistema, proporcionando una interfaz directa para el
  paciente y gestionando la recepción de datos.

- Un *backend* centralizado responsable del almacenamiento persistente
  de la información, la gestión de usuarios y la lógica de
  funcionamiento del sistema.

- Una plataforma web orientada a profesionales sanitarios, desde la cual
  es posible consultar los datos recogidos, analizar la evolución del
  paciente y configurar parámetros del tratamiento.

> Este enfoque distribuido permite que "Load Crutches" funcione de forma
> flexible y escalable, facilitando la incorporación de nuevos usuarios,
> la ampliación de funcionalidades y la adaptación del sistema a
> distintos contextos clínicos. Además, la separación de
> responsabilidades entre los distintos componentes contribuye a mejorar
> la seguridad, la mantenibilidad y la claridad del diseño del sistema
> en su conjunto.

![](memoria_referencia/media/image17.jpeg)

> []{#_bookmark75 .anchor}Ilustración 16: Esquema de la muleta

## Modelado software

> Durante el desarrollo de "Load Crutches" se han aplicado distintos
> modelos de diseño con el objetivo de estructurar el sistema de manera
> clara, modular y mantenible. El uso de patrones de diseño permite
> separar responsabilidades, facilitar la escalabilidad del sistema y
> simplificar tanto el desarrollo como el mantenimiento del código.
>
> Estos patrones se han aplicado principalmente en el desarrollo de la
> plataforma web y del *backend* del sistema, donde resulta
> especialmente importante organizar correctamente la lógica de negocio,
> la gestión de datos y la interacción con el usuario.

1.  []{#_bookmark77 .anchor}MVC

> En el proyecto "Load Crutches", el patrón MVC se ha utilizado como
> base organizativa en el desarrollo del *backend* y de la plataforma
> web destinada a los profesionales sanitarios. Su adopción ha permitido
> estructurar el código de forma clara, separando las distintas
> responsabilidades y facilitando el mantenimiento del sistema a lo
> largo del desarrollo.
>
> Gracias a este enfoque, la gestión de entidades como pacientes,
> sesiones de rehabilitación, patologías, consejos y estadísticas se ha
> podido implementar de manera ordenada. El acceso a la base de datos,
> el procesamiento de las peticiones y la generación de las vistas se
> han desarrollado de forma desacoplada, lo que ha reducido la
> complejidad del código y ha permitido introducir cambios sin afectar
> al conjunto del sistema.
>
> El uso de MVC ha sido especialmente útil durante las fases de
> ampliación de funcionalidades, ya que ha permitido añadir nuevas
> vistas y operaciones sin necesidad de reestructurar el *backend*
> existente. Esta organización ha contribuido a que el sistema sea más
> mantenible y coherente, algo fundamental en un proyecto que integra
> múltiples subsistemas.

2.  []{#_bookmark78 .anchor}MVVM

> En la aplicación móvil de "Load Crutches" se ha optado por utilizar el
> patrón MVVM, adaptándolo al desarrollo nativo en Swift con UIKit. Esta
> decisión se ha tomado para mantener separada la lógica de presentación
> de la interfaz gráfica y evitar que los controladores de vista
> asumieran demasiada responsabilidad.
>
> El uso de MVVM ha permitido centralizar en los modelos de vista todo
> el tratamiento de los datos procedentes del hardware de la muleta y
> del *backend*, preparando la información antes de mostrarla en
> pantalla. De este modo, las vistas se han mantenido simples y
> centradas únicamente en la presentación y la interacción con el
> usuario.
>
> Este enfoque ha resultado especialmente útil en pantallas con
> información dinámica, como las sesiones de rehabilitación, las
> estadísticas o los avisos, donde los datos cambian en función de la
> actividad del paciente y de la comunicación con el sistema. Además, ha
> facilitado la gestión del estado de la aplicación y ha reducido la
> complejidad de los controladores.
>
> ![](memoria_referencia/media/image19.png){width="5.873951224846894in"
> height="3.7848950131233594in"}
>
> []{#_bookmark79 .anchor}Ilustración 17: MVVM en "Load Crutches"

## Patrones estructurales

> Los patrones estructurales forman parte de los patrones de diseño de
> software y están orientados a resolver problemas relacionados con la
> composición y organización de clases y objetos dentro de un sistema.
> Su objetivo principal es definir cómo se relacionan los distintos
> componentes entre sí, facilitando la creación de estructuras
> flexibles, reutilizables y fáciles de mantener.
>
> A diferencia de los patrones arquitectónicos, que se centran en la
> organización global del sistema, los patrones estructurales actúan a
> un nivel más bajo de abstracción, permitiendo adaptar y conectar
> componentes existentes sin necesidad de modificar su implementación
> interna. Esto resulta especialmente útil en sistemas complejos o
> distribuidos, donde diferentes subsistemas deben cooperar entre sí a
> pesar de haber sido desarrollados de forma independiente.
>
> En el proyecto "Load Crutches", el uso de patrones estructurales ha
> sido clave para gestionar la interacción entre los distintos módulos
> que conforman el sistema, tales como el hardware de la muleta, la
> aplicación móvil, el *backend* y la plataforma web. Cada uno de estos
> componentes maneja información con estructuras y formatos diferentes,
> por lo que resulta necesario aplicar mecanismos que permitan
> estandarizar su tratamiento dentro del sistema.
>
> Los patrones estructurales permiten, en este contexto:

- Reducir el acoplamiento entre módulos.

- Facilitar la reutilización de componentes.

- Mejorar la claridad del diseño y la legibilidad del código.

- Permitir la evolución del sistema sin introducir dependencias
  innecesarias.

> En "Load Crutches", estos patrones se han aplicado principalmente en
> las capas de comunicación, tratamiento de datos y lógica intermedia,
> donde confluyen datos procedentes de distintas fuentes y tecnologías.

1.  []{#_bookmark81 .anchor}Adapter o Wrapper

> En el proyecto "Load Crutches" se ha utilizado el patrón Adapter como
> una solución práctica para aislar la lógica principal del sistema de
> los formatos concretos en los que llegan los datos desde los distintos
> subsistemas. Dado que el sistema integra hardware embebido, aplicación
> móvil, *backend* y plataforma web, cada uno de estos componentes
> maneja la información de forma diferente.
>
> Uno de los usos más relevantes del patrón Adapter se encuentra en la
> comunicación Bluetooth entre la muleta inteligente y la aplicación
> móvil. El dispositivo envía los datos en forma de tramas
> estructuradas, optimizadas para la transmisión inalámbrica, que no son
> directamente utilizables por el resto de la aplicación. Para resolver
> este problema, se implementa una capa adaptadora que transforma estas
> tramas en objetos de dominio propios del sistema, como estructuras de
> datos asociadas a sesiones de rehabilitación, valores de carga o
> eventos de paso.
>
> Gracias a esta adaptación, el resto de la aplicación móvil puede
> trabajar con modelos de datos coherentes y estables, sin depender del
> formato exacto definido en el firmware de la muleta. Esto permite
> modificar o evolucionar el protocolo de comunicación Bluetooth sin
> afectar a la lógica de presentación ni al procesamiento interno de la
> aplicación.
>
> El mismo enfoque se ha aplicado en la comunicación con el *backend*.
> Las respuestas recibidas desde la API REST, en formato JSON, son
> convertidas mediante adaptadores en modelos internos utilizados tanto
> por la aplicación móvil como por la plataforma web. De este modo, la
> lógica del sistema no depende directamente de la estructura de los
> endpoints ni de cambios en la API.
>
> En conjunto, el uso del patrón Adapter en "Load Crutches" ha permitido
> centralizar la transformación de datos, reducir el acoplamiento entre
> componentes y facilitar la evolución independiente del hardware, el
> *backend* y las aplicaciones cliente. Esta decisión ha resultado clave
> para mantener un sistema modular, mantenible y robusto frente a
> cambios tecnológicos.

## Prototipos

> En este apartado se describen los principales aspectos relacionados
> con el diseño y el prototipado de las interfaces de usuario del
> sistema "Load Crutches", abordados con anterioridad a la
> implementación de la funcionalidad definitiva. El objetivo de esta
> fase fue definir de forma clara cómo interactuarían los distintos
> perfiles de usuario con el
>
> sistema, garantizando una experiencia de uso coherente, intuitiva y
> alineada con los requisitos funcionales y clínicos definidos en los
> anexos del proyecto.
>
> El proceso de diseño se centró principalmente en la aplicación móvil
> destinada al paciente y en la plataforma web orientada a los
> profesionales sanitarios. Para ello, se emplearon técnicas de
> prototipado digital mediante storyboards, *wireframes* y *mockups*,
> que permitieron representar situaciones reales de uso del sistema y
> validar de manera temprana los flujos de interacción antes de abordar
> la implementación técnica.

1.  []{#_bookmark83 .anchor}Storyboards

> En este subapartado se definieron una serie de historias que
> representan situaciones reales de uso de "Load Crutches" mediante
> storyboards. Estas historias permiten contextualizar el funcionamiento
> del sistema desde el punto de vista del usuario final y facilitan la
> comprensión de los distintos flujos de interacción. Los storyboards se
> diseñaron utilizando herramientas de prototipado visual, permitiendo
> representar de forma gráfica y secuencial las acciones realizadas por
> los usuarios.

### Storyboard 1: Realización de una sesión de rehabilitación por parte del paciente

> En esta primera historia se representa una situación habitual en la
> que un paciente utiliza la aplicación móvil de "Load Crutches" durante
> su proceso de rehabilitación. El paciente inicia sesión en la
> aplicación y accede a la sección de sesiones de rehabilitación. Antes
> de comenzar, conecta la muleta inteligente mediante Bluetooth,
> verificando que el dispositivo está correctamente enlazado.
>
> Una vez establecida la conexión, el paciente inicia la sesión de
> rehabilitación y comienza a caminar apoyándose en la muleta. Durante
> la sesión, la aplicación muestra información básica en tiempo real
> relacionada con el uso de la muleta, como el peso aplicado y el número
> de pasos realizados, así como avisos asociados a los límites
> configurados por el profesional sanitario. Tras finalizar el
> ejercicio, el paciente detiene la sesión y los datos recogidos se
> almacenan automáticamente en el sistema. Finalmente, el paciente puede
> consultar un resumen de la sesión y su progreso diario desde la propia
> aplicación móvil.
>
> ![](memoria_referencia/media/image20.jpeg){width="5.549978127734033in"
> height="3.69875in"}
>
> []{#_bookmark85 .anchor}Ilustración 18: Storyboard de la realización
> de una sesión de rehabilitación por parte del paciente

### Storyboard 2: Seguimiento clínico y configuración del tratamiento por parte del profesional sanitario

> Este storyboard describe una situación en la que un profesional
> sanitario accede a la plataforma web de "Load Crutches" para realizar
> el seguimiento de un paciente. El doctor inicia sesión en el sistema y
> accede al listado de pacientes registrados. Tras seleccionar un
> paciente concreto, consulta su historial de sesiones de
> rehabilitación, visualizando datos agregados y estadísticas que
> reflejan la evolución del proceso.
>
> A partir de esta información, el profesional sanitario puede ajustar
> los límites de carga o de pasos, asignar o modificar lesiones y añadir
> consejos personalizados para el paciente. Estas configuraciones quedan
> almacenadas en el sistema y se aplican automáticamente en las
> siguientes sesiones de rehabilitación del paciente. El storyboard
> finaliza mostrando cómo el doctor puede utilizar el sistema de
> mensajería para comunicarse con el paciente y resolver dudas o
> realizar indicaciones adicionales.
>
> ![](memoria_referencia/media/image21.jpeg){width="5.6911143919510065in"
> height="3.793853893263342in"}
>
> []{#_bookmark87 .anchor}Ilustración 19: Storyboard de seguimiento
> clínico y configuración del tratamiento por parte del profesional
> sanitario

2.  []{#_bookmark88 .anchor}Prototipado

> En este subapartado se describe el proceso de prototipado llevado a
> cabo como paso previo a la implementación final del sistema,
> utilizando prototipos digitales de baja fidelidad como una primera
> aproximación visual y funcional a la aplicación de "Load Crutches". El
> objetivo principal de esta fase ha sido validar la estructura general
> de la interfaz, la organización de la información y los flujos básicos
> de interacción antes de abordar el desarrollo completo del software.
>
> El prototipado ha permitido obtener una visión temprana de cómo los
> distintos perfiles de usuario interactúan con el sistema, facilitando
> la detección de posibles problemas de usabilidad y mejorando la toma
> de decisiones en fases posteriores del proyecto.

### Prototipo de baja fidelidad - Mockup - Web

> Para la plataforma web de "Load Crutches" se ha elaborado un prototipo
> de baja fidelidad mediante la creación de mockups utilizando una
> herramienta de prototipado digital. Estas pantallas representan la
> interfaz destinada principalmente a los profesionales sanitarios,
> donde se reflejan funcionalidades como la consulta del historial de
> rehabilitación, la visualización de estadísticas, la configuración de
> límites y objetivos, y la comunicación con los pacientes.
>
> El mockup web ha sido diseñado pensando en su uso desde navegadores
> convencionales, siendo adaptable a distintos tamaños de pantalla y
> resoluciones. De este modo, se ha
>
> priorizado una distribución clara de la información, una navegación
> sencilla entre secciones y una presentación visual orientada al
> análisis clínico de los datos recogidos por el sistema.

### Vista de inicio de sesión

> En [Ilustración 20](#_bookmark91) se muestra la pantalla
> correspondiente al formulario de autenticación del panel web de "Load
> Crutches", destinada al acceso del personal médico autorizado al
> sistema. Para utilizar las funcionalidades de gestión clínica, el
> usuario debe autenticarse mediante su nombre de usuario y la
> contraseña definidos durante el proceso de registro.
>
> La interfaz presenta de forma clara y centralizada los campos
> necesarios para la introducción de las credenciales, incorporando
> validaciones básicas antes de enviar la solicitud de autenticación al
> servidor.

![](memoria_referencia/media/image22.png){width="4.07757217847769in"
height="3.1324989063867017in"}

> []{#_bookmark91 .anchor}Ilustración 20: Vista de la pantalla de inicio
> de sesión doctor

### Vista de registro

> En la [Ilustración 21](#_bookmark93) se muestra la pantalla
> correspondiente al formulario de registro de doctores del panel web,
> destinada al alta de nuevos profesionales sanitarios en el sistema.
> Esta vista permite crear una nueva cuenta médica que habilita el
> acceso a las funcionalidades de gestión clínica de la plataforma.
>
> La interfaz presenta de forma vertical y ordenada los campos
> necesarios para el registro, incluyendo el nombre de usuario, la
> contraseña y su confirmación, así como los datos identificativos del
> profesional, tales como nombre, apellidos y correo electrónico.
>
> Adicionalmente, se incluye un campo específico para la introducción
> del código de doctor, utilizado como mecanismo de control para
> restringir el alta únicamente a profesionales autorizados.

![](memoria_referencia/media/image23.png){width="5.962918853893263in"
height="3.254166666666667in"}

> []{#_bookmark93 .anchor}Ilustración 21: Vista de la pantalla de
> registro de doctor

### Vista principal

> En la [Ilustración 22](#_bookmark95) se muestra la vista principal del
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
> ![](memoria_referencia/media/image24.png){width="5.963059930008749in"
> height="2.9929166666666664in"}
>
> []{#_bookmark95 .anchor}Ilustración 22: Vista de principal

### Vista de gestión de paciente

> En la [Ilustración 23](#_bookmark97) se muestra la vista de gestión de
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
>
> ![](memoria_referencia/media/image25.png){width="5.918772965879265in"
> height="3.7159372265966755in"}
>
> []{#_bookmark97 .anchor}Ilustración 23: Vista de pacientes

### Vista de gestión de patologías

> En la [Ilustración 24](#_bookmark99) se muestra la vista de gestión de
> patologías del panel web, destinada a la administración del catálogo
> de lesiones y patologías clínicas utilizadas dentro del sistema. Esta
> pantalla permite al personal médico consultar, crear, modificar y
> eliminar patologías de forma centralizada.
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
> ![](memoria_referencia/media/image26.png){width="5.906232502187226in"
> height="3.7061450131233595in"}
>
> []{#_bookmark99 .anchor}Ilustración 24: Vista de gestión de patologías

### Vista de gestión de consejos

> En la [Ilustración 25](#_bookmark101) se muestra la vista de gestión
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
>
> ![](memoria_referencia/media/image27.png){width="5.918696412948382in"
> height="3.7061450131233595in"}
>
> []{#_bookmark101 .anchor}Ilustración 25: Vista de gestión de consejos

### Vista de chat

> En la [Ilustración 26](#_bookmark103) se muestra la vista de chat del
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
> ![](memoria_referencia/media/image28.png){width="5.969253062117235in"
> height="3.446665573053368in"}
>
> []{#_bookmark103 .anchor}Ilustración 26: Vista de Chat

### Vistas de sesiones

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

![](memoria_referencia/media/image29.png){width="5.704748468941382in"
height="2.7399989063867016in"}

> []{#_bookmark105 .anchor}Ilustración 27: Vista de sesiones
>
> ![](memoria_referencia/media/image30.png){width="5.759812992125984in"
> height="2.92in"}
>
> []{#_bookmark106 .anchor}Ilustración 28: Vista de detalle de sesiones

![](memoria_referencia/media/image31.png){width="5.394819553805775in"
height="2.7316666666666665in"}

> []{#_bookmark107 .anchor}Ilustración 29: Vista de detalles de
> microsesiones

### Vista de configuración

> La [Ilustración 30](#_bookmark109) muestra la vista de configuración
> permite al usuario personalizar y gestionar distintos parámetros
> generales de la aplicación web. Esta pantalla se presenta como una
> ventana modal superpuesta al panel principal, lo que permite modificar
> la configuración sin abandonar el contexto de uso actual.
>
> En esta vista se agrupan las opciones de configuración en diferentes
> secciones. En primer lugar, se incluye la selección de idioma,
> permitiendo adaptar la interfaz a la lengua preferida del usuario. A
> continuación, se ofrece una sección de apariencia, donde se puede
>
> definir el tema visual de la aplicación, facilitando la adaptación a
> diferentes preferencias de visualización.
>
> Asimismo, la vista incorpora una sección de seguridad, desde la cual
> el usuario puede iniciar el proceso de cambio de contraseña. En la
> parte inferior de la ventana se presentan las acciones principales
> para guardar los cambios realizados o cancelar la operación,
> garantizando un control explícito sobre la modificación de la
> configuración.

![](memoria_referencia/media/image32.png){width="3.040987532808399in"
height="2.7312489063867016in"}

> []{#_bookmark109 .anchor}Ilustración 30: Vista de configuración

1.  []{#_bookmark110 .anchor}Tipografía y colores (Web)

> Como parte del prototipo inicial y del diseño de la aplicación web de
> "Load Crutches", uno de los primeros aspectos abordados fue la
> definición de la tipografía y de la paleta de colores, con el objetivo
> de construir una interfaz coherente con el ámbito sanitario,
> tecnológicamente actual y fácilmente utilizable por profesionales
> clínicos en su actividad diaria. Estos elementos visuales han sido
> seleccionados para reforzar la claridad en la presentación de la
> información, la accesibilidad del sistema y la sensación de fiabilidad
> y control que debe transmitir una herramienta orientada al seguimiento
> de procesos de rehabilitación.
>
> En relación con la tipografía, desde el inicio se buscó una fuente
> moderna, limpia y altamente legible, capaz de ofrecer un rendimiento
> óptimo tanto en pantallas de escritorio como en dispositivos con
> diferentes resoluciones y tamaños. Dado que el portal web está pensado
> para un uso continuado por parte de profesionales sanitarios, se
> priorizó la comodidad visual, la uniformidad tipográfica y la
> neutralidad estética frente a tipografías excesivamente decorativas o
> con un marcado carácter experimental.
>
> Finalmente, se optó por la tipografía Inter Sans, una fuente
> sans-serif ampliamente utilizada en aplicaciones web y plataformas
> digitales contemporáneas. Inter Sans se caracteriza por sus trazos
> claros, su excelente espaciado entre caracteres y su alta legibilidad
> incluso en tamaños reducidos, lo que la hace especialmente adecuada
> para
>
> interfaces densas en información. Esta tipografía se utiliza de forma
> consistente en todo el panel web de "Load Crutches", estableciendo
> jerarquías visuales mediante variaciones de peso y tamaño para
> diferenciar títulos, subtítulos, etiquetas, tablas y texto
> informativo. Esta decisión facilita una lectura fluida y permite
> identificar rápidamente la información relevante en vistas como
> listados de pacientes, sesiones de rehabilitación, gráficos de
> evolución o paneles estadísticos.
>
> El uso de una tipografía funcional y bien equilibrada refuerza el
> carácter profesional del sistema y reduce la fatiga visual durante
> sesiones prolongadas de uso. Asimismo, esta elección favorece la
> accesibilidad del sistema y su posible adaptación futura a otros
> idiomas o configuraciones de visualización, manteniendo siempre una
> experiencia de usuario homogénea y predecible.

![](memoria_referencia/media/image33.png){width="3.438213035870516in"
height="2.59875in"}

> []{#_bookmark111 .anchor}Ilustración 31: Muestra de caracteres de la
> tipografía Inter
>
> En cuanto a la paleta de colores utilizada en la aplicación web, se ha
> definido un conjunto cromático estructurado en colores primarios,
> secundarios, de acento y tonos neutros, con el objetivo de transmitir
> sensaciones de profesionalidad, dinamismo y claridad visual. La base
> de la interfaz se apoya en tonos neutros claros, que proporcionan un
> entorno limpio y ordenado, mientras que los colores de acento se
> emplean para destacar acciones, estados y elementos interactivos
> clave.
>
> El color principal del sistema es un tono naranja (#FF6B35), utilizado
> como color identificativo de la aplicación y presente en botones
> principales, elementos de llamada a la acción y componentes
> destacados. Este color transmite energía, cercanía y dinamismo,
> aportando un carácter distintivo a "Load Crutches" sin resultar
> agresivo visualmente. Sus variantes más oscuras y claras permiten
> mantener coherencia cromática en distintos estados de interacción.
>
> Como color secundario se emplea un tono turquesa (#4ECDC4), utilizado
> para complementar al color principal en gráficos, indicadores
> secundarios y elementos de apoyo visual. Este color aporta equilibrio
> y frescura al conjunto visual, reforzando la sensación de control y
> estabilidad asociada al ámbito de la salud. El color de acento
> (#FFE66D) se utiliza de forma puntual para resaltar información
> relevante o estados concretos, evitando su uso excesivo para no
> sobrecargar la interfaz.
>
> La base visual de la aplicación se construye sobre una gama de tonos
> neutros, que van desde grises muy claros (#FAFAFA, #8A8A8A) hasta
> grises más oscuros (#262626, #171717), empleados para fondos,
> separadores, textos secundarios y elementos estructurales. El uso de
> estos colores neutros permite que los colores principales destaquen de
> forma natural y contribuye a una correcta jerarquización visual de la
> información.
>
> Además, se han definido colores específicos para representar estados
> del sistema, como el color de éxito (#10B981) para indicar valores
> dentro de los rangos establecidos, el color de advertencia (#F59E0B)
> para situaciones que requieren atención, el color de error (#EF4444)
> para alertas críticas y el color informativo (#3B82F6) para mensajes y
> acciones de carácter neutro. Esta codificación cromática facilita una
> interpretación rápida de los datos clínicos y del estado de las
> sesiones de rehabilitación.
>
> Por último, el sistema contempla la posibilidad de utilizar un modo
> oscuro, basado en los tonos neutros más oscuros de la paleta,
> invirtiendo la relación entre fondos y textos. Esta funcionalidad
> mejora la comodidad de uso en entornos con baja iluminación y se
> adapta a las preferencias personales de los usuarios, manteniendo
> siempre la coherencia cromática, el contraste adecuado y la
> legibilidad de todos los elementos.

![](memoria_referencia/media/image34.png){width="5.851547462817148in"
height="1.0884372265966755in"}

> []{#_bookmark112 .anchor}Ilustración 32: Paleta de colores utilizada
> en la aplicación web

![](memoria_referencia/media/image35.png){width="5.823692038495188in"
height="1.0482283464566928in"}

> []{#_bookmark113 .anchor}Ilustración 33: Paleta de colores utilizada
> en la base de la aplicación web

### Prototipo de baja fidelidad -- Mockup -- App

> De forma complementaria, se ha desarrollado un prototipo de baja
> fidelidad para la aplicación móvil de "Load Crutches", orientada
> principalmente al paciente. Este mockup representa las pantallas
> básicas de interacción durante una sesión de rehabilitación, como el
> inicio de sesión, la visualización del estado de la sesión, la
> recepción de avisos o consejos y la consulta del historial personal.
>
> El prototipo de la aplicación móvil se ha diseñado teniendo en cuenta
> las limitaciones propias de los dispositivos móviles, priorizando la
> simplicidad, la claridad visual y la facilidad de uso durante el
> proceso de rehabilitación. Este enfoque ha permitido sentar las bases
> para una interfaz intuitiva y coherente con el uso cotidiano del
> sistema por parte del paciente.

### Vista de iniciar sesión

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

![](memoria_referencia/media/image36.png){width="2.043264435695538in"
height="3.610624453193351in"}

> []{#_bookmark116 .anchor}Ilustración 34: Vista de la pantalla de
> inicio de sesión

### Vista de inicio

> La vista de inicio de la aplicación móvil constituye la pantalla
> principal a la que accede el paciente tras autenticarse en el sistema.
> Su objetivo es servir como punto de partida
>
> para la interacción con la muleta inteligente y con el resto de las
> funcionalidades de la aplicación.
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
>
> Una vez haya una muleta conectada se podrá proceder a la vista donde
> se realice la sesión.

![](memoria_referencia/media/image37.png){width="2.323279746281715in"
height="4.529478346456693in"}

> []{#_bookmark118 .anchor}Ilustración 35: Vista de inicio

### Vista para realizar sesión

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
> datos complejos. La zona central de la vista está reservada para un
> gráfico circular, que actúa como elemento principal de representación
> visual.
>
> Este gráfico permite mostrar de forma intuitiva la distribución del
> peso o del esfuerzo realizado durante la sesión, facilitando la
> comprensión del estado físico del paciente sin requerir conocimientos
> técnicos.
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
>
> ![](memoria_referencia/media/image38.png){width="2.1369794400699913in"
> height="4.205207786526684in"}
>
> []{#_bookmark120 .anchor}Ilustración 36: Vista de realizar sesión

### Vista de Bluetooth

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
> sesión, garantizando la coherencia con el resto de las vistas
> principales de la aplicación.
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
> Finalmente, en la parte inferior de la pantalla se mantiene la barra
> de navegación de la aplicación, que proporciona acceso rápido a las
> distintas secciones disponibles (inicio, Bluetooth, estadísticas, chat
> y perfil), asegurando una navegación fluida y consistente en toda la
> aplicación.

![](memoria_referencia/media/image39.png){width="1.927267060367454in"
height="3.7968744531933507in"}

> []{#_bookmark122 .anchor}Ilustración 37: Vista de Bluetooth

### Vista de estadísticas

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
> avisos. Estos elementos actúan como accesos directos a vistas
> específicas donde se detalla la información correspondiente a cada
> categoría.
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

![](memoria_referencia/media/image40.png){width="1.927192694663167in"
height="3.8020833333333335in"}

> []{#_bookmark123 .anchor}Ilustración 38: Vista de estadísticas

### Vista de estadísticas de sesiones

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
> así como puntos intermedios que representan mediciones realizadas a
>
> lo largo del tiempo. La visualización permite al usuario identificar
> de forma intuitiva tendencias y variaciones durante la sesión.
>
> En la parte inferior de la vista se muestra un resumen textual con el
> valor medio total del peso registrado durante el día, proporcionando
> una visión global complementaria a la información detallada del
> gráfico.

![](memoria_referencia/media/image41.png){width="2.364102143482065in"
height="4.657603893263342in"}

> []{#_bookmark124 .anchor}Ilustración 39: Vista de sesiones

### Vista de pasos

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
>
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

![](memoria_referencia/media/image42.png){width="2.0925in"
height="3.63375in"}

> []{#_bookmark126 .anchor}Ilustración 40: Vista de consejos

### Vista de consejos

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

![](memoria_referencia/media/image43.jpeg){width="2.5634722222222224in"
height="4.46875in"}

> []{#_bookmark128 .anchor}Ilustración 41: Vista de consejos

### Vista de chat

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

![](memoria_referencia/media/image44.png){width="2.5118471128608926in"
height="4.949478346456693in"}

> []{#_bookmark130 .anchor}Ilustración 42: Vista de chat

### Vista de perfil

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
>
> ![](memoria_referencia/media/image45.png){width="1.8884864391951006in"
> height="3.7107283464566927in"}
>
> []{#_bookmark132 .anchor}Ilustración 43: Vista de perfil

2.  []{#_bookmark133 .anchor}Tipografía y colores (App)

> Como parte del prototipo inicial y del diseño de la aplicación móvil
> de "Load Crutches", uno de los aspectos clave abordados desde las
> primeras fases fue la definición de la tipografía y de la paleta de
> colores, con el objetivo de ofrecer una experiencia de uso clara,
> coherente y plenamente integrada con el entorno iOS. Dado que la
> aplicación está orientada principalmente a pacientes en proceso de
> rehabilitación, se priorizó un diseño visual sencillo, accesible y
> adaptado a un uso cotidiano en dispositivos móviles.
>
> En relación con la tipografía, se optó por utilizar SF Pro (San
> Francisco), la tipografía del sistema de iOS. Esta fuente ha sido
> diseñada específicamente por Apple para su uso en interfaces móviles y
> se caracteriza por una excelente legibilidad, una correcta adaptación
> a distintos tamaños de pantalla y una integración nativa con el
> sistema operativo. El uso de SF Pro garantiza una experiencia de
> usuario consistente con el resto del ecosistema iOS, reduciendo la
> curva de aprendizaje y mejorando la percepción de familiaridad de la
> aplicación.
>
> La tipografía SF Pro se emplea de forma uniforme en toda la aplicación
> móvil, estableciendo jerarquías visuales claras mediante variaciones
> de tamaño y peso para diferenciar títulos, valores numéricos,
> etiquetas y textos informativos. Esta jerarquización resulta
> especialmente relevante en vistas relacionadas con la realización de
> sesiones de rehabilitación, la consulta de estadísticas o el
> seguimiento del progreso, donde es necesario identificar rápidamente
> la información más relevante.
>
> El uso de la tipografía del sistema refuerza el carácter funcional y
> accesible de la aplicación móvil de "Load Crutches", evitando
> inconsistencias visuales y asegurando una correcta representación
> tipográfica en diferentes dispositivos y versiones del sistema
>
> operativo. Además, esta elección favorece el cumplimiento de las
> recomendaciones de diseño de Apple en términos de accesibilidad y
> usabilidad.

![](memoria_referencia/media/image46.png){width="4.010582895888014in"
height="3.0625in"}

> []{#_bookmark134 .anchor}Ilustración 44: Muestra de caracteres de la
> tipografía SF
>
> En cuanto a la paleta de colores utilizada en la aplicación móvil, se
> ha optado por una base de tonos neutros claros, combinados con colores
> pastel empleados de forma puntual en determinados elementos de la
> interfaz. Esta elección permite mantener una apariencia visual limpia
> y relajada, adecuada para un contexto de uso sanitario, al tiempo que
> se guían las acciones del usuario mediante colores suaves y no
> invasivos.
>
> El color blanco (#FFFFFF) se utiliza como color de fondo principal en
> la mayoría de las pantallas de la aplicación, proporcionando un
> entorno visual limpio y facilitando la lectura del contenido. El texto
> principal se presenta en color negro (#000000), garantizando un alto
> contraste y una excelente legibilidad. Como fondo secundario se emplea
> el gris claro (#F5F5F5), utilizado en contenedores, tarjetas y
> secciones diferenciadas dentro de una misma vista, ayudando a
> estructurar la información de forma ordenada. El gris muy claro
> (#E6E6E6) se utiliza de manera puntual en gráficos vacíos o estados
> sin datos, permitiendo identificar visualmente estas situaciones sin
> generar confusión ni distracción.
>
> Sobre esta base neutra, se emplean colores pastel como el azul, el
> naranja, el amarillo y el verde en algunos botones y elementos
> interactivos de la interfaz. Estos colores se utilizan de forma
> controlada para resaltar acciones concretas o diferenciar
> funcionalidades, manteniendo siempre una estética suave y equilibrada
> que no resulte agresiva para el usuario.
>
> Por último, el sistema contempla la posibilidad de utilizar un modo
> oscuro, basado en los tonos neutros más oscuros de la paleta,
> invirtiendo la relación entre fondos y textos. Esta funcionalidad
> mejora la comodidad de uso en entornos con baja iluminación y se
> adapta a las preferencias personales de los usuarios, manteniendo
> siempre la coherencia cromática, el contraste adecuado y la
> legibilidad de todos los elementos.
>
> ![](memoria_referencia/media/image47.png){width="5.454374453193351in"
> height="1.0301038932633422in"}
>
> []{#_bookmark135 .anchor}Ilustración 45: Paleta de colores utilizada
> en la base de la aplicación móvil

## Métricas

> En este apartado se presentan las métricas utilizadas para evaluar el
> funcionamiento de "Load Crutches". Estas métricas permiten comprobar
> de forma objetiva si el sistema cumple los objetivos definidos y si su
> comportamiento es adecuado tanto a nivel funcional como técnico.
>
> Dado que el sistema integra hardware, aplicación móvil, *backend* y
> plataforma web, la evaluación se ha dividido en tres grupos: métricas
> funcionales, métricas técnicas y métricas de validación.
>
> Las métricas funcionales verifican que las funcionalidades del sistema
> se ejecutan correctamente desde el punto de vista del usuario. Las
> métricas técnicas analizan el comportamiento interno y la correcta
> comunicación entre los distintos componentes. Por último, las métricas
> de validación permiten comprobar que el sistema desarrollado cumple
> los requisitos iniciales del proyecto en un contexto de uso realista.

1.  []{#_bookmark137 .anchor}Métricas funcionales

> Las métricas funcionales permiten evaluar en qué medida el sistema
> "Load Crutches" cumple con los objetivos para los que ha sido
> diseñado, desde el punto de vista del uso real por parte de pacientes
> y profesionales sanitarios. Estas métricas están directamente
> relacionadas con la funcionalidad ofrecida por el hardware de la
> muleta, la aplicación móvil y el panel web, y se centran en la
> capacidad del sistema para apoyar y mejorar el proceso de
> rehabilitación con muletas, proporcionando información objetiva,
> comprensible y útil para la toma de decisiones clínicas.

### Métricas asociadas al paciente durante la rehabilitación

> Una de las métricas funcionales principales es el peso aplicado sobre
> la muleta durante el uso. El sistema permite medir de forma continua
> la carga ejercida en cada apoyo, expresada en kilogramos, gracias al
> sensor de carga integrado en la caña de la muleta. A partir de esta
> medición se obtienen varios indicadores funcionales:

- **Peso medio por sesión**: valor medio de carga aplicado durante una
  sesión completa de rehabilitación.

- **Peso instantáneo**: valor mostrado en tiempo real durante la sesión,
  que permite al paciente corregir su apoyo de forma inmediata.

- **Desviaciones respecto a los límites terapéuticos**: detección de
  situaciones de sobrepeso o infrapeso cuando el valor registrado se
  encuentra fuera de los rangos definidos por el profesional sanitario.

> Estas métricas permiten evaluar si el paciente está cumpliendo
> correctamente las pautas de carga establecidas para su proceso de
> recuperación, aportando un feedback inmediato que no existe en la
> rehabilitación tradicional basada únicamente en la percepción
> subjetiva.
>
> Otra métrica funcional relevante es el número de pasos realizados
> durante una sesión y a lo largo del día. El sistema registra los pasos
> detectados por el hardware y los presenta de forma agregada en la
> aplicación móvil:

- **Pasos por sesión**: número total de apoyos registrados durante una
  sesión concreta.

- **Pasos diarios**: suma de los pasos realizados a lo largo del día.

- **Progreso respecto a objetivos diarios**: comparación entre los pasos
  realizados y los límites mínimo y máximo establecidos por el
  profesional sanitario.

> Esta métrica permite controlar la cantidad de actividad realizada por
> el paciente, evitando tanto el sedentarismo como el sobreesfuerzo, y
> favoreciendo una rehabilitación progresiva y controlada.
>
> Métricas de seguimiento y adherencia al tratamiento
>
> Desde un punto de vista funcional, el sistema también permite medir la
> adherencia del paciente al tratamiento pautado. A partir de los datos
> almacenados se pueden obtener indicadores como:

- **Número de sesiones realizadas**: total de sesiones de rehabilitación
  registradas en un periodo determinado.

- **Frecuencia de uso de la muleta**: regularidad con la que el paciente
  realiza sesiones de rehabilitación.

- **Duración de las sesiones**: tiempo aproximado de uso de la muleta en
  cada sesión, a partir de los registros temporales.

> Estas métricas ayudan a identificar patrones de uso, detectar posibles
> abandonos del tratamiento o periodos de baja actividad, y facilitan al
> profesional sanitario una visión objetiva del compromiso del paciente
> con su rehabilitación.

### Métricas funcionales para el profesional sanitario

> Desde el panel web, el profesional sanitario dispone de métricas
> funcionales orientadas al análisis clínico y a la toma de decisiones.
> Entre las más relevantes se encuentran:

- **Evolución temporal del peso aplicado**: gráficos que muestran la
  progresión del peso medio soportado por el paciente a lo largo del
  tiempo, comparado con los límites establecidos.

- **Evolución del número de pasos**: análisis de la actividad diaria y
  por sesiones, permitiendo evaluar la mejora funcional del paciente.

- **Cumplimiento de límites terapéuticos**: identificación visual de
  sesiones en las que el paciente ha superado o no alcanzado los valores
  recomendados.

> Estas métricas permiten ajustar de forma dinámica los límites de carga
> y de actividad, personalizando el tratamiento en función de la
> evolución real del paciente y no únicamente de estimaciones teóricas.

### Métricas de interacción y comunicación

> El sistema incorpora métricas funcionales relacionadas con la
> comunicación entre paciente y profesional sanitario. Aunque no se
> trata de métricas clínicas directas, sí influyen en la calidad del
> seguimiento:

- **Uso del sistema de chat**: intercambio de mensajes para resolver
  dudas, informar de molestias o recibir indicaciones adicionales.

- **Consulta de avisos y consejos**: acceso del paciente a las
  recomendaciones clínicas asociadas a su lesión o patología.

> Estas métricas reflejan el grado de interacción y acompañamiento
> durante la rehabilitación, reforzando el carácter continuo y
> supervisado del tratamiento.

1.  []{#_bookmark141 .anchor}Métricas técnicas

> Las métricas técnicas permiten evaluar el correcto funcionamiento del
> sistema "Load Crutches" desde un punto de vista tecnológico,
> analizando el rendimiento, la fiabilidad y la eficiencia de los
> distintos componentes que lo conforman. Estas métricas no están
> directamente relacionadas con la percepción del usuario final, pero
> resultan fundamentales para garantizar la estabilidad del sistema, la
> calidad de los datos recogidos y la viabilidad de su uso continuado en
> un contexto real de rehabilitación.
>
> Las métricas técnicas se han definido teniendo en cuenta la
> arquitectura distribuida del sistema, el hardware de la muleta, la
> comunicación inalámbrica, el backend y las aplicaciones cliente,
> apoyándose en la información recogida en los anexos de hardware y
> manual de usuario.

### Métricas técnicas asociadas al hardware de la muleta

> Una de las métricas técnicas principales es la frecuencia de muestreo
> de los sensores integrados en la muleta. El sistema mide de forma
> periódica la señal del sensor de carga y del sensor de movimiento,
> siendo relevante evaluar:

- **Frecuencia de lectura del sensor de carga**: número de muestras por
  segundo utilizadas para registrar el peso aplicado.

- **Frecuencia de detección de pasos**: capacidad del sistema para
  identificar correctamente eventos de apoyo sin pérdidas de
  información.

- **Estabilidad de la señal**: ausencia de lecturas erráticas o picos
  anómalos durante un uso continuado.

> Estas métricas permiten verificar que el hardware es capaz de captar
> datos de forma consistente durante toda la sesión de rehabilitación,
> incluso bajo condiciones de uso prolongado o repetitivo.
>
> Otra métrica técnica relevante es la autonomía energética del sistema.
> A partir de las pruebas realizadas se evalúan aspectos como:

- Duración de la batería por ciclo de carga.

- Consumo energético medio durante una sesión.

- Comportamiento del sistema ante niveles bajos de batería.

> Esta información es clave para asegurar que el dispositivo puede
> utilizarse en sesiones reales sin interrupciones inesperadas y para
> identificar posibles mejoras futuras en la gestión energética.

### Métricas técnicas de comunicación Bluetooth

> La comunicación entre la muleta y la aplicación móvil se realiza
> mediante Bluetooth Low Energy, por lo que se han definido métricas
> técnicas específicas para evaluar su rendimiento:

- **Latencia de transmisión**: tiempo transcurrido entre la captura del
  dato en la muleta y su recepción en la aplicación móvil.

- **Pérdida de paquetes**: número de tramas no recibidas correctamente
  durante una sesión.

- **Estabilidad de la conexión**: número de desconexiones involuntarias
  durante el uso normal.

> Estas métricas permiten comprobar que la comunicación inalámbrica es
> suficientemente fiable para un seguimiento en tiempo casi real,
> evitando inconsistencias en los datos mostrados al usuario.
>
> []{#_bookmark144 .anchor}**Métricas técnicas del *backend***
>
> Desde el punto de vista del *backend*, las métricas técnicas se
> centran en la capacidad del sistema para almacenar, procesar y servir
> los datos de forma eficiente:

- **Tiempo de respuesta de la API**: latencia media de las peticiones
  realizadas desde la aplicación móvil y el *frontend* web.

- **Tasa de errores en peticiones**: porcentaje de peticiones que
  devuelven errores frente al total de solicitudes.

- **Capacidad de concurrencia**: comportamiento del sistema ante
  múltiples accesos simultáneos, tanto de pacientes como de
  profesionales sanitarios.

> Estas métricas son especialmente relevantes para validar que la
> arquitectura modular y distribuida permite la ejecución de varios
> procesos de forma simultánea sin degradar el rendimiento del sistema.
>
> Métricas técnicas del *frontend* web y la aplicación móvil
>
> En el *frontend* web y la aplicación móvil se han tenido en cuenta
> métricas técnicas relacionadas con la experiencia de uso y la
> estabilidad del software:

- Tiempo de carga de vistas principales.

- Fluidez en la actualización de datos y gráficos.

- Consumo de recursos en el dispositivo cliente.

> Aunque estas métricas no se perciben de forma directa como indicadores
> clínicos, influyen de manera significativa en la usabilidad y en la
> aceptación del sistema por parte de los usuarios finales.

1.  []{#_bookmark145 .anchor}Métricas de validación

> Las métricas de validación tienen como objetivo comprobar que el
> sistema "Load Crutches" cumple adecuadamente con los requisitos
> planteados al inicio del proyecto y que los resultados obtenidos son
> coherentes con el uso esperado en un contexto real de rehabilitación.
> A diferencia de las métricas técnicas, estas métricas se centran en
> validar el comportamiento global del sistema, la utilidad de la
> información generada y la coherencia entre los distintos subsistemas.
>
> Dado que el proyecto se ha desarrollado en un entorno académico y no
> ha sido posible realizar pruebas clínicas con pacientes reales en un
> contexto hospitalario, las métricas de validación se han obtenido a
> partir de pruebas controladas, uso experimental del sistema y
> evaluaciones cualitativas basadas en escenarios de uso realistas.

### Validación funcional del sistema

> Una de las métricas de validación principales es el grado de
> cumplimiento de los requisitos funcionales definidos en la
> especificación del sistema. Para ello se ha comprobado que:

- El paciente puede iniciar, realizar y finalizar una sesión de
  rehabilitación de forma completa.

- Los datos de peso y pasos se registran correctamente durante la
  sesión.

- La información se almacena de forma persistente y se recupera sin
  pérdidas.

- El profesional sanitario puede consultar sesiones pasadas,
  estadísticas y evolución del paciente.

> La validación se considera satisfactoria cuando todas estas acciones
> pueden ejecutarse sin errores y siguiendo el flujo descrito en los
> casos de uso del sistema.

### Validación de coherencia de los datos

> Otra métrica de validación relevante es la coherencia de los datos
> recogidos y mostrados en los distintos niveles del sistema. Se ha
> verificado que:

- Los valores visualizados en la aplicación móvil coinciden con los
  datos enviados por la muleta.

- Los datos almacenados en el *backend* coinciden con los mostrados
  posteriormente en el *frontend* web.

- Las estadísticas y agregaciones reflejan correctamente los valores
  reales de las sesiones realizadas.

> Esta validación permite asegurar que no existen inconsistencias entre
> la captura, transmisión, almacenamiento y visualización de la
> información.

### Validación de utilidad clínica percibida

> Aunque no se ha realizado un estudio clínico formal, se ha utilizado
> una métrica de validación cualitativa basada en la utilidad percibida
> del sistema. A partir del uso del sistema por parte del propio
> desarrollador y de personas cercanas en pruebas realistas, se ha
> evaluado:

- La facilidad para comprender la información mostrada al paciente.

- La utilidad de los avisos y alertas durante la sesión.

- El valor añadido que aporta la visualización histórica de datos para
  el seguimiento de la rehabilitación.

> Estas observaciones permiten validar que el sistema aporta información
> relevante y comprensible, alineada con las necesidades de un proceso
> de rehabilitación con muletas.

### Validación de la integración de subsistemas

> Otra métrica clave de validación es la correcta integración de los
> distintos componentes del sistema. Se ha comprobado que:

- El hardware, la aplicación móvil, el *backend* y el *frontend* web
  funcionan de forma coordinada.

- La caída o desconexión temporal de un subsistema no provoca errores
  críticos en el resto.

- El sistema puede ser utilizado de forma concurrente por distintos
  usuarios sin interferencias significativas.

> Esta validación refuerza la idoneidad de la arquitectura modular y
> distribuida adoptada en "Load Crutches".

### Validación global del sistema

> Como métrica final de validación, se ha evaluado el grado de
> cumplimiento de los objetivos principales del proyecto. Se considera
> que el sistema es válido cuando:

- Permite monitorizar de forma objetiva el uso de la muleta durante la
  rehabilitación.

- Facilita el seguimiento del paciente tanto desde su perspectiva como
  desde la del profesional sanitario.

- Ofrece una solución integrada y coherente frente a alternativas
  parciales o no conectadas.

# Requisitos iniciales

> En este apartado se presenta un resumen estructurado de los requisitos
> iniciales del sistema "Load Crutches", definidos durante las primeras
> fases del proyecto. Estos requisitos recogen las necesidades
> funcionales y operativas identificadas a partir del análisis del
> problema y constituyen la base sobre la que se ha diseñado y
> desarrollado la solución propuesta.
>
> De acuerdo con la metodología seguida, los requisitos han sido
> especificados en detalle en el Anexo I: Especificaciones del sistema,
> donde se describen mediante objetivos, actores, casos de uso y
> requisitos no funcionales. En la presente sección no se reproducen
> dichas especificaciones de forma exhaustiva, sino que se ofrece una
> visión sintética y comprensible de los requisitos más relevantes,
> utilizando una representación de alto nivel orientada a la
> funcionalidad del sistema.
>
> El objetivo de este apartado es proporcionar una visión global de lo
> que el sistema debe ofrecer desde el punto de vista de sus usuarios,
> identificando los principales actores implicados y las funcionalidades
> que el sistema pone a su disposición, sirviendo como nexo entre el
> análisis previo y la posterior descripción de la solución
> desarrollada.

## Objetivos funcionales

> En el anexo I, se especificó la funcionalidad, restricciones y datos a
> recoger por medio de los objetivos, requisitos funcionales, de
> información y no funcionales. Así como los actores involucrados en el
> sistema.
>
> Como objetivos principales que debía cubrir el sistema y que debían
> cumplirse para lograr obtener la finalidad perseguida en el proyecto
> se presentaron los siguientes expuestos en las siguientes tablas.
>
> []{#_bookmark153 .anchor}Tabla 5: Especificación del objetivo
> OBJ-0001: Gestionar usuarios y seguridad

+--------------------+--------------------------------------------------+
| > **OBJ-0001**     | > **Gestionar usuarios y seguridad**             |
+====================+==================================================+
| > **Versión**      | > 1.0 (10/09/2025)                               |
+--------------------+--------------------------------------------------+
| > **Autores**      | > Víctor Martín Fuentes                          |
+--------------------+--------------------------------------------------+
| > **Fuentes**      | > A. Durán, B. Bernárdez                         |
+--------------------+--------------------------------------------------+
| > **Descripción**  | > El sistema debe proporcionar una plataforma    |
|                    | > segura para la gestión de dos roles            |
|                    | > diferenciados: doctores y pacientes. Debe      |
|                    | > permitir el registro y validación de           |
|                    | > profesionales médicos, así como la creación de |
|                    | > cuentas de pacientes gestionadas por dichos    |
|                    | > profesionales. El acceso debe estar protegido  |
|                    | > mediante autenticación basada en tokens        |
|                    | >                                                |
|                    | > y las contraseñas deben almacenarse            |
|                    | > encriptadas, garantizando la privacidad de los |
|                    | > datos médicos sensibles.                       |
+--------------------+--------------------------------------------------+
| > **Subobjetivos** | > Ninguno                                        |
+--------------------+--------------------------------------------------+

+-------------------+--------------------------------------------------+
| > **Importancia** | > Vital                                          |
+===================+==================================================+
| > **Estado**      | > En construcción                                |
+-------------------+--------------------------------------------------+
| > **Estabilidad** | > Alta                                           |
+-------------------+--------------------------------------------------+
| > **Comentarios** | > Ninguno                                        |
+-------------------+--------------------------------------------------+

> []{#_bookmark154 .anchor}Tabla 6: Especificación del objetivo
> OBJ-0002: Integrar muleta inteligente y gestionar monitorización
> biomédica

+--------------------+--------------------------------------------------+
| > **OBJ-0002**     | > **Integrar muleta inteligente y gestionar      |
|                    | > monitorización biomédica**                     |
+====================+==================================================+
| > **Versión**      | > 1.0 (10/09/2025)                               |
+--------------------+--------------------------------------------------+
| > **Autores**      | > Víctor Martín Fuentes                          |
+--------------------+--------------------------------------------------+
| > **Fuentes**      | > A. Durán, B. Bernárdez                         |
+--------------------+--------------------------------------------------+
| > **Descripción**  | > Implementar la comunicación vía bluetooth con  |
|                    | > una muleta inteligente instrumentada, capaz de |
|                    | > actuar como sensor biomecánico. El sistema     |
|                    | > debe capturar, procesar y transmitir en tiempo |
|                    | > real dos métricas fundamentales para la        |
|                    | > rehabilitación:                                |
|                    |                                                  |
|                    | 1.  Carga soportada (Peso): Medición precisa de  |
|                    |     la fuerza ejercida sobre la muleta en cada   |
|                    |     apoyo.                                       |
|                    |                                                  |
|                    | 2.  Cadencia (Pasos): Conteo exacto de los pasos |
|                    |     realizados durante cada sesión.              |
+--------------------+--------------------------------------------------+
| > **Subobjetivos** | > Ninguno                                        |
+--------------------+--------------------------------------------------+
| > **Importancia**  | > Vital                                          |
+--------------------+--------------------------------------------------+
| > **Estado**       | > En construcción                                |
+--------------------+--------------------------------------------------+
| > **Estabilidad**  | > Alta                                           |
+--------------------+--------------------------------------------------+
| > **Comentarios**  | > Ninguno                                        |
+--------------------+--------------------------------------------------+

> []{#_bookmark155 .anchor}Tabla 7: Especificación del objetivo
> OBJ-0003: Definir trazabilidad clínica y visual de rehabilitación

+----------------+--------------------------------------------------+
| > **OBJ-0003** | > **Definir trazabilidad clínica y visual de     |
|                | > rehabilitación**                               |
+================+==================================================+
| > **Versión**  | > 1.0 (10/09/2025)                               |
+----------------+--------------------------------------------------+
| > **Autores**  | > Víctor Martín Fuentes                          |
+----------------+--------------------------------------------------+
| > **Fuentes**  | > A. Durán, B. Bernárdez                         |
+----------------+--------------------------------------------------+

+--------------------+--------------------------------------------------+
| > **Descripción**  | > Proveer al personal médico de un *dashboard*   |
|                    | > que permita visualizar la evolución de la      |
|                    | > rehabilitación basándose en la telemetría      |
|                    | > enviada por la muleta inteligente. El sistema  |
|                    | > debe transformar los datos brutos de peso y    |
|                    | > pasos en gráficas de evolución temporal,       |
|                    | > permitiendo al doctor evaluar si el paciente   |
|                    | > está cumpliendo los objetivos de carga         |
|                    | > progresiva y detectar posibles estancamientos  |
|                    | > o                                              |
|                    | >                                                |
|                    | > riesgos de lesión por sobrecarga.              |
+====================+==================================================+
| > **Subobjetivos** | > Ninguno                                        |
+--------------------+--------------------------------------------------+
| > **Importancia**  | > Vital                                          |
+--------------------+--------------------------------------------------+
| > **Estado**       | > En construcción                                |
+--------------------+--------------------------------------------------+
| > **Estabilidad**  | > Alta                                           |
+--------------------+--------------------------------------------------+
| > **Comentarios**  | > Ninguno                                        |
+--------------------+--------------------------------------------------+

> []{#_bookmark156 .anchor}Tabla 8: Especificación del objetivo
> OBJ-0004: Personalizar tratamiento paciente

+--------------------+--------------------------------------------------+
| > **OBJ-0004**     | > **Personalizar tratamiento paciente**          |
+====================+==================================================+
| > **Versión**      | > 1.0 (10/09/2025)                               |
+--------------------+--------------------------------------------------+
| > **Autores**      | > Víctor Martín Fuentes                          |
+--------------------+--------------------------------------------------+
| > **Fuentes**      | > A. Durán, B. Bernárdez                         |
+--------------------+--------------------------------------------------+
| > **Descripción**  | > Facilitar la configuración remota de los       |
|                    | > parámetros de la muleta inteligente desde la   |
|                    | > consola del doctor. El sistema debe permitir   |
|                    | > al médico establecer "ventanas de carga" (peso |
|                    | > mínimo y máximo permitido) y objetivos de      |
|                    | > pasos diarios, los cuales se sincronizarán con |
|                    | > la App del paciente para ajustar el            |
|                    | > comportamiento del                             |
|                    | >                                                |
|                    | > *biofeedback* en tiempo real. Además, incluye  |
|                    | > un sistema de chat para el seguimiento         |
|                    | > cualitativo y envío de consejos.               |
+--------------------+--------------------------------------------------+
| > **Subobjetivos** | > Ninguno                                        |
+--------------------+--------------------------------------------------+
| > **Importancia**  | > Vital                                          |
+--------------------+--------------------------------------------------+
| > **Estado**       | > En construcción                                |
+--------------------+--------------------------------------------------+
| > **Estabilidad**  | > Alta                                           |
+--------------------+--------------------------------------------------+
| > **Comentarios**  | > Ninguno                                        |
+--------------------+--------------------------------------------------+

> La especificación de requisitos del proyecto "Load Crutches" se
> definió utilizando una plantilla basada en la metodología propuesta
> por Durán y Bernárdez para la elicitación de requisitos de sistemas
> software. Como primer paso, se identificaron los actores involucrados
> en el sistema, es decir, aquellos elementos que interactúan
> directamente con él. En este caso, los actores principales
> corresponden a los perfiles de usuario definidos dentro del sistema,
> fundamentalmente el paciente y el profesional sanitario.
>
> Una vez identificados los actores, se procedió a definir las
> funcionalidades que debía proporcionar el sistema mediante la
> elaboración de un modelo de casos de uso. Este modelo permite
> representar de forma estructurada los distintos escenarios de
> interacción con la aplicación y las acciones que cada actor puede
> realizar dentro de "Load Crutches".
>
> Posteriormente, se llevó a cabo la definición detallada de la
> información que debía almacenarse en el sistema de "Load Crutches" con
> el objetivo de dar soporte a la funcionalidad descrita en los casos de
> uso y a otros requisitos del sistema. Esta definición se materializó
> mediante los requisitos de información, centrados principalmente en
> los datos asociados a los usuarios (pacientes y profesionales
> sanitarios), las sesiones de rehabilitación, los registros de carga y
> pasos, así como la configuración clínica asociada a cada paciente.
>
> De forma complementaria, se identificaron y especificaron los
> requisitos no funcionales, los cuales adquieren una relevancia
> especial en el contexto de "Load Crutches" debido a la naturaleza
> distribuida del sistema y a la interacción entre varios subsistemas,
> tanto software como hardware. Estos requisitos describen
> características propias del sistema y la manera en la que debe ofrecer
> sus funcionalidades, incluyendo aspectos como el rendimiento, la
> fiabilidad, la disponibilidad, la seguridad de la información y la
> usabilidad de las aplicaciones móviles y web.
>
> Como resultado de este proceso, se definió un conjunto completo de
> requisitos compuesto por 25 requisitos funcionales, 3 actores
> principales, 4 requisitos no funcionales y 4 requisitos de
> información. Dado que el proyecto sigue un enfoque iterativo e
> incremental, esta fase requirió un trabajo especialmente cuidadoso y
> sistemático, ya que las decisiones tomadas influyen de forma directa
> en la calidad y coherencia de las fases posteriores de diseño e
> implementación.

## Requisitos funcionales

> En este apartado se describen los requisitos funcionales del sistema,
> entendidos como el conjunto de funcionalidades que la plataforma debe
> proporcionar para dar soporte a los procesos de rehabilitación y
> seguimiento clínico. Estos requisitos definen el comportamiento
> esperado del sistema desde el punto de vista de sus usuarios y
> establecen qué acciones pueden realizar los distintos actores en su
> interacción con la aplicación.
>
> Los requisitos funcionales han sido identificados y especificados a
> partir del análisis de los casos de uso definidos en el Anexo I -
> Especificaciones del sistema, los cuales modelan de forma estructurada
> las interacciones entre pacientes, profesionales sanitarios y los
> distintos componentes del sistema. En este apartado se presenta una
> visión organizada de dichos requisitos, sin reproducir el nivel de
> detalle propio del anexo, con el objetivo de facilitar su comprensión
> dentro del contexto global de la memoria.
>
> Para una mayor claridad, los requisitos funcionales se agrupan en
> diferentes bloques temáticos que responden a las principales áreas de
> funcionalidad del sistema, tales como la gestión de acceso, la
> rehabilitación, la gestión clínica y la comunicación entre pacientes
>
> y profesionales sanitarios. Esta organización permite relacionar de
> forma directa los requisitos con los casos de uso que los originan y
> sirve de base para la posterior descripción de la solución
> desarrollada.

1.  []{#_bookmark158 .anchor}Gestión de acceso

> El sistema debe proporcionar mecanismos que permitan la gestión segura
> del acceso de los usuarios, garantizando que únicamente las personas
> autorizadas puedan interactuar con la plataforma y acceder a la
> información correspondiente a su rol. Estos requisitos afectan tanto a
> pacientes como a profesionales sanitarios y constituyen la base sobre
> la que se apoyan el resto de funcionalidades del sistema.
>
> En primer lugar, el sistema debe permitir que pacientes y doctores
> inicien sesión mediante la introducción de credenciales válidas, de
> acuerdo con lo definido en el caso de uso UC- 0001 - Iniciar sesión.
> Este proceso de autenticación es imprescindible para identificar al
> usuario y asociar sus acciones y datos a su perfil correspondiente
> dentro del sistema.
>
> Asimismo, el sistema debe permitir a ambos tipos de usuario cerrar
> sesión de forma explícita cuando finalicen su interacción con la
> plataforma, tal y como se especifica en el caso de uso UC-0002 -
> Cerrar sesión. Esta funcionalidad resulta especialmente relevante para
> garantizar la seguridad en dispositivos compartidos o en entornos
> clínicos.
>
> La gestión de credenciales incluye también la posibilidad de modificar
> la contraseña asociada a la cuenta del usuario. El caso de uso
> UC-0009 - Cambiar contraseña, común a pacientes y doctores, permite
> actualizar las credenciales de acceso, reforzando el control de
> seguridad y reduciendo el riesgo de accesos no autorizados.
>
> Desde el punto de vista del profesional sanitario, el sistema debe
> ofrecer funcionalidades adicionales relacionadas con la administración
> de usuarios. En concreto, el caso de uso UC-0003 - Registrar doctor
> permite dar de alta nuevos profesionales sanitarios en la plataforma,
> ampliando el conjunto de usuarios con acceso a las funcionalidades
> clínicas.
>
> De igual forma, el sistema debe permitir al doctor registrar nuevos
> pacientes, listar los pacientes existentes, editar su información y
> eliminarlos cuando sea necesario, tal y como se define en los casos de
> uso UC - 0004 - Registrar paciente**,** UC-0005 - Listar
> pacientes**,** UC-0006 - Editar paciente y UC-0007 - Eliminar
> paciente. Estas funcionalidades permiten al profesional sanitario
> mantener una gestión centralizada y actualizada de los pacientes bajo
> su supervisión.
>
> Por su parte, el paciente debe poder consultar la información básica
> asociada a su perfil personal, de acuerdo con el caso de uso UC-0008 -
> Ver perfil personal, lo que le permite conocer los datos que el
> sistema maneja sobre su identidad y su tratamiento.
>
> ![](memoria_referencia/media/image48.png){width="2.3614490376202975in"
> height="4.80375in"}
>
> []{#_bookmark159 .anchor}Ilustración 46: Diagrama de casos de uso del
> paquete "Gestión de acceso"

2.  []{#_bookmark160 .anchor}Rehabilitación

> El sistema debe proporcionar al paciente un conjunto de
> funcionalidades orientadas a la realización y seguimiento de sesiones
> de rehabilitación mediante el uso de la muleta inteligente. Estos
> requisitos se implementan principalmente a través de la aplicación
> móvil y constituyen el núcleo funcional del sistema desde el punto de
> vista del paciente.
>
> En primer lugar, el sistema debe permitir al paciente establecer la
> conexión entre la aplicación móvil y la muleta inteligente, tal y como
> se describe en el caso de uso UC- 0010 - Conectar muleta. Esta
> funcionalidad es imprescindible para habilitar la captura de datos
> biomecánicos durante el uso real de la muleta.
>
> Una vez establecida la conexión, el sistema debe permitir al paciente
> iniciar una sesión de rehabilitación, de acuerdo con el caso de uso
> UC-0011 - Realizar sesión de rehabilitación. Durante esta sesión, el
> sistema debe recibir y procesar los datos enviados por la muleta,
> asociándolos a un periodo de actividad claramente definido.
>
> El sistema debe permitir también finalizar la sesión de rehabilitación
> y almacenar de forma persistente la información generada, tal y como
> se especifica en el caso de uso UC- 0012 - Finalizar y guardar sesión.
> Esta funcionalidad permite estructurar los datos
>
> recogidos y facilita su posterior análisis tanto por el paciente como
> por el profesional sanitario.
>
> Además, el sistema debe ofrecer al paciente la posibilidad de
> consultar su progreso diario, proporcionando una visión resumida de su
> actividad y evolución durante la rehabilitación. Este requisito se
> recoge en el caso de uso UC-0013 - Consultar progreso diario, y
> contribuye a fomentar la implicación activa del paciente en su proceso
> de recuperación.

![](memoria_referencia/media/image49.png){width="3.5896412948381453in"
height="3.4536450131233596in"}

> []{#_bookmark161 .anchor}Ilustración 47: Diagrama de casos de uso del
> paquete "Rehabilitación"

3.  []{#_bookmark162 .anchor}Gestión clínica

> El sistema debe proporcionar al profesional sanitario un conjunto de
> funcionalidades avanzadas orientadas a la gestión clínica y al
> seguimiento del proceso de rehabilitación de los pacientes. Estas
> funcionalidades se implementan principalmente a través de la
> plataforma web y están diseñadas para facilitar la toma de decisiones
> clínicas basadas en datos objetivos.
>
> Uno de los requisitos fundamentales en este ámbito es la posibilidad
> de consultar el historial de sesiones de rehabilitación de los
> pacientes, tal y como se define en el caso de uso UC-0014 - Consultar
> historial de sesiones. Esta funcionalidad permite al doctor analizar
> la evolución del paciente a lo largo del tiempo y evaluar la eficacia
> del tratamiento aplicado.
>
> El sistema debe permitir también configurar límites y objetivos
> terapéuticos personalizados para cada paciente, de acuerdo con el caso
> de uso UC-0015 - Configurar límites y objetivos. Estos parámetros son
> utilizados posteriormente por el sistema para contextualizar los datos
> capturados durante las sesiones de rehabilitación.
>
> En relación con la gestión de lesiones, el sistema debe permitir al
> profesional sanitario crear, editar y eliminar lesiones, así como
> asignarlas a pacientes concretos. Estas funcionalidades están
> recogidas en los casos de uso UC-0016 - Crear lesión, UC-0017 - Editar
> lesión**,** UC-0018 - Eliminar lesión y UC-0019 - Asignar lesión a
> paciente. Esta gestión estructurada de las lesiones permite adaptar el
> seguimiento y las recomendaciones a la situación clínica específica de
> cada paciente.
>
> Asimismo, el sistema debe permitir al doctor consultar un catálogo de
> lesiones, tal y como se define en el caso de uso UC-0020 - Consultar
> catálogo de lesiones, facilitando la reutilización y estandarización
> de la información clínica dentro de la plataforma.

![](memoria_referencia/media/image50.png){width="2.0578127734033247in"
height="3.67875in"}

> []{#_bookmark163 .anchor}Ilustración 48: Diagrama de casos de uso del
> paquete "Gestión clínica (web doctor)"

4.  []{#_bookmark164 .anchor}Comunicación y gestión de consejos

> El sistema debe facilitar la comunicación entre pacientes y
> profesionales sanitarios, así como la gestión de consejos clínicos
> asociados al proceso de rehabilitación. Estos requisitos permiten
> reforzar el seguimiento remoto y mejorar la continuidad del
> tratamiento fuera del entorno presencial.
>
> El sistema debe permitir el intercambio de mensajes entre paciente y
> doctor mediante un sistema de mensajería integrado, tal y como se
> describe en el caso de uso UC-0021 - Intercambio de mensajes - Chat.
> Esta funcionalidad posibilita la resolución de dudas, el seguimiento
> continuo y la transmisión de información relevante de forma asíncrona.
>
> Desde el punto de vista del profesional sanitario, el sistema debe
> permitir crear y eliminar consejos médicos asociados a los pacientes,
> de acuerdo con los casos de uso UC-0022 - Crear consejo médico y
> UC-0023 - Eliminar consejo. Estos consejos pueden incluir
> recomendaciones de uso, advertencias o pautas específicas relacionadas
> con la rehabilitación.
>
> El paciente debe poder consultar los consejos médicos que le han sido
> asignados, tal y como se define en el caso de uso UC-0024 - Consultar
> consejos, mientras que el profesional sanitario puede listar los
> consejos existentes mediante el caso de uso UC- 0025 - Listar
> consejos. Estas funcionalidades permiten mantener una comunicación
> estructurada y accesible en torno a las recomendaciones clínicas.

![](memoria_referencia/media/image51.png){width="2.832600612423447in"
height="3.6461450131233595in"}

> []{#_bookmark165 .anchor}Ilustración 49: Diagrama de casos de uso del
> paquete "Comunicación y gestión de consejos"

# Hipótesis, restricciones y alcance

> En este apartado se recogen los supuestos de partida, las principales
> restricciones y el alcance del proyecto "Load Crutches", con el
> objetivo de contextualizar las decisiones adoptadas a lo largo del
> desarrollo y delimitar de forma precisa el marco en el que se ha
> llevado a cabo el trabajo. Este análisis permite identificar los
> condicionantes que han influido en el diseño del sistema y establecer
> los límites técnicos, funcionales y académicos del proyecto.
>
> Las hipótesis planteadas reflejan las premisas sobre las que se apoya
> la solución propuesta y que justifican la elección de una arquitectura
> basada en la monitorización objetiva del uso de muletas. Por su parte,
> las restricciones del proyecto derivan tanto de los requisitos no
> funcionales definidos como de las decisiones técnicas adoptadas,
> incluyendo aspectos relacionados con la seguridad, la eficiencia, la
> usabilidad y la disponibilidad del sistema.
>
> Finalmente, se delimita el alcance del Trabajo de Fin de Grado,
> especificando qué elementos han sido abordados y cuáles quedan fuera
> del ámbito del proyecto. Esta delimitación resulta fundamental para
> evaluar correctamente los resultados obtenidos y el impacto esperado
> de la solución desarrollada, situándolos dentro del contexto académico
> y tecnológico en el que se enmarca el trabajo.

## Hipótesis de partida

> El desarrollo del proyecto "Load Crutches" parte de una serie de
> hipótesis fundamentadas en el análisis previo del dominio del problema
> y en la revisión de las limitaciones existentes en los procesos
> tradicionales de rehabilitación asistida con muletas. En particular,
> se asume que la ausencia de mecanismos objetivos y continuos de
> seguimiento dificulta tanto la correcta ejecución de las pautas
> terapéuticas por parte del paciente como la evaluación precisa del
> progreso por parte del profesional sanitario.
>
> La principal hipótesis de partida del proyecto es que la
> monitorización objetiva del uso de la muleta, basada en la medición de
> parámetros como la carga aplicada y el número de pasos realizados
> durante las sesiones de rehabilitación, puede aportar información
> relevante para mejorar el seguimiento del proceso terapéutico. Esta
> información, recogida de forma automática y continua, permitiría
> reducir la dependencia de la percepción subjetiva del paciente y
> complementar la evaluación clínica tradicional con datos
> cuantificables.
>
> Asimismo, se plantea la hipótesis de que la integración de estos datos
> en una aplicación móvil orientada al paciente y en una plataforma web
> destinada al profesional sanitario facilita una comunicación más
> fluida entre ambas partes. De este modo, el profesional puede disponer
> de una visión más completa y actualizada del estado del paciente,
> mientras que este último puede recibir retroalimentación inmediata
> sobre su desempeño durante la rehabilitación, favoreciendo una mayor
> adherencia a las pautas prescritas.
>
> Estas hipótesis constituyen la base conceptual sobre la que se ha
> diseñado la solución propuesta, guiando tanto la definición de los
> requisitos del sistema como las decisiones técnicas y de diseño
> adoptadas a lo largo del desarrollo del proyecto.

## Restricciones del proyecto

> Las restricciones del proyecto *Load Crutches* derivan principalmente
> de los requisitos no funcionales definidos durante la fase de
> especificación, así como de las decisiones técnicas adoptadas para
> garantizar la viabilidad del sistema dentro del contexto de un Trabajo
> de Fin de Grado. Estas restricciones han condicionado el diseño de la
> arquitectura, la selección de tecnologías y la implementación de los
> distintos componentes del sistema.

1.  []{#_bookmark169 .anchor}Seguridad y privacidad de los datos médicos

> La seguridad y la privacidad de los datos médicos constituyen una de
> las restricciones más críticas del proyecto *Load Crutches*, dado que
> el sistema gestiona información personal y clínica sensible asociada a
> pacientes en proceso de rehabilitación. Entre estos datos se incluyen
> información identificativa, parámetros antropométricos, registros de
> sesiones de rehabilitación y comunicaciones entre paciente y
> profesional sanitario, lo que exige la aplicación de medidas de
> protección rigurosas tanto a nivel técnico como organizativo.
>
> Desde el diseño inicial del sistema se ha adoptado un enfoque de
> seguridad desde el diseño y por defecto, considerando los riesgos
> derivados de la exposición de servicios web, el uso de aplicaciones
> móviles, la comunicación inalámbrica con un dispositivo físico y el
> almacenamiento persistente de datos clínicos. Este contexto incrementa
> la superficie de ataque y condiciona el desarrollo del proyecto a la
> implementación de mecanismos que garanticen la confidencialidad,
> integridad y disponibilidad de la información gestionada.
>
> Como consecuencia de esta restricción, el sistema implementa
> mecanismos de autenticación y control de acceso robustos, de forma que
> todo acceso a la API del *backend* debe estar validado mediante tokens
> de autenticación con tiempo de expiración. Asimismo, se establece un
> control de acceso basado en roles que permite diferenciar claramente
> las operaciones disponibles para pacientes y profesionales sanitarios,
> garantizando que cada usuario únicamente pueda acceder a la
> información que le corresponde. En particular, un paciente solo puede
> consultar sus propios datos, mientras que un doctor únicamente puede
> acceder a la información de los pacientes bajo su supervisión.
>
> En lo relativo al almacenamiento de credenciales y datos sensibles, se
> ha impuesto la restricción de evitar en todo momento el uso de
> contraseñas en texto plano, empleando algoritmos de hash seguros para
> su almacenamiento. La información clínica se gestiona a través de una
> base de datos protegida mediante políticas de acceso restrictivas,
> permitiendo únicamente la interacción directa desde el *backend* del
> sistema. Estas medidas reducen significativamente el riesgo de accesos
> no autorizados o filtraciones de información.
>
> La comunicación entre los distintos componentes del sistema se realiza
> a través de canales seguros y se han adoptado prácticas de desarrollo
> seguro orientadas a la prevención y detección de vulnerabilidades,
> tales como la validación estricta de las entradas recibidas, la
> gestión segura de sesiones y el uso de cabeceras HTTP seguras. Además,
> se han tenido
>
> en cuenta los principios establecidos por el Reglamento General de
> Protección de Datos (RGPD) y la normativa nacional aplicable,
> condicionando el diseño del sistema a la minimización de datos y al
> tratamiento lícito y transparente de la información personal.
>
> Todas estas medidas, desarrolladas y detalladas en el Anexo IV: Plan
> de seguridad, suponen una restricción de alta importancia que ha
> influido de manera directa en la arquitectura del sistema, el diseño
> del *backend* y la gestión de usuarios. Aunque el proyecto no persigue
> una certificación como producto sanitario, la adopción de estas
> prácticas permite ofrecer una solución robusta y alineada con los
> estándares éticos y legales exigibles a aplicaciones del ámbito de la
> salud.

2.  []{#_bookmark170 .anchor}Eficiencia y procesamiento en tiempo real

> Otra restricción clave del proyecto está relacionada con la eficiencia
> del sistema y la necesidad de ofrecer una respuesta en tiempo cercano
> al real durante las sesiones de rehabilitación. El sistema debe ser
> capaz de procesar y transmitir los datos generados por la muleta
> inteligente con una latencia suficientemente baja como para que la
> información visualizada resulte útil para el paciente mientras realiza
> la sesión.
>
> Esta restricción afecta directamente a la comunicación inalámbrica
> entre la muleta y la aplicación móvil, basada en Bluetooth Low Energy,
> cuyo ancho de banda y frecuencia de transmisión son limitados por la
> propia tecnología y por el consumo energético del dispositivo.
> Asimismo, condiciona la implementación de mecanismos de comunicación
> en la plataforma web, como el sistema de mensajería entre paciente y
> profesional, que debe garantizar la entrega inmediata de los mensajes
> sin necesidad de recargar la interfaz.
>
> La necesidad de mantener una latencia reducida ha influido tanto en el
> diseño del firmware de la muleta como en la arquitectura de
> comunicación del sistema, priorizando la eficiencia en la transmisión
> y el procesamiento de los datos frente a la incorporación de
> funcionalidades no esenciales.

3.  []{#_bookmark171 .anchor}Usabilidad e interfaz de usuario

> La usabilidad y el diseño de la interfaz de usuario constituyen otra
> de las restricciones fundamentales del proyecto *Load Crutches*, dado
> que el sistema está dirigido a perfiles de usuario con necesidades y
> contextos de uso muy diferentes. Por un lado, el paciente interactúa
> con la aplicación móvil durante la realización de la sesión de
> rehabilitación, en un entorno dinámico y en movimiento. Por otro lado,
> el profesional sanitario accede a la plataforma web con fines de
> análisis, seguimiento y toma de decisiones clínicas.
>
> Esta dualidad impone la restricción de adaptar las interfaces al
> contexto específico de cada usuario. En el caso de la aplicación
> móvil, la interfaz debe priorizar la claridad visual y la simplicidad,
> utilizando elementos de gran tamaño, códigos de color fácilmente
> identificables y una disposición que minimice la carga cognitiva del
> paciente. Durante la sesión de rehabilitación, el usuario debe ser
> capaz de interpretar de forma rápida si está aplicando la carga
> adecuada en cada paso, sin necesidad de realizar interacciones
> complejas ni desviar la atención de la actividad física.
>
> En cuanto a la plataforma web destinada al profesional sanitario, la
> interfaz debe permitir una visualización más detallada de los datos,
> incluyendo gráficos, históricos de sesiones y métricas de progreso.
> Esta restricción implica el uso de un diseño responsive y de librerías
> especializadas en visualización de datos, que faciliten el análisis de
> la información sin comprometer la legibilidad ni la experiencia de
> usuario.
>
> La necesidad de equilibrar simplicidad y capacidad de análisis ha
> condicionado el diseño de ambas interfaces, limitando la complejidad
> de las interacciones y priorizando la presentación clara de la
> información relevante para cada perfil de usuario.

4.  []{#_bookmark172 .anchor}Disponibilidad y conectividad del hardware

> El correcto funcionamiento del sistema *Load Crutches* depende en gran
> medida de la conectividad entre la muleta inteligente y la aplicación
> móvil. En este sentido, una restricción adicional del proyecto está
> relacionada con la disponibilidad del hardware y la gestión de
> posibles desconexiones durante su uso.
>
> Dado que la comunicación entre la muleta y la aplicación se realiza de
> forma inalámbrica, el sistema debe ser capaz de detectar situaciones
> de pérdida de conexión y actuar en consecuencia para mantener la
> coherencia del estado operativo. Esta restricción implica que la
> aplicación móvil debe identificar de manera automática la desconexión
> del dispositivo, informar al usuario y, en la medida de lo posible,
> facilitar la recuperación de la conexión sin necesidad de reiniciar el
> sistema.
>
> La existencia de esta restricción ha influido en el diseño de los
> mecanismos de comunicación y en la lógica de la aplicación móvil, que
> debe contemplar escenarios de fallo y asegurar una experiencia de uso
> robusta incluso en condiciones de conectividad no ideales. Aunque no
> se persigue una tolerancia total a fallos propia de sistemas
> industriales o médicos certificados, sí se busca una solución
> suficientemente estable para un entorno de uso realista dentro del
> alcance académico del proyecto.

## Alcance del trabajo

> El alcance del presente Trabajo de Fin de Grado se centra en el diseño
> e implementación de un prototipo funcional que integra una muleta
> inteligente con una aplicación móvil, una plataforma web y un sistema
> *backend* centralizado. El objetivo principal es demostrar la
> viabilidad técnica de una solución orientada a la monitorización del
> proceso de rehabilitación mediante la captura y gestión de datos
> objetivos relacionados con el uso de muletas.
>
> El proyecto abarca el desarrollo del firmware necesario para la
> adquisición de datos en la muleta, la implementación de la
> comunicación inalámbrica con la aplicación móvil, el diseño de
> interfaces de usuario adaptadas a los distintos perfiles y la creación
> de una infraestructura *backend* capaz de almacenar y gestionar la
> información generada. Asimismo, se incluye la visualización de
> métricas y el seguimiento del progreso del paciente a través de la
> plataforma web.
>
> Quedan fuera del alcance del proyecto la validación clínica del
> sistema en pacientes reales, la certificación del producto como
> dispositivo médico y su adaptación para un despliegue comercial o
> industrial. Del mismo modo, no se contempla la realización de estudios
> estadísticos o ensayos clínicos que permitan evaluar el impacto
> terapéutico de la solución desarrollada, limitándose el trabajo a un
> contexto académico y experimental.

## Impacto esperado

> A pesar de las limitaciones inherentes a su alcance, se espera que la
> solución propuesta tenga un impacto positivo tanto desde el punto de
> vista técnico como desde la perspectiva del dominio de aplicación.
> Para el paciente, *Load Crutches* ofrece una herramienta que facilita
> la comprensión y el control del proceso de rehabilitación,
> proporcionando retroalimentación inmediata y fomentando una mayor
> adherencia a las pautas establecidas por el profesional sanitario.
>
> Desde la perspectiva del profesional, el sistema aporta una fuente de
> información objetiva y estructurada que complementa la evaluación
> clínica tradicional. La posibilidad de analizar el historial de
> sesiones, las métricas de carga y el progreso del paciente permite una
> toma de decisiones más informada y abre la puerta a una
> personalización más precisa del tratamiento.
>
> En un contexto más amplio, el proyecto sienta las bases para futuras
> líneas de desarrollo en el ámbito de la rehabilitación digital y la
> monitorización remota de pacientes. La arquitectura planteada y las
> decisiones de diseño adoptadas permiten la incorporación de nuevas
> métricas, sensores o funcionalidades, así como su posible integración
> con otros sistemas de información sanitaria, contribuyendo a la
> evolución de soluciones tecnológicas aplicadas al sector de la salud.

# Estudio de alternativas y viabilidad

> En este apartado se realiza un análisis de las principales decisiones
> tecnológicas adoptadas durante el desarrollo del sistema "Load
> Crutches", evaluando de forma razonada las alternativas existentes y
> justificando la idoneidad de las soluciones finalmente escogidas. El
> objetivo de este estudio no es únicamente describir las herramientas
> utilizadas, sino demostrar que dichas elecciones responden a un
> proceso consciente de evaluación técnica, económica y práctica,
> teniendo en cuenta las restricciones propias del proyecto.
>
> Dado el carácter multidisciplinar del sistema, que integra hardware
> embebido, aplicación móvil, plataforma web y *backend*, el estudio de
> alternativas se ha abordado desde una perspectiva global, considerando
> tanto aspectos puramente técnicos (rendimiento, compatibilidad,
> escalabilidad o mantenibilidad) como factores relacionados con el
> contexto académico del proyecto, la disponibilidad de recursos y la
> viabilidad real de implementación.
>
> Asimismo, este apartado incluye un análisis cualitativo de la
> viabilidad económica del sistema, abordando tanto el coste aproximado
> del desarrollo como posibles vías de monetización y beneficios
> futuros. Aunque el proyecto se enmarca en un contexto académico,
> resulta relevante analizar su potencial de explotación como producto o
> servicio, especialmente por su orientación al ámbito de la salud
> digital y la rehabilitación, un sector con una creciente demanda de
> soluciones tecnológicas.
>
> El estudio se estructura en dos grandes bloques. En primer lugar, se
> analizan las alternativas tecnológicas consideradas para los distintos
> componentes del sistema y se justifica la elección final de lenguajes,
> *frameworks*, APIs y herramientas de desarrollo. En segundo lugar, se
> presenta un estudio de viabilidad económica y de monetización,
> teniendo en cuenta los costes de desarrollo, mantenimiento y las
> posibles fuentes de ingresos asociadas a un sistema como "Load
> Crutches".

## Análisis de alternativas tecnológicas

> []{#_bookmark177 .anchor}*Backend*
>
> Uno de los elementos centrales del sistema "Load Crutches" es el
> *backend*, responsable de la gestión de la lógica de negocio, el
> almacenamiento de datos, la autenticación de usuarios y la
> comunicación con las aplicaciones cliente. La elección de la
> tecnología para esta capa resulta crítica, ya que condiciona tanto el
> rendimiento del sistema como su mantenibilidad y escalabilidad futura.
>
> Durante la fase de diseño se valoraron distintas alternativas
> habituales en el desarrollo de servicios *backend*, entre las que
> destacan Node.js, Java con Spring Boot, Python con *frameworks* como
> Django o Flask, y PHP con *frameworks* como Laravel. Cada una de estas
> opciones presenta ventajas e inconvenientes en función del contexto de
> uso.
>
> El uso de Java con Spring Boot ofrece una gran robustez, tipado fuerte
> y un ecosistema muy maduro, siendo una solución ampliamente utilizada
> en entornos empresariales y sanitarios. Sin embargo, esta alternativa
> implica una mayor complejidad inicial, un mayor
>
> consumo de recursos y tiempos de desarrollo más elevados, aspectos que
> resultan poco adecuados para un proyecto académico con recursos
> limitados y necesidad de iteración rápida.
>
> Por su parte, Python con Django o Flask proporciona una sintaxis
> sencilla y una curva de aprendizaje reducida, además de contar con
> numerosas bibliotecas orientadas al tratamiento de datos. No obstante,
> en escenarios donde se requiere una comunicación en tiempo casi real y
> la gestión simultánea de múltiples conexiones, como ocurre en "Load
> Crutches" con el intercambio de mensajes y la recepción de datos de
> telemetría, estas soluciones pueden presentar limitaciones de
> rendimiento si no se complementan con servicios adicionales.
>
> La opción de PHP con Laravel, aunque muy extendida en el desarrollo
> web tradicional, se consideró menos adecuada para un sistema orientado
> a la comunicación continua con aplicaciones móviles y dispositivos
> IoT, ya que su modelo de ejecución y su ecosistema no están tan
> alineados con arquitecturas orientadas a servicios y comunicación en
> tiempo real.
>
> Finalmente, se optó por Node.js como tecnología para el desarrollo del
> *backend*. Esta elección se justifica por varios motivos. En primer
> lugar, Node.js permite utilizar JavaScript tanto en el *backend* como
> en el *frontend* web, favoreciendo la homogeneidad tecnológica y
> reduciendo la complejidad cognitiva del desarrollo. En segundo lugar,
> su modelo de ejecución basado en eventos y operaciones asíncronas
> resulta especialmente adecuado para gestionar múltiples conexiones
> concurrentes, peticiones a la API y servicios de mensajería en tiempo
> real.
>
> Además, Node.js cuenta con un ecosistema muy amplio de paquetes y
> librerías disponibles a través de npm, lo que facilita la
> implementación de funcionalidades comunes como autenticación,
> validación de datos, comunicación con bases de datos y gestión de
> *WebSockets*. Esta disponibilidad de herramientas reduce el tiempo de
> desarrollo y permite centrarse en la lógica específica del sistema.
>
> Desde un punto de vista académico y práctico, Node.js ofrece un
> equilibrio adecuado entre potencia, simplicidad y flexibilidad,
> cumpliendo con las restricciones del proyecto y permitiendo
> desarrollar un *backend* funcional, mantenible y preparado para una
> posible evolución futura del sistema.
>
> []{#_bookmark178 .anchor}Arquitectura de la API y modelo de
> comunicación
>
> Una vez seleccionado el entorno tecnológico para el *backend*, fue
> necesario definir el modelo de comunicación entre los distintos
> componentes del sistema: aplicación móvil, plataforma web y servidor
> central. En este contexto, se evaluaron diferentes enfoques
> arquitectónicos, principalmente arquitecturas monolíticas**,**
> arquitecturas orientadas a servicios y arquitecturas basadas en APIs
> REST**.**
>
> La arquitectura monolítica tradicional, en la que toda la lógica del
> sistema se concentra en un único bloque fuertemente acoplado, fue
> descartada en fases tempranas del diseño. Aunque este enfoque puede
> simplificar el desarrollo inicial, presenta importantes limitaciones
> en términos de escalabilidad, mantenibilidad y reutilización,
> especialmente
>
> en un sistema distribuido como "Load Crutches", donde interactúan
> múltiples clientes heterogéneos.
>
> Frente a esta opción, se optó por una arquitectura basada en una API
> REST, que actúa como punto central de comunicación entre los distintos
> subsistemas. Este enfoque permite desacoplar claramente la lógica de
> negocio del *backend* de las capas de presentación (aplicación móvil y
> plataforma web), facilitando el desarrollo independiente de cada
> componente y mejorando la claridad del diseño global.
>
> La elección de una API REST frente a otras alternativas, como GraphQL,
> se fundamenta en varios aspectos. REST es un estándar ampliamente
> adoptado, con una curva de aprendizaje moderada y una gran
> compatibilidad con herramientas y *frameworks* tanto en el lado del
> cliente como del servidor. Además, para el tipo de operaciones
> requeridas por el sistema como gestión de usuarios, sesiones, datos de
> rehabilitación y configuraciones clínicas como el modelo basado en
> recursos y operaciones CRUD (*Create, Read, Update, Delete*) resulta
> adecuado y suficientemente expresivo.
>
> GraphQL, aunque ofrece ventajas en términos de flexibilidad en la
> consulta de datos, introduce una mayor complejidad conceptual y de
> implementación que no se consideró necesaria para el alcance del
> proyecto. En un contexto académico, donde la claridad arquitectónica y
> la robustez son prioritarias frente a la optimización extrema de
> consultas, la elección de REST permite cumplir los requisitos
> funcionales de forma eficaz y comprensible.
>
> []{#_bookmark179 .anchor}Comunicación en tiempo real
>
> Uno de los requisitos funcionales clave del sistema es la posibilidad
> de ofrecer comunicación casi en tiempo real entre pacientes y
> profesionales sanitarios, así como la actualización dinámica de
> determinados datos relevantes. Para dar soporte a esta necesidad, se
> evaluaron distintas alternativas de comunicación, entre las que
> destacan el uso de peticiones HTTP periódicas (*polling*), servicios
> de mensajería externos y tecnologías basadas en WebSockets.
>
> El enfoque basado en *polling*, en el que el cliente consulta
> periódicamente al servidor para comprobar si existen nuevos datos, fue
> descartado debido a su ineficiencia y al consumo innecesario de
> recursos. Este modelo genera un elevado número de peticiones
> redundantes y aumenta la latencia percibida por el usuario, lo que
> resulta poco adecuado para un sistema orientado al seguimiento
> continuo.
>
> Por otro lado, el uso de servicios de mensajería externos o
> plataformas de terceros, aunque viable, introduce dependencias
> adicionales, posibles costes económicos y una menor capacidad de
> control sobre el flujo de datos, aspectos poco deseables en un
> proyecto académico y en un sistema que gestiona información sensible.
>
> Finalmente, se optó por el uso de *WebSockets* para la comunicación en
> tiempo real, integrados directamente en el *backend*. Esta tecnología
> permite establecer una conexión persistente entre cliente y servidor,
> facilitando el envío bidireccional de mensajes con baja latencia y sin
> necesidad de realizar peticiones repetitivas. Este enfoque resulta
> especialmente adecuado para implementar funcionalidades como el chat
> entre paciente y doctor y la actualización inmediata de determinados
> eventos relevantes.
>
> La integración de *WebSockets* en una arquitectura basada en Node.js
> se realiza de forma natural, aprovechando su modelo asíncrono y
> orientado a eventos. De este modo, el sistema puede gestionar de forma
> eficiente múltiples conexiones simultáneas sin comprometer el
> rendimiento general.
>
> []{#_bookmark180 .anchor}Base de datos
>
> La base de datos constituye uno de los elementos más críticos del
> sistema "Load Crutches", ya que es responsable del almacenamiento
> persistente de información sensible relacionada con usuarios, sesiones
> de rehabilitación, datos biomecánicos, configuraciones clínicas y
> comunicaciones entre pacientes y profesionales sanitarios. Por este
> motivo, la elección del sistema gestor de bases de datos se abordó con
> especial atención, evaluando tanto alternativas relacionales como no
> relacionales.
>
> Entre las opciones consideradas se encuentran bases de datos
> relacionales como MySQL y PostgreSQL, así como soluciones no
> relacionales como MongoDB o Firebase Firestore. Cada una de estas
> alternativas presenta ventajas e inconvenientes en función del tipo de
> datos a gestionar y del contexto del proyecto.
>
> Las bases de datos no relacionales ofrecen una gran flexibilidad en la
> estructura de los datos y son especialmente adecuadas para escenarios
> con esquemas altamente variables o datos semiestructurados. Sin
> embargo, en el contexto de "Load Crutches", la información gestionada
> presenta una estructura claramente definida, con relaciones bien
> establecidas entre entidades como pacientes, sesiones, lesiones,
> consejos y mensajes. En este tipo de escenarios, el uso de una base de
> datos no relacional puede dificultar el mantenimiento de la coherencia
> de los datos y la integridad referencial.
>
> Por otro lado, bases de datos relacionales como PostgreSQL ofrecen una
> gran robustez, soporte avanzado para transacciones y una elevada
> fiabilidad, siendo ampliamente utilizadas en entornos críticos. No
> obstante, PostgreSQL introduce una mayor complejidad de configuración
> y administración que no resulta estrictamente necesaria para el
> alcance del proyecto.
>
> Finalmente, se optó por MySQL como sistema gestor de bases de datos.
> Esta elección se justifica por varios motivos: su amplia adopción, su
> estabilidad, su buen rendimiento en escenarios de carga moderada y su
> integración sencilla con entornos de desarrollo habituales. Además,
> MySQL ofrece soporte completo para relaciones entre tablas, claves
> foráneas y restricciones de integridad, aspectos fundamentales para
> garantizar la consistencia de la información clínica.
>
> Desde un punto de vista de viabilidad, MySQL puede desplegarse
> fácilmente en entornos locales mediante herramientas como XAMPP, lo
> que facilita el desarrollo, las pruebas y la defensa académica del
> proyecto sin incurrir en costes adicionales. Al mismo tiempo, esta
> solución resulta escalable hacia entornos de producción más complejos
> si el sistema evolucionase en el futuro.
>
> []{#_bookmark181 .anchor}Aplicación móvil
>
> La aplicación móvil constituye el principal punto de interacción entre
> el sistema "Load Crutches" y el paciente durante el proceso de
> rehabilitación, por lo que su diseño y la tecnología empleada resultan
> determinantes tanto para la experiencia de usuario como para la
> viabilidad del desarrollo. Durante la fase de estudio se evaluaron
> distintas alternativas para la implementación de esta aplicación,
> considerando tanto enfoques nativos como multiplataforma.
>
> Entre las opciones analizadas se encuentran *frameworks*
> multiplataforma como Flutter, React Native o Ionic, así como el
> desarrollo nativo para sistemas operativos móviles. Las soluciones
> multiplataforma presentan como principal ventaja la reutilización de
> código y la posibilidad de desplegar la aplicación en distintos
> sistemas operativos a partir de una única base. Sin embargo, este
> enfoque introduce limitaciones relevantes cuando se requiere un acceso
> intensivo a funcionalidades nativas del dispositivo, como es el caso
> de la comunicación Bluetooth Low Energy, la gestión de estados en
> tiempo real o el control preciso del ciclo de vida de la aplicación.
>
> En el contexto de "Load Crutches", la aplicación móvil debe establecer
> una comunicación estable y continua con la muleta inteligente,
> gestionar eventos en tiempo casi real durante las sesiones de
> rehabilitación y ofrecer una interfaz fiable y fluida en situaciones
> de uso activo. Estas necesidades hacen que el acceso directo a las
> APIs nativas del sistema operativo sea un requisito clave para
> garantizar el correcto funcionamiento del sistema.
>
> Por estos motivos, se optó por el desarrollo nativo en iOS utilizando
> el lenguaje Swift y el *framework* UIKit. Esta decisión no responde
> únicamente a criterios técnicos, sino también a un análisis realista
> de la viabilidad del proyecto. El autor del trabajo cuenta con
> experiencia laboral previa como desarrollador de aplicaciones iOS
> utilizando Swift y UIKit, lo que ha permitido abordar el desarrollo de
> la aplicación móvil con un mayor nivel de solvencia técnica, reducir
> la curva de aprendizaje y minimizar riesgos asociados a la
> implementación.
>
> La elección de Swift y UIKit ha permitido aprovechar de forma
> eficiente las capacidades del sistema operativo iOS, garantizando un
> alto rendimiento, una integración directa con los servicios del
> dispositivo y un control preciso sobre la gestión de la comunicación
> Bluetooth. Asimismo, el uso de tecnologías conocidas ha facilitado la
> aplicación de buenas prácticas de desarrollo, la estructuración
> adecuada del código y una mayor facilidad para la depuración y el
> mantenimiento de la aplicación.
>
> []{#_bookmark182 .anchor}*Frontend* web
>
> La plataforma web destinada a los profesionales sanitarios constituye
> otro de los componentes clave del sistema, ya que centraliza la
> visualización de datos clínicos, la gestión de pacientes y la
> configuración del tratamiento. Para el desarrollo de este *frontend*
> se analizaron distintas alternativas basadas en *frameworks*
> JavaScript modernos, entre las que destacan Vue.js**,** React y
> Angular**.**
>
> Angular ofrece una solución completa y muy estructurada, ampliamente
> utilizada en proyectos de gran envergadura. Sin embargo, su curva de
> aprendizaje es elevada y su enfoque resulta excesivamente pesado para
> un proyecto académico con un equipo de
>
> desarrollo reducido. React, por su parte, proporciona una gran
> flexibilidad y un ecosistema muy amplio, pero requiere la integración
> de múltiples librerías externas para cubrir aspectos como la gestión
> de estado o el enrutado, lo que puede aumentar la complejidad del
> proyecto.
>
> Finalmente, se optó por Vue.js como *framework* para el desarrollo del
> *frontend* web. Esta decisión se fundamenta en su equilibrio entre
> simplicidad y potencia, así como en su curva de aprendizaje moderada.
> Vue.js permite construir aplicaciones web modernas de tipo Single Page
> Application de forma estructurada, utilizando una arquitectura basada
> en componentes que favorece la reutilización y la mantenibilidad del
> código.
>
> Además, Vue.js se integra de forma natural con APIs REST y facilita la
> creación de interfaces dinámicas para la visualización de datos,
> aspecto especialmente relevante en el contexto de "Load Crutches",
> donde se trabaja con información clínica, estadísticas y gráficos de
> seguimiento. Desde un punto de vista de viabilidad, esta tecnología
> permite desarrollar una interfaz web funcional y profesional sin
> introducir una complejidad innecesaria.

# Descripción de solución propuesta

> La solución propuesta en el proyecto Load Crutches consiste en un
> sistema integral de apoyo a la rehabilitación de pacientes que
> requieren el uso de muletas, combinando un dispositivo hardware
> inteligente con una plataforma software distribuida, formada por una
> aplicación móvil para pacientes y un panel web para profesionales
> sanitarios. El objetivo principal de la solución es permitir el
> seguimiento objetivo, continuo y remoto del proceso de recuperación, a
> partir de datos biomecánicos reales capturados durante el uso
> cotidiano de la muleta.
>
> Desde un punto de vista técnico, la solución final se materializa como
> una arquitectura cliente-servidor distribuida, en la que cada
> componente cumple una función bien definida dentro del flujo global
> del sistema. La muleta inteligente actúa como punto de adquisición de
> datos; la aplicación móvil como intermediaria y punto de interacción
> con el paciente; el *backend* como núcleo de procesamiento,
> persistencia y lógica de negocio; y el panel web como herramienta de
> supervisión clínica y toma de decisiones.
>
> La descripción funcional y visual de la solución se apoya en los
> manuales de usuario recogidos en el Anexo V, donde se documentan de
> forma detallada las interfaces, flujos de uso y funcionalidades
> disponibles para cada tipo de usuario.

## Panel web Doctor

> El panel web del doctor constituye el principal subsistema de gestión
> clínica de "Load Crutches". A través de esta aplicación web, los
> profesionales sanitarios pueden supervisar la evolución de los
> pacientes, gestionar la información clínica asociada a cada uno de
> ellos y analizar los datos generados durante las sesiones de
> rehabilitación.
>
> Este panel ha sido diseñado como una aplicación web de tipo Single
> Page Application, accesible desde un navegador, y orientada a
> facilitar el trabajo diario del profesional sanitario mediante una
> interfaz clara, estructurada y coherente. Todas las operaciones
> realizadas desde el panel web se comunican con el *backend* del
> sistema, que se encarga de aplicar la lógica de negocio y garantizar
> la seguridad e integridad de los datos.
>
> También se ha implementado un modo oscuro en toda la web.
>
> ![](memoria_referencia/media/image52.jpeg){width="5.931820866141733in"
> height="2.990624453193351in"}
>
> []{#_bookmark185 .anchor}Ilustración 50: Iniciar sesión

1.  []{#_bookmark186 .anchor}Dashboard

> El *dashboard* representa el punto de entrada principal al panel web
> del doctor tras el inicio de sesión. Su objetivo es ofrecer una visión
> global y resumida del estado del sistema, permitiendo al profesional
> sanitario acceder rápidamente a la información más relevante sin
> necesidad de navegar por los distintos módulos.
>
> Desde esta vista se muestran indicadores generales relacionados con la
> actividad del sistema, como el número de pacientes registrados, la
> existencia de sesiones recientes o accesos rápidos a las
> funcionalidades principales. El diseño del *dashboard* prioriza la
> claridad visual y la organización de la información, facilitando una
> comprensión inmediata del contexto clínico.
>
> ![](memoria_referencia/media/image53.jpeg){width="5.765193569553806in"
> height="3.1186450131233596in"}
>
> []{#_bookmark187 .anchor}Ilustración 51: Dashboard

![](memoria_referencia/media/image54.jpeg){width="5.762919947506561in"
height="3.1186450131233596in"}

> []{#_bookmark188 .anchor}Ilustración 52: Dashboard modo oscuro

2.  []{#_bookmark189 .anchor}Gestión de pacientes

> El módulo de gestión de pacientes permite al profesional sanitario
> administrar de forma completa la información asociada a cada paciente
> registrado en el sistema. A través de este apartado, el doctor puede
> dar de alta nuevos pacientes, editar sus datos personales, eliminar
> pacientes existentes y acceder a su ficha clínica detallada.
>
> La ficha del paciente actúa como eje central del seguimiento clínico,
> ya que desde ella es posible consultar el historial de sesiones de
> rehabilitación, asignar patologías, definir
>
> límites terapéuticos y analizar la evolución del paciente a lo largo
> del tiempo. Este enfoque centralizado facilita la organización de la
> información y mejora la trazabilidad de los datos clínicos.

![](memoria_referencia/media/image55.jpeg){width="5.8830653980752405in"
height="2.965in"}

> []{#_bookmark190 .anchor}Ilustración 53: Gestión de pacientes

![](memoria_referencia/media/image56.jpeg){width="5.831998031496063in"
height="2.94in"}

> []{#_bookmark191 .anchor}Ilustración 54: Añadir paciente
>
> ![](memoria_referencia/media/image57.jpeg){width="5.179433508311461in"
> height="4.6672911198600175in"}
>
> []{#_bookmark192 .anchor}Ilustración 55: Ficha paciente

3.  []{#_bookmark193 .anchor}Gestión de patologías y consejos

> Este apartado permite al profesional sanitario gestionar el catálogo
> de patologías y los consejos clínicos utilizados dentro del sistema.
> Las patologías representan lesiones o condiciones clínicas que pueden
> ser asignadas a los pacientes, mientras que los consejos permiten
> proporcionar recomendaciones personalizadas relacionadas con el
> tratamiento y el uso de la muleta.
>
> El sistema permite crear, editar y eliminar tanto patologías como
> consejos, favoreciendo la reutilización de esta información entre
> distintos pacientes. Esta funcionalidad contribuye a estandarizar el
> seguimiento clínico y a facilitar la personalización del tratamiento
> sin necesidad de introducir repetidamente la misma información.
>
> ![](memoria_referencia/media/image58.jpeg){width="5.42885498687664in"
> height="2.736770559930009in"}
>
> []{#_bookmark194 .anchor}Ilustración 56: Gestión de patologías

![](memoria_referencia/media/image59.jpeg){width="5.858031496062992in"
height="2.9521872265966755in"}

> []{#_bookmark195 .anchor}Ilustración 57: Añadir patología
>
> ![](memoria_referencia/media/image60.jpeg){width="5.957595144356955in"
> height="3.002082239720035in"}
>
> []{#_bookmark196 .anchor}Ilustración 58: Gestión de consejos

![](memoria_referencia/media/image61.jpeg){width="5.956192038495188in"
height="3.002083333333333in"}

> []{#_bookmark197 .anchor}Ilustración 59: Añadir consejo

4.  []{#_bookmark198 .anchor}Comunicación y seguimiento

> El panel web incorpora un módulo de comunicación directa entre el
> profesional sanitario y el paciente mediante un sistema de mensajería
> tipo chat. Esta funcionalidad permite resolver dudas, realizar
> indicaciones adicionales y mantener un seguimiento más cercano del
> proceso de rehabilitación sin necesidad de interacción presencial
> constante.
>
> El sistema de mensajería está integrado con el resto del sistema y
> vinculado a la identidad de cada usuario, garantizando la trazabilidad
> de las comunicaciones y evitando accesos no autorizados. Este canal de
> comunicación refuerza la implicación del paciente y mejora la
> continuidad del tratamiento.

![](memoria_referencia/media/image62.jpeg){width="5.959206036745407in"
height="3.1625in"}

> []{#_bookmark199 .anchor}Ilustración 60: Chat paciente

5.  []{#_bookmark200 .anchor}Análisis de sesiones de rehabilitación

> El módulo de análisis de sesiones permite al profesional sanitario
> consultar y estudiar en detalle las sesiones de rehabilitación
> realizadas por cada paciente. A través de este apartado es posible
> acceder al historial completo de sesiones y analizar métricas clave
> como la carga aplicada, el número de pasos o la evolución temporal del
> uso de la muleta.
>
> Las sesiones se presentan de forma estructurada y apoyadas en
> representaciones gráficas que facilitan la interpretación de los
> datos. Esta funcionalidad permite evaluar el cumplimiento de los
> límites terapéuticos, detectar posibles desviaciones y adaptar el
> tratamiento en función de la evolución real del paciente.
>
> ![](memoria_referencia/media/image63.jpeg){width="5.957595144356955in"
> height="3.002082239720035in"}
>
> []{#_bookmark201 .anchor}Ilustración 61: Gestión de sesiones
>
> ![](memoria_referencia/media/image64.png){width="5.365993000874891in"
> height="8.40739501312336in"}
>
> []{#_bookmark202 .anchor}Ilustración 62: Historial de sesiones de
> paciente
>
> ![](memoria_referencia/media/image65.png){width="5.866558398950131in"
> height="7.911666666666667in"}
>
> []{#_bookmark203 .anchor}Ilustración 63: Detalles de la sesión

## Aplicación móvil pacientes

> La aplicación móvil para pacientes constituye el principal punto de
> interacción entre el sistema "Load Crutches" y el usuario final
> durante el proceso de rehabilitación. Esta aplicación ha sido diseñada
> para dispositivos iOS y orientada a un uso cotidiano, permitiendo al
> paciente realizar sesiones de rehabilitación, visualizar su progreso y
> comunicarse con el profesional sanitario de forma sencilla e
> intuitiva.
>
> El diseño de la aplicación prioriza la facilidad de uso, la claridad
> visual y la minimización de la carga cognitiva, teniendo en cuenta que
> el paciente puede encontrarse en movimiento durante su utilización.
> Todas las funcionalidades de la aplicación móvil se integran con el
> *backend* del sistema, garantizando la persistencia de los datos y la
> coherencia de la información mostrada en el resto de componentes de la
> plataforma.
>
> La aplicación dispone de un modo oscuro, además, la ventana de inicio
> de sesión se adapta según el modelo de dispositivo que se esté usando.
> En ilustración 35, se muestra el inicio de sesión desde: iphone 13,
> iphone 15, iphone SE (3 gen.) y ipad 10.

![](memoria_referencia/media/image66.jpeg)

> ![](memoria_referencia/media/image70.png)
>
> []{#_bookmark205 .anchor}Ilustración 64: Inicio de sesión en varios
> dispositivos

1.  []{#_bookmark206 .anchor}Sesión de rehabilitación

> El módulo de sesión de rehabilitación es la funcionalidad central de
> la aplicación móvil del paciente. A través de este apartado, el
> usuario puede iniciar, realizar y finalizar una sesión de
> rehabilitación mientras utiliza la muleta inteligente.
>
> Durante una sesión activa, la aplicación muestra información relevante
> en tiempo casi real, como la carga aplicada sobre la muleta, el número
> de pasos realizados y el estado general de la sesión. Estos datos se
> presentan mediante indicadores visuales simples y códigos de color que
> permiten al paciente interpretar fácilmente si está respetando los
> límites terapéuticos establecidos por el profesional sanitario.
>
> Al finalizar la sesión, la aplicación permite confirmar el cierre de
> la misma y procede al almacenamiento de los datos recogidos, que
> posteriormente quedan disponibles para su análisis desde el panel web
> del doctor.

![](memoria_referencia/media/image72.png){width="5.8541108923884515in"
height="3.17125in"}

> []{#_bookmark207 .anchor}Ilustración 65: Pantalla de inicio (sesión de
> rehabilitación)
>
> ![](memoria_referencia/media/image73.png)
>
> []{#_bookmark208 .anchor}Ilustración 66: pantalla sesión de
> rehabilitación

2.  []{#_bookmark209 .anchor}Conexión Bluetooth con la muleta

> La aplicación móvil gestiona la conexión inalámbrica entre el
> dispositivo móvil y la muleta inteligente mediante tecnología
> Bluetooth Low Energy. Este módulo permite al paciente establecer y
> supervisar la conexión con la muleta de forma sencilla, mostrando el
> estado de la conexión y los dispositivos disponibles.
>
> La conexión Bluetooth constituye un elemento crítico del sistema, ya
> que permite la recepción continua de los datos generados por los
> sensores integrados en la muleta. La aplicación informa al usuario en
> caso de pérdida de conexión y facilita la reconexión automática,
> contribuyendo a una experiencia de uso más robusta y fiable.
>
> ![](memoria_referencia/media/image75.jpeg)
>
> []{#_bookmark210 .anchor}Ilustración 67: Pantalla de conexión
> bluetooth

3.  []{#_bookmark211 .anchor}Estadísticas y consejos

> Este apartado permite al paciente consultar información resumida sobre
> su proceso de rehabilitación a partir de los datos registrados durante
> las sesiones. La aplicación presenta estadísticas visuales
> relacionadas con la carga aplicada, el número de pasos o la evolución
> temporal del uso de la muleta.
>
> Además, el paciente puede acceder a los consejos clínicos definidos
> por el profesional sanitario, que se muestran de forma clara y
> accesible desde la aplicación. Estos consejos refuerzan las
> indicaciones recibidas durante el tratamiento y contribuyen a mejorar
> la adherencia terapéutica.
>
> ![](memoria_referencia/media/image77.png){width="3.7787784339457566in"
> height="4.089478346456693in"}
>
> []{#_bookmark212 .anchor}Ilustración 68: Pantalla de estadísticas

![](memoria_referencia/media/image78.png){width="5.739738626421698in"
height="3.0995833333333334in"}

> []{#_bookmark213 .anchor}Ilustración 69: Estadísticas de pesos
>
> ![](memoria_referencia/media/image79.png){width="3.629623797025372in"
> height="3.92875in"}
>
> []{#_bookmark214 .anchor}Ilustración 70: Estadísticas de pasos

![](memoria_referencia/media/image80.png){width="5.73652012248469in"
height="3.10625in"}

> []{#_bookmark215 .anchor}Ilustración 71: Avisos

4.  []{#_bookmark216 .anchor}Comunicación con doctor

> La aplicación móvil integra un sistema de mensajería que permite la
> comunicación directa entre el paciente y el profesional sanitario. A
> través de este módulo, el paciente puede enviar y recibir mensajes
> relacionados con su tratamiento, resolver dudas y recibir indicaciones
> adicionales sin necesidad de desplazamientos.
>
> Este canal de comunicación refuerza el seguimiento remoto del proceso
> de rehabilitación y mejora la continuidad asistencial. Las
> conversaciones quedan asociadas a la identidad del usuario y se
> gestionan de forma segura a través del *backend* del sistema.

![](memoria_referencia/media/image81.png){width="3.798611111111111in"
height="4.106561679790026in"}

> []{#_bookmark217 .anchor}Ilustración 72: Chat

5.  []{#_bookmark218 .anchor}Perfil

> El apartado de perfil permite al paciente consultar y gestionar su
> información personal dentro de la aplicación. Desde esta sección, el
> usuario puede visualizar sus datos básicos y realizar acciones
> relacionadas con la seguridad de su cuenta, como el cambio de
> contraseña.
>
> El diseño de este módulo es sencillo y directo, facilitando el acceso
> a las opciones de configuración sin interferir con las funcionalidades
> principales de la aplicación. Este enfoque contribuye a una
> experiencia de usuario coherente y alineada con el resto del sistema.
>
> ![](memoria_referencia/media/image82.png){width="5.367272528433946in"
> height="2.898020559930009in"}
>
> []{#_bookmark219 .anchor}Ilustración 73: Perfil

## Despliegue del sistema

> El sistema desarrollado en "Load Crutches" está compuesto por varios
> subsistemas interconectados que, en conjunto, conforman una
> arquitectura distribuida formada por hardware, *backend*, *frontend*
> web y aplicación móvil. Debido a esta complejidad, el proceso de
> despliegue y puesta en marcha del sistema requiere seguir una serie de
> pasos bien definidos para garantizar que todos los componentes
> funcionen correctamente y de forma coordinada.
>
> En el contexto actual del proyecto, todo el sistema ha sido desplegado
> en un entorno local. Esta decisión se ha tomado principalmente por
> motivos de simplicidad, control del entorno de desarrollo y
> limitaciones propias del alcance académico del proyecto, evitando así
> costes adicionales asociados a infraestructuras en la nube o servicios
> de publicación comercial.
>
> En primer lugar, para el despliegue de los servicios básicos de
> servidor se ha utilizado la herramienta XAMPP. XAMPP proporciona un
> entorno de desarrollo local que integra de forma sencilla varios
> componentes fundamentales, entre ellos un servidor web Apache y un
> sistema gestor de bases de datos MySQL. Gracias a esta herramienta es
> posible levantar rápidamente la infraestructura necesaria para alojar
> y gestionar la base de datos clínica del sistema.
>
> Una vez instalado XAMPP en el sistema operativo, el primer paso
> consiste en iniciar los servicios de Apache y MySQL desde el panel de
> control de XAMPP. Esto permite que el servidor web esté disponible en
> local y que la base de datos pueda aceptar conexiones. La
> administración de la base de datos se realiza mediante la herramienta
> phpMyAdmin, incluida en XAMPP, que ofrece una interfaz gráfica
> accesible desde el navegador web. A través de phpMyAdmin se crean las
> bases de datos necesarias, se definen las tablas correspondientes a
> usuarios, sesiones, datos de telemetría, mensajes y configuraciones
> clínicas, y se supervisa el estado general de la información
> almacenada.
>
> ![](memoria_referencia/media/image83.jpeg){width="3.8312609361329835in"
> height="2.733332239720035in"}
>
> []{#_bookmark221 .anchor}Ilustración 74: XAMPP

![](memoria_referencia/media/image84.jpeg){width="5.4926093613298335in"
height="2.8039577865266843in"}

> []{#_bookmark222 .anchor}Ilustración 75: phpMyAdmin
>
> Con los servicios de base de datos y servidor web en funcionamiento,
> el siguiente paso es el despliegue del *backend* de "Load Crutches".
> El *backend* está desarrollado con Node.js y se encarga de implementar
> toda la lógica de negocio del sistema, así como de exponer una API que
> permite la comunicación entre el *frontend* web, la aplicación móvil y
> la base de datos. Para lanzar el *backend*, es necesario acceder desde
> la terminal al directorio raíz del proyecto *backend* y ejecutar el
> siguiente comando:
>
> \$ npm install
>
> Este comando permite instalar todas las dependencias definidas en el
> archivo package.json del proyecto. Una vez completada la instalación
> de dependencias, el servidor *backend* se pone en marcha mediante el
> comando:
>
> \$ npm run dev
>
> Este comando inicia el servidor en modo desarrollo, permitiendo
> detectar errores de forma más sencilla y facilitando la depuración
> durante las pruebas. En este punto, el *backend* queda a la espera de
> recibir peticiones HTTP desde los distintos clientes del sistema y de
> interactuar con la base de datos MySQL alojada en el entorno XAMPP.
>
> Una vez que el *backend* está correctamente desplegado y en ejecución,
> se procede al lanzamiento del *frontend* web destinado al profesional
> sanitario. Este *frontend* permite al doctor gestionar pacientes,
> configurar tratamientos, consultar datos de rehabilitación y
> comunicarse con los pacientes. Al igual que en el *backend*, el
> *frontend* se lanza desde la terminal accediendo al directorio
> correspondiente al proyecto web. Previamente, se instalan las
> dependencias necesarias ejecutando:
>
> \$ npm install
>
> Tras la instalación, el servidor de desarrollo del *frontend* se
> inicia mediante el comando:
>
> \$ npm run serve
>
> Este comando levanta la aplicación web en un servidor local, accesible
> desde un navegador web. A partir de este momento, el profesional
> sanitario puede acceder a la interfaz web e interactuar con el
> sistema, siempre que el *backend* y la base de datos se encuentren
> activos.
>
> En paralelo al despliegue del *backend* y del *frontend* web, se debe
> proceder a la instalación y ejecución de la aplicación móvil de "Load
> Crutches", destinada al paciente. Dado que la publicación de
> aplicaciones en la App Store requiere una suscripción de desarrollador
> de Apple con un coste económico, la aplicación móvil se ha desplegado
> directamente en un dispositivo iOS utilizando Xcode. Para ello, es
> necesario disponer de un dispositivo físico compatible con iOS y
> conectarlo al equipo de desarrollo mediante cable o red local.
>
> Desde Xcode, se abre el proyecto de la aplicación móvil y se
> selecciona el dispositivo de destino. A continuación, se compila e
> instala la aplicación directamente en el dispositivo móvil. Este
> proceso permite ejecutar la aplicación en un entorno real, con acceso
> a funcionalidades nativas como Bluetooth, sensores y almacenamiento
> local, imprescindibles para el correcto funcionamiento del sistema.

![](memoria_referencia/media/image85.jpeg){width="5.855742563429572in"
height="0.2373950131233596in"}

> []{#_bookmark223 .anchor}Ilustración 76: Xcode
>
> Una vez instalada la aplicación en el dispositivo móvil, el siguiente
> paso consiste en iniciar la aplicación y proceder a la conexión con la
> muleta inteligente. Esta conexión se realiza a través de la interfaz
> de la propia aplicación móvil, utilizando comunicación Bluetooth Low
> Energy. El usuario debe activar el Bluetooth del dispositivo y
> seleccionar la muleta desde el listado de dispositivos disponibles.
> Una vez establecida la conexión, la aplicación comienza a recibir los
> datos de los sensores integrados en la muleta.
>
> A partir de este momento, la aplicación móvil actúa como intermediaria
> entre el hardware y el *backend*, enviando los datos de carga, pasos y
> estado del sistema al servidor mediante la API previamente desplegada.
> Estos datos son procesados, almacenados y puestos a disposición del
> profesional sanitario a través del portal web.
>
> Cuando todos los componentes están correctamente desplegados y en
> funcionamiento, XAMPP con Apache y MySQL activos, *backend* en
> ejecución, *frontend* web accesible y aplicación móvil instalada y
> conectada a la muleta, el sistema "Load Crutches" se encuentra
> completamente operativo. En este estado, es posible realizar sesiones
> de rehabilitación, monitorizar la evolución del paciente, configurar
> tratamientos personalizados y mantener una comunicación fluida entre
> paciente y profesional sanitario.

![](memoria_referencia/media/image86.jpeg){width="5.876812117235346in"
height="1.7468744531933509in"}

> []{#_bookmark224 .anchor}Ilustración 77: Definición diagrama de
> despliegue

## Video demostrativo

> Enlace: [Video demostrativo]{.underline}

# Análisis de riesgos

> El desarrollo de un sistema tecnológico complejo como "Load Crutches",
> que integra hardware, aplicaciones software y un contexto de uso
> sanitario, implica la aparición de diversos riesgos que pueden afectar
> tanto al proceso de desarrollo como a la viabilidad y aceptación de la
> solución final. La identificación y gestión temprana de estos riesgos
> resulta fundamental para minimizar su impacto y garantizar que el
> sistema cumpla los objetivos funcionales y no funcionales planteados.
>
> En el caso de "Load Crutches", el análisis de riesgos aborda tanto
> riesgos tecnológicos, derivados de la integración de distintos
> subsistemas y del uso de tecnologías específicas, como riesgos
> orientados al usuario, relacionados con la aceptación del sistema, la
> usabilidad y la satisfacción de pacientes y profesionales sanitarios.
> Asimismo, se consideran los posibles riesgos asociados a la
> integración del sistema dentro de un proyecto de mayor alcance, dado
> el carácter colaborativo del desarrollo del hardware.
>
> Con el fin de realizar un análisis estructurado y sistemático, se han
> empleado distintas herramientas complementarias ampliamente utilizadas
> en la gestión de proyectos tecnológicos. En primer lugar, se ha
> utilizado una matriz de riesgos que permite evaluar y priorizar los
> riesgos en función de su probabilidad y severidad. En segundo lugar,
> se ha realizado un análisis DAFO, orientado a identificar factores
> internos y externos que pueden influir en el éxito del proyecto. Por
> último, se ha elaborado un registro de riesgos, en el que se
> documentan de forma detallada los riesgos identificados, su prioridad,
> su complejidad y las medidas correctoras asociadas.

## Matriz de riesgos

> Con el objetivo de identificar, evaluar y priorizar los principales
> riesgos asociados al desarrollo del sistema "Load Crutches", se ha
> utilizado una matriz de riesgos basada en el modelo propuesto por
> Asana, que permite combinar de forma sistemática la probabilidad de
> ocurrencia de un riesgo con la severidad de su impacto sobre el
> proyecto.
>
> []{#_bookmark228 .anchor}Criterios de evaluación
>
> Para la evaluación de riesgos del sistema "Load Crutches" se han
> considerado los siguientes criterios, en coherencia con la matriz de
> riesgos mostrada en la Figura 1:

### Probabilidad

- 1: Muy improbable

- 2: Poco probable

- 3: Posible

- 4: Probable

- 5: Muy probable

### Severidad

- 1: Despreciable

- 2: Menor

- 3: Moderada

- 4: Grave

- 5: Catastrófica

> El nivel de riesgo se obtiene como el producto de ambos valores y se
> clasifica como:

- **Bajo (1--6)**

- **Medio (7--12)**

- **Alto (13--25)**

![](memoria_referencia/media/image87.jpeg){width="5.9504604111986in"
height="1.4309372265966753in"}

> []{#_bookmark229 .anchor}Ilustración 78: Matriz de riesgos

## Análisis DAFO

> Con el objetivo de complementar el análisis de riesgos y obtener una
> visión estratégica del sistema "Load Crutches", se ha realizado un
> análisis DAFO (Debilidades, Amenazas, Fortalezas y Oportunidades).
> Esta herramienta permite evaluar tanto los factores internos del
> proyecto, relacionados con el propio diseño y desarrollo del sistema,
> como los factores externos, vinculados al contexto tecnológico,
> sanitario y de uso.
>
> El análisis DAFO resulta especialmente útil en proyectos
> multidisciplinares orientados al usuario final, ya que permite
> identificar posibles puntos de mejora, anticipar riesgos futuros y
> detectar oportunidades de evolución del sistema más allá del alcance
> académico del Trabajo de Fin de Grado.

1.  []{#_bookmark231 .anchor}Debilidades

> Entre las principales debilidades de "Load Crutches" se encuentra la
> complejidad inherente a la integración de múltiples subsistemas, que
> incluye hardware embebido, comunicación inalámbrica, aplicación móvil,
> *backend* y plataforma web. Esta complejidad incrementa el esfuerzo de
> desarrollo y dificulta la detección temprana de errores en fases
> iniciales.
>
> Otra debilidad relevante es el carácter académico del proyecto, que
> limita tanto el tiempo disponible como los recursos humanos
> implicados. El desarrollo ha sido realizado
>
> principalmente por un único autor, lo que condiciona la velocidad de
> implementación, la capacidad de paralelización de tareas y la
> profundidad de algunas pruebas.
>
> Asimismo, el sistema depende de un hardware específico, cuyo
> desarrollo se ha llevado a cabo en colaboración con la Universidad de
> Salamanca. Aunque esta colaboración aporta ventajas, también introduce
> una dependencia externa que puede limitar la capacidad de modificación
> rápida del dispositivo físico ante nuevos requisitos o cambios de
> diseño.
>
> Por último, al tratarse de un sistema orientado al ámbito sanitario,
> la validación clínica real del sistema no ha podido realizarse dentro
> del alcance del proyecto, lo que limita la obtención de conclusiones
> sobre su eficacia terapéutica en entornos reales.

2.  []{#_bookmark232 .anchor}Amenazas

> Una de las principales amenazas externas es la existencia de
> soluciones comerciales o en desarrollo dentro del ámbito de la
> rehabilitación digital y la monitorización biomecánica, que podrían
> ofrecer funcionalidades similares o más avanzadas, especialmente
> aquellas respaldadas por equipos multidisciplinares y mayores recursos
> económicos.
>
> Otra amenaza significativa está relacionada con los requisitos
> normativos y legales asociados al tratamiento de datos clínicos.
> Aunque el sistema ha sido diseñado teniendo en cuenta principios de
> seguridad y privacidad, una futura implantación real requeriría
> cumplir estrictamente normativas como el Reglamento General de
> Protección de Datos (RGPD), lo que podría implicar cambios
> sustanciales en la arquitectura o en los procesos de gestión de la
> información.
>
> También se considera una amenaza la resistencia al cambio por parte de
> los usuarios, especialmente en entornos clínicos tradicionales, donde
> la adopción de nuevas tecnologías puede verse limitada por hábitos
> consolidados o falta de formación específica.

3.  []{#_bookmark233 .anchor}Fortalezas

> Entre las principales fortalezas de "Load Crutches" destaca su enfoque
> integral, que combina la captura objetiva de datos biomecánicos con
> herramientas de visualización y seguimiento clínico, proporcionando
> una solución completa para el proceso de rehabilitación asistida con
> muletas.
>
> La arquitectura modular y distribuida del sistema constituye otra
> fortaleza clave, ya que facilita el mantenimiento, la escalabilidad y
> la evolución futura del proyecto. La clara separación entre hardware,
> aplicación móvil, *backend* y *frontend* permite introducir mejoras o
> sustituir componentes sin afectar al conjunto del sistema.
>
> Asimismo, la colaboración con la Universidad de Salamanca para el
> desarrollo del hardware aporta un valor añadido al proyecto, al contar
> con un dispositivo funcional y validado en un entorno académico de
> investigación. Esta colaboración reduce riesgos técnicos y refuerza la
> solidez del sistema desarrollado.
>
> Finalmente, la experiencia previa del desarrollador en tecnologías
> clave, como el desarrollo de aplicaciones móviles iOS y sistemas
> *backend*, ha permitido tomar
>
> decisiones tecnológicas adecuadas y optimizar el proceso de
> desarrollo, mejorando la calidad del resultado final.

4.  []{#_bookmark234 .anchor}Oportunidades

> "Load Crutches" presenta diversas oportunidades de evolución futura,
> especialmente en el contexto de la salud digital y la rehabilitación
> remota, un ámbito en crecimiento impulsado por la digitalización de
> los servicios sanitarios y la necesidad de seguimiento a distancia de
> los pacientes.
>
> El sistema podría ampliarse incorporando nuevas métricas biomecánicas,
> algoritmos de análisis más avanzados o técnicas de aprendizaje
> automático que permitan detectar patrones de uso incorrecto o predecir
> la evolución del paciente.
>
> Otra oportunidad relevante es la adaptación del sistema a otros
> dispositivos de ayuda técnica, como bastones, andadores o prótesis,
> ampliando así el alcance del sistema a otros perfiles de pacientes y
> contextos clínicos.
>
> Por último, la plataforma podría evolucionar hacia un producto
> comercial o un proyecto de investigación de mayor alcance,
> integrándose con sistemas hospitalarios existentes o formando parte de
> estudios clínicos más amplios, lo que permitiría validar su impacto
> real en procesos de rehabilitación supervisados.

## Registro de riesgos

> Como complemento a la matriz de riesgos y al análisis DAFO, se ha
> elaborado un registro de riesgos que permite documentar de forma
> estructurada los principales riesgos identificados durante el
> desarrollo de "Load Crutches". Este registro facilita el seguimiento
> de cada riesgo, su priorización y la definición de medidas correctoras
> orientadas a minimizar su impacto sobre el proyecto.
>
> El registro de riesgos se ha construido teniendo en cuenta tanto
> riesgos tecnológicos, derivados de la complejidad del sistema y de la
> integración entre subsistemas, como riesgos orientados al usuario,
> relacionados con la aceptación, la usabilidad y el contexto sanitario
> de aplicación. Para cada riesgo se indica su prioridad, la complejidad
> asociada a su gestión y las medidas correctoras adoptadas o previstas.
>
> La información recogida en este registro se apoya en los resultados
> obtenidos en la matriz de riesgos y en el análisis DAFO,
> proporcionando una visión coherente y completa de los factores de
> incertidumbre del proyecto.
>
> []{#_bookmark236 .anchor}Tabla 9: Registro de riesgos

+------------+-------------------+-----------------+-------------------+---------------------------+
| > **Nº     | > **Descripción** | > **Prioridad** | > **Complejidad** | > **Medidas correctoras** |
| > riesgo** |                   |                 |                   |                           |
+============+===================+=================+===================+===========================+

+---------+------------------+---------+----------+---------------------------+
| > R1    | > Fallos en la   | > Media | > Media  | > Uso de Bluetooth Low    |
|         | > comunicación   |         |          | > Energy, control del     |
|         | > Bluetooth      |         |          | > estado de conexión,     |
|         | > entre la       |         |          | > reconexión automática y |
|         | > muleta y la    |         |          | > validación de tramas.   |
|         | >                |         |          |                           |
|         | > app móvil      |         |          |                           |
+=========+:=================+=========+==========+===========================+
| > R2    | > Errores en la  | > Media | > Media  | > Calibración previa del  |
|         | > medición de la |         |          | > sensor, pruebas         |
|         | > carga aplicada |         |          | > repetidas de carga y    |
|         | > por el         |         |          | > validación de valores   |
|         | > paciente       |         |          | > anómalos.               |
+---------+------------------+---------+----------+---------------------------+
| > R3    | > Dificultad de  | > Media | > Baja   | > Diseño de interfaz      |
|         | > uso de la      |         |          | > simplificada, uso de    |
|         | > aplicación     |         |          | > indicadores visuales    |
|         | > móvil durante  |         |          | > claros y pruebas con    |
|         | > la             |         |          | > usuarios no técnicos.   |
|         | > rehabilitación |         |          |                           |
+---------+------------------+---------+----------+---------------------------+
| > R4    | > Problemas de   | > Media | > Alta   | > Arquitectura modular,   |
|         | > integración    |         |          | > uso de API REST bien    |
|         | > entre          |         |          | > definida y pruebas de   |
|         | > *backend*,     |         |          | > integración             |
|         | > *frontend* web |         |          | >                         |
|         | > y              |         |          | > progresivas.            |
|         | >                |         |          |                           |
|         | > aplicación     |         |          |                           |
|         | > móvil          |         |          |                           |
+---------+------------------+---------+----------+---------------------------+
| > R5    | > Pérdida o      | > Media | > Media  | > Almacenamiento          |
|         | > inconsistencia |         |          | > persistente en base de  |
|         | > de datos de    |         |          | > datos, validación de    |
|         | > sesiones de    |         |          | > datos y control de      |
|         | > rehabilitación |         |          | > errores en la API.      |
+---------+------------------+---------+----------+---------------------------+
| > R6    | > Baja           | > Baja  | > Media  | > Diseño centrado en el   |
|         | > aceptación del |         |          | > usuario,                |
|         | > sistema por    |         |          | > retroalimentación clara |
|         | > parte de       |         |          | > y enfoque no intrusivo  |
|         | >                |         |          | > durante el uso.         |
|         | > pacientes o    |         |          |                           |
|         | > profesionales  |         |          |                           |
+---------+------------------+---------+----------+---------------------------+
| > R7    | > Dependencia    | > Baja  | > Media  | > Colaboración continua   |
|         | > del hardware   |         |          | > con la USAL y           |
|         | >                |         |          | >                         |
|         | > desarrollado   |         |          | > adaptación del software |
|         | > externamente   |         |          | > a un prototipo estable. |
+---------+------------------+---------+----------+---------------------------+
| > R8    | > Problemas de   | > Baja  | > Alta   | > Autenticación por       |
|         | > seguridad en   |         |          | > roles, cifrado de       |
|         | > el acceso a    |         |          | > contraseñas y control   |
|         | > datos clínicos |         |          | > de acceso a la          |
|         |                  |         |          | > información.            |
+---------+------------------+---------+----------+---------------------------+
| > R9    | > Retrasos en el | > Media | > Media  | > Metodología iterativa,  |
|         | > desarrollo     |         |          | > planificación por hitos |
|         | > debido a la    |         |          | > y priorización de       |
|         | > complejidad    |         |          | > funcionalidades         |
|         | > del proyecto   |         |          | > esenciales.             |
+---------+------------------+---------+----------+---------------------------+
| > R10   | > Limitaciones   | > Baja  | > Alta   | > Pruebas controladas,    |
|         | > para realizar  |         |          | > validación técnica del  |
|         | > validaciones   |         |          | > sistema y planteamiento |
|         | > clínicas       |         |          | > de trabajos futuros.    |
|         | > reales         |         |          |                           |
+---------+------------------+---------+----------+---------------------------+

# Organización y gestión del proyecto

> En este apartado se describe la organización y gestión del sistema
> "Load Crutches", así como el flujo general de funcionamiento de sus
> distintos componentes. El objetivo es ofrecer una visión global y
> estructurada de cómo se organizan e interrelacionan los elementos
> software y hardware que forman el sistema, poniendo especial énfasis
> en los componentes de más alto nivel, como la captura de datos en la
> muleta inteligente, la comunicación inalámbrica, el procesamiento de
> la información, el almacenamiento de datos y la visualización a través
> de las aplicaciones móvil y web.
>
> La arquitectura planteada para "Load Crutches" responde a la necesidad
> de integrar un dispositivo físico embebido con sistemas software
> distribuidos, garantizando fiabilidad, escalabilidad y claridad en la
> separación de responsabilidades. Para ello, se ha diseñado una
> arquitectura modular en la que cada subsistema cumple una función bien
> definida dentro del conjunto, permitiendo su desarrollo, mantenimiento
> y evolución de forma relativamente independiente.

## Arquitectura del sistema

> Tal y como establece el paradigma del "Proceso Unificado", la
> arquitectura constituye el eje central del desarrollo del proyecto. En
> el caso de "Load Crutches", este principio ha guiado las decisiones
> tecnológicas y de diseño desde las primeras fases, asegurando que la
> solución final sea coherente con los requisitos funcionales y no
> funcionales definidos, así como con las limitaciones propias de un
> sistema orientado al ámbito sanitario.
>
> La arquitectura principal del sistema se compone de varios bloques
> claramente diferenciados. En primer lugar, se encuentra el subsistema
> de adquisición de datos, integrado en la muleta inteligente. Este
> subsistema está basado en un sistema embebido que se encarga de la
> lectura de los sensores de carga y movimiento, el preprocesado básico
> de las señales y la transmisión de los datos mediante comunicación
> Bluetooth Low Energy.
>
> En un segundo nivel se sitúa la aplicación móvil, que actúa como punto
> de interacción principal para el paciente durante la realización de
> las sesiones de rehabilitación. Esta aplicación recibe los datos
> enviados por la muleta, los interpreta, los presenta de forma
> comprensible al usuario y los envía al *backend* central cuando es
> necesario. De este modo, la aplicación móvil funciona como
> intermediaria entre el dispositivo físico y el resto del sistema,
> reduciendo la complejidad del procesamiento en la propia muleta.
>
> El *backend* del sistema constituye otro de los elementos clave de la
> arquitectura. Este componente centraliza la lógica de negocio,
> gestiona la persistencia de los datos clínicos y de uso, y ofrece
> servicios accesibles tanto desde la aplicación móvil como desde el
> portal web. En este nivel se realiza el almacenamiento estructurado de
> la información de pacientes, sesiones de rehabilitación,
> configuraciones terapéuticas y métricas de seguimiento, garantizando
> la integridad y consistencia de los datos.
>
> Por último, el portal web orientado a profesionales sanitarios
> representa el subsistema de visualización y gestión clínica. A través
> de este componente, los médicos y fisioterapeutas
>
> pueden consultar el progreso de los pacientes, analizar estadísticas,
> configurar límites de carga o pautas de rehabilitación y realizar un
> seguimiento longitudinal del tratamiento. Este subsistema se comunica
> exclusivamente con el *backend*, manteniendo una clara separación
> entre la capa de presentación y la lógica de negocio.

![](memoria_referencia/media/image88.jpeg){width="5.869027777777778in"
height="2.369478346456693in"}

> []{#_bookmark239 .anchor}Ilustración 79: Arquitectura por componentes
> del sistema

1.  []{#_bookmark240 .anchor}Componentes del sistema []{#_bookmark241
    .anchor}Aspectos relevantes asociados a*l backend*

> El *backend* de "Load Crutches" constituye el núcleo lógico del
> sistema y es el encargado de centralizar la gestión, el procesamiento
> y el almacenamiento de toda la información generada por los distintos
> componentes de la plataforma. Esta capa no es accesible directamente
> por los usuarios finales, pero resulta esencial para garantizar el
> correcto funcionamiento del sistema, la coherencia de los datos
> clínicos y la comunicación entre la muleta inteligente, la aplicación
> móvil del paciente y el portal web del profesional sanitario.
>
> Desde un punto de vista arquitectónico, el *backend* se implementa
> como un servidor de tipo API que expone una serie de servicios
> especializados, cada uno de ellos responsable de una parte concreta de
> la lógica de negocio. Esta aproximación favorece la modularidad, la
> escalabilidad y el mantenimiento del sistema, permitiendo que cada
> servicio evolucione de forma independiente sin afectar al resto de
> componentes.
>
> Uno de los aspectos más relevantes del *backend* es la gestión y
> procesamiento de los datos de telemetría procedentes de la muleta
> inteligente. Los datos capturados por los sensores de carga y
> movimiento son recibidos inicialmente por la aplicación móvil del
> paciente y enviados posteriormente al *backend* mediante peticiones a
> la API. Una vez recibidos, estos datos son validados, normalizados y
> almacenados de forma estructurada, asociándolos a una sesión de
> rehabilitación concreta y a un paciente específico. Este
>
> proceso permite transformar señales crudas en información clínica
> útil, como valores de carga por apoyo, número de pasos, duración de la
> sesión o detección de posibles desviaciones respecto a los límites
> establecidos.
>
> El *backend* también desempeña un papel fundamental en la gestión de
> las sesiones de rehabilitación. A través del servicio de gestión de
> sesiones, el sistema permite crear, iniciar, finalizar y consultar
> sesiones, así como asociar a cada una de ellas los datos biomecánicos
> recogidos durante su ejecución. Esta funcionalidad resulta clave para
> ofrecer al profesional sanitario una visión histórica y detallada de
> la evolución del paciente a lo largo del tiempo.
>
> Otro componente esencial del *backend* es la gestión de usuarios y
> autenticación. Mediante los servicios de autenticación y gestión de
> usuarios, el sistema controla el acceso seguro tanto de pacientes como
> de profesionales sanitarios, aplicando distintos niveles de permisos
> según el rol. Esta capa garantiza que cada usuario solo pueda acceder
> a la información que le corresponde, reforzando la confidencialidad y
> la seguridad de los datos clínicos almacenados.
>
> En relación con la personalización del tratamiento, el *backend*
> incorpora servicios específicos para la gestión de patologías, límites
> de carga y pasos, y consejos clínicos. Estos servicios permiten al
> profesional sanitario configurar parámetros individualizados para cada
> paciente, como límites máximos de peso soportado o recomendaciones
> específicas de uso. Dicha información se almacena de forma persistente
> y es enviada a la aplicación móvil cuando es necesario, asegurando que
> el seguimiento de la rehabilitación se adapte a las necesidades
> clínicas concretas de cada usuario.
>
> El sistema de mensajería y comunicación en tiempo real constituye otro
> aspecto relevante del *backend*. Mediante un servidor de comunicación
> basado en *WebSocket*, el *backend* facilita el intercambio de
> mensajes instantáneos entre pacientes y profesionales sanitarios, así
> como la actualización en tiempo casi real de determinados datos
> relevantes. Este mecanismo mejora la interacción y permite un
> seguimiento más cercano del proceso de rehabilitación.
>
> Por último, el *backend* actúa como intermediario entre las
> aplicaciones cliente y la base de datos clínica. Toda la información
> persistente, incluyendo datos de usuarios, sesiones, mensajes,
> configuraciones y telemetría, se almacena en una base de datos
> relacional. El *backend* se encarga de garantizar la integridad,
> consistencia y disponibilidad de estos datos, aplicando las
> operaciones necesarias de creación, consulta, actualización y
> eliminación según la lógica del sistema.
>
> []{#_bookmark242 .anchor}Aspectos relevantes asociados a*l frontend*
>
> El subsistema de visualización y representación de datos de "Load
> Crutches" constituye uno de los elementos clave del sistema, ya que es
> el encargado de materializar la funcionalidad del *backend* en una
> interfaz gráfica accesible y comprensible para los profesionales
> sanitarios. Este subsistema se ha implementado como una aplicación web
> orientada principalmente al uso clínico, permitiendo al personal
> médico supervisar la evolución de los pacientes, analizar datos de
> rehabilitación y configurar tratamientos de forma centralizada.
>
> Para el desarrollo del *frontend* web se ha utilizado Vue.js como
> *framework* principal de JavaScript. Vue.js permite la creación de
> aplicaciones web de tipo Single Page Application (SPA), en las que la
> carga inicial se realiza una única vez y las distintas vistas se
> actualizan dinámicamente sin necesidad de recargar la página completa.
> Este enfoque mejora significativamente la experiencia de usuario,
> reduce la latencia percibida y facilita la interacción continua con el
> sistema, aspectos especialmente relevantes en entornos clínicos donde
> se trabaja con información en tiempo real.
>
> La arquitectura basada en componentes que ofrece Vue.js ha permitido
> estructurar la aplicación en unidades funcionales independientes y
> reutilizables, como vistas de pacientes, paneles de estadísticas,
> formularios de configuración clínica o módulos de mensajería. Cada
> componente encapsula su propia lógica de presentación y
> comportamiento, favoreciendo la mantenibilidad del código, la
> escalabilidad del sistema y la incorporación de nuevas funcionalidades
> en futuras iteraciones del proyecto.
>
> Desde el punto de vista del diseño visual y la experiencia de usuario,
> el *frontend* web se ha apoyado en bibliotecas de estilos que
> proporcionan una base sólida para la construcción de interfaces
> consistentes y profesionales. El uso de un sistema de diseño
> predefinido ha permitido mantener una coherencia visual en toda la
> aplicación, asegurando que los distintos elementos de la interfaz como
> tablas, formularios, botones, gráficos e indicadores, estos presentan
> un aspecto homogéneo y fácilmente reconocible. Este enfoque reduce la
> carga cognitiva del usuario y facilita el aprendizaje del sistema por
> parte del personal sanitario.
>
> El *frontend* web de "Load Crutches" está orientado principalmente a
> la visualización de grandes volúmenes de información clínica, por lo
> que se ha puesto especial énfasis en la claridad de los datos
> presentados. Se han implementado vistas específicas para la
> monitorización de sesiones de rehabilitación, el análisis de métricas
> como carga aplicada, número de pasos o evolución temporal del
> paciente, así como paneles de control que permiten al profesional
> sanitario configurar límites, patologías asociadas y recomendaciones
> personalizadas.
>
> En cuanto a la comunicación con el resto del sistema, el subsistema de
> *frontend* web actúa como cliente del *backend*, accediendo a la
> información a través de llamadas HTTP siguiendo el paradigma REST.
> Todas las operaciones relacionadas con la obtención, actualización o
> eliminación de datos se realizan mediante peticiones a la API expuesta
> por el servidor, manteniendo una clara separación entre la capa de
> presentación y la lógica de negocio. Este desacoplamiento facilita la
> evolución independiente de ambos subsistemas y refuerza la robustez de
> la arquitectura general.
>
> Además, el *frontend* web incorpora mecanismos de gestión de estado y
> control de acceso que garantizan que cada usuario visualice únicamente
> la información que le corresponde según su rol dentro del sistema. De
> este modo, el profesional sanitario puede acceder a funcionalidades
> avanzadas de seguimiento clínico y configuración del tratamiento,
> mientras que se evita la exposición de datos innecesarios o sensibles
> fuera de su ámbito de actuación.
>
> []{#_bookmark243 .anchor}Aspectos relevantes asociados a la aplicación
> móvil
>
> La aplicación móvil de "Load Crutches" constituye el principal punto
> de interacción entre el sistema y el paciente durante el proceso de
> rehabilitación. Este subsistema ha sido diseñado con el objetivo de
> ofrecer una interfaz sencilla, intuitiva y accesible, que permita al
> usuario realizar sesiones de rehabilitación, visualizar su progreso y
> comunicarse con el profesional sanitario sin necesidad de
> conocimientos técnicos avanzados.
>
> La aplicación móvil ha sido desarrollada de forma nativa para
> dispositivos iOS, utilizando el lenguaje de programación Swift y el
> *framework* UIKit. Esta elección permite aprovechar al máximo las
> capacidades del sistema operativo, garantizando un alto rendimiento,
> una integración directa con los servicios del dispositivo y una
> experiencia de usuario coherente con las directrices de diseño de
> Apple. El uso de componentes nativos favorece además la estabilidad de
> la aplicación y facilita el acceso a funcionalidades críticas como la
> comunicación Bluetooth y la gestión de permisos del sistema.
>
> Uno de los aspectos más relevantes de la aplicación móvil es su papel
> como intermediaria entre la muleta inteligente y el *backend* del
> sistema. La aplicación se encarga de establecer la conexión Bluetooth
> con la muleta, recibir los datos generados por los sensores de carga y
> movimiento y procesarlos de forma preliminar antes de enviarlos al
> servidor. Este enfoque permite reducir la complejidad del hardware y
> centralizar la lógica de procesamiento y almacenamiento en el
> *backend*.
>
> Durante una sesión de rehabilitación, la aplicación móvil muestra al
> paciente información en tiempo casi real sobre su actividad, como el
> estado de la conexión con la muleta, el progreso de la sesión o la
> detección de eventos relevantes. El diseño de estas vistas se ha
> realizado priorizando la claridad visual y la facilidad de
> interpretación, evitando la sobrecarga de información y utilizando
> indicadores simples que permitan al paciente comprender su estado de
> forma inmediata.
>
> La aplicación también permite al usuario consultar información
> histórica relacionada con su proceso de rehabilitación. A través de
> diferentes secciones, el paciente puede visualizar estadísticas
> resumidas, datos de sesiones anteriores y avisos o recomendaciones
> proporcionadas por el profesional sanitario. Esta funcionalidad
> fomenta la implicación activa del paciente en su recuperación y
> contribuye a una mayor adherencia al tratamiento prescrito.
>
> Otro aspecto clave del subsistema móvil es la comunicación entre
> paciente y profesional sanitario. La aplicación integra un módulo de
> mensajería que permite el intercambio de mensajes de forma directa,
> facilitando la resolución de dudas, el seguimiento remoto y la
> transmisión de indicaciones clínicas. Esta comunicación se realiza de
> forma controlada y vinculada a la identidad del usuario, garantizando
> la trazabilidad de las interacciones.
>
> Desde el punto de vista arquitectónico, la aplicación móvil se
> comunica con el *backend* de "Load Crutches" mediante peticiones a la
> API, siguiendo un modelo cliente-servidor. Este diseño permite que la
> aplicación móvil se mantenga ligera, delegando en el servidor las
> tareas relacionadas con la lógica de negocio, el almacenamiento
> persistente y el análisis de datos. De este modo, cualquier cambio en
> las reglas clínicas o en el tratamiento
>
> de la información puede realizarse en el *backend* sin necesidad de
> modificar la aplicación instalada en los dispositivos de los
> pacientes.
>
> Asimismo, la aplicación incorpora mecanismos de gestión de sesiones y
> control de acceso, asegurando que el usuario solo pueda acceder a su
> propia información y a las funcionalidades que le corresponden. La
> interfaz guía al usuario de forma clara a través de los distintos
> flujos de uso, como el inicio de sesión, la conexión con la muleta, la
> realización de una sesión de rehabilitación o la consulta de
> resultados.
>
> []{#_bookmark244 .anchor}Aspectos relevantes asociados a la base de
> datos
>
> La base de datos constituye uno de los componentes fundamentales del
> sistema "Load Crutches", ya que es la encargada de almacenar de forma
> persistente toda la información generada y gestionada por los
> distintos subsistemas de la plataforma. Su correcto diseño resulta
> clave para garantizar la integridad, coherencia, trazabilidad y
> seguridad de los datos, especialmente teniendo en cuenta el carácter
> sanitario de la información tratada.
>
> El sistema emplea una base de datos relacional, implementada sobre un
> gestor MySQL, lo que permite modelar de manera estructurada las
> entidades principales del dominio del problema y definir relaciones
> claras entre ellas mediante claves primarias y foráneas. Este enfoque
> resulta especialmente adecuado para un sistema de seguimiento clínico,
> donde es necesario mantener consistencia entre usuarios, pacientes,
> sesiones de rehabilitación y datos biomecánicos asociados.
>
> El diseño de la base de datos se apoya en un modelo entidad-relación
> que refleja los elementos clave del sistema y sus interacciones. Entre
> las entidades principales almacenadas se encuentran los usuarios del
> sistema (tanto pacientes como profesionales sanitarios), los pacientes
> con su información clínica asociada, las sesiones de rehabilitación
> realizadas, los datos de telemetría recogidos durante dichas sesiones,
> las patologías o lesiones definidas por los profesionales sanitarios,
> los consejos clínicos personalizados y los mensajes intercambiados
> entre pacientes y doctores.
>
> Las sesiones de rehabilitación constituyen una de las entidades
> centrales del sistema, ya que actúan como nexo entre el paciente y los
> datos biomecánicos capturados por la muleta inteligente. Cada sesión
> se asocia a un paciente concreto y puede contener múltiples registros
> de telemetría, lo que permite almacenar información detallada sobre la
> carga aplicada, el número de pasos y otros parámetros relevantes a lo
> largo del tiempo. Esta estructura facilita tanto el análisis histórico
> como la visualización gráfica de la evolución del paciente.
>
> Las relaciones entre las distintas entidades han sido definidas de
> forma explícita, garantizando la integridad referencial de los datos.
> Por ejemplo, un paciente puede estar asociado a múltiples sesiones de
> rehabilitación, pero cada sesión pertenece a un único paciente; de
> igual forma, los mensajes intercambiados están siempre vinculados a
> usuarios válidos del sistema, lo que asegura la trazabilidad de las
> comunicaciones. Estas restricciones evitan inconsistencias en la
> información y refuerzan la coherencia global del sistema.
>
> El diseño de la base de datos sigue criterios de normalización,
> separando la información en tablas especializadas según su función y
> evitando redundancias innecesarias. Este
>
> enfoque mejora la mantenibilidad del sistema, facilita su evolución
> futura y reduce el riesgo de errores derivados de la duplicación de
> datos. La información de autenticación, los datos clínicos, las
> métricas de rehabilitación y las comunicaciones se almacenan de forma
> diferenciada, permitiendo aplicar políticas de acceso específicas
> desde la capa de *backend*.
>
> El acceso a la base de datos se realiza exclusivamente a través del
> *backend* del sistema, que actúa como capa intermedia entre los
> clientes (aplicación móvil y panel web) y la persistencia de datos.
> Ningún componente cliente accede directamente a la base de datos, lo
> que permite centralizar la lógica de validación, control de permisos y
> gestión de errores. El *backend* implementa las operaciones de
> creación, consulta, actualización y eliminación de datos, aplicando
> las restricciones necesarias en función del rol del usuario
> autenticado.
>
> Desde el punto de vista de la seguridad y privacidad, el diseño de la
> base de datos ha tenido en cuenta los principios básicos de protección
> de datos aplicables a sistemas del ámbito sanitario. Las credenciales
> de acceso no se almacenan en texto plano y la estructura de la base de
> datos facilita la aplicación de controles de acceso por roles,
> garantizando que cada usuario solo pueda acceder a la información que
> le corresponde. Además, la separación clara entre datos personales,
> clínicos y de comunicación contribuye a una gestión más segura de la
> información sensible.
>
> En conjunto, la base de datos de "Load Crutches" ha sido diseñada como
> un componente robusto, coherente y alineado con los requisitos
> funcionales y no funcionales del sistema. Su estructura relacional, la
> correcta definición de entidades y relaciones, y la centralización del
> acceso a través del *backend* permiten garantizar la integridad,
> seguridad y trazabilidad de la información, constituyendo un pilar
> esencial para el correcto funcionamiento y la escalabilidad futura del
> sistema desarrollado.

![](memoria_referencia/media/image89.jpeg){width="5.4019433508311465in"
height="3.34125in"}

> []{#_bookmark245 .anchor}Ilustración 80: Estructura de la base de
> datos
>
> []{#_bookmark246 .anchor}Aspectos relevantes asociados al hardware
>
> El hardware de la muleta inteligente constituye uno de los pilares
> fundamentales del sistema "Load Crutches", ya que representa el punto
> de partida de toda la cadena de adquisición, procesamiento y análisis
> de datos. Su función principal es transformar una muleta convencional
> en un dispositivo capaz de capturar información biomecánica objetiva
> durante el proceso de rehabilitación, permitiendo así un seguimiento
> preciso y continuo del uso real que el paciente hace de la ayuda
> técnica.
>
> El desarrollo de este hardware se ha llevado a cabo en colaboración
> con la Universidad de Salamanca, dentro de un contexto académico y de
> investigación orientado a la mejora de los sistemas de apoyo a la
> rehabilitación. A lo largo del tiempo, el diseño de la muleta
> inteligente ha evolucionado mediante diferentes iteraciones, en las
> que se han ido refinando tanto los aspectos mecánicos como
> electrónicos y de software embebido. Durante este proceso, se ha
> participado de forma activa en el desarrollo y validación del sistema,
> tanto en la definición de la arquitectura hardware como en la
> implementación del firmware encargado de la adquisición de datos y la
> comunicación inalámbrica. Finalmente, el prototipo funcional
> resultante ha sido cedido para su integración completa en el sistema
> "Load Crutches" y para su utilización en la fase final del proyecto y
> su defensa académica.
>
> Desde el punto de vista técnico, la muleta inteligente integra un
> conjunto de componentes electrónicos diseñados para funcionar de
> manera conjunta de forma robusta, eficiente y segura. El núcleo del
> sistema es un microcontrolador ESP32, que actúa como unidad de control
> encargada de la lectura de sensores, el procesamiento básico de las
> señales y la transmisión de los datos hacia la aplicación móvil
> mediante Bluetooth Low Energy. La elección de este microcontrolador
> responde a su buen equilibrio entre capacidad de procesamiento, bajo
> consumo energético y conectividad inalámbrica integrada, aspectos
> clave en un dispositivo portátil alimentado por batería.
>
> El sensor principal integrado en la muleta es una célula de carga
> axial de tensión y compresión, modelo YGX601L-13, basada en galgas
> extensiométricas. Este sensor permite medir de forma directa la carga
> aplicada por el paciente en cada apoyo, proporcionando valores de peso
> fiables y repetibles. Su integración en la caña de la muleta, en el
> punto de unión entre las dos secciones principales, garantiza que la
> fuerza transmitida durante el apoyo se concentre en el eje del sensor,
> minimizando errores derivados de esfuerzos laterales. Gracias a esta
> configuración, el sistema es capaz de registrar el peso soportado en
> cada paso, calcular valores medios por sesión y detectar situaciones
> de sobrepeso o infrapeso en relación con los límites terapéuticos
> definidos por el profesional sanitario.
>
> Además del sensor de carga, el sistema incorpora un sensor de
> movimiento utilizado para la detección de pasos. La combinación de
> ambas fuentes de información permite no solo cuantificar la carga
> aplicada, sino también contextualizarla dentro del patrón de marcha
> del paciente. Estos datos se procesan en el firmware del dispositivo y
> se encapsulan en una trama estructurada que se envía periódicamente a
> la aplicación móvil.
>
> La comunicación entre la muleta y el resto del sistema se realiza
> mediante Bluetooth Low Energy*,* lo que permite una transmisión
> eficiente de datos con un consumo energético
>
> reducido. La muleta actúa como emisor, mientras que la aplicación
> móvil del paciente funciona como receptor principal, encargándose de
> interpretar los datos, mostrarlos de forma comprensible y enviarlos
> posteriormente al *backend* para su almacenamiento y análisis
> histórico.
>
> En cuanto al sistema de alimentación, la muleta inteligente utiliza
> una batería recargable de polímero de litio integrada en el módulo
> superior. Esta batería proporciona la energía necesaria para alimentar
> el microcontrolador, los sensores y el módulo de comunicación durante
> varias horas de uso continuo. El diseño del firmware incluye
> estrategias básicas de gestión del consumo energético, como el uso de
> BLE, la lectura periódica de sensores y la reducción de actividad
> cuando no se detecta uso de la muleta, lo que permite una autonomía
> adecuada para el contexto clínico y doméstico.
>
> La integración física de todos los componentes se ha realizado
> teniendo en cuenta criterios de ergonomía, peso y robustez. La
> electrónica se aloja en un módulo superior protegido por una carcasa
> resistente, que no interfiere con el agarre de la muleta ni altera de
> forma significativa su peso o equilibrio. En este módulo se incluyen
> también los elementos de interacción básica con el usuario, como
> botones de encendido, indicadores LED de estado y un *buzzer*. Este
> último emite una señal acústica cada vez que se detecta un paso con la
> muleta, proporcionando una retroalimentación sonora simple durante el
> uso.

2.  []{#_bookmark247 .anchor}Descripción del desarrollo

> El desarrollo del sistema "Load Crutches" se ha llevado a cabo
> siguiendo un proceso progresivo e iterativo, en el que se ha pasado
> desde una propuesta inicial de carácter conceptual hasta una solución
> final plenamente funcional que integra hardware, aplicación móvil,
> *backend* y plataforma web. Este proceso ha estado condicionado tanto
> por los objetivos académicos del Trabajo de Fin de Grado como por las
> particularidades técnicas y organizativas propias de un sistema
> orientado al ámbito sanitario.
>
> En las fases iniciales del proyecto, el desarrollo se centró en la
> definición clara del problema y del alcance, así como en el análisis
> del contexto de uso del sistema. A partir del estudio del dominio de
> la rehabilitación asistida mediante muletas y de la revisión de
> soluciones existentes, se identificó la necesidad de un sistema que
> permitiera monitorizar de forma objetiva la carga aplicada por el
> paciente, facilitar el seguimiento remoto por parte del profesional
> sanitario y mejorar la adherencia al tratamiento. Esta propuesta
> inicial se concretó mediante la identificación de actores, la
> definición de casos de uso y la especificación de requisitos
> funcionales y no funcionales, recogidos en los anexos
> correspondientes.
>
> Una vez definidos los requisitos, el desarrollo avanzó hacia la fase
> de diseño de la arquitectura, en la que se tomó la decisión clave de
> adoptar una arquitectura distribuida y modular. Esta decisión
> respondió a varias necesidades fundamentales: reducir la complejidad
> del hardware, centralizar la lógica clínica en un *backend*, facilitar
> la escalabilidad del sistema y permitir la evolución independiente de
> cada subsistema. En este punto se estableció la separación clara entre
> la muleta inteligente como dispositivo de adquisición de datos, la
> aplicación móvil como intermediaria con el paciente, el
>
> *backend* como núcleo lógico del sistema y el *frontend* web como
> herramienta de gestión clínica.
>
> Durante la fase de construcción, el desarrollo del sistema se abordó
> de forma incremental, implementando cada subsistema de manera
> progresiva y validando su funcionamiento antes de avanzar a la
> siguiente etapa. En primer lugar, se priorizó el desarrollo del
> backend, ya que este componente actúa como eje central del sistema y
> condiciona el funcionamiento del resto de elementos. El *backend* se
> diseñó siguiendo un enfoque de API REST, con una estructura modular
> basada en servicios, lo que permitió implementar de forma ordenada la
> gestión de usuarios, sesiones de rehabilitación, patologías, límites
> terapéuticos, mensajería y almacenamiento de datos clínicos.
>
> Paralelamente al desarrollo del *backend*, se abordó la implementación
> del modelo de datos y la configuración de la base de datos relacional,
> prestando especial atención a la integridad de la información, la
> trazabilidad de las sesiones y la separación de datos según el rol del
> usuario. Esta fase requirió varias iteraciones de ajuste,
> especialmente en lo relativo a la estructura de las sesiones de
> rehabilitación y a la asociación de los datos biomecánicos con cada
> paciente y cada sesión concreta.
>
> Una vez establecida una base sólida en el *backend*, el desarrollo
> continuó con la aplicación móvil, concebida como el principal punto de
> interacción para el paciente. La aplicación se desarrolló de forma
> nativa para iOS utilizando Swift y UIKit, una decisión motivada tanto
> por la experiencia previa del desarrollador como por la necesidad de
> una integración robusta con funcionalidades del sistema operativo,
> como la comunicación Bluetooth Low Energy. Durante esta fase surgieron
> diversas dificultades técnicas, especialmente relacionadas con la
> estabilidad de la conexión Bluetooth, la gestión del estado de la
> sesión y la sincronización de datos con el backend. Estas dificultades
> se resolvieron mediante ajustes iterativos en la lógica de conexión,
> la gestión de errores y la separación clara entre la lógica de
> presentación y la lógica de comunicación.
>
> La integración con la muleta inteligente constituyó uno de los
> aspectos más críticos del desarrollo. Aunque el hardware fue
> desarrollado en colaboración con la Universidad de Salamanca, fue
> necesario adaptar y ajustar el firmware para asegurar una comunicación
> fiable con la aplicación móvil, así como definir un formato de datos
> estructurado que permitiera interpretar correctamente la información
> de carga y pasos. Durante este proceso se realizaron múltiples pruebas
> de integración, refinando tanto la frecuencia de envío de datos como
> los mecanismos de detección de eventos relevantes, como los apoyos
> durante la marcha.
>
> En paralelo, se desarrolló el *frontend* web orientado a profesionales
> sanitarios, utilizando Vue.js como *framework* principal. Este
> subsistema se diseñó con el objetivo de ofrecer una visualización
> clara y estructurada de la información clínica, priorizando la
> usabilidad y la interpretación de datos. El desarrollo del *frontend*
> implicó decisiones relevantes en cuanto a la organización de vistas,
> la representación de métricas y la gestión del estado de la
> aplicación, así como la implementación de mecanismos de control de
> acceso basados en roles. La integración con el *backend* permitió
> validar de forma temprana los flujos completos de información, desde
> la captura de datos en la muleta hasta su visualización por parte del
> profesional sanitario.
>
> A lo largo de todo el proceso de desarrollo, se han producido ajustes
> y decisiones técnicas motivadas por limitaciones reales del proyecto,
> como el tiempo disponible, la complejidad de la integración
> hardware-software o el carácter académico del sistema. En algunos
> casos, se optó por soluciones más sencillas pero robustas, priorizando
> la estabilidad y la claridad del diseño frente a implementaciones más
> complejas que podrían comprometer la fiabilidad del sistema.
>
> Como particularidad destacable, el desarrollo de "Load Crutches" ha
> requerido una coordinación constante entre subsistemas, lo que ha
> puesto de manifiesto la importancia de una arquitectura bien definida
> y de una planificación iterativa. El paso progresivo de la propuesta
> inicial a la solución final ha permitido obtener un sistema funcional,
> coherente con los requisitos definidos y suficientemente flexible para
> futuras ampliaciones, sentando una base sólida tanto desde el punto de
> vista técnico como académico.

3.  []{#_bookmark248 .anchor}Descripción de las pruebas

> En este apartado se presentan las pruebas y los resultados obtenidos
> durante el desarrollo y validación del sistema "Load Crutches", con el
> objetivo de evaluar su funcionamiento global y comprobar el
> cumplimiento de los objetivos planteados. Dado el carácter académico
> del proyecto y las limitaciones propias de un Trabajo de Fin de Grado,
> los resultados se han obtenido a partir de pruebas controladas y
> realistas, realizadas en un entorno no clínico.
>
> Cabe destacar que no ha sido posible contar con pacientes reales que
> requiriesen el uso continuado de muletas durante el periodo de
> desarrollo del proyecto. Por este motivo, las pruebas del sistema se
> han llevado a cabo utilizando al propio autor del proyecto y a un
> grupo reducido de personas cercanas, como amigos y familiares, a
> quienes se les ha permitido probar el hardware de la muleta
> inteligente en condiciones de uso lo más realistas posibles. Estas
> pruebas han permitido validar el funcionamiento técnico del sistema,
> así como detectar posibles mejoras en la experiencia de uso y en la
> integración entre los distintos componentes.
>
> Inicialmente, los resultados se han analizado desde una perspectiva
> general del sistema, evaluando la correcta interacción entre el
> hardware, la aplicación móvil, el *backend* y el *frontend* web. En
> todas las pruebas realizadas se ha comprobado que la muleta
> inteligente es capaz de capturar los datos de carga y pasos de forma
> consistente, transmitirlos mediante Bluetooth a la aplicación móvil y,
> posteriormente, enviarlos al *backend* para su almacenamiento y
> visualización. Este flujo completo de funcionamiento confirma la
> viabilidad de la arquitectura planteada.
>
> En relación con el hardware, las pruebas realizadas han permitido
> verificar que el sensor de carga responde de forma proporcional al
> peso aplicado sobre la muleta durante el apoyo. Al simular distintos
> patrones de marcha y niveles de carga, se ha observado que los valores
> registrados reflejan adecuadamente las variaciones de peso,
> permitiendo identificar apoyos más intensos o más ligeros. Del mismo
> modo, el sistema de detección de pasos ha funcionado de forma estable,
> contabilizando los eventos de apoyo de manera coherente durante las
> sesiones simuladas.
>
> En cuanto a la aplicación móvil, los resultados muestran que el
> sistema permite realizar sesiones de rehabilitación de forma fluida,
> siempre que la muleta esté correctamente conectada por Bluetooth.
> Durante las pruebas, los usuarios pudieron iniciar y finalizar
> sesiones, visualizar el estado de la conexión y comprobar que los
> datos se registraban correctamente. La interfaz resultó comprensible
> incluso para personas sin conocimientos técnicos, lo que indica una
> buena adecuación del diseño a su público objetivo.
>
> Desde el punto de vista del *backend* y del almacenamiento de datos,
> se ha comprobado que las sesiones registradas se almacenan de forma
> persistente en la base de datos y pueden ser consultadas
> posteriormente desde el frontend web. Esto ha permitido verificar la
> trazabilidad completa de la información, desde la captura en el
> hardware hasta su visualización por parte del profesional sanitario.
> Los tiempos de respuesta del sistema han sido adecuados para el
> volumen de datos manejado durante las pruebas, sin apreciarse retrasos
> significativos en la sincronización de la información.
>
> En el *frontend* web, los resultados obtenidos muestran que la
> plataforma permite al profesional sanitario acceder a la información
> de los pacientes, consultar el historial de sesiones y analizar los
> datos registrados de forma estructurada. Aunque el número de usuarios
> y sesiones utilizadas en las pruebas ha sido limitado, la
> visualización de la información ha resultado clara y coherente,
> facilitando la interpretación de los datos recogidos durante las
> sesiones de rehabilitación simuladas.
>
> Es importante señalar que los resultados obtenidos no pretenden
> extraer conclusiones clínicas ni validar la eficacia terapéutica del
> sistema, ya que esto requeriría estudios controlados con pacientes
> reales y la supervisión de profesionales sanitarios. El objetivo
> principal de las pruebas ha sido validar el correcto funcionamiento
> técnico de "Load Crutches" y demostrar que el sistema es capaz de
> capturar, transmitir, almacenar y presentar datos de forma fiable.
>
> En conclusión, los resultados obtenidos durante las pruebas confirman
> que "Load Crutches" funciona de manera coherente con el diseño
> planteado y que sus distintos componentes se integran correctamente. A
> pesar de las limitaciones en cuanto al número y perfil de usuarios
> utilizados en las pruebas, el sistema ha demostrado ser una base
> sólida para futuras validaciones clínicas más amplias, en las que se
> podría analizar el impacto real del uso de la muleta inteligente en
> procesos de rehabilitación supervisados.

## Gestión del proyecto

> La gestión del proyecto "Load Crutches" se ha llevado a cabo siguiendo
> un enfoque estructurado y realista, adaptado al contexto académico de
> un Trabajo de Fin de Grado y a la naturaleza multidisciplinar del
> sistema desarrollado. El proyecto integra componentes hardware y
> software orientados al ámbito sanitario, lo que ha requerido una
> planificación cuidadosa de los recursos disponibles, una organización
> clara de las tareas y una gestión temporal acorde con la complejidad
> del sistema.
>
> Dado que el proyecto ha sido desarrollado principalmente por un único
> autor, la gestión del trabajo ha tenido en cuenta las limitaciones
> propias de un desarrollo individual,
>
> apostando por una metodología iterativa que permitiera avanzar de
> forma progresiva, validar resultados intermedios y reducir riesgos
> técnicos. En este contexto, se ha adoptado el paradigma del Proceso
> Unificado, empleando un ciclo de vida iterativo e incremental, tal y
> como se detalla en el Anexo III.

1.  []{#_bookmark250 .anchor}Recursos humanos y colaboraciones

> Desde el punto de vista de los recursos humanos, el desarrollo del
> proyecto ha sido realizado por el autor del trabajo, quien ha asumido
> las tareas de análisis, diseño, implementación, integración y
> validación del sistema software. Esta circunstancia ha condicionado
> tanto la planificación temporal como la organización del trabajo,
> haciendo necesario un enfoque realista en cuanto a carga de trabajo,
> priorización de tareas y alcance del proyecto.
>
> En lo relativo al hardware, el desarrollo de la muleta inteligente se
> ha llevado a cabo en colaboración con la Universidad de Salamanca,
> dentro de un contexto académico y de investigación orientado a la
> mejora de los sistemas de apoyo a la rehabilitación. A lo largo de
> este proceso, el diseño del dispositivo ha evolucionado mediante
> diferentes iteraciones, en las que se han refinado progresivamente los
> aspectos mecánicos, electrónicos y de software embebido.
>
> El autor del proyecto ha participado de forma activa en este proceso
> colaborativo, contribuyendo a la definición de la arquitectura
> hardware, a la implementación y ajuste del firmware encargado de la
> adquisición de datos y la comunicación inalámbrica, así como a la
> validación funcional del dispositivo. Finalmente, el prototipo
> funcional resultante ha sido cedido para su integración completa en el
> sistema "Load Crutches", siendo utilizado durante la fase final del
> proyecto y en su defensa académica.
>
> Esta colaboración ha permitido disponer de un hardware funcional y
> validado, reduciendo de forma significativa los riesgos asociados al
> desarrollo físico del dispositivo y permitiendo centrar el esfuerzo
> principal del TFG en el diseño e implementación del sistema software y
> su integración con el dispositivo IoT.

2.  []{#_bookmark251 .anchor}Recursos humanos y colaboraciones

> En cuanto a los recursos materiales y técnicos, se han utilizado los
> siguientes elementos principales:

- **Equipo de desarrollo personal**: Se emplea para el diseño,
  implementación y pruebas del sistema.

### Entornos de desarrollo software:

- Xcode para el desarrollo de la aplicación móvil iOS.

- Entorno Node.js para el desarrollo del *backend*.

- Herramientas de desarrollo web para el *frontend* clínico.

<!-- -->

- **Infraestructura local de servidor**: Se basada en XAMPP, utilizada
  para el despliegue de la base de datos MySQL y pruebas de integración.

### Dispositivos físicos:

- Prototipo de muleta inteligente proporcionado en el marco de la
  colaboración con la USAL.

- Dispositivo iOS físico para pruebas reales de la aplicación móvil y de
  la comunicación Bluetooth.

> Estos recursos se han configurado y utilizado de forma progresiva,
> comenzando por entornos de desarrollo aislados y avanzando hacia
> escenarios de integración completa del sistema, conforme se iban
> alcanzando los distintos hitos del proyecto.

1.  []{#_bookmark252 .anchor}Planificación temporal

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
> []{#_bookmark253 .anchor}Tabla 10: Asignación de tiempos a las
> distintas iteraciones

+------------------+---------------------+---------------------+
| > **Fase**       | > **Iteración**     | > **Tiempo (días)** |
+==================+=====================+=====================+
| > Inicio         | > Iteración 1       | > 5                 |
|                  +---------------------+---------------------+
|                  | > Iteración 2       | > 10                |
+------------------+---------------------+---------------------+
| > Elaboración    | > Iteración 1       | > 15                |
|                  +---------------------+---------------------+
|                  | > Iteración 2       | > 20                |
+------------------+---------------------+---------------------+
| > Construcción   | > Iteración 1       | > 160               |
|                  +---------------------+---------------------+
|                  | > Iteración 2       | > 40                |
+------------------+---------------------+---------------------+
| > Transición     | > Iteración 1       | > 15                |
|                  +---------------------+---------------------+
|                  | > Iteración 2       | > 25                |
+------------------+---------------------+---------------------+

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
> ![](memoria_referencia/media/image90.png){width="9.540354330708661in"
> height="1.8856244531933508in"}
>
> []{#_bookmark254 .anchor}Ilustración 81: Diagrama de Gantt fase
> Inicio - Iteración 1
>
> ![](memoria_referencia/media/image91.png){width="4.2323753280839895in"
> height="2.098957786526684in"}
> ![](memoria_referencia/media/image92.png){width="3.712474846894138in"
> height="2.1947911198600174in"}
>
> []{#_bookmark255 .anchor}Ilustración 82: Diagrama de Gantt fase
> Inicio - Iteración 2
>
> ![](memoria_referencia/media/image93.png){width="9.576580271216098in"
> height="2.2037489063867017in"}

[]{#_bookmark256 .anchor}Ilustración 83: Diagrama de Gantt fase
Elaboración - Iteración 1

> ![](memoria_referencia/media/image94.png){width="5.246090332458443in"
> height="3.5475in"}
> ![](memoria_referencia/media/image95.png){width="4.165451662292213in"
> height="3.6693744531933508in"}
>
> []{#_bookmark257 .anchor}Ilustración 84: Diagrama de Gantt fase
> Elaboración - Iteración 2
>
> ![](memoria_referencia/media/image96.png){width="9.451244531933508in"
> height="3.1390616797900264in"}

[]{#_bookmark258 .anchor}Ilustración 85: Diagrama de Gantt fase
Construcción - Iteración 1

> ![](memoria_referencia/media/image97.png)
>
> []{#_bookmark259 .anchor}Ilustración 86: Diagrama de Gantt fase
> Construcción - Iteración 2
>
> ![](memoria_referencia/media/image99.png){width="9.4373676727909in"
> height="1.8218744531933508in"}
>
> []{#_bookmark260 .anchor}Ilustración 87: Diagrama de Gantt fase
> Transición - Iteración 1
>
> ![](memoria_referencia/media/image100.png){width="5.292498906386702in"
> height="2.2660411198600174in"}
> ![](memoria_referencia/media/image101.png){width="3.8610444006999125in"
> height="2.3508333333333336in"}
>
> []{#_bookmark261 .anchor}Ilustración 88: Diagrama de Gantt fase
> Transición - Iteración 2

# Conclusiones y trabajo futuro

> En este último apartado se recogen de forma global los resultados y
> conclusiones obtenidas tras el desarrollo del Trabajo de Fin de Grado
> "Load Crutches", así como una reflexión final sobre las posibles
> mejoras y líneas de evolución futuras del sistema. El proyecto ha
> permitido abordar de manera integral un problema real del ámbito de la
> rehabilitación, combinando hardware, software y tecnologías de la
> información en una solución coherente y funcional.

## Conclusiones

> Como parte de las conclusiones del Trabajo de Fin de Grado "Load
> Crutches", se puede afirmar que se ha logrado diseñar e implementar un
> sistema completo y funcional orientado al seguimiento de procesos de
> rehabilitación mediante el uso de muletas inteligentes. El proyecto ha
> recorrido todas las fases propias de un proceso de ingeniería del
> software, desde el análisis inicial y la definición de requisitos
> hasta el diseño, implementación, pruebas y validación del sistema
> final, estructurando el trabajo mediante una división clara en
> subsistemas interconectados pero conceptualmente desacoplados.
>
> El resultado final es un sistema distribuido compuesto por un
> dispositivo hardware instrumentado, una aplicación móvil para el
> paciente, un *backend* centralizado y una plataforma web para el
> profesional sanitario. Esta arquitectura permite que cada componente
> cumpla una función bien definida dentro del conjunto, facilitando
> tanto el mantenimiento como la posible evolución futura del sistema.
> La descomposición del problema en subsistemas independientes ha
> permitido abordar la complejidad del proyecto de forma progresiva y
> controlada, logrando una integración coherente entre hardware y
> software.
>
> Desde el punto de vista funcional, "Load Crutches" cubre un conjunto
> amplio de necesidades habituales en la rehabilitación de pacientes que
> requieren el uso de muletas. El sistema permite medir de forma
> objetiva la carga aplicada en cada apoyo, detectar eventos de paso,
> registrar sesiones completas de rehabilitación y ofrecer una
> visualización clara de los datos tanto para el paciente como para el
> profesional sanitario. Esta información objetiva supone un valor
> añadido frente a los métodos tradicionales de seguimiento, que suelen
> basarse en la percepción subjetiva del paciente o en observaciones
> puntuales en consulta.
>
> En este sentido, la experiencia personal previa en el ámbito de la
> rehabilitación deportiva ha permitido identificar carencias reales en
> el seguimiento del uso de muletas durante procesos de recuperación. A
> partir de esta experiencia, se puede afirmar que "Load Crutches"
> responde de manera efectiva a muchas de las necesidades prácticas que
> surgen tanto para el paciente, que obtiene una mayor conciencia y
> control sobre su rehabilitación, como para el profesional sanitario,
> que dispone de datos objetivos que facilitan la toma de decisiones
> clínicas y el ajuste del tratamiento. Esta doble vertiente refuerza la
> utilidad del sistema en un contexto real de uso.
>
> A nivel técnico, el proyecto ha permitido aplicar y consolidar
> conocimientos relacionados con sistemas embebidos, desarrollo de
> aplicaciones móviles nativas, desarrollo web, bases de datos,
> arquitecturas cliente-servidor y comunicación inalámbrica. La
> integración de un microcontrolador con sensores biomecánicos, junto
> con la transmisión de datos mediante Bluetooth y su posterior
> procesamiento en un *backend*, ha supuesto un reto relevante que se ha
> resuelto de forma satisfactoria. Asimismo, el uso de patrones de
> diseño y una arquitectura modular ha favorecido la mantenibilidad del
> sistema y su posible escalabilidad.
>
> El sistema desarrollado no pretende ser un producto final cerrado,
> sino una base sólida sobre la que se puedan realizar futuras
> ampliaciones. La modularidad alcanzada permite sustituir o mejorar
> componentes concretos, como el hardware de la muleta, los algoritmos
> de análisis de datos o las interfaces de usuario, sin necesidad de
> rehacer el sistema completo. Este enfoque resulta especialmente
> adecuado en un contexto tecnológico en constante evolución, como es el
> ámbito de la salud digital.
>
> En cuanto al cumplimiento de los objetivos, se puede concluir que los
> objetivos principales planteados al inicio del proyecto han sido
> alcanzados, junto con otros objetivos secundarios que han enriquecido
> el resultado final. El sistema es capaz de funcionar de forma
> integrada, puede ser desplegado en un entorno local de manera
> controlada y ofrece una funcionalidad completa alineada con los
> requisitos definidos. Todo ello confirma la viabilidad técnica y
> conceptual de "Load Crutches".
>
> Finalmente, desde una perspectiva personal y formativa, el desarrollo
> de este Trabajo de Fin de Grado ha resultado altamente enriquecedor.
> Ha permitido aplicar conocimientos adquiridos a lo largo del grado,
> profundizar en nuevas tecnologías y afrontar un proyecto de carácter
> multidisciplinar con una visión global. Asimismo, ha proporcionado una
> experiencia cercana a la que se encuentra en un entorno profesional
> real, reforzando capacidades como la planificación, el análisis
> crítico, la resolución de problemas y la integración de sistemas
> complejos. Todo ello supone una base sólida para afrontar futuros
> proyectos relacionados con el desarrollo de soluciones tecnológicas en
> el ámbito de la salud y la rehabilitación.

## Líneas de trabajo futuro

> Una vez alcanzada la solución final del proyecto "Load Crutches", se
> identifican diversas líneas de trabajo futuro orientadas a mejorar,
> ampliar y consolidar el sistema desarrollado. Estas posibles mejoras
> permitirían evolucionar el prototipo actual hacia una solución más
> completa, robusta y cercana a un entorno real de producción, tanto
> desde el punto de vista técnico como funcional y clínico. A
> continuación, se detallan las principales líneas de mejora propuestas:

1.  **Extensión de la aplicación móvil a otras plataformas**:
    Actualmente, la aplicación móvil de "Load Crutches" ha sido
    desarrollada de forma nativa para dispositivos iOS, lo que limita su
    uso a usuarios que dispongan de este tipo de terminales. Como línea
    de trabajo futura, se propone el desarrollo de una versión
    equivalente para dispositivos Android, lo que permitiría ampliar de
    forma considerable el alcance del sistema y facilitar su adopción en
    entornos clínicos

> reales, donde conviven múltiples plataformas. Esta ampliación podría
> abordarse mediante desarrollo nativo en Android o mediante el uso de
> *frameworks* multiplataforma, manteniendo la coherencia funcional y
> visual del sistema.

2.  **Incorporación de un protocolo de comunicación segura**: Aunque el
    sistema ha sido desplegado y probado en un entorno local controlado,
    una mejora fundamental de cara a una futura puesta en producción
    sería la implementación de un protocolo de comunicación segura. La
    incorporación de HTTPS permitiría garantizar la confidencialidad e
    integridad de los datos intercambiados entre el backend, el portal
    web y la aplicación móvil, especialmente relevantes al tratarse de
    información relacionada con la salud de los pacientes. Esta mejora
    sería clave para cumplir con buenas prácticas de seguridad y
    normativas de protección de datos en un entorno real.

3.  **Desarrollo de una segunda muleta instrumentada**: Una de las
    principales limitaciones del prototipo actual es la disponibilidad
    de una única muleta instrumentada, debido a restricciones de
    presupuesto. Como mejora futura prioritaria, se propone el
    desarrollo e integración de una segunda muleta inteligente, lo que
    permitiría:

    - Monitorizar de forma simultánea ambas extremidades.

    - Detectar descompensaciones en la carga aplicada en cada muleta.

    - Analizar patrones de apoyo asimétricos durante la marcha.

    - Obtener métricas mucho más precisas y representativas del proceso
      de rehabilitación.

> Esta ampliación resultaría especialmente relevante, ya que un alto
> porcentaje de pacientes en rehabilitación requieren el uso de dos
> muletas, y su análisis conjunto aportaría un valor clínico
> significativamente mayor.

4.  **Mejora de los algoritmos de análisis y tratamiento de datos**: En
    futuras iteraciones, podría profundizarse en el análisis avanzado de
    los datos recogidos por la muleta, incorporando:

    - Algoritmos más sofisticados de detección de eventos.

    - Análisis temporal y comparativo entre sesiones.

    - Identificación automática de patrones de mejora o estancamiento en
      la rehabilitación.

> Asimismo, se podrían explorar técnicas de aprendizaje automático
> orientadas a la personalización del tratamiento, adaptando
> recomendaciones y límites de carga en función de la evolución
> individual de cada paciente.

5.  **Ampliación de las métricas clínicas disponibles**: Otra línea de
    trabajo futura consistiría en ampliar el conjunto de métricas
    ofrecidas al profesional sanitario, incorporando indicadores como:

    - Evolución de la simetría en la carga.

    - Tendencias de progresión semanal o mensual.

    - Alertas automáticas ante comportamientos anómalos o riesgosos.

> Estas mejoras facilitarían una toma de decisiones más informada y
> permitirían un seguimiento clínico más preciso y continuo.

6.  **Integración con sistemas externos y exportación de datos**: De
    cara a una integración en entornos sanitarios reales, se propone
    como mejora futura la posibilidad de:

    - Exportar datos en formatos estándar (CSV, PDF, informes clínicos).

    - Integrar el sistema con historiales clínicos electrónicos u otros
      sistemas de información hospitalaria.

> Esto permitiría que "Load Crutches" actuase como una herramienta
> complementaria dentro de un ecosistema clínico más amplio.

7.  **Evolución del hardware y mejora de la ergonomía**: Finalmente, una
    línea de trabajo relevante sería la optimización del diseño físico
    de la muleta, tanto a nivel de electrónica como de ergonomía. Entre
    las posibles mejoras se incluyen:

    - Reducción del consumo energético y aumento de la autonomía.

    - Miniaturización de los componentes electrónicos.

    - Mejora de la protección frente a golpes, humedad y uso prolongado.

> Estas mejoras contribuirían a una experiencia de uso más cómoda y
> fiable para el paciente en su día a día.
>
> En conjunto, estas líneas de trabajo futuro ponen de manifiesto que
> "Load Crutches" constituye una base sólida sobre la que seguir
> construyendo un sistema de monitorización de la rehabilitación con un
> alto potencial de crecimiento, tanto a nivel tecnológico como clínico,
> siempre que se disponga del tiempo y los recursos necesarios para su
> evolución.

# Bibliografía

1.  «PlantUML,» \[En línea\]. Available:
    [https://plantuml.com/]{.underline} \[Último acceso: 2025\].

2.  «Vue.js,» \[En línea\]. Available: [https://vuejs.org/]{.underline}
    \[Último acceso: 2025\].

3.  «Node.js,» \[En línea\]. Available:
    [https://nodejs.org/]{.underline} \[Último acceso: 2025\].

4.  «npm -- Node Package Manager,» \[En línea\]. Available:
    [https://[www.npmjs.com/](http://www.npmjs.com/)]{.underline}
    \[Último acceso: 2025\].

5.  «Swift Documentation,» Apple Developer, \[En línea\]. Available:
    [https://developer.apple.com/documentation/swift]{.underline}
    \[Último acceso: 2025\].

6.  «UIKit *Framework*,» Apple Developer, \[En línea\]. Available:
    [https://developer.apple.com/documentation/uikit]{.underline}
    \[Último acceso: 2025\].

7.  «Xcode,» Apple Developer Tools, \[En línea\]. Available:
    [https://developer.apple.com/xcode/]{.underline} \[Último acceso:
    2025\].

8.  «ESP32 Series Datasheet,» Espressif Systems, \[En línea\].
    Available:
    [https://[www.espressif.com/en/products/socs/esp32](http://www.espressif.com/en/products/socs/esp32)]{.underline}
    \[Último acceso: 2025\].

9.  «BLE (*Bluetooth Low Energy*),» Bluetooth SIG, \[En línea\].
    Available:
    https://[www.bluetooth.com/learn-about-bluetooth/tech-overview/low-energy/](http://www.bluetooth.com/learn-about-bluetooth/tech-overview/low-energy/)
    \[Último acceso: 2025\].

10. «MySQL,» Oracle, \[En línea\]. Available:
    [https://[www.mysql.com/](http://www.mysql.com/)]{.underline}
    \[Último acceso: 2025\].

11. «phpMyAdmin,» \[En línea\]. Available:
    [https://[www.phpmyadmin.net/](http://www.phpmyadmin.net/)]{.underline}
    \[Último acceso: 2025\].

12. «XAMPP,» Apache Friends, \[En línea\]. Available:
    [https://[www.apachefriends.org/](http://www.apachefriends.org/)]{.underline}
    \[Último acceso: 2025\].

13. «Postman API Platform,» \[En línea\]. Available:
    [https://[www.postman.com/](http://www.postman.com/)]{.underline}
    \[Último acceso: 2025\].

14. «Git,» \[En línea\]. Available: [https://git-scm.com/]{.underline}
    \[Último acceso: 2025\].

15. «Proceso Unificado de Desarrollo de Software,» \[En línea\].
    Available:
    https://[www.ibm.com/docs/es/rational-soft-arch/9.5.1?topic=overview-rational-unified-](http://www.ibm.com/docs/es/rational-soft-arch/9.5.1?topic=overview-rational-unified-)
    process \[Último acceso: 2025\].

16. «Inter Typeface,» \[En línea\]. Available:
    [https://rsms.me/inter/]{.underline} \[Último acceso: 2025\].

17. «SF Pro Fonts,» Apple Developer, \[En línea\]. Available:
    [https://developer.apple.com/fonts/]{.underline} \[Último acceso:
    2025\].

18. «Model--View--Controller (MVC),» \[En línea\]. Available:
    [https://martinfowler.com/eaaCatalog/modelViewController.html]{.underline}
    \[Último acceso: 2025\].

19. «Model--View--ViewModel (MVVM),» Microsoft Docs, \[En línea\].
    Available:
    https://learn.microsoft.com/en-us/archive/msdn-magazine/2015/january/mvvm-the-
    mvvm-pattern \[Último acceso: 2025\].

20. «PhysiApp,» Physitrack PLC, \[En línea\]. Available:
    [https://[www.physitrack.com/es/physiapp](http://www.physitrack.com/es/physiapp)]{.underline}
    \[Último acceso: 2025\].

21. «Kaia Health,» Kaia Health Software Inc., \[En línea\]. Available:
    [https://[www.kaiahealth.com](http://www.kaiahealth.com/)]{.underline}
    \[Último acceso: 2025\].

22. «ReHub,» DyCare, \[En línea\]. Available:
    [https://[www.dycare.com/rehub](http://www.dycare.com/rehub)]{.underline}
    \[Último acceso: 2025\].

23. «Hinge Health,» Hinge Health Inc., \[En línea\]. Available:
    [https://[www.hingehealth.com](http://www.hingehealth.com/)]{.underline}
    \[Último acceso: 2025\].

24. «Sword Health,» Sword Health Inc., \[En línea\]. Available:
    [https://swordhealth.com]{.underline} \[Último acceso: 2025\].

25. «AMTI Force Sensors,» Advanced Mechanical Technology, Inc., \[En
    línea\]. Available:
    [https://[www.amti.biz](http://www.amti.biz/)]{.underline} \[Último
    acceso: 2025\].

26. «Bertec Force Plates,» Bertec Corporation, \[En línea\]. Available:
    [https://[www.bertec.com](http://www.bertec.com/)]{.underline}
    \[Último acceso: 2025\].

27. «Moticon OpenGo,» Moticon GmbH, \[En línea\]. Available:
    [https://[www.moticon.com](http://www.moticon.com/)]{.underline}
    \[Último acceso: 2025\].

28. «Tekscan Pressure Mapping,» Tekscan, Inc., \[En línea\]. Available:
    [https://[www.tekscan.com](http://www.tekscan.com/)]{.underline}
    \[Último acceso: 2025\].

29. «Xsens Motion Capture,» Movella (Xsens), \[En línea\]. Available:
    [https://[www.xsens.com](http://www.xsens.com/)]{.underline}
    \[Último acceso: 2025\].

30. «APDM Wearable Technologies,» Clario, \[En línea\]. Available:
    [https://[www.clario.com/solutions/precision-motion](http://www.clario.com/solutions/precision-motion)]{.underline}
    \[Último acceso: 2025\].

31. «Universidad de Salamanca,» \[En línea\]. Available:
    [https://[www.usal.es/](http://www.usal.es/)]{.underline} \[Último
    acceso: 2025\].
