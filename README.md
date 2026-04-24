# DocumentChain

DocumentChain es un sistema de gestion documental con trazabilidad blockchain, versionado, comparticion, firma digital con wallet y soporte para documentos privados y publicos.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript + Prisma
- Base de datos: PostgreSQL
- Blockchain local: Hardhat
- Persistencia de binarios: IPFS con proveedor configurable (Pinata o cluster propio)
- Correo saliente: Postfix en Docker
- Documentacion academica: anexos LaTeX

## Arranque recomendado

La forma recomendada para probar el proyecto en otro equipo es levantar todo con Docker Compose:

```powershell
docker compose up -d --build
```

Servicios expuestos:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5433
- Hardhat RPC: http://localhost:8545
- IPFS Kubo y cluster: opcionales con perfil `ipfs-cluster`
- SMTP Postfix: localhost:1587

Comprobaciones rapidas:

```powershell
docker compose ps
Invoke-WebRequest -UseBasicParsing http://localhost:3000/health
```

Para dejar el entorno local en un estado QA reproducible, con Hardhat redeployado y datos coherentes para Playwright, el flujo canonico es:

```powershell
.\reseed-dev.ps1
```

Ese flujo sincroniza automaticamente la direccion desplegada del contrato en backend y frontend antes de regenerar la seed QA.

Los scripts PowerShell del repositorio ya fijan internamente la raiz del proyecto, por lo que no dependen del directorio activo desde el que se invoquen.

## Variables de entorno

Si no existen, crea los ficheros `.env` a partir de los ejemplos disponibles:

```powershell
Copy-Item backend\.env.example backend\.env
if (Test-Path frontend\.env.example) { Copy-Item frontend\.env.example frontend\.env }
if (Test-Path smart-contracts\.env.example) { Copy-Item smart-contracts\.env.example smart-contracts\.env }
```

Para trabajo local fuera de Docker, `backend/.env` debe apuntar a PostgreSQL en el puerto `5433`:

```dotenv
DATABASE_URL="postgresql://documentchain:documentchain@localhost:5433/documentchain?schema=public"
```

## IPFS: proveedor gestionado o infraestructura propia

El backend ya soporta dos modos reales de almacenamiento IPFS:

- `IPFS_PROVIDER=pinata`: arranque rapido, pero sujeto a cuotas del proveedor.
- `IPFS_PROVIDER=cluster`: soberania operativa sobre nodos propios, sin dependencia funcional de terceros.

Si quieres usar el clúster IPFS propio incluido en el repositorio con el compose principal, activa el perfil `ipfs-cluster` y fuerza el proveedor en el entorno de Docker:

```powershell
$env:IPFS_PROVIDER = "cluster"
$env:IPFS_API_URL = "http://ipfs-node-1:5001"
$env:IPFS_CLUSTER_API_URL = "http://ipfs-cluster:9094"
$env:IPFS_GATEWAY_URL = "http://ipfs-node-1:8080"
$env:IPFS_DATA_ROOT = "/opt/documentchain/ipfs"

docker compose --profile ipfs-cluster up -d postgres hardhat postfix ipfs-node-1 ipfs-cluster backend frontend
```

Ese modo reutiliza la configuracion de `ipfs-cluster/`, levanta un nodo Kubo persistente mas un peer de `ipfs-cluster` accesible por el backend y deja los datos fuera del checkout si defines `IPFS_DATA_ROOT`. Para desarrollo puntual Pinata sigue siendo valido; para despliegue autonomo y para evitar limites de cuota, el camino recomendado en una sola maquina es este modo self-hosted persistente.

## Correo con Postfix del proyecto

El backend ya esta preparado para entregar al Postfix del propio stack. Si quieres evitar proveedores externos, el modo mas directo es `app -> postfix local -> internet`, sin relay SMTP adicional.

Configuracion para desarrollo local en `backend/.env`:

```dotenv
SMTP_HOST="localhost"
SMTP_PORT="1587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@documentchain.local"
EMAIL_FROM_NAME="DocumentChain"
FRONTEND_URL="http://localhost:5173"
```

Configuracion equivalente para `docker compose` en el `.env` de la raiz del proyecto para salida directa con Postfix:

```dotenv
SMTP_RELAYHOST=
SMTP_RELAYHOST_USERNAME=
SMTP_RELAYHOST_PASSWORD=
POSTFIX_SMTP_TLS_SECURITY_LEVEL=may
POSTFIX_HOSTNAME=mail.documentchain.local
ALLOWED_SENDER_DOMAINS=documentchain.local
MASQUERADED_DOMAINS=documentchain.local
EMAIL_FROM=noreply@documentchain.local
EMAIL_FROM_NAME=DocumentChain
```

Con esa configuracion, la app entrega al Postfix del proyecto y Postfix intenta la entrega directa a los servidores destino.

Limitacion importante: esto funciona como arquitectura y sirve para demostrar que el correo sale desde tu servidor, pero no garantiza que Gmail, Outlook u otros receptores acepten siempre el mensaje. Si cae en spam o se rechaza, el problema ya no es la app sino la falta de reputacion, dominio y DNS del emisor.

Si en algun momento quieres un modo mas estable sin cambiar el backend, puedes añadir un relay SMTP despues, pero no es obligatorio para probar el flujo tecnico del TFG.

Arranque minimo para este modo:

```powershell
Set-Location E:\Universidad\tfg
docker compose up -d postfix

Set-Location E:\Universidad\tfg\backend
npm run dev
```

Prueba rapida de envio:

