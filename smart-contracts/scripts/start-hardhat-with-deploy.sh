#!/bin/sh
set -eu

cd /app

npx hardhat node --hostname 0.0.0.0 --port 8545 &
NODE_PID=$!

cleanup() {
  kill "$NODE_PID" 2>/dev/null || true
  wait "$NODE_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "Esperando a que Hardhat RPC esté disponible..."
until node -e "const http=require('http');const body=JSON.stringify({jsonrpc:'2.0',method:'eth_blockNumber',params:[],id:1});const req=http.request({hostname:'127.0.0.1',port:8545,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}},(res)=>{let data='';res.on('data',(chunk)=>data+=chunk);res.on('end',()=>{try{const parsed=JSON.parse(data);process.exit(parsed.result!==undefined?0:1);}catch{process.exit(1);}})});req.on('error',()=>process.exit(1));req.write(body);req.end();"; do
  sleep 1
done

echo "Hardhat RPC listo en http://0.0.0.0:8545"
echo "Desplegando contrato DocumentRegistry..."

npx hardhat run scripts/deploy.js --network localhost || true

if [ -f deployments/localhost.json ]; then
  REGISTRY_ADDR=$(node -e "console.log(require('./deployments/localhost.json').contracts.DocumentRegistry)")
  echo "DocumentRegistry desplegado en: $REGISTRY_ADDR"
fi

wait "$NODE_PID"