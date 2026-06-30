import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../lib/api';
import { KeyManager } from '../lib/crypto/KeyManager';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import AlertMessage from '../components/ui/AlertMessage';
import { Lock, Shield } from 'lucide-react';

/**
 * Página para restablecer la contraseña mediante token y clave de recuperación.
 *
 * Flujo en dos fases:
 * 1. Verifica el token y la clave de recuperación contra el servidor
 *    (POST /auth/reset-password/verify). El backend devuelve encryptedPrivateKeyRecovery.
 * 2. Descifra la clave privada con la recovery key en el navegador,
 *    la re-cifra con la nueva contraseña y confirma el restablecimiento
 *    (POST /auth/reset-password).
 *
 * Aplica reglas de complejidad de contraseña antes de enviar.
 *
 * @returns JSX.Element con el formulario de restablecimiento de contraseña.
 */
export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    recoveryKey: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /**
   * Actualiza el estado del formulario cuando cambia un campo de entrada.
   *
   * @param e - Evento de cambio del input.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Valida que el token, la clave de recuperación y la nueva contraseña
   * cumplan con los requisitos de seguridad establecidos.
   *
   * @returns `true` si todos los campos son válidos, `false` en caso contrario.
   */
  const validateForm = (): boolean => {
    if (!token) {
      setError('Token de restablecimiento inválido o faltante');
      return false;
    }

    if (!formData.recoveryKey.trim()) {
      setError('La clave de recuperación es obligatoria');
      return false;
    }

    if (!formData.newPassword.trim()) {
      setError('La nueva contraseña es obligatoria');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      setError('La contraseña debe contener al menos una letra mayúscula');
      return false;
    }

    if (!/[a-z]/.test(formData.newPassword)) {
      setError('La contraseña debe contener al menos una letra minúscula');
      return false;
    }

    if (!/[0-9]/.test(formData.newPassword)) {
      setError('La contraseña debe contener al menos un número');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  /**
   * Gestiona el envío del formulario de restablecimiento de contraseña.
   *
   * Verifica la validez del formulario, envía los datos al servidor y,
   * tras el éxito, programa la redirección al inicio de sesión.
   *
   * @param e - Evento del formulario.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Fase A: Verificar token + recovery key, obtener datos de recuperación
      const verifyResult = await authApi.resetPasswordVerify({
        token: token!,
        recoveryKey: formData.recoveryKey,
      });

      // Descifrar clave privada con recovery key y re-cifrar con nueva contraseña
      const privateKeyPem = await KeyManager.decryptPrivateKeyWithRecovery(
        verifyResult.encryptedPrivateKeyRecovery,
        formData.recoveryKey,
        verifyResult.recoveryKeySalt ?? undefined,
      );
      const newEncrypted = await KeyManager.encryptPrivateKey(
        privateKeyPem,
        formData.newPassword,
      );
      const newSalt = newEncrypted.split(':')[0];

      // Fase B: Confirmar restablecimiento
      await authApi.resetPassword({
        token: token!,
        newEncryptedPrivateKey: newEncrypted,
        newSalt,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      
      timerRef.current = setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.16),_transparent_30%),linear-gradient(135deg,#0f172a_0%,#111c30_45%,#0b1324_100%)] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertMessage
              type="error"
              message="Token de restablecimiento inválido o faltante. Por favor, solicite un nuevo enlace de restablecimiento de contraseña."
            />
            <Link to="/login" className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium">
              Volver al Inicio de Sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.16),_transparent_30%),linear-gradient(135deg,#0f172a_0%,#111c30_45%,#0b1324_100%)] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              ¡Contraseña Restablecida con Éxito!
            </h2>
            <p className="mb-4 text-muted-foreground">
              Su contraseña ha sido restablecida correctamente.
            </p>
            <p className="text-sm text-green-600 font-medium">
              &#10003; Todos sus documentos siguen siendo accesibles
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Redirigiendo a la página de inicio de sesión...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.16),_transparent_30%),linear-gradient(135deg,#0f172a_0%,#111c30_45%,#0b1324_100%)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] p-3 rounded-full shadow-[0_0_24px_rgba(14,165,233,0.24)]">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            Restablecer Su Contraseña
          </CardTitle>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Introduzca su clave de recuperación y nueva contraseña. Si solo necesita acceder desde otro dispositivo y recuerda su contraseña, puede introducir la misma.
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <AlertMessage type="error" message={error} onClose={() => setError(null)} className="mb-4" />
          )}

          {/* Alerta informativa */}
          <AlertMessage
            type="info"
            message="Necesita su clave de recuperación (recibida durante el registro) para restablecer su contraseña y mantener el acceso a sus documentos cifrados."
            className="mb-4"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Clave de Recuperación"
                name="recoveryKey"
                type="text"
                value={formData.recoveryKey}
                onChange={handleChange}
                placeholder="Introduzca su clave de recuperación"
                required
                disabled={isLoading}
                helperText="La clave de recuperación que guardó al crear su cuenta"
              />
            </div>

            <div>
              <Input
                label="Nueva Contraseña"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Cree una nueva contraseña"
                required
                disabled={isLoading}
                helperText="Al menos 8 caracteres, con mayúscula, minúscula y número"
              />
            </div>

            <div>
              <Input
                label="Confirmar Nueva Contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Vuelva a introducir la nueva contraseña"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? 'Restableciendo contraseña...' : 'Restablecer Contraseña'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Recuerda su contraseña?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-blockchain-700">
                Inicie sesión aquí
              </Link>
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50/85 p-3">
            <p className="text-xs text-warning-800">
              <strong>¿Perdió su clave de recuperación?</strong> Lamentablemente, sin su clave de recuperación, 
              no podemos ayudarle a restablecer su contraseña manteniendo el acceso a sus documentos cifrados. 
              Esto es una característica de seguridad para proteger sus datos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