```powershell
Set-Location E:\Universidad\tfg\backend
node test-smtp-quick.js destinatario@ejemplo.com
```

Si prefieres que el flujo siga pasando por tu servidor local pero que la salida final la haga un tercero, usa Postfix como relay. En ese escenario la app entrega al Postfix del proyecto, y Postfix reenvia el mensaje al relay configurado.

Configuracion para el `.env` de la raiz del proyecto cuando quieres `app -> postfix local -> gmail -> internet`:

```dotenv
SMTP_RELAYHOST=[smtp.gmail.com]:587
SMTP_RELAYHOST_USERNAME=tu_cuenta@gmail.com
SMTP_RELAYHOST_PASSWORD=tu_contrasena_de_aplicacion
POSTFIX_SMTP_TLS_SECURITY_LEVEL=encrypt
POSTFIX_HOSTNAME=mail.documentchain.local
ALLOWED_SENDER_DOMAINS=gmail.com
MASQUERADED_DOMAINS=gmail.com
EMAIL_FROM=tu_cuenta@gmail.com
EMAIL_FROM_NAME=DocumentChain
```

Si ejecutas el backend fuera de Docker, en `backend/.env` debes mantener el envio hacia el Postfix local:

```dotenv
SMTP_HOST="localhost"
SMTP_PORT="1587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="tu_cuenta@gmail.com"
EMAIL_FROM_NAME="DocumentChain"
```

Con esa variante sigues usando tu servidor SMTP local dentro del proyecto, pero la salida real a Internet la resuelve Gmail. Solo usala si la entrega directa de Postfix no te basta.

Limitaciones practicas:

- La salida directa con Postfix es valida para demostracion tecnica del flujo.
- La aceptacion por receptores externos no esta garantizada sin dominio, PTR, SPF, DKIM y reputacion.
- Si el objetivo es solo validar plantillas y logica, este modo es suficiente aunque parte del correo externo falle.

Configuracion alternativa con Brevo SMTP:

```dotenv
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu_login_smtp_de_brevo"
SMTP_PASS="tu_clave_smtp_de_brevo"
EMAIL_FROM="tu_remitente_verificado@example.com"
EMAIL_FROM_NAME="DocumentChain"
```

Para este caso concreto, Brevo suele ser mejor opcion que un buzon personal porque:

- esta pensado para correo transaccional;
- no dependes de crear otra cuenta de Google;
- el flujo de pruebas se parece mas a un entorno real de aplicacion.

## Desarrollo hibrido

Si prefieres ejecutar frontend y backend en caliente, manteniendo PostgreSQL, Hardhat y Postfix en Docker:

```powershell
docker compose up -d postgres hardhat postfix

Set-Location backend
npx prisma migrate deploy
npx prisma generate
npm run dev

Set-Location ..\frontend
npm run dev
```

## Pruebas

Backend unit tests:

```powershell
Set-Location backend
npm run test:unit
```

Frontend unit tests:

```powershell
Set-Location frontend
npm test -- --run
```

E2E principales:

```powershell
.\scripts\run-playwright.ps1 -Project chromium -Arguments @('e2e/shared-routes.spec.ts','--reporter=line')
```

Validacion multi-navegador disponible:

```powershell
.\scripts\run-playwright.ps1 -Project firefox
.\scripts\run-playwright.ps1 -Project webkit
```

Anexos:

```powershell
Set-Location anexos
.\build.ps1
```

## Autodespliegue en Ubuntu

Si quieres que un servidor Ubuntu local actualice el stack automaticamente tras cada push en GitHub, el repositorio ya incluye:

- [/.github/workflows/deploy-local-server.yml](.github/workflows/deploy-local-server.yml) para runner self-hosted.
- [/scripts/deploy-ubuntu-server.sh](scripts/deploy-ubuntu-server.sh) para reconstruir y relanzar el stack Docker.
- [/.env.server.example](.env.server.example) como plantilla de configuracion del servidor.
- [/docs/UBUNTU_SELF_HOSTED_DEPLOY.md](docs/UBUNTU_SELF_HOSTED_DEPLOY.md) con la puesta en marcha completa.

Ese flujo esta pensado para entorno de pruebas sobre Ubuntu + Docker, no para produccion publica.

## Contenedores

- `documentchain-frontend`: sirve la SPA y proxifica `/api` al backend.
- `documentchain-backend`: API REST, servicios y sincronizacion blockchain.
- `documentchain-postgres`: persistencia relacional.
- `documentchain-hardhat`: nodo EVM local con despliegue automatico.
- `documentchain-postfix`: SMTP de salida para pruebas reales.

Para salida real a Internet, el Postfix del compose debe actuar preferiblemente como relay contra un proveedor SMTP o un dominio bien configurado. La entrega directa puede funcionar en entornos controlados, pero suele degradarse por bloqueo de puerto 25, falta de PTR o mala reputación del emisor.

## Notas importantes

- El sistema de permisos documental real usa `OWNER`, `EDITOR`, `VIEWER` y `NONE` en blockchain.
- La firma usa patron prepare/confirm; la wallet firma siempre en cliente.
- Las migraciones Prisma deben versionarse en Git.
- Las capturas del anexo V viven en `anexos/capturas-ui/`.

## Estructura

```text
backend/           API y logica de negocio
frontend/          SPA React
smart-contracts/   contratos Solidity y scripts Hardhat
anexos/            memoria y anexos LaTeX
docs/              documentacion tecnica auxiliar
nginx/             configuracion del frontend Docker
```
