#!/bin/bash
# Script para crear el primer usuario administrador
# Uso: ./create-first-admin.sh

set -e

echo "=== Crear Primer Usuario Administrador ==="
echo ""

# Verificar que el backend esté corriendo
BACKEND_URL="https://localhost:3001"
if ! curl -k -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    echo "❌ Error: El backend no está corriendo en $BACKEND_URL"
    echo "Inicia el servidor primero: npm run dev"
    exit 1
fi

echo "✓ Backend detectado en $BACKEND_URL"
echo ""

# Leer .env para obtener el ADMIN_REGISTRATION_SECRET
ENV_PATH="$(dirname "$0")/../backend/.env"
if [ ! -f "$ENV_PATH" ]; then
    echo "❌ Error: No se encontró el archivo .env en backend/"
    echo "Copia .env.example a .env y configura ADMIN_REGISTRATION_SECRET"
    exit 1
fi

ADMIN_SECRET=$(grep '^ADMIN_REGISTRATION_SECRET=' "$ENV_PATH" | cut -d'=' -f2 | tr -d '"')

if [ -z "$ADMIN_SECRET" ] || [ "$ADMIN_SECRET" = "change-this-to-a-secure-random-string-min-32-chars" ]; then
    echo "❌ Error: ADMIN_REGISTRATION_SECRET no configurado en .env"
    echo ""
    echo "Genera un secret seguro con:"
    echo "  openssl rand -base64 32"
    echo ""
    echo "Luego añádelo a backend/.env:"
    echo '  ADMIN_REGISTRATION_SECRET="tu-secret-generado"'
    exit 1
fi

echo "✓ ADMIN_REGISTRATION_SECRET encontrado en .env"
echo ""

# Solicitar datos del admin
echo "Ingresa los datos del primer administrador:"
echo ""

read -p "Username (ej: admin): " USERNAME
if [ -z "$USERNAME" ]; then
    echo "❌ Username es obligatorio"
    exit 1
fi

read -p "Email (ej: admin@example.com): " EMAIL
if [ -z "$EMAIL" ]; then
    echo "❌ Email es obligatorio"
    exit 1
fi

read -sp "Password (mínimo 6 caracteres): " PASSWORD
echo ""

if [ ${#PASSWORD} -lt 6 ]; then
    echo "❌ La contraseña debe tener al menos 6 caracteres"
    exit 1
fi

read -p "Nombre completo (opcional, presiona Enter para omitir): " FULLNAME

# Crear el body del request
BODY=$(cat <<EOF
{
  "username": "$USERNAME",
  "email": "$EMAIL",
  "password": "$PASSWORD",
  "adminSecret": "$ADMIN_SECRET"
EOF
)

if [ -n "$FULLNAME" ]; then
    BODY="$BODY,
  \"fullName\": \"$FULLNAME\""
fi

BODY="$BODY
}"

echo ""
echo "Creando usuario administrador..."

RESPONSE=$(curl -k -s -X POST "$BACKEND_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "$BODY")

# Verificar si hubo error
if echo "$RESPONSE" | grep -q '"error"'; then
    echo ""
    echo "❌ Error al crear administrador:"
    echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4
    echo ""
    exit 1
fi

# Extraer recovery key y user info
RECOVERY_KEY=$(echo "$RESPONSE" | grep -o '"recoveryKey":"[^"]*"' | cut -d'"' -f4)
USER_USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*"' | head -1 | cut -d'"' -f4)
USER_EMAIL=$(echo "$RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
USER_ROLE=$(echo "$RESPONSE" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "✅ ¡Administrador creado exitosamente!"
echo ""
echo "Detalles del usuario:"
echo "  Username: $USER_USERNAME"
echo "  Email: $USER_EMAIL"
echo "  Role: $USER_ROLE"
echo ""
echo "🔑 Recovery Key (GUÁRDALO EN LUGAR SEGURO):"
echo "  $RECOVERY_KEY"
echo ""
echo "Ya puedes iniciar sesión en: https://localhost:5173/login"
echo ""
