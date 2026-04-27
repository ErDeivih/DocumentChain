# Bocetos seleccionados para Anexo II

Este archivo deja unicamente los bocetos que merece la pena mantener en el Anexo II. El criterio seguido ha sido el mismo que se observa en los anexos de referencia: representar las vistas estructurales y los flujos nucleares del sistema, dejando para el Anexo V las capturas detalladas de pantallas secundarias, modales auxiliares y estados operativos.

## Seleccion final

- `login-wireframe.png`
- `register-wireframe.png`
- `documents-dashboard-wireframe.png`
- `document-detail-wireframe.png`
- `share-modal-wireframe.png`
- `shared-documents-wireframe.png`
- `admin-dashboard-wireframe.png`
- `blockchain-auditor-wireframe.png`
- `public-verify-wireframe.png`
- `profile-wireframe.png`
- `settings-wireframe.png`

## Bocetos descartados del Anexo II

No se incluyen en este documento los prompts de `create-folder-modal`, `upload-document-modal`, `versions-panel`, `sign-document-modal`, `signers-modal`, `transfer-tab`, `timeline`, `notifications`, `admin-users`, `admin-logs`, `wallet-selector` y `public-audit`, porque aportan mas valor como capturas finales del Anexo V que como bocetos de analisis.

## Regeneracion prioritaria

Si se vuelven a generar los PNG, conviene rehacer primero `document-detail-wireframe.png`, `shared-documents-wireframe.png`, `blockchain-auditor-wireframe.png`, `profile-wireframe.png` y `settings-wireframe.png`, ya que las versiones existentes son las que mas se alejan del frontend entregado.

## Orden exacto de regeneracion y reintegracion

1. `document-detail-wireframe.png`
	Reinsertar en Anexo II como subseccion `Vista de detalle de documento`, inmediatamente despues de `Vista principal de documentos`.
2. `shared-documents-wireframe.png`
	Reinsertar en Anexo II como subseccion `Vista de documentos compartidos`, inmediatamente despues de `Vista de compartir documento`.
3. `blockchain-auditor-wireframe.png`
	Reinsertar en Anexo II como subseccion `Vista de auditoria blockchain`, inmediatamente despues de `Vista de administracion (Solo Admin)`.
4. `profile-wireframe.png`
	Reinsertar en Anexo II como subseccion `Vista de perfil de usuario`, inmediatamente despues de `Vista de verificacion publica`.
5. `settings-wireframe.png`
	Reinsertar en Anexo II como subseccion `Vista de configuracion`, inmediatamente despues de `Vista de perfil de usuario`.

Ese es el orden recomendado porque va de mayor desviacion estructural a menor, y permite devolver primero al anexo las vistas mas importantes del flujo autenticado.

## Revision visual actual

- `login-wireframe.png`: utilizable tal como esta.
- `register-wireframe.png`: aceptable, pero todavia conviene reforzar la columna informativa izquierda y la referencia a wallet opcional.
- `documents-dashboard-wireframe.png`: la estructura general es valida, pero no deben aparecer etiquetas inventadas como `VERIFICADO` ni estados propios de firma o verificacion que no existen en esa vista.
- `document-detail-wireframe.png`: utilizable, con margen solo para pequenos retoques cosmeticos.
- `share-modal-wireframe.png`: necesita rehacerse; la version actual introduce texto y estructura que no coinciden con el modal real.
- `shared-documents-wireframe.png`: necesita rehacerse; la version actual sigue usando una barra lateral antigua.
- `admin-dashboard-wireframe.png`: necesita rehacerse o ajustarse; debe respetar mejor el sidebar de administrador y la jerarquia real de bloques.
- `blockchain-auditor-wireframe.png`: necesita rehacerse; el sidebar y varios filtros visibles no se corresponden con la pantalla entregada.
- `public-verify-wireframe.png`: necesita rehacerse; no debe mostrar sidebar ni estados ficticios como `Pendiente`.
- `profile-wireframe.png`: aceptable para anexo, sin cambios obligatorios.
- `settings-wireframe.png`: necesita rehacerse o ajustarse; la navegacion lateral y el bloque de wallets deben parecerse mas a la vista real.

