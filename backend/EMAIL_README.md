# Sistema de Correo Electrónico - DocumentChain

## Estado real del subsistema

El proyecto ya puede enviar correos desde el backend. Lo que cambia según el entorno es la estrategia de salida. En local, el backend suele entregar al Postfix del stack. Para Internet real, Postfix debería reenviar a través de un relay SMTP con reputación suficiente.

## Qué funciona ya

- Verificación de cuenta
- Reenvío de verificación
- Restablecimiento de contraseña
- Confirmación de cambio de contraseña
- Documento compartido
- Alertas de seguridad
- Bienvenida

## Regla funcional actual

- El alta de usuario no exige haber verificado el correo en ese mismo momento.
- El acceso con usuario y contraseña sí queda bloqueado hasta confirmar el correo.
- La vista `/verify-email` permite confirmar el token y, si el usuario ya tiene sesión abierta pero sigue sin verificar, solicitar un nuevo enlace desde la propia interfaz.

Las plantillas HTML están en `backend/src/templates/emails/` y el servicio responsable es `backend/src/services/emailService.ts`.

## Configuracion recomendada

### Entorno local o demo tecnica con Postfix directo

```env
SMTP_HOST="localhost"
SMTP_PORT="1587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@documentchain.local"
EMAIL_FROM_NAME="DocumentChain"
FRONTEND_URL="https://localhost:5173"
```

Con esta configuracion la aplicacion entrega al Postfix del proyecto y Postfix intenta el envio directo. Es la opcion adecuada si no quieres depender de terceros y solo necesitas validar el flujo tecnico del TFG.

### Salida real a Internet mediante relay

```env
SMTP_HOST="localhost"
SMTP_PORT="1587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""

SMTP_RELAYHOST="[smtp.gmail.com]:587"
SMTP_RELAYHOST_USERNAME="cuenta-salida@tudominio.com"
SMTP_RELAYHOST_PASSWORD="credencial-smtp"
POSTFIX_SMTP_TLS_SECURITY_LEVEL="encrypt"
POSTFIX_HOSTNAME="mail.tudominio.com"
ALLOWED_SENDER_DOMAINS="tudominio.com"
MASQUERADED_DOMAINS="tudominio.com"
POSTFIX_DKIM_AUTOGENERATE="false"

EMAIL_FROM="cuenta-salida@tudominio.com"
EMAIL_FROM_NAME="DocumentChain"
FRONTEND_URL="https://tudominio.com"
```

## Que no conviene prometer

- La entrega directa desde Postfix sin relay no debe tratarse como solución fiable para producción.
- Sin SPF, DKIM, DMARC y PTR, parte del correo acabará en spam o se rechazará.
- `localhost` no sirve como URL final para enlaces de verificación o cambio de contraseña.

## Comprobaciones rápidas

```powershell
docker compose ps
docker logs documentchain-postfix

Set-Location backend
node test-smtp-quick.js --verify-only
node test-smtp-quick.js destinatario@ejemplo.com
```

## Si el correo no llega

1. Verifica que `documentchain-postfix` esté levantado.
2. Comprueba que `SMTP_HOST` y `SMTP_PORT` del backend coinciden con el modo de ejecución.
3. Si usas relay, revisa `SMTP_RELAYHOST`, usuario, contraseña y nivel TLS.
4. Si usas Gmail o proveedor equivalente, revisa autenticación, límites y remitente permitido.
5. Si usas entrega directa, asume que el problema puede ser reputación o bloqueo externo aunque el código funcione.

## Referencias dentro del proyecto

- `backend/EMAIL_SYSTEM.md`
- `docs/EMAIL_SMTP_SETUP.md`
- `backend/.env.example`
- `backend/.env.production.example`

## 🎓 Producción Futura

Para evitar spam en producción:

1. **Dominio real:** `documentchain.com`
2. **VPS con IP dedicada**
3. **Configurar DNS:**
   ```
   SPF:   v=spf1 ip4:TU.IP.PUBLICA ~all
   DKIM:  Firma criptográfica de emails
   DMARC: Política de autenticación
   ```
4. **Reverse DNS (PTR record)**
5. **Certificado SSL/TLS**

Pero para desarrollo/demos, **funciona perfecto tal como está** ✅
