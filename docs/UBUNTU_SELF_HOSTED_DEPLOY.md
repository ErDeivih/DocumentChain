# Despliegue Automatico en Ubuntu con Docker

Este flujo permite que un equipo Ubuntu actue como servidor de pruebas local y actualice DocumentChain automaticamente cada vez que llegue un push a `main` o `master`.

## Arquitectura propuesta

- GitHub aloja el codigo y dispara el workflow.
- Un runner self-hosted de GitHub Actions se ejecuta dentro del propio Ubuntu.
- El runner ejecuta [scripts/deploy-ubuntu-server.sh](../scripts/deploy-ubuntu-server.sh).
- El despliegue real se resuelve con Docker Compose sobre el propio servidor.

No se busca un entorno productivo. El objetivo es tener un servidor de pruebas que reconstruya el stack, aplique migraciones y deje frontend, backend, PostgreSQL, Hardhat, Postfix e IPFS listos tras cada push.

## Requisitos del servidor

Instala estos componentes en Ubuntu:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
docker version
docker compose version
```

El workflow usa solo Docker para ejecutar la aplicacion, pero si activas las migraciones automaticas el script tambien necesita `node` y `npm` disponibles en el runner. La via mas simple consiste en dejar que GitHub Actions gestione ese runtime si en el futuro amplias el workflow. Para el flujo actual, basta con tener el runner instalado en una maquina donde Docker funcione correctamente.

## Fichero de entorno del servidor

Crea un fichero persistente fuera del checkout del repositorio:

```bash
sudo mkdir -p /opt/documentchain
sudo cp .env.server.example /opt/documentchain/.env.server
sudo chown "$USER":"$USER" /opt/documentchain/.env.server
```

Edita `/opt/documentchain/.env.server` y ajusta al menos:

- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `VITE_BLOCKCHAIN_RPC_URL`
- `IPFS_PROVIDER`
- `IPFS_API_URL`
- `IPFS_GATEWAY_URL`
- `IPFS_DATA_ROOT`

Si vas a abrir la aplicacion desde otro equipo de la misma red, usa la IP LAN fija del servidor en esas variables. No dejes `localhost` en `VITE_BLOCKCHAIN_RPC_URL`, porque el navegador del otro equipo intentaria conectarse a su propia maquina en lugar de al nodo Hardhat del servidor.

Ejemplo para una LAN domestica:

- `FRONTEND_URL=http://192.168.1.50:5173`
- `ALLOWED_ORIGINS=http://192.168.1.50:5173`
- `VITE_BLOCKCHAIN_RPC_URL=http://192.168.1.50:8545`

La forma mas sencilla de mantener esa IP estable es reservarla en el router por DHCP o fijarla con Netplan en Ubuntu.

Para el modo self-hosted con IPFS propio, la configuracion recomendada en un solo Ubuntu es un unico nodo Kubo persistente. La persistencia debe vivir fuera del checkout del repositorio para que `actions/checkout` no toque los datos. Por eso conviene fijar:

- `IPFS_DATA_ROOT=/opt/documentchain/ipfs`

Ese directorio guardara el datastore del nodo IPFS entre redeploys.

## Runner self-hosted

Desde GitHub, entra en `Settings > Actions > Runners > New self-hosted runner` y sigue los pasos para Linux x64. Durante la configuracion conviene usar un usuario dedicado y mantener el runner como servicio del sistema.

El workflow añadido en [/.github/workflows/deploy-local-server.yml](../.github/workflows/deploy-local-server.yml) usa las etiquetas por defecto `self-hosted`, `linux` y `x64`, por lo que no requiere una etiqueta personalizada.

## Flujo de despliegue

Cuando llegue un push a `main` o `master`, GitHub Actions ejecutara este proceso:

1. Checkout del repositorio en el runner local.
2. Verificacion de Docker y Docker Compose.
3. Generacion de `backend/.env` y `frontend/.env` si no existen.
4. Carga de `/opt/documentchain/.env.server`.
5. Construccion de imagenes Docker.
6. Arranque de PostgreSQL, Postfix, Hardhat y, opcionalmente, el nodo IPFS local.
7. Aplicacion de migraciones Prisma con la imagen del backend.
8. Arranque o recreacion de backend y frontend.
9. Espera activa hasta que los health checks queden en verde.

El script esta pensado para ser idempotente. Si no hay cambios en imagenes o configuracion, el redeploy sera rapido. Si quieres un reinicio completo del stack con borrado de volumenes, puedes activar `RESET_DOCKER_STATE=1` en el fichero del servidor, aunque eso elimina la base de datos y el estado persistente.

Si quieres que cada despliegue deje el entorno completamente limpio para pruebas funcionales (sin usuarios ni datos previos), combina:

- `RESET_DOCKER_STATE=1`
- `AUTO_RESEED_QA=1`
- `SEED_PROFILE=qa-fast` (o `qa-max`)

Con esa combinacion, cada deploy borra volumenes, reconstruye servicios y regenera la base de datos con seed QA.

Para evitar despliegues en los que el correo parezca funcionar pero no se entregue externamente, puedes forzar validacion estricta de SMTP:

- `REQUIRE_SMTP_RELAY=1`

Cuando este flag está activo, el script falla si falta `SMTP_RELAYHOST`, `SMTP_RELAYHOST_USERNAME`, `SMTP_RELAYHOST_PASSWORD` o si `EMAIL_FROM` usa dominio local (`.local`).

## Comprobaciones utiles

Tras un despliegue, estas verificaciones suelen ser suficientes:

```bash
docker compose ps
curl http://localhost:3000/health
curl http://localhost:5173/health
docker logs documentchain-backend --tail 100
```

## Ajustes recomendados

- Si quieres que el servidor de pruebas siga otra rama, cambia el filtro `branches` del workflow.
- Si prefieres activar el despliegue solo manualmente, elimina el trigger `push` y deja `workflow_dispatch`.
- Si en el futuro necesitas una seed QA completa en Linux, conviene portar `reseed-dev.ps1` a un script shell dedicado en lugar de reutilizar el flujo de Windows.