# Sistema de Correo Electrónico - DocumentChain

## Resumen

El backend genera y envía correos para verificación de cuenta, restablecimiento de contraseña, bienvenida, compartición de documentos y alertas de seguridad. La lógica de negocio reside en `emailService.ts` y la entrega se realiza por SMTP, lo que permite usar tanto el Postfix del entorno Docker como un proveedor externo.

## Arquitectura actual

El flujo operativo es el siguiente:

1. El backend compone el correo y renderiza la plantilla Handlebars.
2. Nodemailer entrega el mensaje al SMTP configurado por entorno.
3. Ese SMTP puede ser el contenedor `documentchain-postfix` o un relay/proveedor externo.

La estrategia base del proyecto es mantener al backend apuntando al Postfix del stack. A partir de ahí hay dos modos: entrega directa desde Postfix o reenvío mediante relay SMTP. Así se evita acoplar el código del backend a un proveedor concreto.

## Variables relevantes

```env
# Backend -> SMTP
SMTP_HOST="localhost"
SMTP_PORT="1587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""

EMAIL_FROM="noreply@documentchain.local"
EMAIL_FROM_NAME="DocumentChain"
FRONTEND_URL="https://localhost:5173"

# Postfix -> relay externo (opcional pero recomendado para Internet real)
SMTP_RELAYHOST=""
SMTP_RELAYHOST_USERNAME=""
SMTP_RELAYHOST_PASSWORD=""
POSTFIX_SMTP_TLS_SECURITY_LEVEL="may"
POSTFIX_HOSTNAME="mail.documentchain.local"
ALLOWED_SENDER_DOMAINS="documentchain.local"
MASQUERADED_DOMAINS="documentchain.local"
POSTFIX_DKIM_AUTOGENERATE="true"
```

## Modos de uso

### Desarrollo local integrado

El backend puede hablar con el Postfix del proyecto usando `localhost:1587` en modo híbrido o `postfix:587` dentro de Docker Compose. Este modo sirve para validar el flujo técnico de envío.

### Salida directa desde Postfix

Configuracion minima:

```env
SMTP_HOST="localhost"
SMTP_PORT="1587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""

EMAIL_FROM="noreply@documentchain.local"
EMAIL_FROM_NAME="DocumentChain"

SMTP_RELAYHOST=""
SMTP_RELAYHOST_USERNAME=""
SMTP_RELAYHOST_PASSWORD=""
POSTFIX_SMTP_TLS_SECURITY_LEVEL="may"
POSTFIX_HOSTNAME="mail.documentchain.local"
ALLOWED_SENDER_DOMAINS="documentchain.local"
MASQUERADED_DOMAINS="documentchain.local"
```

Este modo sirve para demostrar que la aplicacion entrega al servidor SMTP del proyecto y que Postfix intenta la salida por su cuenta. No requiere terceros, pero la aceptacion por destinatarios externos puede ser irregular.

### Salida real a Internet

La entrega fiable requiere uno de estos caminos:

- Relay SMTP autenticado, por ejemplo Google Workspace, Amazon SES, Mailgun o Postmark.
- Infraestructura SMTP propia con IP fija, PTR, SPF, DKIM y DMARC correctamente configurados.

La primera opcion es la mas estable para Internet abierta. La segunda es valida como demostracion tecnica si el proyecto se queda en local.

## Qué se envía

El sistema soporta estos correos:

- Verificación de cuenta
- Reenvío de verificación
- Restablecimiento de contraseña
- Confirmación de cambio de contraseña
- Documento compartido
- Alerta de seguridad
- Bienvenida

Las plantillas HTML se encuentran en `backend/src/templates/emails/`.

## Advertencias operativas

- La entrega directa desde Postfix sin relay puede funcionar y es suficiente para una demo tecnica, pero no debe considerarse solucion fiable para Internet abierta.
- Sin DNS adecuado, muchos destinatarios enviarán el correo a spam o lo rechazarán.
- `FRONTEND_URL` debe apuntar a una URL pública real si se quiere que los enlaces de verificación y reset funcionen fuera de local.
- El backend usa `SMTP_PASS`, no `SMTP_PASSWORD`.

## Comprobación rápida

```powershell
Set-Location backend
node test-smtp-quick.js destinatario@ejemplo.com
```

Si solo interesa verificar conectividad SMTP:

```powershell
Set-Location backend
node test-smtp-quick.js --verify-only
```

## Material complementario

- `docs/EMAIL_SMTP_SETUP.md`: configuración Gmail/App Password y pruebas rápidas.
- `backend/.env.example`: ejemplo local e híbrido.
- `backend/.env.production.example`: ejemplo orientado a salida real con relay.
Las rutas de email están protegidas con rate limiting:
- `forgot-password`: Máximo 5 intentos por hora
- `resend-verification`: Máximo 3 intentos por hora

### Prevención de Enumeración
- Siempre responder exitosamente aunque el email no exista
- No revelar si el usuario existe o no

## 🎯 Próximos Pasos (Opcional)

1. **Configuración DNS en Producción:**
   - SPF record
   - DKIM signing
   - DMARC policy

2. **Templates Personalizables:**
   - Variables dinámicas por empresa
   - Logos personalizados

3. **Analytics:**
   - Tracking de apertura de emails
   - Click tracking en enlaces

4. **Localización (i18n):**
   - Templates en múltiples idiomas
   - Detección automática de idioma del usuario

## 📝 Notas

- El sistema NO bloquea el registro si falla el envío de email
- Los emails se envían de forma asíncrona (no esperan respuesta)
- En desarrollo, usar MailHog para evitar enviar emails reales
- En producción sin DNS configurado, emails pueden ir a spam (pero funcionan)

## 📚 Recursos

- [Nodemailer Documentation](https://nodemailer.com/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [MailHog Repository](https://github.com/mailhog/MailHog)
- [Postfix Docker](https://github.com/mwader/postfix-relay)
