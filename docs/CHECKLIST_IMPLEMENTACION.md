# ✅ CHECKLIST DE IMPLEMENTACIÓN - TFG DocumentChain

> **Objetivo**: Guía paso a paso para implementar todas las correcciones y mejoras identificadas.

---

## 🎯 PROGRESO GENERAL

```
[██████░░░░░░░░░░] 30% - Análisis y planificación completada
```

**Total de tareas**: 16  
**Completadas**: 2  
**En progreso**: 0  
**Pendientes**: 14

---

## 📋 FASE 1: CORRECCIONES CRÍTICAS (DÍA 1)

### ✅ [COMPLETADO] Análisis de arquitectura
- [x] Identificar datos duplicados
- [x] Crear tabla de decisión Blockchain vs BD
- [x] Documentar en `PLAN_CORRECCION_ARQUITECTURA.md`

### ⏳ [PENDIENTE] 1. Fix req.user Inconsistency
**Tiempo estimado**: 15 minutos  
**Prioridad**: 🔴 CRÍTICA

- [ ] **Paso 1**: Abrir `backend/src/config/jwt.ts`
  - [ ] Eliminar línea `id: string;` del interface JWTPayload
  - [ ] Actualizar función `generateToken()` para no incluir `id`
  
- [ ] **Paso 2**: Abrir `backend/src/middleware/errorHandler.ts`
  - [ ] Cambiar línea 16: `userId: (req as any).user?.id`
  - [ ] Por: `userId: req.user?.userId`
  
- [ ] **Paso 3**: Buscar en todo el proyecto usos de `req.user.id`
  ```bash
  grep -r "req\.user\.id" backend/src/
  ```
  - [ ] Reemplazar todos por `req.user.userId`

- [ ] **Paso 4**: Compilar y verificar
  ```bash
  cd backend
  npm run build
  ```

**Archivos modificados**: 2-3 archivos  
**Riesgo**: Bajo

---

### ⏳ [PENDIENTE] 2. Fix BigInt Serialization
**Tiempo estimado**: 30 minutos  
**Prioridad**: 🔴 CRÍTICA

- [ ] **Paso 1**: Crear `backend/src/config/prismaExtension.ts`
  ```typescript
  import { PrismaClient } from '@prisma/client';
  
  export const prisma = new PrismaClient().$extends({
    result: {
      document: {
        size: {
          needs: { size: true },
          compute(doc) { return doc.size.toString(); }
        }
      }
    }
  });
  ```

- [ ] **Paso 2**: Reemplazar imports de prisma
  - [ ] Buscar: `import prisma from '../config/database'`
  - [ ] Por: `import { prisma } from '../config/prismaExtension'`
  - [ ] En todos los servicios

- [ ] **Paso 3**: Actualizar `frontend/src/types/index.ts`
  - [ ] Cambiar `size: number` por `size: string`
  
- [ ] **Paso 4**: Actualizar componentes frontend que usen `size`
  - [ ] Buscar componentes que hagan cálculos con `doc.size`
  - [ ] Parsear: `parseInt(doc.size)` o `formatBytes(doc.size)`

- [ ] **Paso 5**: Test
  ```bash
  # Backend
  curl http://localhost:3000/api/documents | jq '.documents[0].size'
  # Debe retornar string: "1048576" no número
  ```

**Archivos modificados**: ~10 archivos  
**Riesgo**: Medio (afecta frontend y backend)

---

### ⏳ [PENDIENTE] 3. Rate Limiting
**Tiempo estimado**: 1 hora  
**Prioridad**: 🔴 CRÍTICA

- [ ] **Paso 1**: Instalar dependencia
  ```bash
  cd backend
  npm install express-rate-limit
  npm install -D @types/express-rate-limit
  ```

- [ ] **Paso 2**: Crear `backend/src/middleware/rateLimiter.ts`
  - [ ] Copiar código del plan (3 limiters)
  
- [ ] **Paso 3**: Actualizar `backend/src/index.ts`
  - [ ] Importar limiters
  - [ ] Aplicar a rutas correspondientes
  
- [ ] **Paso 4**: Test con curl
  ```bash
  # Debe bloquear después de 5 intentos
  for i in {1..10}; do
    curl -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"test","password":"wrong"}'
  done
  ```

