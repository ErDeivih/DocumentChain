# Cambios 22/05/2026

## Objetivo
Validacion tecnica completa final, correccion minima de roturas reales, limpieza conservadora de codigo no usado/deprecado y evidencia verificable. No se modifica `CHANGELOG`.

## Validacion Ejecutada
| Bloque | Comando | Resultado |
|---|---|---|
| Backend build | `npm run build` en `backend` | OK (`tsc`) |
| Backend unit tests | `npm run test:unit` en `backend` | OK, 20 suites, 242 tests |
| Backend lint | `npm run lint` en `backend` | OK, 0 errores, 0 warnings tras limpieza |
| Smart contracts | `npm test` en `smart-contracts` | OK, 102 tests |
| Frontend build | `npm run build` en `frontend` | OK; warnings no bloqueantes de Rollup por chunks grandes y anotaciones `#__PURE__` de dependencias |
| Frontend unit tests | `npm test` en `frontend` | OK, 7 suites, 74 tests |
| Frontend lint | `npm run lint` en `frontend` | OK, 0 errores |
| Playwright chromium | `npm run test:e2e:chromium` en `frontend` | OK, 81 tests |

## Incidencias y Resolucion
| Incidencia | Resolucion |
|---|---|
| `smoke.spec.ts` intentaba seleccionar una wallet detras del overlay del modal. | Se usa `selectFirstSavedWallet(...)`, helper existente para el modal. |
| `wallet-management.spec.ts` contenia selectores `[data-testid="wallet-row"]` sin comillas. | Selectores corregidos. |
| El test de gestion de wallets no contemplaba la firma obligatoria de challenge. | Alta E2E de wallets verificadas mediante API y firma Hardhat; la UI sigue cubriendo renombrar, priorizar y eliminar. |
| `annex-screenshots.spec.ts` dependia de clases CSS fragiles para capturar modales. | Se usa `data-testid="modal-content"`. |
| Capturas de anexos podian fallar si un PNG existente estaba bloqueado. | `capture(...)` reintenta escribiendo un `.new.png`. |
| Backend lint tenia 30 warnings de simbolos no usados. | Eliminados imports/variables no usados y renombrados parametros intencionadamente no usados con prefijo `_`. |

## Limpieza Conservadora
| Area | Accion |
|---|---|
| Backend codigo | Eliminados imports/variables no usados en controladores, servicios, rutas, middleware y utilidades. |
| Backend tipos Express | Se conserva la ampliacion global de `Express.Request`; se desactiva localmente `no-unused-vars` en el `.d.ts` porque el namespace es declarativo. |
| Dependencias backend | No se eliminaron mas paquetes: `axios` y `form-data` se usan en `scripts/full-system-smoke-test.js`; `bcrypt` se usa para migracion heredada a Argon2id. |
| Dependencias frontend | No se eliminaron mas paquetes: `qrcode` se usa en `PublicLinkActions.tsx`; no quedan imports de `zustand`, `argon2`, `speakeasy` ni `@walletconnect/modal` en frontend. |

## Busqueda Final de Terminos
| Alcance | Patron | Resultado |
|---|---|---|
| Anexos activos `*_NUEVO.tex` | `ECDH|Express 5|39 casos|50 MB|wallet auth` | Sin coincidencias |
| `docs/` | `ECDH|Express 5|39 casos|50 MB|wallet auth` | Sin coincidencias |
| `backend/docs/` | `ECDH|Express 5|39 casos|50 MB|wallet auth` | Sin coincidencias |
| `frontend/docs/` | `ECDH|Express 5|39 casos|50 MB|wallet auth` | Sin coincidencias |
| Anexo V activo | `Slither|Echidna|Mythril|OWASP ZAP` | Solo aparecen como herramientas recomendadas/futuras o auditoria pendiente |

