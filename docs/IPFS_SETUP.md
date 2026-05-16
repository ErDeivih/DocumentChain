# Configuración de IPFS en DocumentChain

DocumentChain soporta dos modos de almacenamiento IPFS que puedes cambiar en cualquier momento editando variables de entorno.

---

## Opción A: Pinata (por defecto)

Usa el servicio de pinning **Pinata** para almacenar los documentos. Es la opción más sencilla y no requiere mantener un nodo IPFS propio.

### Ventajas
- No necesitas mantener un nodo IPFS local consumiendo recursos.
- Los documentos públicos son accesibles desde cualquier gateway IPFS público (`ipfs.io`, `dweb.link`, etc.).
- No hace falta abrir puertos de tu router.

### Inconvenientes
- Depende de un tercero (aunque IPFS es descentralizado, el pinning está centralizado en Pinata).
- Límites de la cuenta gratuita (gestionamos el cleanup automático en el seed).

### Configuración

1. Crea una cuenta en [https://app.pinata.cloud](https://app.pinata.cloud).
2. Ve a **Developers → API Keys** y genera una nueva key con permisos de `pinFile`, `unpin` y `pinList`.
3. Copia el **JWT**, la **API Key** y la **API Secret**.
4. En `backend/.env`:
   ```env
   IPFS_PROVIDER="pinata"
   PINATA_JWT="tu-jwt-aqui"
   PINATA_API_KEY="tu-api-key-aqui"
   PINATA_API_SECRET="tu-api-secret-aqui"
   PINATA_GATEWAY_URL="https://apricot-big-jackal-796.mypinata.cloud"
   ```
5. Reconstruye y levanta los contenedores:
   ```bash
   docker compose up -d --build backend
   ```

### Seed responsable
Cada vez que se ejecuta el seed (`docker compose up` o `npx prisma db seed`), el sistema:
1. Lista todos los pines existentes en tu cuenta Pinata.
2. Los elimina masivamente para respetar los límites gratuitos.
3. Inserta los nuevos datos de prueba.

---

## Opción B: Nodo IPFS propio + Cloudflare Tunnel

Si prefieres no depender de Pinata y usar tu propio nodo Kubo, puedes volver al modo self-hosted y exponerlo públicamente mediante **Cloudflare Tunnel** (sin abrir puertos del router).

### Ventajas
- Completa soberanía sobre tus datos.
- Sin límites de terceros.

### Inconvenientes
- Tu PC debe estar siempre encendido para que los documentos sean accesibles.
- Requiere configurar Cloudflare Tunnel.

### Paso 1: Reactivar el nodo IPFS

En `docker-compose.yml`, descomenta el bloque `ipfs-node`:
```yaml
  ipfs-node:
    image: ipfs/kubo:latest
    container_name: documentchain-ipfs
    restart: unless-stopped
    profiles: ["ipfs"]
    ports:
      - "4001:4001"
      - "127.0.0.1:5001:5001"
      - "8080:8080"
    # ... resto de la config
```

> **Seguridad**: el puerto 5001 (API de Kubo) está ligado a `127.0.0.1` para evitar exposición pública sin autenticación.

### Paso 2: Cambiar el provider

En `backend/.env`:
```env
IPFS_PROVIDER="self-hosted"
IPFS_API_URL="http://ipfs-node:5001"
IPFS_GATEWAY_URL="http://ipfs-node:8080"
```

Levanta el nodo y el backend:
```bash
docker compose --profile ipfs up -d ipfs-node backend
```

### Paso 3: Exponer el gateway con Cloudflare Tunnel

1. Crea una cuenta gratuita en [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. Descarga `cloudflared`:
   ```bash
   docker pull cloudflare/cloudflared:latest
   ```
3. Autentica (solo una vez):
   ```bash
   docker run --rm -it cloudflare/cloudflared:latest tunnel login
   ```
   Esto abrirá tu navegador y generará un certificado.
4. Crea el túnel:
   ```bash
   docker run --rm -it cloudflare/cloudflared:latest tunnel create documentchain-ipfs
   ```
5. Obtén el **Tunnel ID** del paso anterior.
6. Añade el servicio a `docker-compose.yml`:
   ```yaml
   cloudflared:
     image: cloudflare/cloudflared:latest
     container_name: documentchain-cloudflared
     restart: unless-stopped
     command: tunnel run --token ${CLOUDFLARE_TUNNEL_TOKEN}
     networks:
       - documentchain
     depends_on:
       - ipfs-node
   ```
   O usa el formato legacy con el config.yml:
   ```yaml
   cloudflared:
     image: cloudflare/cloudflared:latest
     container_name: documentchain-cloudflared
     restart: unless-stopped
     volumes:
       - ./cloudflared:/etc/cloudflared
     command: tunnel run documentchain-ipfs
     networks:
       - documentchain
   ```
7. En `cloudflared/config.yml`:
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /etc/cloudflared/<TUNNEL_ID>.json
   ingress:
     - hostname: ipfs.tudominio.com
       service: http://ipfs-node:8080
     - service: http_status:404
   ```
8. Crea el registro DNS en Cloudflare apuntando al túnel.
9. Ahora tus CIDs son accesibles públicamente en:
   ```
   https://ipfs.tudominio.com/ipfs/<CID>
   ```

### Paso 4: Anunciar el nodo en el DHT público (opcional)

Si quieres que `https://ipfs.io/ipfs/<CID>` también funcione para tus archivos:
1. Abre el puerto **4001/tcp** y **4001/udp** en tu router (redirección a tu PC).
2. Edita `ipfs/runtime/node/config`:
   ```json
   "Addresses": {
     "Announce": [
       "/dns4/ipfs.tudominio.com/tcp/4001",
       "/dns4/ipfs.tudominio.com/udp/4001/quic-v1"
     ]
   },
   "Swarm": {
     "DisableNatPortMap": false
   }
   ```
3. Reinicia el contenedor `ipfs-node`.

---

## Cambio rápido entre modos

| Paso | Pinata → Self-hosted | Self-hosted → Pinata |
|------|----------------------|----------------------|
| 1 | Descomenta `ipfs-node` en `docker-compose.yml` | Comenta `ipfs-node` en `docker-compose.yml` |
| 2 | Cambia `IPFS_PROVIDER=self-hosted` en `.env` | Cambia `IPFS_PROVIDER=pinata` en `.env` |
| 3 | Asegúrate de que `IPFS_API_URL` apunta a `http://ipfs-node:5001` | Rellena `PINATA_JWT`, `PINATA_API_KEY`, `PINATA_API_SECRET` |
| 4 | `docker compose --profile ipfs up -d` | `docker compose up -d --build backend` |

> **Nota**: los documentos ya subidos en un modo no se migran automáticamente al otro. Si cambias de modo, los documentos existentes en la base de datos apuntarán a CIDs que solo existen en el sistema anterior. Para un entorno de desarrollo/demo esto es aceptable; para producción considera migrar manualmente o mantener ambos sistemas activos temporalmente.

---

## Troubleshooting

### "Unsupported IPFS_PROVIDER"
Asegúrate de que `IPFS_PROVIDER` es exactamente `"pinata"` o `"self-hosted"`. No uses mayúsculas ni espacios.

### "PINATA_JWT is not set"
Al usar `pinata`, la variable `PINATA_JWT` es obligatoria. Comprueba que está definida en `backend/.env` y que Docker la está pasando al contenedor.

### Documentos públicos no se ven desde fuera
- **Con Pinata**: el CID debe estar pinned. Comprueba en el dashboard de Pinata.
- **Con self-hosted + Cloudflare Tunnel**: verifica que `cloudflared` está corriendo (`docker logs documentchain-cloudflared`) y que el hostname DNS está apuntando al túnel.
