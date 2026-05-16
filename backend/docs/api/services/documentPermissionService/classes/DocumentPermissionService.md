[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [services/documentPermissionService](../README.md) / DocumentPermissionService

# Class: DocumentPermissionService

Defined in: [services/documentPermissionService.ts:48](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L48)

Servicio de permisos de documentos.

Consulta y gestiona los permisos directamente desde la blockchain.
La blockchain es la ÚNICA fuente de verdad para los permisos de documentos.

No existe tabla `DocumentShare` en la base de datos;
todos los permisos se consultan y gestionan a través del smart contract.

## Constructors

### Constructor

> **new DocumentPermissionService**(): `DocumentPermissionService`

#### Returns

`DocumentPermissionService`

## Methods

### canEdit()

> `static` **canEdit**(`docId`, `userAddress`): `Promise`\<`boolean`\>

Defined in: [services/documentPermissionService.ts:151](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L151)

Verifica si un usuario puede editar un documento.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si puede editar, `false` en caso contrario.

***

### canView()

> `static` **canView**(`docId`, `userAddress`): `Promise`\<`boolean`\>

Defined in: [services/documentPermissionService.ts:130](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L130)

Verifica si un usuario puede ver un documento.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si puede ver, `false` en caso contrario.

***

### getDocumentUsers()

> `static` **getDocumentUsers**(`docId`): `Promise`\<`string`[]\>

Defined in: [services/documentPermissionService.ts:192](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L192)

Obtiene la lista de usuarios con acceso a un documento.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

#### Returns

`Promise`\<`string`[]\>

Array de direcciones Ethereum con acceso al documento.

***

### getDocumentUsersWithRoles()

> `static` **getDocumentUsersWithRoles**(`docId`): `Promise`\<`object`[]\>

Defined in: [services/documentPermissionService.ts:210](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L210)

Obtiene la lista de usuarios con acceso y sus roles.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

#### Returns

`Promise`\<`object`[]\>

Array de objetos con dirección y rol asignado.

***

### getUserDocumentCount()

> `static` **getUserDocumentCount**(`userAddress`): `Promise`\<`number`\>

Defined in: [services/documentPermissionService.ts:275](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L275)

Obtiene el número de documentos a los que un usuario tiene acceso.

#### Parameters

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`number`\>

Número de documentos accesibles.

***

### getUserDocuments()

> `static` **getUserDocuments**(`userAddress`): `Promise`\<`string`[]\>

Defined in: [services/documentPermissionService.ts:237](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L237)

Obtiene todos los documentos a los que un usuario tiene acceso.

#### Parameters

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`string`[]\>

Array de identificadores de documento (bytes32).

***

### getUserPermission()

> `static` **getUserPermission**(`docId`, `userAddress`): `Promise`\<[`DocumentPermission`](../interfaces/DocumentPermission.md)\>

Defined in: [services/documentPermissionService.ts:79](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L79)

Obtiene los permisos completos de un usuario en un documento.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<[`DocumentPermission`](../interfaces/DocumentPermission.md)\>

Objeto con el rol y los permisos detallados.

***

### getUserRole()

> `static` **getUserRole**(`docId`, `userAddress`): `Promise`\<[`DocumentRole`](../enumerations/DocumentRole.md)\>

Defined in: [services/documentPermissionService.ts:55](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L55)

Obtiene el rol de un usuario en un documento.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<[`DocumentRole`](../enumerations/DocumentRole.md)\>

Rol del usuario como valor del enum [DocumentRole](../enumerations/DocumentRole.md).

***

### isOwner()

> `static` **isOwner**(`docId`, `userAddress`): `Promise`\<`boolean`\>

Defined in: [services/documentPermissionService.ts:172](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L172)

Verifica si un usuario es propietario de un documento.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

##### userAddress

`string`

Dirección Ethereum del usuario.

#### Returns

`Promise`\<`boolean`\>

`true` si es propietario, `false` en caso contrario.

***

### revokePermission()

> `static` **revokePermission**(`docId`, `userAddress`): `Promise`\<`string`\>

Defined in: [services/documentPermissionService.ts:336](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L336)

Revoca los permisos de un usuario en un documento.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

##### userAddress

`string`

Dirección del usuario cuyos permisos se revocarán.

#### Returns

`Promise`\<`string`\>

Hash de la transacción.

#### Throws

Error si la dirección es inválida.

***

### shareDocument()

> `static` **shareDocument**(`docId`, `userAddress`, `role`): `Promise`\<`string`\>

Defined in: [services/documentPermissionService.ts:294](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/services/documentPermissionService.ts#L294)

Comparte un documento con otro usuario otorgándole permisos.

#### Parameters

##### docId

`string`

Identificador del documento en la blockchain (bytes32).

##### userAddress

`string`

Dirección del usuario destinatario.

##### role

Rol a otorgar (`VIEWER` o `EDITOR`).

[`VIEWER`](../enumerations/DocumentRole.md#viewer) | [`EDITOR`](../enumerations/DocumentRole.md#editor)

#### Returns

`Promise`\<`string`\>

Hash de la transacción.

#### Throws

Error si la dirección es inválida, el rol no es permitido o el documento está eliminado.
