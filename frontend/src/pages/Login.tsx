import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Lock, AlertCircle, Shield } from 'lucide-react';

/**
 * Login Page - Traditional authentication only
 * Users login with username/email and password
 * Wallets are ONLY for signing blockchain transactions, NOT for login
 */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, pendingTwoFactor, verifyTwoFactor, cancelTwoFactorLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('El nombre de usuario y la contraseña son obligatorios');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ username, password });
      if (!result.requires2FA) {
        navigate(from, { replace: true });
      }
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

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!twoFactorCode.trim()) {
      setError('Introduzca un código 2FA o un código de respaldo');
      return;
    }

    setIsLoading(true);

    try {
      await verifyTwoFactor(twoFactorCode);
      setTwoFactorCode('');
      navigate(from, { replace: true });
    } catch (err: any) {
      let errorMessage = 'No se pudo verificar el segundo factor.';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isTwoFactorStep = !!pendingTwoFactor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              {isTwoFactorStep ? (
                <Shield className="w-8 h-8 text-primary-foreground" />
              ) : (
                <Lock className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
          </div>
          <CardTitle className="text-center">
            {isTwoFactorStep ? 'Verificación 2FA' : 'Iniciar Sesión - DocumentChain'}
          </CardTitle>
          <CardDescription className="text-center">
            {isTwoFactorStep
              ? `Segundo factor requerido para ${pendingTwoFactor?.user.username ?? 'la cuenta seleccionada'}`
              : 'Gestión segura de documentos en blockchain'}
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

          {notice && !isTwoFactorStep && (
            <Alert className="mb-4">
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}

          {isTwoFactorStep ? (
            <>
              <Alert className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Introduzca el código de su aplicación autenticadora o uno de sus códigos de respaldo.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Código 2FA o de respaldo</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.trim())}
                    placeholder="123456 o código de respaldo"
                    required
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                    onClick={() => {
                      cancelTwoFactorLogin();
                      setTwoFactorCode('');
                      setError(null);
                    }}
                  >
                    Volver
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Verificando...' : 'Verificar'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
