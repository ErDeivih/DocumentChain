#!/bin/bash
# Script para generar un secret seguro aleatorio
# Uso: ./generate-admin-secret.sh

set -e

echo "=== Generador de Admin Secret ==="
echo ""

# Generar secret de 32 bytes en base64
SECRET=$(openssl rand -base64 32)

echo "✨ Secret generado:"
echo ""
echo "$SECRET"
echo ""
echo "📋 Copia este secret a tu archivo backend/.env:"
echo ""
echo "ADMIN_REGISTRATION_SECRET=\"$SECRET\""
echo ""
echo "⚠️  IMPORTANTE: Guarda este secret en un lugar seguro."
echo "   Solo quienes tengan este secret pueden crear usuarios admin."
echo ""

# Preguntar si quiere añadirlo automáticamente al .env
ENV_PATH="$(dirname "$0")/../backend/.env"

if [ -f "$ENV_PATH" ]; then
    read -p "¿Quieres añadir este secret automáticamente a backend/.env? (s/n): " RESPONSE
    
    if [ "$RESPONSE" = "s" ] || [ "$RESPONSE" = "S" ]; then
        # Verificar si ya existe ADMIN_REGISTRATION_SECRET
        if grep -q "^ADMIN_REGISTRATION_SECRET=" "$ENV_PATH"; then
            echo ""
            echo "⚠️  ADMIN_REGISTRATION_SECRET ya existe en .env"
            read -p "¿Quieres reemplazarlo? (s/n): " OVERWRITE
            
            if [ "$OVERWRITE" = "s" ] || [ "$OVERWRITE" = "S" ]; then
                # Usar sed para reemplazar la línea
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "s|^ADMIN_REGISTRATION_SECRET=.*|ADMIN_REGISTRATION_SECRET=\"$SECRET\"|" "$ENV_PATH"
                else
                    # Linux
                    sed -i "s|^ADMIN_REGISTRATION_SECRET=.*|ADMIN_REGISTRATION_SECRET=\"$SECRET\"|" "$ENV_PATH"
                fi
                echo "✅ Secret actualizado en backend/.env"
            else
                echo "❌ Operación cancelada"
            fi
        else
            # Añadir al final del archivo
            echo "" >> "$ENV_PATH"
            echo "ADMIN_REGISTRATION_SECRET=\"$SECRET\"" >> "$ENV_PATH"
            echo "✅ Secret añadido a backend/.env"
        fi
        
        echo ""
        echo "🔄 Recuerda reiniciar el backend para que tome efecto:"
        echo "   cd backend && npm run dev"
    fi
else
    echo "⚠️  No se encontró backend/.env"
    echo "   Crea el archivo primero: cp backend/.env.example backend/.env"
fi

echo ""