## Terminologia Final Verificada
- `RSA-OAEP 4096`.
- `AES-256-GCM`.
- `Express 4.21`.
- `43 casos de uso`.
- Autenticacion por email/contraseña + JWT; wallet limitada a challenge de vinculacion y firma de operaciones/documentos.

## Archivos Modificados Relevantes
| Archivo | Motivo |
|---|---|
| `backend/src/config/database.ts` | Eliminar import no usado. |
| `backend/src/controllers/healthController.ts` | Eliminar variable no usada. |
| `backend/src/controllers/shareController.ts` | Eliminar import no usado. |
| `backend/src/controllers/versionController.ts` | Eliminar variable no usada. |
| `backend/src/index.ts` | Eliminar import no usado. |
| `backend/src/lib/encryption.ts` | Eliminar constante no usada. |
| `backend/src/middleware/errorHandler.ts` | Marcar parametros no usados como intencionados. |
| `backend/src/routes/documents.ts` | Eliminar schemas importados no usados. |
| `backend/src/services/__tests__/DocumentService.test.ts` | Eliminar imports no usados. |
| `backend/src/services/documentService.ts` | Eliminar imports no usados. |
| `backend/src/services/emailService.ts` | Marcar parametros no usados como intencionados. |
| `backend/src/services/eventHandlers.ts` | Eliminar imports no usados y marcar parametro no usado. |
| `backend/src/services/eventListenerService.ts` | Eliminar import/variables no usadas. |
| `backend/src/services/signatureService.ts` | Eliminar import no usado. |
| `backend/src/services/verificationService.ts` | Eliminar import no usado. |
| `backend/src/services/walletDocumentService.ts` | Eliminar import no usado. |
| `backend/src/types/express.d.ts` | Mantener namespace declarativo sin warning lint. |
| `backend/src/utils/accessControl.ts` | Eliminar import no usado. |
| `frontend/e2e/smoke.spec.ts` | Selector robusto de wallet. |
| `frontend/e2e/helpers.ts` | Helper `signHardhatMessage(...)`. |
| `frontend/e2e/wallet-management.spec.ts` | Ajuste a challenge obligatorio y selectores validos. |
| `frontend/e2e/annex-screenshots.spec.ts` | Capturas de modales mas robustas. |
| `frontend/e2e/negative-paths.spec.ts` | Selector flexible de eliminacion de cuenta. |
| `anexos/AnexoV_PlanSeguridad_NUEVO.tex` | Claims de seguridad alineados a evidencia real y recomendaciones futuras. |

## Estado Final
- Validacion tecnica completa final en verde.
- Lint backend/frontend sin errores; backend tambien sin warnings tras limpieza.
- Playwright chromium completo en verde.
- No se toco `CHANGELOG`.

## 10. Corrección de diagramas BCE — estricto Boundary-Control-Entity

### Criterio aplicado (22 Mayo 2026)
- **Boundary**: pantallas/modales/formularios de la interfaz de usuario
- **Control**: orquestación de la lógica del caso de uso
- **Entity**: objetos del dominio (Usuario, Documento, Versión, Firma, PermisoAcceso, Evento, Sesión, Wallet, Carpeta, Notificación)
- **Prohibido**: Base de datos, PostgreSQL, Blockchain, IPFS, Repository, DAO, Prisma
- La persistencia y verificación de integridad se expresan como comportamiento implícito de las entidades

### Diagramas revisados: 43 de 43
Se revisó el conjunto completo de secuencias BCE de los 43 casos de uso. Se eliminaron fugas de infraestructura donde aparecían, se sustituyeron actores genéricos por actores canónicos y se corrigieron duplicidades semánticas de entidades. Todos los PNG afectados se regeneraron con `plantuml.jar -tpng`.

### Texto actualizado
- `AnexoIII_AnalisisDiseno_NUEVO.tex:1067`: "39 diagramas" → "43 diagramas"
- `MemoriaPrincipal_DocumentChain_NUEVO.tex:727`: nombres de implementación sustituidos por nombres BCE + aclaración de persistencia implícita

