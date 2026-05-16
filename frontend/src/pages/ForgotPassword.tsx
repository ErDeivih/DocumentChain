import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Mail, ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';

/**
 * Página para solicitar el restablecimiento de contraseña.
 *
 * Permite al usuario introducir su correo electrónico para recibir
 * un enlace de recuperación que incluye un token de un solo uso.
 *
 * @returns JSX.Element con el formulario de recuperación de contraseña.
 */
export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Valida el formato de una dirección de correo electrónico.
   *
   * @param email - Dirección de correo a validar.
   * @returns `true` si el email cumple con el patrón estándar, `false` en caso contrario.
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Gestiona el envío del formulario de recuperación de contraseña.
   *
   * Verifica que el email no esté vacío y sea válido antes de invocar la API
   * de autenticación para solicitar el restablecimiento.
   *
   * @param e - Evento del formulario.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('El email es obligatorio');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, introduzca un email válido');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email de restablecimiento. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(135deg,#f4fbff_0%,#e7f3fb_48%,#eef7ff_100%)] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Compruebe Su Email
            </h2>
            <p className="mb-4 text-muted-foreground">
              Si existe una cuenta con ese email, le hemos enviado un enlace para restablecer su contraseña.
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              El enlace expirará en 1 hora.
            </p>
            <Link to="/login">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio de Sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(135deg,#f4fbff_0%,#e7f3fb_48%,#eef7ff_100%)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-center">
            ¿Olvidó Su Contraseña?
          </CardTitle>
          <CardDescription className="text-center">
            Introduzca su email para recibir un enlace de restablecimiento
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Mensajes de error y advertencia */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Importante: Necesitará su clave de recuperación (recibida durante el registro) para completar el proceso de restablecimiento de contraseña.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Dirección de Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="su@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio de Sesión
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50/80 p-3 backdrop-blur-sm">
            <p className="text-xs text-foreground">
              <strong>Nota de Seguridad:</strong> Para su protección, no confirmaremos si existe una cuenta 
              con este email. Si no recibe un email en unos minutos, compruebe su 
              carpeta de spam o verifique que está usando la dirección de email correcta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
