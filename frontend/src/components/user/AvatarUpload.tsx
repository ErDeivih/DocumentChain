/**
 * Componente de Subida de Avatar
 * Permite al usuario subir y gestionar su foto de perfil
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { api, getErrorMessage } from '../../lib/api';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  username: string;
  onAvatarChange?: (newAvatarUrl: string | null) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  username,
  onAvatarChange
}) => {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no puede superar los 2MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.put('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newAvatarUrl = response.data.avatarUrl;
      setPreviewUrl(newAvatarUrl);
      onAvatarChange?.(newAvatarUrl);
    } catch (err: any) {
      console.error('Error al subir avatar:', err);
      setError(getErrorMessage(err));
      // Revertir preview si falla
      setPreviewUrl(currentAvatarUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setRemoving(true);
      setError(null);

      await api.delete('/api/users/avatar');
      setPreviewUrl(null);
      onAvatarChange?.(null);
    } catch (err: any) {
      console.error('Error al eliminar avatar:', err);
      setError(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Foto de Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Avatar Preview */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={previewUrl || undefined} alt={username} />
              <AvatarFallback className="text-lg">
                {getInitials(username)}
              </AvatarFallback>
            </Avatar>
            
            {/* Indicador de carga */}
            {(uploading || removing) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Mensaje de error */}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || removing}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || removing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Foto
            </Button>
            
            {(previewUrl || currentAvatarUrl) && (
              <Button
                variant="outline"
                size="sm"
                onClick={removeAvatar}
                disabled={uploading || removing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>

          {/* Información */}
          <p className="text-xs text-gray-500 text-center">
            Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 2MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarUpload;