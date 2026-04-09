# Creación de Usuarios Administradores

## Crear el Primer Admin

### 1. Generar un Secret Seguro

Primero, genera un secret aleatorio seguro:

```bash
# En Linux/Mac
openssl rand -base64 32

# En Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. Configurar el Secret en .env

Añade el secret generado a tu archivo `.env`:

```env
ADMIN_REGISTRATION_SECRET="tu-secret-generado-aqui"
```

**⚠️ IMPORTANTE:**
- Este secret es **CRÍTICO** para la seguridad
- Guárdalo en un lugar seguro
- NO lo compartas con nadie que no deba ser admin
- NO lo subas a repositorios públicos
- En producción, usa un gestor de secretos (AWS Secrets Manager, Azure Key Vault, etc.)

### 3. Registrar el Primer Admin

#### Opción A: Desde la UI de Registro

1. Ve a la página de registro: `https://tu-dominio.com/register`
2. Completa el formulario normalmente
3. En la consola del navegador (F12), ejecuta:

```javascript
// Antes de hacer submit, añade el campo adminSecret al formulario
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  data.adminSecret = 'tu-secret-de-env-aqui';
  
  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()).then(console.log);
});
```

#### Opción B: Desde cURL/Postman

```bash
curl -X POST https://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "TuPasswordSeguro123!",
    "fullName": "System Administrator",
    "adminSecret": "tu-secret-de-env-aqui"
  }'
```

#### Opción C: Desde PowerShell

```powershell
$body = @{
    username = "admin"
    email = "admin@example.com"
    password = "TuPasswordSeguro123!"
    fullName = "System Administrator"
    adminSecret = "tu-secret-de-env-aqui"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://localhost:3001/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -SkipCertificateCheck  # Solo en desarrollo con SSL autofirmado
```

### 4. Verificar que el Admin fue Creado

Inicia sesión con las credenciales del admin y verifica que:
- Puedes acceder a `/app/dashboard` (solo visible para admins)
- El badge en el perfil dice "Admin"
- Tienes acceso a las rutas de administración

## Crear Admins Adicionales

### Opción 1: Manual (con el mismo secret)

Repite el proceso anterior con el mismo `ADMIN_REGISTRATION_SECRET` para crear más admins.

### Opción 2: UI de Gestión de Usuarios (Recomendado - TODO)

**Funcionalidad pendiente de implementar:**
- Panel de administración en `/app/dashboard`
- Lista de usuarios con opción de cambiar rol
- Endpoint `PUT /api/admin/users/:userId/role`

Implementación sugerida:

```typescript
// backend/src/controllers/adminController.ts
static async updateUserRole(req: Request, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { userId } = req.params;
  const { role } = req.body; // 'USER' | 'ADMIN'
  
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  
  res.json({ message: 'User role updated' });
}
```

## Seguridad

### Mejores Prácticas

1. **Rotar el Secret**: Después de crear los admins necesarios, considera rotar `ADMIN_REGISTRATION_SECRET`
2. **Auditoría**: Implementa logs de quién crea admins y cuándo
3. **Límite de Admins**: Considera limitar el número total de admins
4. **2FA Obligatorio**: Requiere 2FA para cuentas admin
5. **Producción**: Usa gestores de secretos profesionales

### Revocar Acceso Admin

Para convertir un admin en usuario normal:

```sql
-- Conecta a PostgreSQL
UPDATE "User" SET role = 'USER' WHERE username = 'nombre-del-admin';
```

O desde código:

```typescript
await prisma.user.update({
  where: { username: 'nombre-del-admin' },
  data: { role: 'USER' }
});
```

## Variables de Entorno

Asegúrate de tener configurado en `.env`:

```env
# Admin Registration Secret
# Solo usuarios que conozcan este secret pueden registrarse como admin
ADMIN_REGISTRATION_SECRET="tu-secret-super-seguro-aqui"
```

## Troubleshooting

### "No veo el Dashboard"
- Verifica que tu usuario tenga `role: 'ADMIN'` en la base de datos
- Comprueba que el secret usado durante registro coincida con el de `.env`
- Revisa los logs del servidor para ver si el usuario se creó como ADMIN

### "El secret no funciona"
- Asegúrate de que no hay espacios extra en el `.env`
- Verifica que reiniciaste el servidor después de cambiar `.env`
- Comprueba que el secret sea exactamente el mismo (case-sensitive)

### "Error 403 en rutas de admin"
- Verifica que el middleware `isAdmin` esté aplicado correctamente
- Comprueba que el token JWT contenga el role correcto
- Puede que necesites cerrar sesión y volver a iniciar después de ser promovido a admin