## 11. Auditoria final de diagramas UML y trazabilidad

| Archivo | Problema | Correccion aplicada | Motivo |
|---|---|---|---|
| `anexos/diagramas/seq-bce-uc0012-recover-password.puml` | Usaba `EmailService` como entidad de análisis. | Sustituido por `Notificacion` y se reescribió el envío como aviso funcional. | Evitar fuga de infraestructura en BCE. |
| `anexos/diagramas/seq-bce-uc0004-wallet.puml` | Mensaje de creación de entidad sobredimensionado y técnico. | Se normalizó a `Registra wallet vinculada`. | Mantener lenguaje funcional en análisis. |
| `anexos/diagramas/seq-connect-wallet.puml` | Flujo de diseño sin challenge firmado. | Se añadió `POST /api/wallets/challenge`, firma `personal_sign` y alta posterior. | Alinear el diagrama con la autenticación real de wallet. |
| `anexos/diagramas/seq-upload-prepare.puml` | UC incorrecto en título y cierre poco preciso. | Se corrigió a `UC-0015` y el retorno indica confirmación para wallet. | Trazabilidad correcta con el catálogo de 43 UC. |
| `anexos/diagramas/seq-upload-confirm.puml` | `EventListener` genérico y confirmación incompleta. | Renombrado a `EventListenerService` y se añadió `blockchainId` a la confirmación. | Alinear diseño con el servicio real. |
| `anexos/diagramas/seq-upload.puml` | Firma técnica desalineada con el flujo actual. | Se cambió a solicitud de firma de transacción `createDocument`. | Evitar uso incorrecto de `eth_signTypedData_v4`. |
| `anexos/diagramas/seq-version.puml` | Mensaje de firma y salida no reflejaban el flujo real. | Se sustituye la firma por solicitud de transacción `createVersion`. | Coherencia con el contrato y el prepare/confirm. |
| `anexos/diagramas/seq-sign.puml` | La preparación de firma no mostraba el payload contextual real. | Se incorpora `getSignaturePayloadHash(...)` y `personal_sign(bytes(payloadHash))`. | Trazabilidad con la verificación on-chain. |
| `anexos/diagramas/seq-bce-uc0017-detail.puml` | Mensaje con término técnico innecesario. | Se simplificó a `Recupera documento`. | Limpieza semántica BCE. |
| `anexos/diagramas/seq-bce-uc0002-login.puml` | Mensaje con referencia técnica artificial. | Se simplificó a `Crea sesion`. | Mantener abstracción de análisis. |
| `anexos/diagramas/seq-manage-folders.puml` | Diagrama faltante para cobertura documental. | Creado como secuencia de diseño para UC-0024. | Completar trazabilidad de carpetas. |
| `anexos/diagramas/seq-move-documents.puml` | Diagrama faltante para cobertura documental. | Creado como secuencia de diseño para UC-0025. | Completar trazabilidad de movimiento de documentos. |
| `anexos/AnexoIII_AnalisisDiseno_NUEVO.tex` | Rangos de paquetes y referencias cruzadas desfasadas respecto a 43 UC. | Se corrigieron rangos BCE, captions, colaboraciones, ciclo de vida y actividad de subida. | Sincronizar análisis, diseño y documento final. |
| `anexos/AnexoIV_DocumentacionTecnica_NUEVO.tex` | Persistía `Express 5` y una referencia a `Zustand` que ya no forma parte del frontend actual. | Se corrigió a `Express 4.21` y se marcó `Zustand` como eliminado. | Alinear documentación con el estado real del repositorio. |
| `anexos/GUIA_PATRON_DIAGRAMAS_ANALISIS_DISENO_COMPANERO.md` | Faltaba una regla explícita de numeración/trazabilidad para secuencias. | Se añadió una nota mínima sobre UC-43, sufijos `a/b` y coherencia de `\label`. | Evitar futuras desalineaciones entre diagrama y texto. |
| `anexos/diagramas/seq-bce-uc0001-register.puml` | Duplicaba la entidad `Usuario` en dos lifelines. | Se consolidó en una única entidad `Usuario`. | Cumplir la regla BCE de no duplicar entidades de dominio sin justificación. |
| `anexos/diagramas/seq-recover-password.puml` | Faltaba secuencia de diseño para UC-0012. | Se creó el flujo técnico de recuperación con `AuthController`, `AuthService`, `EmailService` y base de datos. | Completar la cobertura 1:1 BCE -> diseño. |
| `anexos/AnexoIII_AnalisisDiseno_NUEVO.tex` | Varias captions de diseño seguían desplazadas (`UC-0003`, `UC-0004`, `UC-0005`, `UC-0014`, `UC-0024`, `UC-0025`). | Se reordenó/corrigió el bloque de diseño, se insertaron UC-0024/UC-0025 y se ajustaron versiones a UC-0026--0030. | Cerrar la trazabilidad exacta del catálogo de 43 UC. |
| `anexos/AnexoIII_AnalisisDiseno_NUEVO.tex` | La tabla BCE del paquete Documentos incluía `IPFSService` como clase de análisis. | Se sustituyó por entidades de dominio (`Document`, `Folder`) coherentes con el diagrama BCE. | Evitar una fuga de infraestructura en el modelo de análisis. |
| `anexos/AnexoIII_AnalisisDiseno_NUEVO.tex` | Algunas figuras de diseño heredaban una subsección anterior aunque su caption y diagrama pertenecían a otro UC (`UC-0006`, `UC-0007`, `UC-0014`, `UC-0020`, `UC-0040`). | Se añadieron las subsecciones específicas faltantes sin modificar los diagramas. | Alinear semánticamente subsección, caption e imagen en el bloque de diseño. |
| `anexos/diagramas/seq-bce-uc0031-sign.puml`, `anexos/diagramas/seq-bce-uc0041-audit.puml` | Dos BCE duplicaban semánticamente una misma entidad (`Firma` y `EventoAuditoria`). | Se consolidó cada concepto en una única lifeline y se regeneraron los PNG afectados. | Cumplir la regla BCE de no duplicar entidades de dominio sin justificación. |
| `anexos/AnexoIV_DocumentacionTecnica_NUEVO.tex` | Faltaban literales finales de alineación (`Express 4.21`, `43 casos de uso` y separación auth/wallet). | Se añadió una frase mínima en la introducción técnica. | Hacer verificable la coherencia terminológica exigida para cierre. |
| `frontend/src/pages/Settings.tsx` | Playwright detectó que alternar varias preferencias de notificación seguidas podía enviar un payload con estado React obsoleto. | Se sincronizó el estado de preferencias con una referencia mutable usada para construir cada actualización. | Evitar pérdida de cambios en toggles rápidos y cerrar el E2E de preferencias. |
| `anexos/AnexoIII_AnalisisDiseno_NUEVO.tex` | La tabla BCE de análisis usaba nombres de implementación y una referencia obsoleta a Zustand. | Se sustituyeron las clases por nombres funcionales BCE y se actualizó la descripción de estado frontend. | Mantener separación estricta entre análisis y diseño y alinear documentación con dependencias reales. |
| `anexos/MemoriaPrincipal_DocumentChain_NUEVO.tex`, `frontend/README.md` | Persistían referencias a Zustand aunque ya no forma parte del frontend actual. | Se sustituyeron por TanStack Query, contextos React y estado local de componentes. | Evitar documentación obsoleta antes de la entrega. |
| `frontend/src/pages/Settings.tsx` | La actualización optimista de preferencias no revertía la UI si fallaba la API. | Se añadió rollback seguro condicionado a que no exista una actualización posterior. | Mejorar robustez UX sin cambiar el flujo normal. |
| `frontend/src/components/ErrorBoundary.tsx` | Quedaba un `TODO` de Sentry no aplicable al alcance de entrega. | Se eliminó el comentario pendiente. | Evitar marcadores de trabajo futuro dentro del código de entrega. |
| `anexos/AnexoVIII_UsoIA_NUEVO.tex` | Persistía una referencia obsoleta a Zustand en el uso de IA. | Se actualizó a TanStack Query, contextos React y estado local. | Mantener coherencia transversal de documentación activa. |
| `frontend/src/api/documents.ts`, `frontend/src/api/versions.ts`, `frontend/src/api/users.ts` | Quedaban wrappers `@deprecated` sin consumidores internos. | Se eliminaron los métodos obsoletos y sus avisos `console.warn`. | Reducir código muerto antes de la entrega sin afectar a llamadas activas. |

