/**
 * @fileoverview Hook useTransactionFlow.
 *
 * Gestiona el flujo completo de transacciones blockchain:
 * 1. Mostrar selector de wallet.
 * 2. Conectar wallet si es necesario.
 * 3. Preparar datos de transacción.
 * 4. Firmar y enviar transacción.
 * 5. Confirmar con el backend.
 */

import { useState, useCallback } from 'react';
import { useWalletManager } from '../contexts/WalletManagerContext';
import { blockchainProvider } from '../lib/blockchain/provider';

/** Paso actual del flujo de transacción. */
export type TransactionStep =
  | 'idle'           // Sin transacción en curso
  | 'select_wallet'  // Esperando selección de wallet
  | 'connecting'     // Conectando wallet
  | 'preparing'      // Preparando datos de transacción
  | 'signing'        // Esperando firma del usuario
  | 'submitting'     // Enviando a blockchain
  | 'confirming'     // Esperando confirmación
  | 'success'        // Transacción completada
  | 'error';         // Transacción fallida

/** Estado interno del flujo de transacción. */
export interface TransactionState {
  /** Paso actual. */
  step: TransactionStep;
  /** Mensaje de error (si aplica). */
  error: string | null;
  /** Hash de la transacción (si aplica). */
  txHash: string | null;
  /** Identificador de la wallet seleccionada. */
  selectedWalletId: string | null;
  /** Dirección conectada. */
  connectedAddress: string | null;
}

/** Opciones del hook useTransactionFlow. */
export interface UseTransactionFlowOptions {
  /** Callback al completar con éxito. */
  onSuccess?: (txHash: string) => void;
  /** Callback al producirse un error. */
  onError?: (error: string) => void;
}

/** Retorno del hook useTransactionFlow. */
export interface UseTransactionFlowReturn {
  // Estado
  step: TransactionStep;
  error: string | null;
  txHash: string | null;
  isProcessing: boolean;
  showWalletModal: boolean;

  // Acciones
  startTransaction: () => void;
  cancelTransaction: () => void;
  handleWalletSelected: (walletId: string | null, address: string) => Promise<void>;

  // Control externo del modal
  setShowWalletModal: (show: boolean) => void;

  // Control avanzado
  setStep: (step: TransactionStep) => void;
  setError: (error: string) => void;
  setSuccess: (txHash: string) => void;
}

/**
 * Hook para gestionar el flujo de transacciones blockchain.
 *
 * @param options - Opciones con callbacks de éxito y error.
 * @returns Estado y acciones del flujo.
 */
export function useTransactionFlow(
  options: UseTransactionFlowOptions = {}
): UseTransactionFlowReturn {
  const { onSuccess, onError } = options;
  useWalletManager(); // Inicializar contexto de gestión de wallets

  const [state, setState] = useState<TransactionState>({
    step: 'idle',
    error: null,
    txHash: null,
    selectedWalletId: null,
    connectedAddress: null,
  });

  const [showWalletModal, setShowWalletModal] = useState(false);

  /**
   * Inicia una nueva transacción mostrando el selector de wallet.
   */
  const startTransaction = useCallback(() => {
    setState({
      step: 'select_wallet',
      error: null,
      txHash: null,
      selectedWalletId: null,
      connectedAddress: null,
    });
    setShowWalletModal(true);
  }, []);

  /**
   * Cancela la transacción en curso y reinicia el estado.
   */
  const cancelTransaction = useCallback(() => {
    setState({
      step: 'idle',
      error: null,
      txHash: null,
      selectedWalletId: null,
      connectedAddress: null,
    });
    setShowWalletModal(false);
  }, []);

  /**
   * Maneja la selección de wallet desde el modal.
   * @param walletId - Identificador de la wallet.
   * @param address - Dirección conectada.
   */
  const handleWalletSelected = useCallback(async (
    walletId: string | null,
    address: string
  ) => {
    setShowWalletModal(false);
    setState(prev => ({
      ...prev,
      step: 'preparing',
      selectedWalletId: walletId,
      connectedAddress: address,
    }));
  }, []);

  /**
   * Actualiza el paso actual.
   * @param step - Nuevo paso.
   */
  const setStep = useCallback((step: TransactionStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  /**
   * Establece un error en el flujo.
   * @param error - Mensaje de error.
   */
  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, step: 'error', error }));
    onError?.(error);
  }, [onError]);

  /**
   * Establece el estado de éxito.
   * @param txHash - Hash de la transacción confirmada.
   */
  const setSuccess = useCallback((txHash: string) => {
    setState(prev => ({ ...prev, step: 'success', txHash }));
    onSuccess?.(txHash);
  }, [onSuccess]);

  const isProcessing = !['idle', 'success', 'error'].includes(state.step);

  return {
    step: state.step,
    error: state.error,
    txHash: state.txHash,
    isProcessing,
    showWalletModal,
    startTransaction,
    cancelTransaction,
    handleWalletSelected,
    setShowWalletModal,
    setStep,
    setError,
    setSuccess,
  };
}

