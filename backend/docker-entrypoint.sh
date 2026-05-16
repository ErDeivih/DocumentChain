#!/bin/sh
set -e

echo "[entrypoint] Esperando a que PostgreSQL esté disponible..."

# Esperar a que PostgreSQL responda
until pg_isready -h postgres -p 5432 -U documentchain > /dev/null 2>&1; do
  echo "[entrypoint] PostgreSQL no está listo, esperando..."
  sleep 2
done

echo "[entrypoint] PostgreSQL listo. Aplicando schema..."
npx prisma db push --accept-data-loss

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
