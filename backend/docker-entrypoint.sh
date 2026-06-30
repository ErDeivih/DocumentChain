#!/bin/sh
set -e

echo "[entrypoint] Esperando a que PostgreSQL este disponible..."

# Esperar a que PostgreSQL responda
MAX_ATTEMPTS="${POSTGRES_WAIT_ATTEMPTS:-60}"
ATTEMPT=1
until pg_isready -h postgres -p 5432 -U documentchain > /dev/null 2>&1; do
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "[entrypoint] PostgreSQL no respondio tras $MAX_ATTEMPTS intentos. Abortando."
    exit 1
  fi
  echo "[entrypoint] PostgreSQL no esta listo, esperando... ($ATTEMPT/$MAX_ATTEMPTS)"
  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
done

echo "[entrypoint] PostgreSQL listo. Aplicando schema..."
npx prisma db push --accept-data-loss

# === Dual System: SEED_PROFILE ===
# SEED_PROFILE vacio        -> seed minima (solo admin)
# SEED_PROFILE=qa-fast      -> 3 usuarios, 12 docs, interacciones reales (datos demo)
# SEED_PROFILE=qa-max       -> 10 usuarios, 50 docs, interacciones reales (maxima demo)
SEED_PROFILE="${SEED_PROFILE:-}"
if [ -n "$SEED_PROFILE" ]; then
  echo "[entrypoint] SEED_PROFILE=$SEED_PROFILE — ejecutando seed QA..."
  npm run data:seed:qa -- --profile=$SEED_PROFILE
else
  echo "[entrypoint] Comprobando si hace falta seed minima..."
  USER_COUNT=$(node -e '
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    (async () => {
      try { process.stdout.write(String(await prisma.user.count())); }
      finally { await prisma.$disconnect(); }
    })().catch(async (error) => {
      try { await prisma.$disconnect(); } catch {}
      process.exit(1);
    });
  ')
  if [ "$USER_COUNT" = "0" ]; then
    echo "[entrypoint] Base vacia. Ejecutando seed minima..."
    npx prisma db seed || true
  else
    echo "[entrypoint] Seed omitida: ya existen $USER_COUNT usuario(s)."
  fi
fi

echo "[entrypoint] Iniciando aplicacion..."
exec node dist/index.js