## Estados y etiquetas que no deben aparecer

- No introducir `Pendiente de verificar` ni `Pendiente de firmar` como estados estables de la interfaz.
- No introducir la etiqueta `VERIFICADO` en las tarjetas de `Mis Documentos`.
- No introducir explicaciones de `E2EE` o cifrado extremo a extremo dentro del modal de compartir.
- En la vista publica de verificacion, las referencias validas son resultados del tipo `Document Verified`, `Document Not Found` y estados documentales como `Activo`, `Archivado` o `Eliminado`.
- En el flujo de firma solo existen mensajes transitorios como `Verificando estado de firma...` o avisos como `Ya has firmado esta version del documento`, no un estado general visible en listados.

## Base comun de estilo

Todos los prompts siguientes parten del mismo criterio visual: boceto de interfaz de baja fidelidad, estilo wireframe academico para anexo universitario de ingenieria informatica. No generar una captura realista ni una UI final pulida. Estilo monocromo o escala de grises, fondo claro, contornos negros finos, cajas rectangulares, textos legibles, iconos esquematicos, sin sombras, sin texturas, sin fotografias, sin gradientes, sin ilustraciones realistas. Composicion limpia, similar a un mockup funcional hecho para documentacion tecnica. Mostrar solo los elementos necesarios de la interfaz. Incluir etiquetas en espanol. Si aparece contenido de ejemplo, usar texto breve y generico. No incluir marcas de agua, destellos, firmas visuales, iconos decorativos ni elementos flotantes ajenos a la interfaz.

# Prompt 1: login-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista web publica de inicio de sesion de DocumentChain. La composicion debe mostrar una cabecera publica minima con el logotipo a la izquierda y mucho espacio en blanco, y una tarjeta centrada como elemento principal. Dentro de la tarjeta, incluir en vertical: titulo Iniciar Sesion, subtitulo breve sobre gestion segura de documentos blockchain, campo Nombre de usuario o Email, campo Contrasena, boton principal Iniciar Sesion, enlace Olvido su contrasena? y enlace secundario No tiene una cuenta? Registrese aqui. Puede aparecer una nota discreta indicando que algunas cuentas requieren verificacion 2FA despues de validar credenciales. Mantener una disposicion muy limpia, sin panel lateral ni elementos de aplicacion autenticada. Relacion de aspecto horizontal.
```

# Prompt 2: register-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista publica de registro de usuario de DocumentChain. Debe verse una tarjeta o contenedor principal ancho, centrado, con una pequena cabecera superior y una disposicion en dos zonas claramente diferenciadas. A la izquierda deben aparecer dos bloques informativos breves: uno sobre proteccion por contrasena y recuperacion de cuenta, y otro sobre la posibilidad de enlazar una wallet de forma opcional despues del alta o al finalizar el registro. A la derecha debe situarse el formulario. El formulario debe incluir Nombre de usuario, Email, Nombre completo (opcional), Contrasena, Confirmar contrasena, casilla opcional para enlazar wallet al finalizar y boton principal Registrarse. Debajo, incluir enlace para volver al inicio de sesion. No mostrar recovery key en esta vista, solo una nota discreta indicando que se generara una clave de recuperacion unica y que habra verificacion de email. Relacion de aspecto horizontal.
```

