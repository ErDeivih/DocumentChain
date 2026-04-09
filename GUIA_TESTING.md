# 📚 Guía Completa de Testing - Sistema de Gestión Documental

## 📖 Tabla de Contenidos
1. [¿Qué son los Tests?](#qué-son-los-tests)
2. [¿Para qué sirven en NUESTRO proyecto?](#para-qué-sirven-en-nuestro-proyecto)
3. [¿Qué casos cubren?](#qué-casos-cubren)
4. [¿Cómo se ejecutan?](#cómo-se-ejecutan)
5. [Sintaxis y Estructura](#sintaxis-y-estructura)
6. [¿Cómo afectan los cambios de código?](#cómo-afectan-los-cambios-de-código)
7. [Estado Actual (207 Tests)](#estado-actual)
8. [Extensiones Recomendadas](#extensiones-recomendadas)

---

## 🤔 ¿Qué son los Tests?

Los **tests automatizados** son **código que valida otro código**. Son pequeños programas que:

- ✅ **Verifican** que tu código hace lo que debe hacer
- 🐛 **Detectan bugs** antes de que lleguen a producción
- 📄 **Documentan** cómo usar las funciones
- 🔒 **Protegen** de romper funcionalidad existente

### Analogía Simple
Imagina que construyes un coche:
- **Sin tests**: Esperas a conducirlo para ver si funciona (puede explotar ⚠️)
- **Con tests**: Pruebas el motor, frenos, luces ANTES de conducir (seguro ✅)

---

## 🎯 ¿Para qué sirven en NUESTRO proyecto?

### 1. **Seguridad Crítica** 🔐
Nuestro sistema maneja:
- 🔑 **Cifrado AES-256-GCM** (si falla, datos expuestos)
- 📜 **Blockchain Ethereum** (transacciones irreversibles)
- 🌐 **IPFS** (contenido permanente)

**Los tests garantizan que:**
- El cifrado SIEMPRE funciona correctamente
- Las operaciones blockchain no pierden fondos
- Los permisos se validan ANTES de compartir

### 2. **Desarrollo Continuo** 🚀
La app NO está terminada. Los tests permiten:
- ✅ Agregar features sin romper existentes
- ✅ Refactorizar con confianza
- ✅ Detectar efectos colaterales inmediatamente

### 3. **Documentación Viva** 📚
Los tests muestran **CÓMO usar** cada función:
```typescript
// En lugar de leer 500 líneas de código, lees el test:
it('should encrypt and decrypt file correctly', () => {
  const file = Buffer.from('hello');
  const encrypted = encryptFile(file);
  const decrypted = decryptFile(encrypted);
  expect(decrypted).toEqual(file); // ✅ Así se usa!
});
```

---

## 📋 ¿Qué casos cubren?

### **Backend: 105 Tests** ✅

#### 1. **Blockchain Queries** (45 tests)
**Archivo:** `backend/test/unit/blockchainQueries.test.ts`

**Qué cubren:**
- ✅ Obtener documentos del contrato
- ✅ Listar versiones de documentos
- ✅ Verificar permisos (OWNER/EDITOR/VIEWER)
- ✅ Consultar firmas digitales
- ✅ Listar documentos de un usuario

**Ejemplo real:**
```typescript
it('should return document data from blockchain', async () => {
  // Simula llamada al contrato Ethereum
  const doc = await BlockchainQueries.getDocument('doc-123');
  
  expect(doc.owner).toBe('0xUserAddress');
  expect(doc.createdAt).toBeGreaterThan(0);
  expect(doc.isDeleted).toBe(false);
});
```

**Por qué importa:**
Si cambias `getDocument()`, el test falla → sabes que rompiste algo.

---

#### 2. **Document Permissions** (38 tests)
**Archivo:** `backend/test/unit/documentPermissionService.test.ts`

**Qué cubren:**
- ✅ Verificar roles (canView, canEdit, isOwner)
- ✅ Compartir documentos (VIEWER/EDITOR)
- ✅ Revocar permisos
- ✅ Listar usuarios con acceso
- ✅ Manejo de errores (direcciones inválidas)

**Ejemplo real:**
```typescript
it('should share document with VIEWER role', async () => {
  await DocumentPermissionService.shareDocument(
    'doc-123', 
    'user-wallet-address', 
    'VIEWER'
  );
  
  const role = await service.getUserRole('doc-123', 'user-wallet-address');
  expect(role).toBe('VIEWER'); // ✅ Usuario puede VER pero NO editar
});
```

**Por qué importa:**
Los permisos son CRÍTICOS en blockchain (irreversibles). Tests previenen errores.

---

#### 3. **Encryption Library** (14 tests)
**Archivo:** `backend/src/lib/__tests__/encryption.test.ts`

**Qué cubren:**
- ✅ Cifrado AES-256-GCM correcto
- ✅ Descifrado exitoso (roundtrip)
- ✅ IVs únicos (vectores inicialización)
- ✅ Auth tags válidos (integridad)
- ✅ RSA key wrapping
- ✅ Password-based encryption
- ✅ Validaciones (tamaño, MIME types)
- ✅ Re-cifrado para compartir

**Ejemplo real:**
```typescript
it('should encrypt and decrypt a file correctly', () => {
  const file = Buffer.from('Contenido secreto');
  
  // 1. Cifrar
  const { encryptedData, symmetricKey, iv, authTag } = encryptFile(file);
  
  // 2. Descifrar
  const decrypted = decryptFile({ 
    encryptedData, 
    symmetricKey, 
    iv, 
    authTag 
  });
  
  // 3. Verificar
  expect(decrypted.toString()).toBe('Contenido secreto');
});
```

**Por qué importa:**
Si cifrado falla, TODO el sistema es inseguro. Tests validan CADA operación.

---

#### 4. **Integration Tests** (8 tests)
**Archivo:** `backend/src/__tests__/integration.test.ts`

**Qué cubren:**
- ✅ Ciclo completo: cifrar → IPFS → descifrar
- ✅ Compartir documentos (re-cifrado)
- ✅ Versionado (claves independientes)
- ✅ Transferencia ownership
- ✅ Múltiples usuarios simultáneos

**Ejemplo real:**
```typescript
it('should complete full encryption cycle', async () => {
  // 1. Usuario 1 cifra documento
  const encrypted = encryptFile(Buffer.from('test'));
  const ownerWrappedKey = encryptSymmetricKey(
    encrypted.symmetricKey, 
    owner.publicKey
  );
  
  // 2. Usuario 1 puede descifrar
  const ownerSymKey = decryptSymmetricKey(
    ownerWrappedKey, 
    owner.privateKey
  );
  const decrypted = decryptFile({ 
    ...encrypted, 
    symmetricKey: ownerSymKey 
  });
  
  expect(decrypted.toString()).toBe('test'); // ✅ Funciona end-to-end
});
```

---

### **Smart Contracts: 102 Tests** ✅

#### Archivo: `smart-contracts/test/DocumentRegistry.test.js`

**Qué cubren:**

##### 1. **Deployment & Initialization** (3 tests)
- ✅ Contrato se despliega correctamente
- ✅ Owner tiene privilegios
- ✅ Roles ADMIN/OPERATOR asignados

##### 2. **Document Creation** (10 tests)
- ✅ Crear documento con IPFS CID
- ✅ Generar ID único (bytes32)
- ✅ Emitir evento `DocumentCreated`
- ✅ Rechazar duplicados
- ✅ Validar IPFS CID no vacío
- ✅ Solo funciona cuando no está pausado

##### 3. **Version Management** (16 tests)
- ✅ Crear nueva versión
- ✅ Incrementar número versión
- ✅ Restaurar versión anterior
- ✅ Cambiar versión operacional
- ✅ Solo OWNER/EDITOR pueden crear
- ✅ Rechazar versiones inexistentes

##### 4. **Document Signing** (8 tests)
- ✅ Firmar versión con ECDSA
- ✅ Almacenar firma + timestamp
- ✅ Verificar acceso (VIEWER puede firmar)
- ✅ Rechazar firmas duplicadas
- ✅ Validar firma no vacía

##### 5. **Permissions & Sharing** (25 tests)
- ✅ Compartir como VIEWER
- ✅ Compartir como EDITOR
- ✅ Revocar permisos
- ✅ Solo OWNER puede compartir
- ✅ No compartir con mismo usuario
- ✅ Roles válidos (no OWNER ni NONE)
- ✅ Listar usuarios con acceso

##### 6. **Ownership Transfer** (5 tests)
- ✅ Transferir ownership
- ✅ Actualizar owner en struct
- ✅ Nuevo owner tiene rol OWNER
- ✅ Viejo owner baja a VIEWER
- ✅ Solo owner actual puede transferir

##### 7. **Archive & Delete** (8 tests)
- ✅ Archivar documento (soft)
- ✅ Desarchivar documento
- ✅ Eliminar (soft delete)
- ✅ Datos persisten después delete
- ✅ Solo owner puede archivar/eliminar
- ✅ Rechazar delete si ya eliminado

##### 8. **Pause/Unpause** (6 tests)
- ✅ Admin puede pausar sistema
- ✅ Admin puede despausar
- ✅ Operaciones bloqueadas cuando pausado
- ✅ Solo ADMIN puede pausar
- ✅ Emitir eventos Paused/Unpaused

##### 9. **Role Management** (5 tests)
- ✅ Otorgar rol ADMIN
- ✅ Revocar rol ADMIN
- ✅ Verificar hasRole()
- ✅ Solo DEFAULT_ADMIN_ROLE puede otorgar

##### 10. **View Functions** (7 tests)
- ✅ getDocument()
- ✅ getVersion()
- ✅ getVersionSignatures()
- ✅ getUserPermission()
- ✅ getUserDocuments()
- ✅ getUserDocumentCount()
- ✅ getTotalDocuments()

##### 11. **Security & Edge Cases** (10 tests)
- ✅ Protección reentrancy (ReentrancyGuard)
- ✅ Operaciones rápidas múltiples
- ✅ Documentos con muchos usuarios
- ✅ Documentos con muchas versiones
- ✅ Documentos con muchas firmas
- ✅ Datos persisten después archive
- ✅ Validación address(0)
- ✅ Manejo uint256 max values
- ✅ Estado consistente tras errores

**Ejemplo real:**
```javascript
it('Should create document successfully', async () => {
  const docId = ethers.id('test-doc');
  const ipfsCid = 'QmTestCID';
  
  await expect(
    registry.createDocument(docId, ipfsCid, ethers.id('key'))
  ).to.emit(registry, 'DocumentCreated')
   .withArgs(docId, owner.address, ipfsCid, expect.any(Number));
  
  const doc = await registry.getDocument(docId);
  expect(doc.owner).to.equal(owner.address);
  expect(doc.ipfsCid).to.equal(ipfsCid);
});
```

---

## ⚙️ ¿Cómo se ejecutan?

### **Backend (Jest + TypeScript)**

#### Todos los tests:
```bash
cd backend
npm test
```

**Salida esperada:**
```
Test Suites: 4 passed, 4 total
Tests:       105 passed, 105 total
Snapshots:   0 total
Time:        15.234 s
```

#### Tests específicos:
```bash
# Solo encryption
npm test encryption.test.ts

# Solo blockchain queries
npm test blockchainQueries.test.ts

# Con coverage
npm test -- --coverage
```

#### Watch mode (auto-ejecuta al cambiar código):
```bash
npm test -- --watch
```

---

### **Smart Contracts (Hardhat + Mocha)**

#### Todos los tests:
```bash
cd smart-contracts
npm test
```

**Salida esperada:**
```
  102 passing (1s)
```

#### Test específico:
```bash
npx hardhat test test/DocumentRegistry.test.js
```

#### Con gas reporting:
```bash
REPORT_GAS=true npx hardhat test
```

---

## 📝 Sintaxis y Estructura

### **Backend (Jest)**

#### Estructura básica:
```typescript
describe('NombreDelServicio', () => {
  // Setup: Se ejecuta ANTES de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Grupo de tests relacionados
  describe('nombreDelMetodo', () => {
    
    // Test individual
    it('should do something specific', () => {
      // 1. ARRANGE: Preparar datos
      const input = { name: 'test' };
      
      // 2. ACT: Ejecutar función
      const result = myFunction(input);
      
      // 3. ASSERT: Verificar resultado
      expect(result).toBe('expected');
    });

    it('should reject invalid input', () => {
      expect(() => {
        myFunction(null);
      }).toThrow('Invalid input');
    });
  });
});
```

#### Matchers de Jest:
```typescript
// Igualdad
expect(value).toBe(5);              // ===
expect(value).toEqual({ a: 1 });    // deep equal

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeDefined();

// Números
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);
expect(value).toBeCloseTo(0.3); // Floats

// Strings
expect(text).toMatch(/pattern/);
expect(text).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow('error');
```

#### Mocking:
```typescript
// Mock función
const mockFn = jest.fn().mockReturnValue(42);
mockFn(); // 42

// Mock módulo
jest.mock('../../src/config/database', () => ({
  default: {
    document: {
      create: jest.fn(),
    },
  },
}));

// Verificar llamadas
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(2);
```

---

### **Smart Contracts (Mocha + Chai)**

#### Estructura básica:
```javascript
describe("ContractName", function () {
  // Fixture: Estado inicial reutilizable
  async function deployFixture() {
    const [owner, user1] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ContractName");
    const contract = await Contract.deploy();
    return { contract, owner, user1 };
  }

  it("Should do something", async function () {
    const { contract, owner } = await loadFixture(deployFixture);
    
    // Llamar función del contrato
    await contract.someFunction(arg1, arg2);
    
    // Verificar resultado
    const result = await contract.getSomething();
    expect(result).to.equal(expectedValue);
  });
});
```

#### Matchers de Chai:
```javascript
// Igualdad
expect(value).to.equal(5);
expect(value).to.deep.equal({ a: 1 });

// Booleanos
expect(value).to.be.true;
expect(value).to.be.false;

// Números
expect(value).to.be.above(10);
expect(value).to.be.below(100);

// Arrays
expect(array).to.include(item);
expect(array).to.have.length(3);

// Eventos
await expect(tx)
  .to.emit(contract, 'EventName')
  .withArgs(arg1, arg2, arg3);

// Reverts (errores)
await expect(
  contract.failingFunction()
).to.be.revertedWith('Error message');

await expect(
  contract.failingFunction()
).to.be.reverted; // Sin mensaje específico
```

---

## 🔄 ¿Cómo afectan los cambios de código?

### **Escenarios Comunes:**

#### 1. **Cambias firma de función** ❌
**Antes:**
```typescript
function getDocument(id: string): Document
```

**Después:**
```typescript
function getDocument(id: string, userId: string): Document
```

**Tests fallan:**
```
❌ Expected 2 arguments, but got 1
```

**Solución:**
Actualizar tests para pasar `userId`:
```typescript
it('should get document', () => {
  const doc = getDocument('id-123', 'user-456'); // ✅ Correcto
});
```

---

#### 2. **Cambias validación** ⚠️
**Antes:**
```typescript
if (size > 100MB) throw new Error('Too large');
```

**Después:**
```typescript
if (size > 50MB) throw new Error('Too large');
```

**Tests fallan:**
```
❌ Expected error at 101MB, but got error at 51MB
```

**Solución:**
Actualizar tests con nuevo límite:
```typescript
it('should reject files > 50MB', () => {
  expect(() => {
    validateSize(51 * 1024 * 1024);
  }).toThrow('Too large');
});
```

---

#### 3. **Agregás nueva feature** ✅
**Código nuevo:**
```typescript
function archiveDocument(id: string): void {
  // Nueva funcionalidad
}
```

**Tests antiguos:** ✅ Siguen pasando (no rompiste nada)

**Tests nuevos:** ⚠️ Debes agregar:
```typescript
it('should archive document', () => {
  archiveDocument('doc-123');
  const doc = getDocument('doc-123');
  expect(doc.isArchived).toBe(true);
});
```

---

#### 4. **Refactorizas implementación (misma API)** ✅
**Antes:**
```typescript
function encrypt(file) {
  // Implementación compleja
  return crypto.encrypt(file);
}
```

**Después:**
```typescript
function encrypt(file) {
  // Implementación más simple
  return newCrypto.encrypt(file);
}
```

**Tests:** ✅ **NO cambian** (misma entrada/salida)

**Beneficio:** Tests garantizan que refactor no rompió nada.

---

#### 5. **Cambias contrato Solidity** ❌
**Antes:**
```solidity
function createDocument(bytes32 id, string cid) external
```

**Después:**
```solidity
function createDocument(bytes32 id, string cid, uint256 version) external
```

**Tests fallan:**
```
❌ Transaction reverted: function signature not found
```

**Solución:**
Actualizar llamadas en tests:
```javascript
await contract.createDocument(id, cid, 1); // ✅ Pasar versión
```

---

### **Reglas de Oro:**

✅ **Cambias código → Ejecuta tests inmediatamente**
- Si pasan: Tu cambio es seguro
- Si fallan: O rompiste algo O los tests necesitan actualización

✅ **Feature nueva → Agregar tests ANTES o DESPUÉS**
- TDD (Test-Driven Development): Escribe test → Implementa → Test pasa
- Tradicional: Implementa → Escribe test → Verifica

✅ **Tests como documentación**
- Si no entiendes una función, lee su test
- Si cambias API, actualiza tests

---

## 📊 Estado Actual

### **Backend: 105/105 (100%)** ✅

| Suite | Tests | Archivo |
|-------|-------|---------|
| Blockchain Queries | 45 | `test/unit/blockchainQueries.test.ts` |
| Permissions | 38 | `test/unit/documentPermissionService.test.ts` |
| Encryption | 14 | `src/lib/__tests__/encryption.test.ts` |
| Integration | 8 | `src/__tests__/integration.test.ts` |

**Cobertura:**
- ✅ Cifrado AES-256-GCM completo
- ✅ Queries blockchain (lectura)
- ✅ Permisos granulares
- ✅ Flujos end-to-end

**Pendiente (por desarrollar):**
- ⏳ DocumentService (prepare/confirm) - requiere DB real
- ⏳ IPFS tests - requiere nodo IPFS local

---

### **Smart Contracts: 102/102 (100%)** ✅

| Categoría | Tests |
|-----------|-------|
| Deployment | 3 |
| Document Creation | 10 |
| Version Management | 16 |
| Document Signing | 8 |
| Permissions & Sharing | 25 |
| Ownership Transfer | 5 |
| Archive & Delete | 8 |
| Pause/Unpause | 6 |
| Role Management | 5 |
| View Functions | 7 |
| Security & Edge Cases | 10 |

**Cobertura:**
- ✅ 100% funcionalidad del contrato
- ✅ Casos edge (max versions, usuarios)
- ✅ Seguridad (reentrancy, pausa)
- ✅ Roles (ADMIN, OPERATOR)

---

### **Total: 207 Tests** 🎉

```
Backend:          105 ✅
Solidity:         102 ✅
─────────────────────
TOTAL:            207
```

**Tiempo ejecución:**
- Backend: ~15 segundos
- Solidity: ~2 segundos
- **Total: ~17 segundos**

---

## 🛠️ Extensiones Recomendadas

### **VS Code:**

#### 1. **Markdown All in One** ⭐⭐⭐⭐⭐
- **ID:** `yzhang.markdown-all-in-one`
- **Features:**
  - Preview en vivo (Ctrl+Shift+V)
  - Tabla de contenidos automática
  - Shortcuts de formato
  - Export a HTML/PDF

#### 2. **Markdown Preview Enhanced** ⭐⭐⭐⭐⭐
- **ID:** `shd101wyy.markdown-preview-enhanced`
- **Features:**
  - Preview HERMOSO con GitHub style
  - Diagramas Mermaid
  - Math (LaTeX)
  - Export profesional

**Instalar:**
```bash
# En terminal de VS Code
code --install-extension yzhang.markdown-all-in-one
code --install-extension shd101wyy.markdown-preview-enhanced
```

**O desde VS Code:**
1. `Ctrl+Shift+X` (Extensions)
2. Buscar "Markdown All in One"
3. Instalar

**Abrir preview:**
- `Ctrl+Shift+V` (preview al lado)
- `Ctrl+K V` (preview separado)

#### 3. **Jest** ⭐⭐⭐⭐
- **ID:** `Orta.vscode-jest`
- **Features:**
  - Ejecuta tests automáticamente
  - Muestra ✅/❌ en el código
  - Debug tests con breakpoints

#### 4. **Solidity** ⭐⭐⭐⭐⭐
- **ID:** `JuanBlanco.solidity`
- **Features:**
  - Syntax highlighting
  - Compilación automática
  - Integración con Hardhat

---

### **Apps Externas (Bonus):**

#### 1. **Typora** (Markdown Editor)
- **URL:** https://typora.io/
- **Features:**
  - WYSIWYG (lo que ves es lo que obtienes)
  - Preview en tiempo real
  - Temas hermosos
  - Export a PDF/Word

#### 2. **MarkText** (Open Source)
- **URL:** https://marktext.app/
- **Features:**
  - Gratis y open source
  - Similar a Typora
  - Sin distracciones

#### 3. **Obsidian** (Knowledge Base)
- **URL:** https://obsidian.md/
- **Features:**
  - Gratis
  - Perfecta para documentación técnica
  - Links entre documentos
  - Gráficos de conocimiento

---

## 📖 Cómo Leer Esta Guía

### **En VS Code (recomendado):**
1. Abre este archivo (`GUIA_TESTING.md`)
2. Presiona `Ctrl+Shift+V` (preview)
3. ¡Disfruta formato hermoso!

### **En GitHub:**
- Automáticamente renderizado

### **En Typora/MarkText:**
- Doble click en archivo
- Vista WYSIWYG

---

## 🎓 Aprender Más

### **Jest (Backend):**
- **Docs oficiales:** https://jestjs.io/docs/getting-started
- **Tutorial:** https://jestjs.io/docs/tutorial-react

### **Mocha + Chai (Solidity):**
- **Mocha:** https://mochajs.org/
- **Chai:** https://www.chaijs.com/
- **Hardhat Testing:** https://hardhat.org/tutorial/testing-contracts

### **Testing Best Practices:**
- **Arrange-Act-Assert (AAA):** https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/
- **Test Pyramid:** https://martinfowler.com/articles/practical-test-pyramid.html

---

## 🚨 Troubleshooting

### **Tests no ejecutan:**
```bash
# Backend
cd backend
npm install  # Reinstalar dependencias
npm test

# Solidity
cd smart-contracts
npm install
npx hardhat clean
npx hardhat compile
npm test
```

### **Tests lentos:**
```bash
# Ejecutar en paralelo
npm test -- --maxWorkers=4

# Solo tests rápidos
npm test -- --testPathPattern=unit
```

### **Watch mode no detecta cambios:**
```bash
# Limpiar cache
npm test -- --clearCache
npm test -- --watch
```

---

## ✅ Checklist al Cambiar Código

- [ ] ¿Cambié firma de función?
  - → Actualizar tests que la llaman
- [ ] ¿Cambié validación/error?
  - → Actualizar tests de errores
- [ ] ¿Agregué feature nueva?
  - → Escribir tests nuevos
- [ ] ¿Refactoricé (misma API)?
  - → Tests no cambian (verificar que pasen)
- [ ] Ejecutar todos tests:
  ```bash
  cd backend && npm test
  cd ../smart-contracts && npm test
  ```
- [ ] ✅ Todos pasan → Commit seguro
- [ ] ❌ Algunos fallan → Revisar cambios

---

## 📞 Contacto

**¿Dudas sobre tests?**
- Lee tests existentes como ejemplos
- Ejecuta `npm test -- --watch` y experimenta
- Consulta docs oficiales (links arriba)

**Recuerda:** Los tests son tu RED DE SEGURIDAD. ¡Úsalos! 🛡️

---

**Última actualización:** 19 de Marzo, 2026
**Tests totales:** 207 (105 backend + 102 Solidity)
**Estado:** ✅ 100% Passing
