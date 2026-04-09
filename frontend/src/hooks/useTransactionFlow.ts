/**
 * useTransactionFlow Hook
 * 
 * Manages the complete flow for blockchain transactions:
 * 1. Show wallet selector
 * 2. Connect wallet if needed
 * 3. Prepare transaction data
 * 4. Sign and submit transaction
 * 5. Confirm with backend
 */

import { useState, useCallback } from 'react';
import { useWalletManager } from '../contexts/WalletManagerContext';
import { blockchainProvider } from '../lib/blockchain/provider';

export type TransactionStep = 
  | 'idle'           // No transaction in progress
  | 'select_wallet'  // Waiting for user to select wallet
  | 'connecting'     // Connecting to wallet
  | 'preparing'      // Preparing transaction data
  | 'signing'        // Waiting for user signature
  | 'submitting'     // Submitting to blockchain
  | 'confirming'     // Waiting for confirmation
  | 'success'        // Transaction completed
  | 'error';         // Transaction failed

export interface TransactionState {
  step: TransactionStep;
  error: string | null;
  txHash: string | null;
  selectedWalletId: string | null;
  connectedAddress: string | null;
}

export interface UseTransactionFlowOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export interface UseTransactionFlowReturn {
  // State
  step: TransactionStep;
  error: string | null;
  txHash: string | null;
  isProcessing: boolean;
  showWalletModal: boolean;
  
  // Actions
  startTransaction: () => void;
  cancelTransaction: () => void;
  handleWalletSelected: (walletId: string | null, address: string) => Promise<void>;
  
  // For external wallet modal control
  setShowWalletModal: (show: boolean) => void;
  
  // Advanced control
  setStep: (step: TransactionStep) => void;
  setError: (error: string) => void;
  setSuccess: (txHash: string) => void;
}

/**
 * Hook for managing blockchain transaction flow
 */
export function useTransactionFlow(
  options: UseTransactionFlowOptions = {}
): UseTransactionFlowReturn {
  const { onSuccess, onError } = options;
  useWalletManager(); // Initialize wallet manager context
  
  const [state, setState] = useState<TransactionState>({
    step: 'idle',
    error: null,
    txHash: null,
    selectedWalletId: null,
    connectedAddress: null,
  });
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  /**
   * Start a new transaction - shows wallet selector
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
   * Cancel the transaction
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
   * Handle wallet selection from modal
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
   * Update step
   */
  const setStep = useCallback((step: TransactionStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);
  
  /**
   * Set error
   */
  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, step: 'error', error }));
    onError?.(error);
  }, [onError]);
  
  /**
   * Set success
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

/**
 * Hook specifically for document upload transactions
 */
export interface UploadTransactionData {
  file: File;
  password: string;
  folderId?: string;
  categoryId?: string;
  tags?: string[];
}

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
   * Start upload process - validate and show wallet selector
   */
  const startUpload = useCallback((data: UploadTransactionData) => {
    // Validation
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
    
    // Store data and show wallet selector
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
   * Handle wallet selection
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
      // Verify signer is available
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No signer available. Please connect your wallet.');
      }
      
      // Verify address matches
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Connected wallet does not match selected wallet.');
      }
      
      setState(prev => ({ ...prev, step: 'preparing' }));
      
      // Return the signer for external use
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
   * Set preparing state
   */
  const setPreparing = useCallback(() => {
    setState(prev => ({ ...prev, step: 'preparing' }));
  }, []);
  
  /**
   * Set signing state
   */
  const setSigning = useCallback(() => {
    setState(prev => ({ ...prev, step: 'signing' }));
  }, []);
  
  /**
   * Set submitting state with tx hash
   */
  const setSubmitting = useCallback((txHash: string) => {
    setState(prev => ({ ...prev, step: 'submitting', txHash }));
  }, []);
  
  /**
   * Set confirming state
   */
  const setConfirming = useCallback(() => {
    setState(prev => ({ ...prev, step: 'confirming' }));
  }, []);
  
  /**
   * Set success
   */
  const setSuccess = useCallback((txHash: string) => {
    setState(prev => ({ ...prev, step: 'success', txHash }));
  }, []);
  
  /**
   * Set error
   */
  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, step: 'error', error }));
  }, []);
  
  /**
   * Reset state
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
    // State
    step: state.step,
    error: state.error,
    txHash: state.txHash,
    isProcessing,
    showWalletModal,
    
    // Actions
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
