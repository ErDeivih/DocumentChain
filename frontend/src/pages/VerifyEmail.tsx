import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MailCheck, XCircle } from 'lucide-react';
import { emailApi, getEmailVerificationErrorMessage } from '../api/email';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import AlertMessage from '../components/ui/AlertMessage';

type VerificationStatus = 'loading' | 'success' | 'error';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Verificando tu email...');
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const verifyEmail = async () => {
      if (!token) {
        if (!isActive) {
          return;
        }

        setStatus('error');
        setMessage('El enlace de verificación no es válido o no incluye token. Solicita un nuevo correo desde la aplicación.');
        return;
      }

      try {
        const response = await emailApi.verifyEmail(token);

        if (!isActive) {
          return;
        }

        setStatus('success');
        setMessage(response.message);
        setUsername(response.username || null);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus('error');
        setMessage(getEmailVerificationErrorMessage(error));
      }
    };

    void verifyEmail();

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              {status === 'loading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
              {status === 'success' && <MailCheck className="w-8 h-8 text-white" />}
              {status === 'error' && <XCircle className="w-8 h-8 text-white" />}
            </div>
          </div>
          <CardTitle>
            {status === 'loading' && 'Verificando email'}
            {status === 'success' && 'Email verificado'}
            {status === 'error' && 'No se pudo verificar el email'}
          </CardTitle>
          <CardDescription>
            {status === 'success' && username ? `Cuenta confirmada para ${username}.` : 'DocumentChain'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' ? (
            <AlertMessage type="success" message={message} />
          ) : null}

          {status === 'error' ? (
            <AlertMessage type="error" message={message} />
          ) : null}

          {status === 'loading' ? (
            <div className="text-center text-sm text-gray-600 flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando el enlace de verificación...
            </div>
          ) : null}

          {status === 'success' ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Ya puedes iniciar sesión con normalidad.
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/login" className="sm:flex-1">
              <Button variant="primary" className="w-full">
                Ir a iniciar sesión
              </Button>
            </Link>

            <Link to="/register" className="sm:flex-1">
              <Button variant="outline" className="w-full">
                Volver al registro
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};