## 12. Limpieza final de entrega y handoff local

| Area | Accion aplicada | Motivo |
|---|---|---|
| Entrega Git | Se creo `_local_no_entrega/` y se anadio a `.gitignore`. | Separar material de apoyo local del paquete final entregable. |
| Suites de prueba | Se movieron `frontend/e2e`, `frontend/src/test`, `backend/test`, `backend/src/__tests__`, `backend/src/services/__tests__` y `smart-contracts/test` a `_local_no_entrega/tests/`. | Conservar pruebas localmente sin incluirlas en la entrega Git. |
| Configuracion de prueba | Se movieron `playwright.config.ts`, `vitest.config.ts`, `jest.config.js` y `tsconfig.test.json` a `_local_no_entrega/tests/`. | Evitar referencias operativas a suites no entregables. |
| Evidencias y reportes | Se movieron reportes Playwright, resultados, coberturas, `dist`, caches, logs y artefactos generados a `_local_no_entrega/`. | Limpiar el arbol entregable sin borrar material util local. |
| Documentacion API generada | Se movieron `backend/docs/api`, `frontend/docs/api` y `smart-contracts/docs` a `_local_no_entrega/docs_generadas/`. | Distinguir fuente real de artefactos regenerables. |
| Dependencias/scripts | Se retiraron scripts y dependencias especificas de pruebas de `frontend`, `backend` y `smart-contracts`; se actualizaron lockfiles. | Alinear `package.json` con el alcance de entrega final. |
| Anexos activos | Se eliminaron referencias a Playwright, Jest, Vitest, Supertest, suites automatizadas y rutas de test en anexos/memoria activos. | Evitar que la documentacion final presente pruebas automatizadas como parte del contenido entregable. |

