# Configuración de Postfix para DocumentChain

Este documento explica cómo usar tu **propio servidor SMTP Postfix** en lugar de servicios externos como Gmail o MailHog.

## ¿Por qué Postfix?

### Ventajas
- ✅ **Control total:** Tu propio servidor de correo
- ✅ **Sin límites:** No hay restricciones de envío como Gmail (100 emails/día)
- ✅ **Sin dependencias externas:** No necesitas cuentas de terceros
- ✅ **Emails reales:** Los emails se envían de verdad (no solo capturados como MailHog)
- ✅ **Gratuito:** No cuesta nada

### Desventajas
- ⚠️ **Puede ir a spam:** Sin configuración DNS/SPF/DKIM, muchos proveedores lo marcarán como spam
- ⚠️ **Solo para desarrollo/testing:** No recomendado para producción sin configuración avanzada
- ⚠️ **Requiere Docker:** Postfix corre en un container

## Configuración Actual

### 1. Docker Container

Postfix está configurado en `docker-compose.yml`:

```yaml
postfix:
  image: catatnight/postfix:latest
  container_name: documentchain-postfix
  ports:
    - "25:25"  # Puerto SMTP estándar
  environment:
    - maildomain=documentchain.local
    - smtp_user=documentchain:documentchain
  volumes:
    - ./postfix-config:/etc/postfix/custom:ro
```

### 2. Backend Configuration

El backend usa Postfix en `backend/.env`:

```env
SMTP_HOST="localhost"
SMTP_PORT="25"
SMTP_SECURE="false"
SMTP_USER=""  # Sin autenticación para localhost
SMTP_PASS=""  # Sin autenticación para localhost
EMAIL_FROM="noreply@documentchain.local"
```

### 3. Custom Postfix Config

Configuración personalizada en `postfix-config/main.cf`:

- **mynetworks:** Permite relay desde localhost y Docker sin autenticación
- **Timeouts aumentados:** Evita el error "Unexpected socket close"
- **Relay abierto:** Solo para redes locales (desarrollo)
- **Sin autenticación:** Simplifica el desarrollo
- **Logs verbosos:** Facilita debugging

## Iniciar Postfix

### Opción 1: Docker Compose

```powershell
cd E:\Universidad\tfg
docker-compose up -d postfix
```

### Opción 2: Script Automatizado

El script `start-dev.ps1` ya está preparado para iniciar Postfix:

```powershell
.\start-dev.ps1
```

### Verificar que Postfix está corriendo

```powershell
docker ps --filter "name=documentchain-postfix"
```

Deberías ver:
```
NAMES                   STATUS              PORTS
documentchain-postfix   Up X seconds        0.0.0.0:25->25/tcp
```

## Testing

### 1. Verificar Conexión SMTP

El backend incluye un script de testing:

```powershell
cd E:\Universidad\tfg\backend
node test-smtp-quick.js
```

**Output esperado:**
```
Probando conexión SMTP...
✅ Conexión SMTP exitosa
Enviando email de prueba...
✅ Email enviado: <message-id>
✅ ¡SMTP funcionando correctamente!
```

### 2. Ver Logs de Postfix

```powershell
docker logs documentchain-postfix --tail 50 -f
```

Busca líneas como:
```
postfix/smtp[XXX]: XXXXXXXX: to=<destino@example.com>, relay=..., status=sent
```

### 3. Probar desde la Aplicación

1. Inicia el sistema completo:
   ```powershell
   .\start-dev.ps1
   ```

2. Regístrate en DocumentChain: http://localhost:5173/register

3. Deberías recibir un email de verificación

   **Si no llega a Gmail/Outlook:** Revisa la carpeta de **spam** (es normal sin SPF/DKIM)

## Problema Resuelto: "Unexpected socket close"

### Causa del Problema

El error ocurría porque:

