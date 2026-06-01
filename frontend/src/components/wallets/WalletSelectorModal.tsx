import React, { useState, useEffect } from 'react';
import { useWalletManager, SavedWallet } from '../../contexts/WalletManagerContext';
import { WalletType, DetectedWallet, BlockchainProvider } from '../../lib/blockchain/provider';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { useToast } from '../ui/Toast';
import { copyToClipboard, truncateAddress } from '../../lib/utils';
import { ConnectedWalletBanner, SavedWalletItem } from './WalletModalComponents';
import { 
  Wallet, 
  Plus, 
  AlertCircle, 
  Loader2,
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
  const { toast } = useToast();

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
      toast({ title: 'Wallet guardada correctamente', variant: 'success' });
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
        `La wallet conectada (${truncateAddress(connectedWallet.address)}) no coincide con ${truncateAddress(wallet.walletAddress)}. ` +
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

  const handleUseConnected = async () => {
    if (connectedWallet) {
      let savedWallet = savedWallets.find(
        w => w.walletAddress.toLowerCase() === connectedWallet.address.toLowerCase()
      );

      if (!savedWallet) {
        try {
          savedWallet = await addWallet(newWalletLabel || undefined);
          toast({ title: 'Wallet guardada correctamente', variant: 'success' });
        } catch (err: any) {
          setLocalError(err.message || 'Error al guardar wallet');
          return;
        }
      }

      onSelect(savedWallet, connectedWallet.address);
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
            <ConnectedWalletBanner
              address={connectedWallet.address}
              onUseThisWallet={handleUseConnected}
              onChangeWallet={handleDisconnectAndChooseAnother}
            />
          )}

          {/* Wallets guardadas */}
          {orderedWallets.length > 0 && !showAddWallet && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Wallets Guardadas ({orderedWallets.length}/5)
              </h4>
              <div className="space-y-2">
                {orderedWallets.map((wallet) => (
                  <SavedWalletItem
                    key={wallet.id}
                    wallet={wallet}
                    isConnected={connectedWallet?.address.toLowerCase() === wallet.walletAddress.toLowerCase()}
                    onSelect={handleSelectSaved}
                    onSetPrimary={handleSetPrimary}
                    onRemove={handleRemoveWallet}
                    onCopyAddress={copyAddress}
                  />
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