### Handoff local creado

La carpeta `_local_no_entrega/handoff/` contiene:
- `README.md`
- `INVENTARIO_FINAL.md`
- `VALIDACION_FINAL.md`
- `RIESGOS_RESIDUALES.md`
- `ARCHIVO_TESTS.md`

Esta carpeta es material local no entregable y queda ignorada por Git.

### Validacion de cierre tras limpieza

| Bloque | Comando | Resultado |
|---|---|---|
| Backend build | `npm run build` en `backend` | OK tras recompilar los artefactos del contrato necesarios para el import JSON |
| Backend lint | `npm run lint` en `backend` | OK |
| Frontend build | `npm run build` en `frontend` | OK; warnings no bloqueantes de Rollup por chunks grandes y anotaciones `#__PURE__` de dependencias |
| Frontend lint | `npm run lint` en `frontend` | OK |
| Smart contracts compile | `npm run compile` en `smart-contracts` | OK |
| PDFs activos | `./build_nuevo.ps1 -OnlyLatex` en `anexos` | OK para memoria y anexos I-IX; MiKTeX aviso de actualizaciones pendiente no bloqueante |

## 13. Preparacion de demo local con IPFS real

| Area | Accion aplicada | Motivo |
|---|---|---|
| `README.md` | Reescrito para reflejar entrega final, demo local Hardhat, validacion sin suites de prueba y carpeta `_local_no_entrega/`. | Alinear la guia principal con el alcance real de entrega y defensa. |
| `backend/scripts/generate-test-data.ts` | La seed QA limpia pins del proveedor IPFS configurado, sube payloads demo y usa CIDs reales cuando IPFS esta disponible; conserva fallback sintetico si falla el proveedor. | Hacer la demo local mas realista: BD + blockchain + IPFS. |
| `anexos/AnexoVII_ManualMontaje_NUEVO.tex` | Se ajusto a despliegue demostrativo local, Hardhat como red objetivo, `CONTRACT_DOCUMENT_REGISTRY`, `ipfs-node` y ciclo de vida de datos locales. | Evitar referencias a Sepolia/produccion como flujo final y documentar `reseed-dev.ps1`. |
| `anexos/AnexoIV_DocumentacionTecnica_NUEVO.tex` | Se aclaro que la documentacion API es regenerable, que Hardhat local es la red de demostracion y que el ABI del contrato se conserva como artefacto necesario para compilar backend. | Coherencia entre entrega Git, codigo y documentacion tecnica. |
| `backend/src/config/blockchain.ts` | Eliminado comentario JSDoc duplicado. | Limpieza menor de codigo. |
| `smart-contracts/hardhat.config.js` | Retirada la ruta de tests y exclusion docgen asociada al directorio de pruebas movido fuera de entrega. | Evitar referencias operativas a material no entregable. |

