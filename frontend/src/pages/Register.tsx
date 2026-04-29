import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { Progress } from '../components/ui/Progress';
import { RecoveryKeyDisplay } from '../components/auth/RecoveryKeyDisplay';
import { UserPlus, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

/**
 * Register Page - Traditional authentication
 * Users register with username, email, and password
 * Password is used to encrypt the user's RSA private key (generated in frontend)
 * Wallets are ONLY for signing blockchain transactions, NOT for registration/login
 */
export const Register: React.FC = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    if (formData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, introduzca un email válido');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      });

      // Show recovery key if present
      if (result.recoveryKey) {
        setRecoveryKey(result.recoveryKey);
        setShowRecoveryModal(true);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo completar el registro. Inténtelo de nuevo.');
      console.error('Error de registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryModalClose = () => {
    setShowRecoveryModal(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(135deg,#f4fbff_0%,#e7f3fb_48%,#eef7ff_100%)] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8 space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-green-500 p-3 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              ¡Cuenta creada con éxito!
            </h2>

            {/* Prominent email verification notice */}
            <Alert className="border-amber-400 bg-amber-50 text-left">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 font-semibold">
                Verifica tu correo electrónico
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                Hemos enviado un enlace de verificación a tu dirección de correo.
                Debes verificarlo <strong>antes de iniciar sesión</strong> para poder
                acceder a tus documentos.
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">
              ¿No has recibido el correo? Revisa tu carpeta de spam.
            </p>

            <Link to="/login">
              <Button className="w-full mt-2">Ir a Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(135deg,#f4fbff_0%,#e7f3fb_48%,#eef7ff_100%)] p-4">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-center">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-center">
            Cree su cuenta en DocumentChain
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Alert variant="info" className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertTitle>Su Contraseña Protege Sus Archivos</AlertTitle>
                <AlertDescription className="text-xs">
                  Su contraseña cifra su clave privada RSA, que se usa para proteger todos sus documentos.
                  Elija una contraseña fuerte para proteger su información.
                </AlertDescription>
              </Alert>

              <Alert variant="info" className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertTitle>Wallet en un paso posterior</AlertTitle>
                <AlertDescription className="text-xs">
                  La wallet se enlaza más adelante desde el perfil, una vez verificado el correo e iniciada la sesión.
                </AlertDescription>
              </Alert>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Elija un nombre de usuario"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Al menos 3 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="su@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo (opcional)</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Su nombre completo"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Cree una contraseña"
                  required
                  disabled={isLoading}
                />
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Fortaleza de la contraseña</span>
                      <span className={`font-medium ${
                        passwordStrength < 40 ? 'text-error-500' :
                        passwordStrength < 70 ? 'text-warning-500' :
                        'text-success-500'
                      }`}>
                        {passwordStrength < 40 ? 'Débil' : passwordStrength < 70 ? 'Media' : 'Fuerte'}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Vuelva a introducir la contraseña"
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
                {isLoading ? 'Creando cuenta...' : 'Registrarse'}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tiene una cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Inicie sesión aquí
              </Link>
            </p>
          </div>
        </CardContent>

        {/* Recovery Key Modal */}
        {recoveryKey && (
          <RecoveryKeyDisplay
            isOpen={showRecoveryModal}
            recoveryKey={recoveryKey}
            onClose={handleRecoveryModalClose}
          />
        )}
      </Card>
    </div>
  );
};
