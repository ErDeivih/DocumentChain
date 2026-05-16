[**DecentralizedFS Backend API v1.0.0**](../../../README.md)

***

[DecentralizedFS Backend API](../../../modules.md) / [utils/logger](../README.md) / FlowLogger

# Class: FlowLogger

Defined in: [utils/logger.ts:138](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L138)

Logger de flujo que permite realizar un seguimiento completo de una operación
desde su inicio hasta su finalización.

## Example

```ts
const flow = new FlowLogger(FlowContext.FILE_UPLOAD, userId);
flow.start('upload', { filename: 'doc.pdf' });
flow.step('encrypt-file');
flow.step('upload-ipfs', { cid });
flow.success({ fileId: '123' });
```

## Constructors

### Constructor

> **new FlowLogger**(`context`, `userId?`): `FlowLogger`

Defined in: [utils/logger.ts:150](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L150)

Crea una nueva instancia de `FlowLogger`.

#### Parameters

##### context

[`FlowContext`](../enumerations/FlowContext.md)

Contexto de flujo que identifica el caso de uso.

##### userId?

`string`

Identificador opcional del usuario asociado al flujo.

#### Returns

`FlowLogger`

## Methods

### error()

> **error**(`error`, `data?`): `void`

Defined in: [utils/logger.ts:211](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L211)

Registra un error ocurrido durante la ejecución del flujo.

#### Parameters

##### error

`Error`

Instancia del error producido.

##### data?

`any`

Datos adicionales opcionales a registrar.

#### Returns

`void`

***

### getFlowId()

> **getFlowId**(): `string`

Defined in: [utils/logger.ts:244](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L244)

Obtiene el identificador único del flujo para correlación entre logs.

#### Returns

`string`

Cadena con el identificador del flujo.

***

### start()

> **start**(`action`, `data?`): `void`

Defined in: [utils/logger.ts:163](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L163)

Registra el inicio de un flujo de operaciones.

#### Parameters

##### action

`string`

Nombre de la acción que inicia el flujo.

##### data?

`any`

Datos adicionales opcionales a registrar.

#### Returns

`void`

***

### step()

> **step**(`step`, `data?`): `void`

Defined in: [utils/logger.ts:179](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L179)

Registra un paso intermedio dentro del flujo.

#### Parameters

##### step

`string`

Nombre del paso ejecutado.

##### data?

`any`

Datos adicionales opcionales a registrar.

#### Returns

`void`

***

### success()

> **success**(`result?`): `void`

Defined in: [utils/logger.ts:195](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L195)

Registra la finalización exitosa del flujo.

#### Parameters

##### result?

`any`

Resultado opcional de la operación.

#### Returns

`void`

***

### warn()

> **warn**(`message`, `data?`): `void`

Defined in: [utils/logger.ts:229](https://github.com/ErDeivih/DocumentChain/blob/7bb6e2638295cf631b649d7568272692f9ace00d/backend/src/utils/logger.ts#L229)

Registra una advertencia dentro del flujo.

#### Parameters

##### message

`string`

Mensaje descriptivo de la advertencia.

##### data?

`any`

Datos adicionales opcionales a registrar.

#### Returns

`void`
