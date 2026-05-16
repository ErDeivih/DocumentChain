import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Lock, AlertCircle } from 'lucide-react';

/**
 * Página de inicio de sesión mediante autenticación tradicional.
 *
 * Permite a los usuarios acceder con su nombre de usuario o correo electrónico
 * y contraseña.
 * Las wallets se utilizan exclusivamente para firmar transacciones en blockchain,
 * nunca para autenticarse.
 *
 * @returns JSX.Element con el formulario de inicio de sesión.
 */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/app/documents';
  const attemptedIdentifier = username.trim();
  const loginNeedsEmailVerification = !!error && /verificar tu email/i.test(error);

  useEffect(() => {
    const storedNotice = sessionStorage.getItem('loginNotice');
    if (storedNotice) {
      setNotice(storedNotice);
      sessionStorage.removeItem('loginNotice');
    }
  }, []);

  /**
   * Gestiona el envío del formulario de credenciales.
   *
  * Valida los campos obligatorios, ejecuta el login y redirige al usuario
  * en caso de exito.
   *
   * @param e - Evento del formulario.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('El nombre de usuario y la contraseña son obligatorios');
      return;
    }

    setIsLoading(true);

    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      // Extract detailed error message from API response
      let errorMessage = 'Error al iniciar sesión. Por favor, verifique sus credenciales.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error de login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(135deg,#f4fbff_0%,#e7f3fb_48%,#eef7ff_100%)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-center">
            Iniciar Sesión - DocumentChain
          </CardTitle>
          <CardDescription className="text-center">
            Gestión segura de documentos en blockchain
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>{error}</p>
                  {loginNeedsEmailVerification ? (
                    <Link
                      to="/verify-email"
                      state={{
                        emailNotVerified: true,
                        email: attemptedIdentifier.includes('@') ? attemptedIdentifier : '',
                      }}
                      className="inline-flex text-sm font-medium text-primary hover:underline"
                    >
                      Reenviar verificación
                    </Link>
                  ) : null}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {notice && (
            <Alert className="mb-4">
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario o Email</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Introduzca su nombre de usuario o email"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduzca su contraseña"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tiene una cuenta?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Regístrese aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
