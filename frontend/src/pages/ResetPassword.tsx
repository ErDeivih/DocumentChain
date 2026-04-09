import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import AlertMessage from '../components/ui/AlertMessage';
import { Lock, Shield } from 'lucide-react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({
        token: token!,
        recoveryKey: formData.recoveryKey,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Contraseña Restablecida con Éxito!
            </h2>
            <p className="text-gray-600 mb-4">
              Su contraseña ha sido restablecida correctamente.
            </p>
            <p className="text-sm text-green-600 font-medium">
              &#10003; Todos sus documentos siguen siendo accesibles
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Redirigiendo a la página de inicio de sesión...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            Restablecer Su Contraseña
          </CardTitle>
          <p className="text-center text-gray-600 text-sm mt-2">
            Introduzca su clave de recuperación y nueva contraseña
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
            <p className="text-sm text-gray-600">
              ¿Recuerda su contraseña?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Inicie sesión aquí
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
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
