import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MailCheck, MailOpen, XCircle } from 'lucide-react';
import { emailApi, getEmailVerificationErrorMessage } from '../api/email';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import AlertMessage from '../components/ui/AlertMessage';

type VerificationStatus = 'loading' | 'success' | 'error' | 'pending';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, patchUserSession } = useAuth();
  const token = searchParams.get('token')?.trim() || '';
  const locationState = (location.state as { emailNotVerified?: boolean; email?: string } | null) ?? null;
  const redirectedAsUnverified = locationState?.emailNotVerified === true;
  const shouldPatchSessionRef = useRef(Boolean(user && !user.emailVerified));

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Verificando tu email...');
  const [username, setUsername] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState((user?.email || locationState?.email || '').trim());

  const canResendVerification = status === 'pending' || status === 'error';

  const handleResend = async () => {
    const email = resendEmail.trim() || user?.email?.trim() || '';
    if (!email) {
      setResendError('Introduce el correo de la cuenta para reenviar la verificación.');
      setResendMessage(null);
      return;
    }

    setResendLoading(true);
    setResendMessage(null);
    setResendError(null);

    try {
      const res = await emailApi.resendVerification(email);
      setResendMessage(res.message);
    } catch (error) {
      setResendError(getEmailVerificationErrorMessage(error));
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const verifyEmail = async () => {
      if (!token) {
        if (!isActive) {
          return;
        }

        if (redirectedAsUnverified) {
          setStatus('pending');
          setMessage('Debes verificar tu email para acceder. Revisa tu bandeja de entrada y pulsa el enlace que te hemos enviado.');
        } else {
          setStatus('error');
          setMessage('El enlace de verificación no es válido o no incluye token. Solicita un nuevo correo desde la aplicación.');
        }
        return;
      }

      try {
        const response = await emailApi.verifyEmail(token);

        if (!isActive) {
          return;
        }

        if (shouldPatchSessionRef.current) {
          patchUserSession({ emailVerified: true });
          shouldPatchSessionRef.current = false;
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
  }, [redirectedAsUnverified, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.16),_transparent_30%),linear-gradient(135deg,#0f172a_0%,#111c30_45%,#0b1324_100%)] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] p-3 shadow-[0_0_24px_rgba(14,165,233,0.24)]">
              {status === 'loading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
              {status === 'success' && <MailCheck className="w-8 h-8 text-white" />}
              {status === 'error' && <XCircle className="w-8 h-8 text-white" />}
              {status === 'pending' && <MailOpen className="w-8 h-8 text-white" />}
            </div>
          </div>
          <CardTitle>
            {status === 'loading' && 'Verificando email'}
            {status === 'success' && 'Email verificado'}
            {status === 'error' && 'No se pudo verificar el email'}
            {status === 'pending' && 'Confirma tu email'}
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

          {status === 'pending' ? (
            <AlertMessage type="warning" message={message} />
          ) : null}

          {status === 'loading' ? (
            <div className="flex items-center justify-center gap-2 py-2 text-center text-sm text-slate-600">
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

          {canResendVerification ? (
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="resendEmail">Correo para reenviar la verificación</Label>
                <Input
                  id="resendEmail"
                  type="email"
                  value={resendEmail}
                  onChange={(event) => setResendEmail(event.target.value)}
                  placeholder="usuario@dominio.com"
                  disabled={resendLoading}
                  autoComplete="email"
                />
              </div>
              {resendMessage ? (
                <AlertMessage type="info" message={resendMessage} />
              ) : null}
              {resendError ? (
                <AlertMessage type="error" message={resendError} />
              ) : null}
              <Button
                variant="primary"
                className="w-full"
                onClick={() => void handleResend()}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  'Reenviar enlace de verificación'
                )}
              </Button>
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