- [ ] **Paso 5**: Verificar headers de respuesta
  - [ ] `X-RateLimit-Limit`
  - [ ] `X-RateLimit-Remaining`
  - [ ] `Retry-After` (cuando se alcanza el límite)

**Archivos modificados**: 2 archivos  
**Riesgo**: Bajo

---

### ⏳ [PENDIENTE] 4. CORS Seguro
**Tiempo estimado**: 15 minutos  
**Prioridad**: 🔴 CRÍTICA

- [ ] **Paso 1**: Añadir a `.env`
  ```env
  ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173
  ```

- [ ] **Paso 2**: Actualizar `backend/src/index.ts`
  - [ ] Reemplazar `app.use(cors())`
  - [ ] Por configuración con whitelist (del plan)

- [ ] **Paso 3**: Test desde navegador
  ```javascript
  // En consola del navegador (dominio diferente)
  fetch('http://localhost:3000/api/health')
    .then(r => r.json())
    .then(console.log)
  // Debe dar error CORS desde origen no permitido
  ```

**Archivos modificados**: 2 archivos (`.env.example`, `index.ts`)  
**Riesgo**: Bajo

---

### ⏳ [PENDIENTE] 5. Validación con Zod
**Tiempo estimado**: 3 horas  
**Prioridad**: 🔴 CRÍTICA

- [ ] **Paso 1**: Instalar Zod
  ```bash
  cd backend
  npm install zod
  ```

- [ ] **Paso 2**: Crear schemas por módulo
  - [ ] `backend/src/schemas/auth.schema.ts`
  - [ ] `backend/src/schemas/document.schema.ts`
  - [ ] `backend/src/schemas/user.schema.ts`
  - [ ] `backend/src/schemas/share.schema.ts`

- [ ] **Paso 3**: Actualizar `middleware/validator.ts`
  - [ ] Implementar `validateBody(schema)`
  - [ ] Implementar `validateParams(schema)`
  - [ ] Implementar `validateQuery(schema)`

- [ ] **Paso 4**: Aplicar a rutas (1 por 1)
  - [ ] `/api/auth/login` → loginSchema
  - [ ] `/api/auth/register` → registerSchema
  - [ ] `/api/documents` (POST) → createDocumentSchema
  - [ ] `/api/documents/:id` → documentIdSchema
  - [ ] etc...

- [ ] **Paso 5**: Test con payloads inválidos
  ```bash
  # Email inválido
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"invalido","password":"123"}'
  # Debe retornar error 400 con detalles Zod
  ```

**Archivos modificados**: ~15 archivos  
**Riesgo**: Medio (puede romper tests existentes)

---

## 📋 FASE 2: REDISEÑO DE BASE DE DATOS (DÍA 1-2)

### ⏳ [PENDIENTE] 6. Migration: Añadir estados transitorios
**Tiempo estimado**: 1 hora  
**Prioridad**: 🟡 ALTA

- [ ] **Paso 1**: Backup de BD
  ```bash
  pg_dump -U postgres -d documentchain > backup_$(date +%Y%m%d).sql
  ```

- [ ] **Paso 2**: Ejecutar Fase 1 de migration SQL
  - [ ] Abrir `backend/prisma/migrations/eliminacion_duplicacion.sql`
  - [ ] Ejecutar SOLO FASE 1 (añadir campos)
  
- [ ] **Paso 3**: Actualizar `schema.prisma`
  ```prisma
  enum DocumentStatus {
    PENDING
    CONFIRMED
    FAILED
    SYNCING
  }
  
  model Document {
    // ... campos existentes
    status        DocumentStatus @default(PENDING)
    syncedAt      DateTime?
    failureCount  Int           @default(0)
    lastError     String?
  }
  ```

- [ ] **Paso 4**: Generar Prisma Client
  ```bash
  cd backend
  npx prisma generate
  ```

