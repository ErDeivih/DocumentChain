/**
 * TwoFactorSetup Component
 * Complete 2FA setup with QR code scanning and backup codes
 */

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { twoFactorApi } from '../../api/twoFactor';
import {
  Smartphone,
  Shield,
  AlertCircle,
  Copy,
  Download,
} from 'lucide-react';

export const TwoFactorSetup: React.FC = () => {
  const [setupStep, setSetupStep] = useState<'initial' | 'setup' | 'verify'>('initial');
  const [qrData, setQrData] = useState<any>(null);
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [managementToken, setManagementToken] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get 2FA status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['twoFactorStatus'],
    queryFn: twoFactorApi.getStatus,
  });

  // Setup mutation
  const setupMutation = useMutation({
    mutationFn: twoFactorApi.setup,
    onSuccess: (data) => {
      setQrData(data);
      setPendingBackupCodes(data.backupCodes || []);
      setSetupStep('verify');
      toast({
        title: 'Éxito',
        description: 'Escanee el código QR con su aplicación autenticadora',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al configurar 2FA',
        variant: 'destructive',
      });
    },
  });

  // Enable mutation
  const enableMutation = useMutation({
    mutationFn: (token: string) => twoFactorApi.enable(token),
    onSuccess: (data: any) => {
      const codesToDisplay = Array.isArray(data.backupCodes) && data.backupCodes.length > 0
        ? data.backupCodes
        : pendingBackupCodes;

      if (codesToDisplay.length > 0) {
        setBackupCodes(codesToDisplay);
        setShowBackupCodes(true);
      }
      queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
      toast({
        title: '¡2FA Habilitado!',
        description: 'Autenticación de dos factores activada exitosamente',
        variant: 'success',
      });
      setSetupStep('initial');
      setQrData(null);
      setPendingBackupCodes([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Código de verificación inválido',
        variant: 'destructive',
      });
    },
  });

  // Disable mutation
  const disableMutation = useMutation({
    mutationFn: (token: string) => twoFactorApi.disable(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
      setManagementToken('');
      setBackupCodes([]);
      setShowBackupCodes(false);
      toast({
        title: '2FA Deshabilitado',
        description: 'Autenticación de dos factores desactivada',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Código TOTP inválido',
        variant: 'destructive',
      });
    },
  });

  // Regenerate backup codes mutation
  const regenerateMutation = useMutation({
    mutationFn: (token: string) => twoFactorApi.regenerateBackupCodes(token),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
      toast({
        title: 'Códigos Regenerados',
        description: 'Nuevos códigos de respaldo generados',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Código TOTP inválido',
        variant: 'destructive',
      });
    },
  });

  const handleStartSetup = () => {
    setupMutation.mutate();
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Ingrese un código de 6 dígitos',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      await enableMutation.mutateAsync(verificationCode);
      setVerificationCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!/^\d{6}$/.test(managementToken)) {
      toast({
        title: 'Error',
        description: 'Ingrese un código TOTP válido de 6 dígitos',
        variant: 'destructive',
      });
      return;
    }

    disableMutation.mutate(managementToken);
  };

  const handleRegenerateBackupCodes = () => {
    if (!/^\d{6}$/.test(managementToken)) {
      toast({
        title: 'Error',
        description: 'Ingrese un código TOTP válido de 6 dígitos',
        variant: 'destructive',
      });
      return;
    }

    regenerateMutation.mutate(managementToken);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado',
      description: 'Copiado al portapapeles',
      variant: 'success',
    });
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes-documentchain.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (statusLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autenticación de Dos Factores (2FA)</CardTitle>
        <CardDescription>
          Añada una capa extra de seguridad a su cuenta usando una aplicación autenticadora
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 2FA Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${status?.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Shield className={`w-5 h-5 ${status?.enabled ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className="font-medium">Estado de 2FA</p>
              <p className="text-sm text-muted-foreground">
                {status?.enabled ? 'Activado y protegiendo su cuenta' : 'Desactivado'}
              </p>
            </div>
          </div>
          <Badge variant={status?.enabled ? 'success' : 'secondary'}>
            {status?.enabled ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* Setup Flow */}
        {!status?.enabled && setupStep === 'initial' && (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Para habilitar 2FA, necesitará una aplicación autenticadora como:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Google Authenticator</li>
                  <li>Microsoft Authenticator</li>
                  <li>Authy</li>
                  <li>1Password</li>
                </ul>
              </AlertDescription>
            </Alert>
            <Button onClick={handleStartSetup} disabled={setupMutation.isPending}>
              <Shield className="w-4 h-4 mr-2" />
              Configurar 2FA
            </Button>
          </div>
        )}

        {/* QR Code Step */}
        {setupStep === 'verify' && qrData && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Paso 1: Escanee el código QR con su aplicación autenticadora
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center gap-4 p-6 bg-accent rounded-lg">
              <img 
                src={qrData.qrCode} 
                alt="QR Code" 
                className="w-64 h-64 border-4 border-white rounded-lg shadow-lg"
              />
              <div className="text-center">
                <p className="text-sm font-medium mb-2">O ingrese manualmente:</p>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-2 bg-background rounded text-sm font-mono">
                    {qrData.secret}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(qrData.secret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Paso 2: Ingrese el código de 6 dígitos de su aplicación
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Código de Verificación</Label>
                <Input
                  id="verificationCode"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isVerifying ? 'Verificando...' : 'Verificar y Activar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSetupStep('initial');
                    setQrData(null);
                    setPendingBackupCodes([]);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes Display */}
        {showBackupCodes && backupCodes.length > 0 && (
          <Alert variant="warning" className="border-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">¡Guarde estos códigos de respaldo!</p>
              <p className="text-sm mb-3">
                Cada código solo se puede usar una vez. Guárdelos en un lugar seguro.
              </p>
              <div className="grid grid-cols-2 gap-2 p-3 bg-background rounded font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span>{code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={downloadBackupCodes}>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Códigos
                </Button>
                <Button size="sm" onClick={() => setShowBackupCodes(false)}>
                  He guardado los códigos
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Disable 2FA */}
        {status?.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-medium mb-3">Gestionar 2FA</h4>
              
              {/* Backup Codes Info */}
              {status.hasBackupCodes && (
                <div className="mb-4 p-3 bg-accent rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Códigos de Respaldo</p>
                      <p className="text-xs text-muted-foreground">
                        {status.remainingBackupCodes || 0} códigos restantes
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground text-right max-w-40">
                      Use el código TOTP inferior si necesita regenerarlos.
                    </span>
                  </div>
                </div>
              )}

              {/* Disable Section */}
              <div className="space-y-3">
                <Label htmlFor="managementToken">Código TOTP actual</Label>
                <Input
                  id="managementToken"
                  type="text"
                  placeholder="123456"
                  value={managementToken}
                  onChange={(e) => setManagementToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Introduzca un código generado por su aplicación autenticadora para regenerar códigos de respaldo o desactivar 2FA.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRegenerateBackupCodes}
                    disabled={regenerateMutation.isPending || managementToken.length !== 6}
                  >
                    {regenerateMutation.isPending ? 'Regenerando...' : 'Regenerar Códigos'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDisable2FA}
                    disabled={disableMutation.isPending || managementToken.length !== 6}
                  >
                    Desactivar 2FA
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
