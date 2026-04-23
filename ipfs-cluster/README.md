# IPFS Cluster - DocumentChain

Cluster de IPFS con múltiples nodos para almacenamiento descentralizado y replicado de documentos.

## Configuración

### Estructura
- **3 Nodos IPFS** (ipfs-node-1, ipfs-node-2, ipfs-node-3)
- **1 IPFS Cluster** (coordinador de replicación y pinning)

### Puertos

#### IPFS Node 1
- `4001`: Swarm (comunicación P2P)
- `5001`: API
- `8080`: Gateway HTTP

#### IPFS Node 2
- `4002`: Swarm
- `5002`: API
- `8081`: Gateway HTTP

#### IPFS Node 3
- `4003`: Swarm
- `5003`: API
- `8082`: Gateway HTTP

#### IPFS Cluster
- `9094`: Cluster REST API (usado por el backend)
- `9095`: Cluster IPFS Proxy
- `9096`: Cluster Swarm

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

Los archivos subidos a través del backend se pinnean automáticamente en todos los nodos del cluster, asegurando:
- **Redundancia**: Los archivos están replicados en 3 nodos
- **Disponibilidad**: Si un nodo falla, los demás mantienen los archivos
- **Persistencia**: Los archivos no se eliminan del cluster hasta que se haga unpin explícitamente

## Troubleshooting

### Los nodos no se conectan entre sí

```bash
# Ver peers de cada nodo
docker-compose exec ipfs-node-1 ipfs swarm peers
docker-compose exec ipfs-node-2 ipfs swarm peers
docker-compose exec ipfs-node-3 ipfs swarm peers
```

### Ver archivos pinneados

```bash
docker-compose exec ipfs-node-1 ipfs pin ls --type=recursive
```

### Verificar configuración del cluster

```bash
docker-compose exec ipfs-cluster ipfs-cluster-ctl peers ls
```
