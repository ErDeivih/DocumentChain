import React from 'react';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import type { UserSearchResult } from './UserSearchSelector';

interface TransferConfirmationPanelProps {
  selectedUser: UserSearchResult;
  documentName: string;
  isPublic: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onCancel: () => void;
  onTransfer: () => void;
  isProcessing: boolean;
}

export const TransferConfirmationPanel: React.FC<TransferConfirmationPanelProps> = ({
  selectedUser,
  documentName,
  isPublic,
  password,
  onPasswordChange,
  onCancel,
  onTransfer,
  isProcessing,
}) => (
  <div className="space-y-4">
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <p className="text-sm text-amber-800">
        <strong>Atención:</strong> Estás a punto de transferir la propiedad de{' '}
        <strong>"{documentName}"</strong> a <strong>{selectedUser.username}</strong>.
        Esta acción no se puede deshacer y requerirá firmar una transacción blockchain.
      </p>
      {isPublic ? (
        <p className="mt-2 text-sm text-amber-800">
          El documento es público, por lo que la transferencia no requiere re-encriptación del contenido.
        </p>
      ) : null}
    </div>

    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/35 p-3">
      <UserAvatar name={selectedUser.fullName || selectedUser.username} avatarUrl={selectedUser.avatarUrl} />
      <div>
        <p className="font-medium text-foreground">{selectedUser.fullName || selectedUser.username}</p>
        <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
      </div>
    </div>

    {!isPublic ? (
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña de su cuenta</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Introduce su contraseña para descifrar el documento"
          disabled={isProcessing}
        />
      </div>
    ) : null}

    <div className="flex gap-2">
      <Button variant="outline" onClick={onCancel} disabled={isProcessing} className="flex-1">
        Cancelar
      </Button>
      <Button onClick={onTransfer} disabled={isProcessing || (!isPublic && !password)} className="flex-1 bg-amber-600 hover:bg-amber-700">
        {isProcessing ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Transfiriendo...</>
        ) : (
          <><ArrowRightLeft className="h-4 w-4 mr-2" /> Transferir y Firmar</>
        )}
      </Button>
    </div>
  </div>
);
