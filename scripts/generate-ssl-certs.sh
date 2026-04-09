#!/bin/bash

echo "🔐 Generando certificados SSL autofirmados para desarrollo..."

# Crear directorio ssl si no existe
mkdir -p ssl
mkdir -p backend/ssl

# Generar clave privada (2048 bits)
openssl genrsa -out ssl/private-key.pem 2048

# Generar CSR (Certificate Signing Request)
openssl req -new -key ssl/private-key.pem -out ssl/csr.pem \
  -subj "/C=ES/ST=Madrid/L=Madrid/O=DocumentChain/OU=Development/CN=localhost"

# Generar certificado autofirmado (válido por 365 días)
openssl x509 -req -days 365 -in ssl/csr.pem -signkey ssl/private-key.pem -out ssl/certificate.pem

# Copiar certificados para backend
cp ssl/private-key.pem backend/ssl/
cp ssl/certificate.pem backend/ssl/

# Copiar certificados para nginx (si se usa)
mkdir -p nginx/ssl
cp ssl/private-key.pem nginx/ssl/key.pem
cp ssl/certificate.pem nginx/ssl/cert.pem

# Limpiar CSR
rm ssl/csr.pem

echo "✅ Certificados SSL generados exitosamente"
echo "   - Clave privada: ssl/private-key.pem"
echo "   - Certificado: ssl/certificate.pem"
echo "   - Válido por: 365 días"
echo ""
echo "⚠️  NOTA: Estos son certificados autofirmados solo para desarrollo."
echo "   Tu navegador mostrará una advertencia de seguridad."
echo "   Para producción, usa certificados válidos (Let's Encrypt, etc.)"