## 14. Cierre de demo local tras bloqueo Docker backend

| Area | Resultado |
|---|---|
| Causa raiz | `docker compose build backend` fallaba en el stage `contracts` porque `smart-contracts/package-lock.json` no estaba sincronizado con `smart-contracts/package.json`; `npm ci` detectaba peer dependencies ausentes del lockfile. |
| Correccion lockfile | `smart-contracts/package-lock.json` se regenero con la version de npm incluida en `node:20-alpine`, alineando el lockfile con el entorno Docker real. |
| Reproducibilidad Docker | `Dockerfile.hardhat` vuelve a usar `npm ci --no-audit --prefer-offline`; `Dockerfile.backend` mantiene `npm ci` en el stage `contracts`. |
| Backend TypeScript | `backend/tsconfig.json` deja de declarar tipos `jest`, ya retirados del alcance de entrega, para que el build Docker no dependa de tipos inexistentes. |
| Reseed local | `reseed-dev.ps1 -SeedProfile qa-fast` finaliza correctamente; despliega `DocumentRegistry`, actualiza `.env`, resetea BD, sube payloads a Pinata/IPFS y deja API + blockchain saludables. |
| Despliegue Hardhat en reseed | El despliegue del contrato se ejecuta en un contenedor `node:20-alpine` temporal con `node_modules` aislado en volumen Docker, evitando el `npx` local y el bloqueo Windows sobre binarios nativos de `node_modules`. |
| Observacion seed | Esta validacion inicial dejo identificada una incidencia de calidad: 2 documentos `FAILED` por desincronizacion de nonce tras firmas blockchain rechazadas. Se corrige en la seccion 15. |

### Validacion final de cierre

| Bloque | Comando | Resultado |
|---|---|---|
| Docker Hardhat | `docker compose build hardhat` | OK con `npm ci` |
| Docker Backend | `docker compose build backend` | OK; stage `contracts`, build TypeScript y runtime completados |
| Reseed QA | `./reseed-dev.ps1 -SeedProfile qa-fast` | OK; health final de API y blockchain correcto |
| Backend build | `npm run build` en `backend` | OK |
| Backend lint | `npm run lint` en `backend` | OK |
| Frontend build | `npm run build` en `frontend` | OK; warnings no bloqueantes de Rollup por chunks grandes y anotaciones `#__PURE__` de dependencias |
| Frontend lint | `npm run lint` en `frontend` | OK |
| Smart contracts compile | `npm ci && npm run compile` en contenedor `node:20-alpine` | OK |
| Anexos activos | `./build_nuevo.ps1 -OnlyLatex` en `anexos` | OK para memoria y anexos I-IX; MiKTeX aviso de actualizaciones pendiente no bloqueante; `AnexoII_EstimacionTamanioEsfuerzo_NUEVO.tex` compila correctamente |

