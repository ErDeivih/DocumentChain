# Configuración de Gmail SMTP para Producción

Este documento explica cómo configurar Gmail como servidor SMTP para enviar emails reales desde DocumentChain.

## Requisitos Previos

- Cuenta de Gmail activa
- Autenticación de 2 factores (2FA) activada
- Acceso a la configuración de seguridad de Google

## Pasos para Configuración

### 1. Activar Autenticación de 2 Factores (2FA)

Si aún no tienes 2FA activado:

1. Ve a [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. En la sección "Cómo inicias sesión en Google", haz clic en "Verificación en dos pasos"
3. Sigue las instrucciones para activar 2FA

### 2. Generar App Password

Una App Password es una contraseña de 16 caracteres que permite a aplicaciones acceder a tu cuenta de Gmail de forma segura.

1. Ve a [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Es posible que te pida iniciar sesión de nuevo
3. En "Seleccionar app", elige **Mail**
4. En "Seleccionar dispositivo", elige **Otro (nombre personalizado)**
5. Escribe un nombre descriptivo como "DocumentChain Backend"
6. Haz clic en **Generar**
7. Google te mostrará una contraseña de 16 caracteres (ejemplo: `abcd efgh ijkl mnop`)
8. **IMPORTANTE:** Copia esta contraseña inmediatamente, no podrás verla de nuevo

### 3. Configurar el Backend

Edita el archivo `backend/.env` y actualiza las siguientes variables:

```env
# Gmail SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"  # App Password generado
EMAIL_FROM="tu-email@gmail.com"
EMAIL_FROM_NAME="DocumentChain"
```

**Notas:**
- `SMTP_PASS`: Pega la App Password tal como te la dio Google (con o sin espacios, ambos funcionan)
- `SMTP_USER` y `EMAIL_FROM`: Deben ser el mismo email de Gmail

### 4. Verificar la Configuración

Una vez configurado, prueba el envío de emails:

```powershell
cd E:\Universidad\tfg\backend
node test-smtp-quick.js
```

Deberías ver:

```
✅ Conexión SMTP exitosa
✅ Email enviado: <message-id>
✅ ¡SMTP funcionando correctamente!
```

### 5. Reiniciar el Sistema

Reinicia el backend para que tome los nuevos valores:

```powershell
# Detener procesos
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Iniciar de nuevo
.\start-dev.ps1
```

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causa:** La App Password no es correcta o no está configurada.

**Solución:**
1. Verifica que hayas copiado la App Password completa (16 caracteres)
2. Asegúrate de que 2FA esté activado
3. Genera una nueva App Password si es necesario

### Error: "Unexpected socket close"

**Causa:** Problemas de conexión o configuración incorrecta del puerto.

**Solución:**
1. Verifica que `SMTP_PORT="587"` (no 465)
2. Verifica que `SMTP_SECURE="false"` (usar STARTTLS)
3. Asegúrate de tener conexión a internet

### Error: "Authentication failed"

**Causa:** Gmail bloqueó el acceso por seguridad.

**Solución:**
1. Ve a [https://accounts.google.com/DisplayUnlockCaptcha](https://accounts.google.com/DisplayUnlockCaptcha)
2. Haz clic en "Continue"
3. Intenta enviar el email de nuevo

### Emails llegan a spam

**Causa:** Gmail detecta el contenido como sospechoso.

**Solución:**
1. Verifica que el contenido del email no parezca spam
2. Marca el email como "No es spam" en tu cliente de correo
3. Considera configurar SPF/DKIM en producción (más avanzado)

## Límites de Envío de Gmail

Gmail tiene límites de envío para evitar spam:

- **Cuentas gratuitas:** ~100-150 emails por día
- **Google Workspace:** ~2000 emails por día

Si necesitas enviar más emails, considera servicios profesionales como:
- SendGrid
- Amazon SES
- Mailgun
- Postmark

## Seguridad

⚠️ **IMPORTANTE:**

- **NUNCA** compartas tu App Password
- **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
- **NUNCA** expongas la App Password en logs o código público
- Si crees que la App Password fue comprometida, revócala inmediatamente en [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

## Alternativa para Desarrollo: MailHog

Si solo necesitas testing local sin enviar emails reales, puedes usar MailHog:

1. Descomenta la sección de MailHog en `docker-compose.yml`
2. Actualiza `backend/.env`:
   ```env
   SMTP_HOST="localhost"
   SMTP_PORT="1025"
   SMTP_SECURE="false"
   ```
3. Accede a la UI web en http://localhost:8025 para ver los emails capturados

MailHog captura todos los emails sin enviarlos realmente, ideal para desarrollo.

## Referencias

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Nodemailer Gmail Configuration](https://nodemailer.com/usage/using-gmail/)