- [ ] **Paso 5**: Verificar en BD
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'Document';
  ```

**Archivos modificados**: 2 archivos  
**Riesgo**: Medio (requiere downtime)

---

### ⏳ [PENDIENTE] 7. Migration: Eliminar duplicados
**Tiempo estimado**: 2 horas  
**Prioridad**: 🟡 ALTA

- [ ] **Paso 1**: Verificar que blockchain tiene todos los datos
  - [ ] Consultar `DocumentRegistry.documents(docId)` para docs existentes
  - [ ] Verificar que todos retornan datos

- [ ] **Paso 2**: Ejecutar Fases 2-4 de migration SQL
  - [ ] Fase 2: Migrar datos
  - [ ] Fase 3: Cambiar tipo de size
  - [ ] Fase 4: Eliminar campos duplicados

- [ ] **Paso 3**: Actualizar `schema.prisma`
  - [ ] Eliminar campos: ipfsCid, isArchived, etc.
  - [ ] Cambiar `size BigInt` → `size String`

- [ ] **Paso 4**: Regenerar Prisma Client
  ```bash
  npx prisma generate
  ```

- [ ] **Paso 5**: Actualizar servicios
  - [ ] `documentService.ts`: obtener ipfsCid desde blockchain
  - [ ] `versionService.ts`: obtener isOperational desde blockchain
  - [ ] etc...

**Archivos modificados**: ~10 archivos  
**Riesgo**: Alto (breaking changes)

---

### ⏳ [PENDIENTE] 8. Worker de Retry Blockchain
**Tiempo estimado**: 3 horas  
**Prioridad**: 🟡 ALTA

- [ ] **Paso 1**: Instalar node-cron
  ```bash
  npm install node-cron
  npm install -D @types/node-cron
  ```

- [ ] **Paso 2**: Crear `backend/src/workers/blockchainSync.ts`
  - [ ] Implementar cron job (cada 5 min)
  - [ ] Buscar documentos con status FAILED
  - [ ] Reintentar creación en blockchain
  - [ ] Actualizar status según resultado

- [ ] **Paso 3**: Registrar worker en `index.ts`
  ```typescript
  import './workers/blockchainSync';
  ```

- [ ] **Paso 4**: Test manual
  - [ ] Crear documento y simular fallo blockchain (desconectar)
  - [ ] Verificar que queda en status PENDING/FAILED
  - [ ] Reconectar blockchain
  - [ ] Esperar 5 min y verificar que pasa a CONFIRMED

**Archivos modificados**: 2 archivos  
**Riesgo**: Bajo

---

## 📋 FASE 3: ROBUSTEZ (DÍA 2)

### ⏳ [PENDIENTE] 9. Saga Pattern para Transacciones
**Tiempo estimado**: 3 horas  
**Prioridad**: 🟡 ALTA

- [ ] **Paso 1**: Refactorizar `documentService.createDocument()`
  - [ ] Crear documento con status PENDING
  - [ ] Upload IPFS
  - [ ] Blockchain tx
  - [ ] Actualizar a CONFIRMED
  - [ ] En caso de error, marcar FAILED (NO eliminar)

- [ ] **Paso 2**: Implementar compensación para IPFS
  - [ ] Si blockchain falla, NO eliminar de IPFS
  - [ ] Guardar referencia para cleanup posterior

- [ ] **Paso 3**: Crear servicio de cleanup
  - [ ] Buscar documentos FAILED con failureCount > 3
  - [ ] Eliminar archivos IPFS huérfanos
  - [ ] Marcar como "archived" o eliminar de BD

- [ ] **Paso 4**: Test de fallos
  - [ ] Simular fallo en cada paso
  - [ ] Verificar que no quedan inconsistencias

**Archivos modificados**: 3-4 archivos  
**Riesgo**: Medio

---

### ⏳ [PENDIENTE] 10. Ajustar nodo IPFS self-hosted
**Tiempo estimado**: 2 horas  
**Prioridad**: 🟡 ALTA

- [ ] **Paso 1**: Fijar la persistencia fuera del checkout
  - [ ] Crear `IPFS_DATA_ROOT` en el servidor
  - [ ] Verificar permisos de escritura para Docker

- [ ] **Paso 2**: Levantar el nodo self-hosted con el perfil principal
  ```bash
  docker compose --profile ipfs up -d ipfs-node
  ```

- [ ] **Paso 3**: Verificar API y gateway
  - [ ] Comprobar `http://localhost:5001/api/v0/version`
  - [ ] Comprobar `http://localhost:8080/ipfs/...`