/** Datos de entrada para el hook de subida de documentos. */
export interface UploadTransactionData {
  /** Archivo a subir. */
  file: File;
  /** Contraseña para cifrado. */
  password: string;
  /** Identificador de carpeta opcional. */
  folderId?: string;
  /** Etiquetas opcionales. */
  tags?: string[];
}

/**
 * Hook especializado para el flujo de subida de documentos.
 *
 * @returns Estado y acciones del flujo de subida.
 */
export function useDocumentUpload() {
  const [state, setState] = useState<TransactionState>({
    step: 'idle',
    error: null,
    txHash: null,
    selectedWalletId: null,
    connectedAddress: null,
  });

  const [showWalletModal, setShowWalletModal] = useState(false);

  /**
   * Inicia el proceso de subida validando datos y mostrando selector.
   * @param data - Datos de la transacción de subida.
   */
  const startUpload = useCallback((data: UploadTransactionData) => {
    // Validación
    if (!data.file) {
      setState(prev => ({ ...prev, step: 'error', error: 'No file selected' }));
      return;
    }

    if (!data.password?.trim()) {
      setState(prev => ({ ...prev, step: 'error', error: 'Password is required for encryption' }));
      return;
    }

    if (data.password.length < 6) {
      setState(prev => ({ ...prev, step: 'error', error: 'Password must be at least 6 characters' }));
      return;
    }

    // Almacenar datos y mostrar selector de wallet
    setState({
      step: 'select_wallet',
      error: null,
      txHash: null,
      selectedWalletId: null,
      connectedAddress: null,
    });
    setShowWalletModal(true);
  }, []);

  /**
   * Maneja la selección de wallet y verifica el firmante.
   * @param walletId - Identificador de la wallet.
   * @param address - Dirección conectada.
   * @returns Firmante y datos de conexión, o null en caso de error.
   */
  const handleWalletSelected = useCallback(async (
    walletId: string | null,
    address: string
  ) => {
    setShowWalletModal(false);
    setState(prev => ({
      ...prev,
      step: 'connecting',
      selectedWalletId: walletId,
      connectedAddress: address,
    }));

    try {
      // Verificar que el firmante esté disponible
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No signer available. Please connect your wallet.');
      }

      // Verificar que la dirección coincida
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Connected wallet does not match selected wallet.');
      }

      setState(prev => ({ ...prev, step: 'preparing' }));

      // Devolver el firmante para uso externo
      return { signer, walletId, address };
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        step: 'error',
        error: err.message || 'Failed to connect wallet',
      }));
      return null;
    }
  }, []);

  /**
   * Establece el estado de preparación.
   */
  const setPreparing = useCallback(() => {
    setState(prev => ({ ...prev, step: 'preparing' }));
  }, []);

  /**
   * Establece el estado de firma.
   */
  const setSigning = useCallback(() => {
    setState(prev => ({ ...prev, step: 'signing' }));
  }, []);

  /**
   * Establece el estado de envío con hash de transacción.
   * @param txHash - Hash de la transacción.
   */
  const setSubmitting = useCallback((txHash: string) => {
    setState(prev => ({ ...prev, step: 'submitting', txHash }));
  }, []);

  /**
   * Establece el estado de confirmación.
   */
  const setConfirming = useCallback(() => {
    setState(prev => ({ ...prev, step: 'confirming' }));
  }, []);

  /**
   * Establece el estado de éxito.
   * @param txHash - Hash de la transacción confirmada.
   */
  const setSuccess = useCallback((txHash: string) => {
    setState(prev => ({ ...prev, step: 'success', txHash }));
  }, []);

  /**
   * Establece un error.
   * @param error - Mensaje de error.
   */
  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, step: 'error', error }));
  }, []);

  /**
   * Reinicia el estado completo del flujo.
   */
  const reset = useCallback(() => {
    setState({
      step: 'idle',
      error: null,
      txHash: null,
      selectedWalletId: null,
      connectedAddress: null,
    });
    setShowWalletModal(false);
  }, []);

  const isProcessing = !['idle', 'success', 'error'].includes(state.step);

  return {
    // Estado
    step: state.step,
    error: state.error,
    txHash: state.txHash,
    isProcessing,
    showWalletModal,

    // Acciones
    startUpload,
    handleWalletSelected,
    setPreparing,
    setSigning,
    setSubmitting,
    setConfirming,
    setSuccess,
    setError,
    reset,
    setShowWalletModal,
  };
}

export default useTransactionFlow;