### Estado final

READY reemplazado por el criterio estricto de la seccion 15: reseed `qa-fast` con `0 FAILED`, integridad de datos y evidencias funcionales.

## 15. Cierre estricto de calidad seed qa-fast sin FAILED

| Area | Resultado |
|---|---|
| Rama de cierre | Trabajo realizado en `fix/qa-seed-no-failed`. |
| Snapshot local | Evidencias guardadas en `_local_no_entrega/evidencias_demo/qa_seed_closure/` (ignorado por Git). |
| Causa raiz FAILED | Los 2 documentos `FAILED` pertenecian a `carmen_martin`; tenian IPFS y version operacional correctos, pero `createDocument` fallaba por `Nonce too high`. La causa anterior era una firma secundaria construida con un hash simplificado, rechazada por `DocumentRegistry`, que dejaba el `NonceManager` desincronizado para la wallet usada despues como owner. |
| Correccion aplicada | `backend/scripts/generate-test-data.ts` firma ahora el payload real del contrato con `getSignaturePayloadHash(...)` y usa reintentos controlados para transacciones con nonce desincronizado. |
| Politica de artefactos locales | `smart-contracts/deployments/localhost.json` y `localhost.env` quedan como artefactos locales efimeros: se ignoran en `.gitignore` y se sacan del indice de Git. |
| Resultado reseed final | `./reseed-dev.ps1 -SeedProfile qa-fast` termina OK con 4 documentos, 6 versiones, 4 firmas y `Documentos en FAILED: 0`. |
| Integridad seed | Sin versiones confirmadas sin `ipfsCid`, sin documentos `SYNCED` sin `blockchainId`, sin firmas `SYNCED` sin `blockchainTxHash`, sin versiones huerfanas, sin documentos sin version operacional y sin firmas sin documento/version. |
| Prueba funcional minima | Evidencia local creada con login, listado, detalle, alta real de documento con transaccion Hardhat, descarga, verificacion blockchain y caso de error esperado. Tras la prueba se relanzo `qa-fast` para dejar la BD en estado limpio. |

### Validacion final estricta

| Bloque | Comando | Resultado |
|---|---|---|
| Docker Hardhat | `docker compose build hardhat` | OK con `npm ci` |
| Docker Backend | `docker compose build backend` | OK; contratos, Prisma y TypeScript compilados |
| Reseed QA final | `./reseed-dev.ps1 -SeedProfile qa-fast` | OK; `Documentos en FAILED: 0` |
| Consistencia BD | consultas guardadas en `_local_no_entrega/evidencias_demo/qa_seed_closure/db-consistency-final.txt` | OK; todos los contadores de inconsistencia a 0 |
| Backend build | `npm run build` en `backend` | OK |
| Backend lint | `npm run lint` en `backend` | OK |
| Frontend build | `npm run build` en `frontend` | OK; warnings no bloqueantes de Rollup por chunks grandes y anotaciones `#__PURE__` de dependencias |
| Frontend lint | `npm run lint` en `frontend` | OK |
| Smart contracts compile | `npm ci && npm run compile` en contenedor `node:20-alpine` | OK |
| Anexos activos | `./build_nuevo.ps1 -OnlyLatex` en `anexos` | OK para memoria y anexos I-IX; MiKTeX aviso de actualizaciones pendiente no bloqueante |

### Estado final de entrega

READY sin excepciones funcionales en seed: `qa-fast` queda reproducible con `0 FAILED`, sin inconsistencias de integridad detectadas y con artefactos efimeros de Hardhat fuera de entrega.