- [ ] **Paso 4**: Test funcional
  - [ ] Subir archivo via backend
  - [ ] Verificar pin local y descarga posterior
  ```bash
  curl http://localhost:9095/pins/QmXXX
  ```

**Archivos modificados**: 2 archivos  
**Riesgo**: Medio (requiere restart de servicios)

---

## 📋 FASE 4: CALIDAD (DÍA 3)

### ⏳ [PENDIENTE] 11. Refactorizar Código Duplicado
**Tiempo estimado**: 1 hora  
**Prioridad**: 🟢 MEDIA

- [ ] **Paso 1**: Crear `middleware/pagination.ts`
  - [ ] Implementar paginationMiddleware
  - [ ] Extender Express.Request

- [ ] **Paso 2**: Aplicar a rutas
  - [ ] `GET /api/documents`
  - [ ] `GET /api/users`
  - [ ] `GET /api/shares`
  - [ ] etc...

- [ ] **Paso 3**: Eliminar parsing duplicado de controllers
  - [ ] Usar `req.pagination.page, .limit, .skip`

**Archivos modificados**: ~8 archivos  
**Riesgo**: Bajo

---

### ⏳ [PENDIENTE] 12. Logging Estructurado
**Tiempo estimado**: 1 hora  
**Prioridad**: 🟢 MEDIA

- [ ] **Paso 1**: Actualizar logger config
  - [ ] Forzar formato JSON en `winston.format.json()`

- [ ] **Paso 2**: Buscar y reemplazar logs
  ```bash
  # Buscar logs con template strings
  grep -r "logger\.\(info\|warn\|error\)(\`" backend/src/
  ```
  - [ ] Convertir a objetos estructurados

- [ ] **Paso 3**: Añadir contexto común
  - [ ] userId en todos los logs de requests
  - [ ] documentId en operaciones de docs
  - [ ] transactionHash en operaciones blockchain

**Archivos modificados**: ~15 archivos  
**Riesgo**: Bajo

---

### ⏳ [PENDIENTE] 13. Error Boundaries Frontend
**Tiempo estimado**: 1 hora  
**Prioridad**: 🟢 MEDIA

- [ ] **Paso 1**: Crear `frontend/src/components/ErrorBoundary.tsx`
  - [ ] Copiar código del plan

- [ ] **Paso 2**: Envolver App en `main.tsx`
  ```tsx
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
  ```

- [ ] **Paso 3**: Test de error
  - [ ] Crear componente que lance error
  - [ ] Verificar que ErrorBoundary lo captura
  - [ ] Verificar que muestra fallback UI

**Archivos modificados**: 2 archivos  
**Riesgo**: Bajo

---

### ⏳ [PENDIENTE] 14. Secrets Management
**Tiempo estimado**: 1 hora  
**Prioridad**: 🟢 MEDIA

- [ ] **Paso 1**: Instalar envalid
  ```bash
  cd backend
  npm install envalid
  ```

- [ ] **Paso 2**: Crear `backend/src/config/env.ts`
  - [ ] Definir schema de validación

- [ ] **Paso 3**: Reemplazar `process.env.*` por `env.*`
  - [ ] En todos los archivos de config

- [ ] **Paso 4**: Test de validación
  - [ ] Eliminar una env var requerida
  - [ ] Verificar que app no inicia con error claro

**Archivos modificados**: ~8 archivos  
**Riesgo**: Bajo

---

### ⏳ [PENDIENTE] 15. Tests de Integración
**Tiempo estimado**: 4 horas  
**Prioridad**: 🟢 MEDIA

- [ ] **Paso 1**: Setup Jest
  ```bash
  npm install -D jest @types/jest ts-jest supertest @types/supertest
  ```

- [ ] **Paso 2**: Configurar jest.config.js

- [ ] **Paso 3**: Crear tests críticos
  - [ ] `auth.test.ts`: login, register, logout
  - [ ] `documents.test.ts`: create, list, download
  - [ ] `sharing.test.ts`: share, revoke
  - [ ] `permissions.test.ts`: access control

- [ ] **Paso 4**: Ejecutar suite
  ```bash
  npm test
  ```