1. **Puerto 587 requiere STARTTLS:** Intentar conectar sin TLS correcto causaba cierre de socket
2. **Timeouts por defecto muy cortos:** Postfix cerraba conexiones rápidamente
3. **Autenticación mal configurada:** Intentar auth con credenciales vacías fallaba
4. **Conflictos con HTTPS del backend:** El backend usa SSL, pero eso NO afecta SMTP

### Solución Implementada

1. ✅ **Puerto 25 en lugar de 587:** SMTP plano sin TLS (adecuado para localhost)
2. ✅ **Sin autenticación:** Relay permitido desde localhost sin credenciales
3. ✅ **Timeouts aumentados en main.cf:**
   ```
   smtp_connect_timeout = 60s
   smtp_data_xfer_timeout = 300s
   ```
4. ✅ **Relay abierto solo para redes locales:**
   ```
   mynetworks = 127.0.0.0/8, 172.0.0.0/8, 192.168.0.0/16
   ```

### HTTPS del Backend NO Afecta SMTP

El backend corre en **HTTPS (puerto 3000)**, pero esto es **independiente de SMTP**:

- ✅ Backend HTTPS: `https://localhost:3000`
- ✅ SMTP Postfix: `smtp://localhost:25`
- ✅ Son protocolos diferentes, no hay conflicto
- ✅ Nodemailer maneja ambos correctamente

El flag `tls: { rejectUnauthorized: false }` en `emailService.ts` solo aplica si SMTP_SECURE=true (TLS), que no es el caso con puerto 25.

## Por Qué los Emails Pueden Ir a Spam

### Sin Configuración DNS/SPF/DKIM

Los proveedores de email (Gmail, Outlook, etc.) verifican:

1. **SPF (Sender Policy Framework):**
   - Verifica que tu IP está autorizada para enviar desde `@documentchain.local`
   - ❌ Sin registro DNS SPF → marcado como sospechoso

2. **DKIM (DomainKeys Identified Mail):**
   - Firma criptográfica que prueba que el email es legítimo
   - ❌ Sin firma DKIM → marcado como sospechoso

3. **DMARC (Domain-based Message Authentication):**
   - Política de autenticación del dominio
   - ❌ Sin política DMARC → marcado como sospechoso

4. **Reverse DNS (PTR):**
   - Tu IP debe tener un registro PTR válido
   - ❌ Localhost sin PTR → marcado como sospechoso

5. **Reputación de IP:**
   - Enviar desde IP residencial/dinámica es sospechoso
   - ❌ Nueva IP sin historial → marcado como sospechoso

### ¿Cómo Arreglar Spam? (Producción Avanzada)

Para producción, necesitarías:

1. **Dominio real:** Comprar `documentchain.com`
2. **Servidor VPS con IP estática:** AWS, DigitalOcean, etc.
3. **Configurar DNS:**
   ```dns
   documentchain.com.  IN  MX  10  mail.documentchain.com.
   documentchain.com.  IN  TXT "v=spf1 ip4:TU.IP.PUBLICA.AQUI ~all"
   _dmarc.documentchain.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:admin@documentchain.com"
   ```
4. **Configurar DKIM en Postfix**
5. **Reverse DNS (PTR):** Configurar en tu proveedor de VPS
6. **Warming up:** Enviar emails gradualmente para construir reputación

**Esto es complejo y toma tiempo.** Por eso servicios como SendGrid, MailGun, Amazon SES existen.

## Alternativas para Producción

Si DocumentChain va a producción, considera:

### Servicios SMTP Profesionales

1. **SendGrid** (Twilio)
   - 100 emails/día gratis
   - Configuración SPF/DKIM automática
   - https://sendgrid.com/

2. **Amazon SES**
   - $0.10 por cada 1,000 emails
   - Integrado con AWS
   - Excelente deliverability
   - https://aws.amazon.com/ses/

3. **Mailgun**
   - 5,000 emails/mes gratis (3 meses)
   - API potente
   - https://www.mailgun.com/