# Prompt 3: documents-dashboard-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista autenticada Mis Documentos de DocumentChain, cercana al layout real del producto. Debe incluir barra lateral izquierda con las entradas Mis Documentos, Compartidos Conmigo, Verificar Documento y Explorador Blockchain. Como es una vista de usuario estandar, bajo la navegacion deben verse tambien bloques laterales sencillos para Carpetas, Almacenamiento y Mis Wallets. En el area principal mostrar el titulo Mis Documentos, pestanas Activos y Archivados, un buscador ancho, un filtro por tipo de archivo y dos botones a la derecha: Nueva Carpeta y Subir Documento. En el listado central no usar tabla pesada; mostrar una rejilla de tarjetas de documento con icono de tipo de archivo, nombre truncado, tamano, descripcion breve opcional y metadatos breves. No saturar la pantalla: pocas tarjetas bien alineadas y con mucho espacio en blanco. No anadir badges inventados como `VERIFICADO`, ni estados `Pendiente de verificar` o `Pendiente de firmar`, ni una columna de validacion blockchain que no aparece asi en la vista real. Relacion de aspecto horizontal panoramica.
```

# Prompt 4: document-detail-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista autenticada de detalle de documento de DocumentChain para un documento privado ya sincronizado. Debe mantener la misma barra lateral real que la aplicacion de usuario: Mis Documentos, Compartidos Conmigo, Verificar Documento y Explorador Blockchain, con las zonas inferiores de almacenamiento y wallets visibles. En el contenido principal incluir primero una accion Volver. Debajo, una tarjeta resumen con icono de archivo, nombre del documento, tamano, tipo MIME, Blockchain ID, numero de versiones y numero de compartidos. Bajo esa tarjeta, mostrar la fila realista de acciones: Descargar, Compartir, Firmar Documento, Archivar y Eliminar. Despues, una barra de pestanas con Detalles, Historial, Versiones y Transferir. La vista debe centrarse en la pestana Versiones, mostrando varias tarjetas o filas de version y, si procede, el boton Subir Nueva Version. No incluir buscador superior, no inventar menu lateral alternativo, no mostrar QR ni enlace publico, no anadir paneles ajenos al flujo real y no mostrar estados sinteticos como `pendiente de firmar`. Relacion de aspecto horizontal panoramica.
```

# Prompt 5: share-modal-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa el modal realista de Compartir Documento de DocumentChain, superpuesto sobre la vista de detalle atenuada al fondo. El modal debe estar centrado y contener: titulo Compartir Documento, una linea breve con el nombre exacto del documento, campo Nombre de Usuario para el destinatario, bloque Nivel de Permiso con dos opciones claras Lectura y Escritura mostrando una breve descripcion funcional de cada una, campo Su Contrasena de Cuenta y un bloque informativo indicando que el backend vuelve a cifrar el documento para el destinatario y que la operacion requiere firma blockchain. En el pie, incluir Cancelar y el boton principal Compartir y Firmar. No incluir E2EE extremo a extremo como concepto explicativo, no anadir paneles inventados con datos del perfil del destinatario, no introducir listas de usuarios ya compartidos dentro del modal y no convertir la ventana en una pantalla completa. Relacion de aspecto vertical o cuadrada con fondo atenuado visible.
```

# Prompt 6: shared-documents-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista autenticada Compartidos Conmigo de DocumentChain usando exactamente la misma barra lateral de usuario que en el resto de la aplicacion: Mis Documentos, Compartidos Conmigo, Verificar Documento y Explorador Blockchain, mas los bloques inferiores sencillos. En el area principal, mostrar el titulo Compartidos Conmigo y una linea de contexto indicando la wallet activa, por ejemplo Mostrando documentos compartidos con: Principal (0x...). Debajo, colocar un buscador y un filtro por tipo. En el cuerpo, mostrar solo uno o dos documentos compartidos, no una lista larga: cada tarjeta debe incluir nombre truncado, extension, propietario y una pequena etiqueta Compartido. El resultado debe parecer la pagina real cuando el usuario tiene pocos documentos recibidos. No usar un menu lateral antiguo, no mostrar secciones de ayuda o firma digital y no introducir textos auxiliares inventados. Relacion de aspecto horizontal panoramica.
```