- [ ] **Paso 5**: Añadir a CI (opcional)

**Archivos creados**: ~5 archivos de test  
**Riesgo**: Bajo (no afecta producción)

---

### ⏳ [PENDIENTE] 16. Actualizar Documentación
**Tiempo estimado**: 2 horas  
**Prioridad**: 🟢 MEDIA

- [ ] **Paso 1**: Crear ADRs
  - [ ] `docs/ADR-001-separacion-blockchain-bd.md`
  - [ ] `docs/ADR-002-estados-transitorios.md`

- [ ] **Paso 2**: Actualizar README.md
  - [ ] Setup actualizado
  - [ ] Nuevas variables de entorno
  - [ ] Comandos de migración

- [ ] **Paso 3**: Actualizar API.md
  - [ ] Schemas Zod documentados
  - [ ] Nuevos campos (status, etc)

- [ ] **Paso 4**: Actualizar `.env.example`
  - [ ] Todas las nuevas variables

**Archivos modificados**: 4 archivos  
**Riesgo**: Ninguno

---

## 🎯 VERIFICACIÓN FINAL

### Pre-Presentación Checklist

- [ ] **Compilación**
  ```bash
  cd backend && npm run build  # Sin errores
  cd frontend && npm run build # Sin errores
  ```

- [ ] **Tests**
  ```bash
  cd backend && npm test       # 100% pasando
  cd smart-contracts && npm test # 100% pasando
  ```

- [ ] **Linting**
  ```bash
  cd backend && npm run lint   # 0 errores
  cd frontend && npm run lint  # 0 errores
  ```

- [ ] **Tipos**
  ```bash
  cd backend && npx tsc --noEmit  # 0 errores
  cd frontend && npx tsc --noEmit # 0 errores
  ```

- [ ] **Base de Datos**
  - [ ] 0 campos duplicados con blockchain
  - [ ] Todos los documentos tienen blockchainId
  - [ ] Estados (PENDING/CONFIRMED/FAILED) funcionan

- [ ] **Blockchain**
  - [ ] Contratos deployados en Hardhat Network
  - [ ] Events se emiten correctamente
  - [ ] Permisos de AccessControl funcionan

- [ ] **IPFS**
  - [ ] Nodo IPFS propio activo
  - [ ] Persistencia del volumen verificada
  - [ ] API IPFS responde

- [ ] **Seguridad**
  - [ ] Rate limiting activo
  - [ ] CORS configurado
  - [ ] Inputs validados con Zod
  - [ ] Secrets no expuestos en código

- [ ] **Documentación**
  - [ ] README actualizado
  - [ ] API.md con schemas
  - [ ] ADRs escritos
  - [ ] .env.example completo

---

## 📊 TIEMPO TOTAL ESTIMADO

| Fase | Tareas | Horas |
|------|--------|-------|
| Fase 1 (Críticas) | 1-5 | 5.25h |
| Fase 2 (BD) | 6-8 | 6h |
| Fase 3 (Robustez) | 9-10 | 5h |
| Fase 4 (Calidad) | 11-16 | 10h |
| **TOTAL** | **16 tareas** | **~26 horas** |

**Distribución recomendada**: 3-4 días de trabajo (6-8h/día)

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Backup BD
pg_dump -U postgres -d documentchain > backup.sql

# Ejecutar migration
psql -U postgres -d documentchain -f backend/prisma/migrations/eliminacion_duplicacion.sql

# Regenerar Prisma
cd backend && npx prisma generate

# Instalar todas las dependencias nuevas
cd backend && npm install express-rate-limit zod envalid node-cron
cd backend && npm install -D @types/express-rate-limit @types/node-cron jest @types/jest ts-jest supertest @types/supertest

# Compilar y verificar
cd backend && npm run build
cd frontend && npm run build

# Ejecutar tests
cd backend && npm test
cd smart-contracts && npm test

# Iniciar servicios
docker compose --profile ipfs up -d ipfs-node
cd backend && npm run dev
cd frontend && npm run dev
```

---

**¿Listo para empezar?** Puedo ayudarte a implementar cualquier tarea paso a paso. ¿Por cuál quieres comenzar?
