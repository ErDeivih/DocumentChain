import React, { useState, useEffect } from 'react';
import { useWalletManager, SavedWallet } from '../../contexts/WalletManagerContext';
import { WalletType, DetectedWallet, BlockchainProvider } from '../../lib/blockchain/provider';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { copyToClipboard } from '../../lib/utils';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Copy,
  LogOut
} from 'lucide-react';

/**
 * Propiedades del componente WalletSelectorModal.
 */
interface WalletSelectorModalProps {
  /** Indica si el modal está abierto. */
  isOpen: boolean;
  /** Función para cerrar el modal. */
  onClose: () => void;
  /** Función invocada al seleccionar una wallet, recibe la wallet guardada y la dirección conectada. */
  onSelect: (wallet: SavedWallet | null, connectedAddress: string) => void;
  /** Título opcional del modal. */
  title?: string;
  /** Descripción opcional del modal. */
  description?: string;
}

/**
 * Modal selector de wallets.
 *
 * Se muestra cuando el usuario necesita firmar una transacción blockchain.
 * Permite seleccionar una wallet guardada o conectar una nueva.
 * Detecta automáticamente todas las wallets disponibles en el navegador.
 *
 * @param props - Propiedades del componente.
 * @returns Elemento JSX del modal selector de wallets.
 */