4. **Postmark**
   - 100 emails/mes gratis
   - Especializado en transactional emails
   - https://postmarkapp.com/

5. **Brevo (ex-Sendinblue)**
   - 300 emails/día gratis
   - UI amigable
   - https://www.brevo.com/

### Configurar es Fácil

Cambiar de Postfix a cualquiera de estos servicios es simple:

```env
# Ejemplo: SendGrid
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="true"
SMTP_USER="apikey"
SMTP_PASS="TU_API_KEY_DE_SENDGRID"
EMAIL_FROM="noreply@documentchain.com"
```

## Resumen de Decisiones

| Escenario | Recomendación |
|-----------|---------------|
| **Desarrollo local** | ✅ Postfix (ya configurado) |
| **Testing/Demo** | ✅ Postfix o MailHog |
| **Producción pequeña** | ⚠️ SendGrid/Brevo (gratis) |
| **Producción grande** | ⚠️ Amazon SES/Mailgun |
| **Control total** | ⚠️ Postfix en VPS con DNS configurado |

## Comandos Útiles

### Iniciar Postfix
```powershell
docker-compose up -d postfix
```

### Detener Postfix
```powershell
docker-compose stop postfix
```

### Ver logs en tiempo real
```powershell
docker logs -f documentchain-postfix
```

### Reiniciar Postfix
```powershell
docker-compose restart postfix
```

### Eliminar y recrear Postfix
```powershell
docker-compose down postfix
docker-compose up -d postfix
```

### Verificar puerto 25
```powershell
Test-NetConnection -ComputerName localhost -Port 25
```

### Test manual SMTP
```powershell
telnet localhost 25
# Luego escribir:
HELO documentchain.local
MAIL FROM:<test@documentchain.local>
RCPT TO:<tu-email@gmail.com>
DATA
Subject: Test

Este es un email de prueba desde Postfix.
.
QUIT
```

## Solución de Problemas

### Error: "Connection refused" en puerto 25

**Causa:** Postfix no está corriendo o el puerto está bloqueado.

**Solución:**
```powershell
docker-compose up -d postfix
docker ps --filter "name=postfix"
Test-NetConnection localhost -Port 25
```

### Error: "Unexpected socket close" (DE NUEVO)

**Causa:** Configuración incorrecta o timeouts.

**Solución:**
1. Verifica `backend/.env`:
   ```env
   SMTP_PORT="25"  # NO 587
   SMTP_SECURE="false"
   ```
2. Reinicia Postfix:
   ```powershell
   docker-compose restart postfix
   ```
3. Revisa logs:
   ```powershell
   docker logs documentchain-postfix --tail 100
   ```

### Emails no llegan (ni a spam)

**Causa:** Proveedor de email bloqueó completamente.

**Solución:**
1. Revisa logs de Postfix:
   ```powershell
   docker logs documentchain-postfix | Select-String "status="
   ```
2. Busca errores como:
   - `status=bounced` (rebotado)
   - `Relay access denied` (relay bloqueado)
   - `Host not found` (DNS no resuelve)

3. Prueba enviar a otro email (Outlook, Yahoo)

### Puerto 25 bloqueado por ISP

**Causa:** Algunos ISPs bloquean puerto 25 para evitar spam.

**Solución:**
1. Usar puerto alternativo (2525):
   ```yaml
   # docker-compose.yml
   ports:
     - "2525:25"
   ```
   ```env
   # backend/.env
   SMTP_PORT="2525"
   ```

2. O usar servicios cloud (SendGrid, etc.)

## Referencias

- [Postfix Documentation](http://www.postfix.org/documentation.html)
- [Docker Image: catatnight/postfix](https://hub.docker.com/r/catatnight/postfix)
- [Understanding SPF](https://www.cloudflare.com/learning/dns/dns-records/dns-spf-record/)
- [Understanding DKIM](https://www.cloudflare.com/learning/dns/dns-records/dns-dkim-record/)
