[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/folderService](../README.md) / FolderService

# Class: FolderService

Defined in: [services/folderService.ts:8](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L8)

Servicio de gestión de carpetas y organización jerárquica de documentos.
Permite crear, actualizar, eliminar y consultar carpetas asociadas a un usuario.

## Constructors

### Constructor

> **new FolderService**(): `FolderService`

#### Returns

`FolderService`

## Methods

### createFolder()

> `static` **createFolder**(`data`): `Promise`\<\{ \}\>

Defined in: [services/folderService.ts:75](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L75)

Crear una nueva carpeta.

#### Parameters

##### data

Datos de la carpeta a crear

###### color?

`string`

Color identificativo (opcional)

###### description?

`string`

Descripción (opcional)

###### icon?

`string`

Icono (opcional)

###### name

`string`

Nombre de la carpeta

###### parentId?

`string`

ID de la carpeta padre (opcional)

###### userId

`string`

ID del propietario

#### Returns

`Promise`\<\{ \}\>

Carpeta creada

***

### deleteFolder()

> `static` **deleteFolder**(`folderId`, `userId`, `deleteContents?`): `Promise`\<`void`\>

Defined in: [services/folderService.ts:191](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L191)

Eliminar una carpeta y, opcionalmente, su contenido.

#### Parameters

##### folderId

`string`

ID de la carpeta

##### userId

`string`

ID del propietario

##### deleteContents?

`boolean` = `false`

Si es true, mueve documentos y subcarpetas a la raíz antes de eliminar

#### Returns

`Promise`\<`void`\>

***

### getFolderById()

> `static` **getFolderById**(`folderId`, `userId`): `Promise`\<\{ \} \| `null`\>

Defined in: [services/folderService.ts:35](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L35)

Obtener una carpeta por ID incluyendo documentos y subcarpetas.

#### Parameters

##### folderId

`string`

ID de la carpeta

##### userId

`string`

ID del usuario propietario

#### Returns

`Promise`\<\{ \} \| `null`\>

Carpeta encontrada o null

***

### getFolderPath()

> `static` **getFolderPath**(`folderId`, `userId`): `Promise`\<`object`[]\>

Defined in: [services/folderService.ts:278](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L278)

Obtener la ruta completa de una carpeta (breadcrumb).

#### Parameters

##### folderId

`string`

ID de la carpeta destino

##### userId

`string`

ID del propietario

#### Returns

`Promise`\<`object`[]\>

Array de carpetas desde la raíz hasta la carpeta indicada

***

### getFolderStats()

> `static` **getFolderStats**(`folderId`, `userId`): `Promise`\<\{ `documentCount`: `number`; `subfolderCount`: `number`; `totalSize`: `string`; \}\>

Defined in: [services/folderService.ts:321](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L321)

Obtener estadísticas de una carpeta.

#### Parameters

##### folderId

`string`

ID de la carpeta

##### userId

`string`

ID del propietario

#### Returns

`Promise`\<\{ `documentCount`: `number`; `subfolderCount`: `number`; `totalSize`: `string`; \}\>

Conteo de documentos, tamaño total y número de subcarpetas

***

### getUserFolders()

> `static` **getUserFolders**(`userId`): `Promise`\<`object`[]\>

Defined in: [services/folderService.ts:14](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L14)

Obtener todas las carpetas de un usuario.

#### Parameters

##### userId

`string`

ID del usuario propietario

#### Returns

`Promise`\<`object`[]\>

Lista de carpetas con conteos de documentos y subcarpetas

***

### moveDocumentsToFolder()

> `static` **moveDocumentsToFolder**(`documentIds`, `folderId`, `userId`): `Promise`\<`void`\>

Defined in: [services/folderService.ts:237](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L237)

Mover documentos a una carpeta destino.

#### Parameters

##### documentIds

`string`[]

IDs de los documentos a mover

##### folderId

ID de la carpeta destino (null para raíz)

`string` | `null`

##### userId

`string`

ID del propietario

#### Returns

`Promise`\<`void`\>

***

### updateFolder()

> `static` **updateFolder**(`folderId`, `userId`, `data`): `Promise`\<\{ \}\>

Defined in: [services/folderService.ts:129](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/folderService.ts#L129)

Actualizar una carpeta existente.

#### Parameters

##### folderId

`string`

ID de la carpeta

##### userId

`string`

ID del propietario

##### data

Campos a actualizar

###### color?

`string`

###### description?

`string`

###### icon?

`string`

###### name?

`string`

###### parentId?

`string`

#### Returns

`Promise`\<\{ \}\>

Carpeta actualizada
