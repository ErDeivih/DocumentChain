#!/bin/sh
set -e

echo "[entrypoint] Esperando a que PostgreSQL esté disponible..."

# Esperar a que PostgreSQL responda con un límite para no bloquear indefinidamente.
MAX_ATTEMPTS="${POSTGRES_WAIT_ATTEMPTS:-60}"
ATTEMPT=1
until pg_isready -h postgres -p 5432 -U documentchain > /dev/null 2>&1; do
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "[entrypoint] PostgreSQL no respondió tras $MAX_ATTEMPTS intentos. Abortando."
    exit 1
  fi

  echo "[entrypoint] PostgreSQL no está listo, esperando... ($ATTEMPT/$MAX_ATTEMPTS)"
  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
done

echo "[entrypoint] PostgreSQL listo. Aplicando migraciones..."
npx prisma migrate deploy

echo "[entrypoint] Generando Prisma Client..."
npx prisma generate

echo "[entrypoint] Comprobando si hace falta seed minima..."
USER_COUNT=$(node -e 'const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient(); (async () => { try { process.stdout.write(String(await prisma.user.count())); } finally { await prisma.$disconnect(); } })().catch(async (error) => { console.error(error); try { await prisma.$disconnect(); } catch {} process.exit(1); });')

if [ "$USER_COUNT" = "0" ]; then
  echo "[entrypoint] Base vacia. Ejecutando seed..."
  npx prisma db seed || true
else
  echo "[entrypoint] Seed omitida: ya existen $USER_COUNT usuario(s)."
fi

echo "[entrypoint] Iniciando aplicación..."
exec node dist/index.js