# Prompt 7: admin-dashboard-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa el Panel de Administracion de DocumentChain en su vista Resumen. La barra lateral izquierda debe corresponder al rol admin y mostrar Panel, Mis Documentos, Compartidos Conmigo, Verificar Documento y Explorador Blockchain, sin bloques de almacenamiento ni wallets. En el area principal incluir titulo Panel de Administracion, subtitulo corto, cuatro tarjetas KPI para usuarios, documentos, almacenamiento y estado del sistema, y una barra de pestanas con Resumen, Gestion de Usuarios, Logs del Sistema y Actividad Reciente. En la pestana Resumen mostrar el bloque Informacion del Sistema con estados de base de datos, API, blockchain, email, IPFS o backend de almacenamiento, y dos bloques inferiores para distribucion de almacenamiento y distribucion de usuarios. Evitar graficas decorativas irreales, no reutilizar la barra lateral de usuario estandar y mantener un wireframe tecnico sobrio. Relacion de aspecto horizontal panoramica.
```

# Prompt 8: blockchain-auditor-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista Explorador Blockchain de DocumentChain dentro de la aplicacion autenticada. Usar la navegacion lateral real del producto, sin menus ficticios de ayuda o firma digital. En el area principal incluir el titulo Auditoria Blockchain o Explorador Blockchain, tres pequenas metricas superiores Total, Mostrados y Tipos, y botones Filtros, CSV y Actualizar. Debajo, mostrar un bloque expandido de Filtros avanzados con chips o botones para tipos de eventos, campos para wallet, tx hash, desde bloque, hasta bloque y rango de fechas, y un boton ancho Buscar eventos. En la mitad inferior, un listado de eventos en filas o tarjetas compactas, con tipo de evento, usuario, documento, fecha, bloque y tx hash abreviado, dejando alguna indicacion de que cada fila puede expandirse. No usar una tabla clasica con columnas gigantes, no anadir un panel JSON separado ocupando media pagina y no usar una barra lateral obsoleta distinta de la del producto actual. Relacion de aspecto horizontal panoramica.
```

# Prompt 9: public-verify-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista publica Verificar Documento de DocumentChain. No debe haber sidebar. Mostrar una cabecera publica ligera con la marca DocumentChain y, debajo, un bloque principal con el titulo Verificar Documento y una frase breve sobre autenticidad mediante blockchain. Incluir un primer panel Elegir Metodo de Verificacion con tres tarjetas grandes: Subir Archivo, Hash IPFS e ID Blockchain. Debajo, un segundo panel Introducir Datos de Verificacion con el formulario correspondiente al metodo activo, y un boton Verificar Documento. Reservar espacio para un tercer panel de resultados con estado de verificacion, existencia, integridad, propietario, versiones y firmas, aunque no es necesario rellenarlo por completo. No introducir un estado `Pendiente` ni mensajes de firma pendientes. Relacion de aspecto horizontal.
```

# Prompt 10: profile-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista Perfil de DocumentChain, usando la barra lateral autentificada real de usuario con Mis Documentos, Compartidos Conmigo, Verificar Documento y Explorador Blockchain, junto a los bloques inferiores de almacenamiento y wallets. En el area principal mostrar el titulo Perfil y cuatro bloques principales: Informacion del Usuario con username, email, fecha de alta y rol; Foto de Perfil con placeholder y boton Subir Foto; Seguridad con boton Cambiar Contrasena y una breve nota sobre proteccion de la clave de encriptacion privada; y Gestion de Wallets con lista simplificada de wallets y accion Conectar Wallet. No convertirla en un perfil de red social ni usar menus antiguos de ayuda o cerrar sesion en el lateral. Relacion de aspecto horizontal panoramica.
```

# Prompt 11: settings-wireframe.png

```text
Genera un boceto de interfaz de baja fidelidad con el estilo descrito en la base comun. Representa la vista Configuracion de DocumentChain para usuario autenticado. Debe usar la misma navegacion lateral que la aplicacion real y, en el contenido principal, mostrar el titulo Configuracion con un subtitulo corto. Debajo, incluir una barra de pestanas horizontal con Perfil, Seguridad, Notificaciones y Privacidad, mostrando Perfil como activa. El bloque central debe representar Informacion del Perfil con avatar o iniciales, boton Cambiar Avatar, campos de nombre de usuario, email, nombre y apellidos, una nota informativa breve sobre la aplicacion y botones Cancelar y Guardar Cambios. Bajo ese bloque, incluir Wallets de Blockchain con varias entradas de wallet y un indicador de limite como 5/5 Wallets. No usar la navegacion lateral del panel admin, no inventar listas de opciones ajenas a la configuracion real y no mostrar una arquitectura de sidebar distinta de la vista de usuario autenticado. Relacion de aspecto horizontal panoramica.
```