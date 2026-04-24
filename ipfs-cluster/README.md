# IPFS Cluster - DocumentChain

Configuracion de IPFS self-hosted para DocumentChain.

En un unico servidor Ubuntu, la opcion recomendada es ejecutar:

- 1 nodo Kubo persistente para almacenar el contenido.
- 1 peer de `ipfs-cluster` persistente para exponer la API de pinning usada por el backend.

Levantar varios nodos Kubo dentro de la misma maquina no aporta una segunda zona de fallo real y solo aumenta el tiempo de despliegue, el consumo de disco y la complejidad operativa. Si en el futuro se quiere redundancia real, la ampliacion correcta es anadir peers de `ipfs-cluster` y nodos Kubo en maquinas distintas.

## Configuración

### Estructura recomendada
- **1 nodo IPFS** (`ipfs-node-1`)
- **1 peer de IPFS Cluster** (`ipfs-cluster`)

### Puertos

#### IPFS Node 1
- `4001`: Swarm (comunicación P2P)
- `5001`: API
- `8080`: Gateway HTTP

#### IPFS Cluster
- `9094`: Cluster REST API (usado por el backend)
- `9095`: Cluster IPFS Proxy
- `9096`: Cluster Swarm del peer

## Uso

### Iniciar el cluster

```bash
cd ipfs-cluster
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f
```

### Ver estado del cluster

```bash
docker-compose exec ipfs-cluster ipfs-cluster-ctl status
```

### Detener el cluster

```bash
docker-compose down
```

### Limpiar datos (CUIDADO: borra todos los archivos)

```bash
docker-compose down -v
```

## Pinning

Los archivos subidos a traves del backend se pinnean automaticamente en el nodo local gestionado por `ipfs-cluster`, asegurando:
- **Persistencia**: El contenido queda en el datastore local hasta que se haga `unpin` explicito.
- **Soberania operativa**: No depende de Pinata ni de otro proveedor externo.
- **Base limpia para crecer**: Si mas adelante se necesitan replicas reales, se anaden peers en otras maquinas sin cambiar el backend.

## Troubleshooting

### Ver archivos pinneados

```bash
docker-compose exec ipfs-node-1 ipfs pin ls --type=recursive
```

### Verificar configuración del cluster

```bash
docker-compose exec ipfs-cluster ipfs-cluster-ctl peers ls
```
