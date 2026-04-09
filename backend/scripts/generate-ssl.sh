#!/bin/bash

# Script para generar certificados SSL auto-firmados para desarrollo
# USO: bash backend/scripts/generate-ssl.sh

set -e

echo "🔒 Generando certificados SSL para desarrollo..."

# Crear directorio ssl si no existe
mkdir -p backend/ssl

# Generar certificado auto-firmado
openssl req -x509 -newkey rsa:4096 \
  -keyout backend/ssl/private-key.pem \
  -out backend/ssl/certificate.pem \
  -days 365 -nodes \
  -subj "/C=ES/ST=Madrid/L=Madrid/O=DocumentChain/OU=Development/CN=localhost"

# Ajustar permisos
chmod 600 backend/ssl/private-key.pem
chmod 644 backend/ssl/certificate.pem

echo ""
echo "✅ Certificados SSL generados correctamente:"
echo "   📄 backend/ssl/private-key.pem"
echo "   📄 backend/ssl/certificate.pem"
echo ""
echo "⚠️  NOTA: Estos certificados son AUTO-FIRMADOS y solo para DESARROLLO."
echo "   Los navegadores mostrarán advertencia de seguridad (normal)."
echo ""
echo "Para usar:"
echo "   1. Asegúrate de que .env tenga:"
echo "      SSL_KEY_PATH=\"./ssl/private-key.pem\""
echo "      SSL_CERT_PATH=\"./ssl/certificate.pem\""
echo "   2. Ejecuta: npm run dev"
echo "   3. Visita: https://localhost:3000"
echo "   4. Acepta la advertencia del navegador"
echo ""