export const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Seleccionar Wallet',
  description = 'Elige una wallet para firmar la transacción'
}) => {
  const {
    savedWallets,
    connectedWallet,
    isLoading,
    isConnecting,
    error,
    canAddWallet,
    connectWallet,
    disconnectWallet,
    addWallet,
    removeWallet,
    setPrimaryWallet
  } = useWalletManager();

  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletLabel, setNewWalletLabel] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const orderedWallets = [...savedWallets].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }

    const leftLabel = left.label?.trim() || left.walletAddress;
    const rightLabel = right.label?.trim() || right.walletAddress;
    return leftLabel.localeCompare(rightLabel, 'es', { sensitivity: 'base' });
  });

  // Detecta las wallets disponibles cuando se abre el modal
  useEffect(() => {
    const detectWallets = async () => {
      if (isOpen) {
        const wallets = await BlockchainProvider.detectAvailableWallets();
        setDetectedWallets(wallets);
     }
    };
    
    detectWallets();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectNew = async (walletType: WalletType, provider?: unknown) => {
    setLocalError(null);
    
    try {
      // Utiliza la conexión devuelta en lugar del estado connectedWallet
      const connected = await connectWallet(walletType, provider);

      // Si la cadena es probablemente Hardhat (31337), ofrece añadirla
      if (connected?.chainId === 31337 || (!connected && walletType !== 'walletconnect')) {
        try {
          await BlockchainProvider.addHardhatNetwork();
        } catch (hardhatError) {
          // Fallo silencioso: la red podría estar ya añadida o el usuario la rechazó
          console.warn('Could not add Hardhat network:', hardhatError);
        }
      }

      setShowAddWallet(true);
    } catch (err: any) {
      setLocalError(err.message || 'Error al conectar wallet');
    }
  };

  const handleDisconnectAndChooseAnother = () => {
    disconnectWallet();
    setShowAddWallet(false);
    setLocalError(null);
  };

  const handleAddWallet = async () => {
    setLocalError(null);
    try {
      const newWallet = await addWallet(newWalletLabel || undefined);
      setShowAddWallet(false);
      setNewWalletLabel('');
      // Muestra retroalimentación de éxito
      alert('Wallet guardada correctamente');
      // Selecciona automáticamente la wallet recién añadida
      if (connectedWallet) {
        onSelect(newWallet, connectedWallet.address);
        onClose();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error al guardar wallet');
    }
  };

  const handleSelectSaved = async (wallet: SavedWallet) => {
    setLocalError(null);
    
    // Si esta wallet ya está conectada, la utiliza directamente
    if (connectedWallet &&
        connectedWallet.address.toLowerCase() === wallet.walletAddress.toLowerCase()) {
      onSelect(wallet, connectedWallet.address);
      onClose();
      return;
    }

    if (connectedWallet) {
      setLocalError(
        `La wallet conectada (${formatAddress(connectedWallet.address)}) no coincide con ${formatAddress(wallet.walletAddress)}. ` +
        'Cambie de cuenta en su wallet y vuelva a intentarlo.'
      );
      return;
    }

    // En caso contrario, es necesario conectar primero
    // Intenta detectar automáticamente el tipo de wallet desde las disponibles
    const detectedType = detectedWallets.find(w => w.installed && w.type !== 'walletconnect')?.type || 'metamask';

    try {
      // Utiliza la conexión devuelta en lugar del estado connectedWallet
      const connected = await connectWallet(detectedType);
      // Tras la conexión, verifica que sea la wallet correcta
      if (connected && 
          connected.address.toLowerCase() === wallet.walletAddress.toLowerCase()) {
        onSelect(wallet, connected.address);
        onClose();
      } else {
        setLocalError('La wallet conectada no coincide. Por favor, conecta la wallet correcta.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error al conectar wallet');
    }
  };

  const handleUseConnected = () => {
    if (connectedWallet) {
      const savedWallet = savedWallets.find(
        w => w.walletAddress.toLowerCase() === connectedWallet.address.toLowerCase()
      );
      onSelect(savedWallet || null, connectedWallet.address);
      onClose();
    }
  };

  const handleRemoveWallet = async (walletId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta wallet?')) {
      try {
        await removeWallet(walletId);
      } catch (err: any) {
        setLocalError(err.message || 'Error al eliminar wallet');
      }
    }
  };

  const handleSetPrimary = async (walletId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await setPrimaryWallet(walletId);
    } catch (err: any) {
      setLocalError(err.message || 'Error al establecer wallet principal');
    }
  };

  const copyAddress = async (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyToClipboard(address);
    } catch {
      setLocalError('No se pudo copiar la dirección de la wallet');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="wallet-selector-modal">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Visualización de errores */}
          {(error || localError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}

          {/* Wallet conectada actualmente */}
          {connectedWallet && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
                    <p className="text-xs font-mono text-green-600">
                      {formatAddress(connectedWallet.address)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleUseConnected}
                  disabled={isLoading}
                >
                  Usar esta wallet
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDisconnectAndChooseAnother}
                  disabled={isLoading}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cambiar wallet
                </Button>
              </div>
            </div>
          )}

          {/* Wallets guardadas */}
          {orderedWallets.length > 0 && !showAddWallet && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Wallets Guardadas ({orderedWallets.length}/5)
              </h4>
              <div className="space-y-2">
                {orderedWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    data-testid={`saved-wallet-${wallet.id}`}
                    onClick={() => handleSelectSaved(wallet)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                      connectedWallet?.address.toLowerCase() === wallet.walletAddress.toLowerCase()
                        ? 'border-green-500 bg-green-50'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Wallet className="w-5 h-5" />
                          {wallet.isPrimary && (
                            <Star className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 fill-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {wallet.label || 'Sin etiqueta'}
                          </p>
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-mono text-muted-foreground">
                              {formatAddress(wallet.walletAddress)}
                            </p>
                            <button
                              onClick={(e) => copyAddress(wallet.walletAddress, e)}
                              className="p-1 hover:bg-muted rounded"
                              title="Copiar dirección"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!wallet.isPrimary && (
                          <button
                            onClick={(e) => handleSetPrimary(wallet.id, e)}
                            className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                            title="Establecer como principal"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleRemoveWallet(wallet.id, e)}
                          className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                          title="Eliminar wallet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de añadir nueva wallet */}
          {showAddWallet ? (
            <div className="space-y-3 p-3 border rounded-lg">
              <h4 className="text-sm font-medium">Guardar Wallet Actual</h4>
              <input
                type="text"
                placeholder="Etiqueta (ej: Personal, Trabajo)"
                value={newWalletLabel}
                onChange={(e) => setNewWalletLabel(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddWallet(false);
                    setNewWalletLabel('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddWallet}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Conectar nueva wallet */}
              {canAddWallet && !connectedWallet && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Conectar Nueva Wallet
                  </h4>
                  {detectedWallets.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No se detectaron wallets. Por favor, instala una wallet como MetaMask, Coinbase Wallet, o Brave Wallet.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {detectedWallets.map((wallet) => (
                        <Button
                          key={wallet.name}
                          variant="outline"
                          onClick={() => handleConnectNew(wallet.type, wallet.provider)}
                          disabled={isConnecting}
                          className="flex items-center gap-2 justify-start"
                        >
                          {isConnecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : wallet.icon ? (
                            <img 
                              src={wallet.icon} 
                              alt={wallet.name} 
                              className="w-5 h-5"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Wallet className="w-5 h-5" />
                          )}
                          <span className="text-sm truncate">{wallet.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Botón de desconexión — se muestra cuando hay una wallet conectada */}
              {connectedWallet && (
                <div className="border-t pt-3">
                  <Button
                    variant="outline"
                    onClick={handleDisconnectAndChooseAnother}
                    className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    Desconectar y elegir otra wallet
                  </Button>
                </div>
              )}

              {/* Guardar wallet conectada */}
              {connectedWallet &&
               !savedWallets.some(w =>
                  w.walletAddress.toLowerCase() === connectedWallet.address.toLowerCase()
                ) && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddWallet(true)}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Guardar Wallet Actual
                </Button>
              )}
            </>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletSelectorModal;
