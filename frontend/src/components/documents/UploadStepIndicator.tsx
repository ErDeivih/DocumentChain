import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

type UploadStep = 'form' | 'select_wallet' | 'preparing' | 'signing' | 'confirming' | 'success' | 'error';

const stepOrder: Record<UploadStep, number> = {
  form: 0, select_wallet: 1, preparing: 2, signing: 3, confirming: 4, success: 5, error: 5,
};

interface UploadStepIndicatorProps {
  step: UploadStep;
}

export const UploadStepIndicator: React.FC<UploadStepIndicatorProps> = ({ step }) => {
  const getStepIcon = (stepName: UploadStep) => {
    if (step === stepName) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (stepOrder[step] > stepOrder[stepName]) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    return null;
  };

  return (
    <div className="space-y-3 p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        {getStepIcon('preparing')}
        <span className={step === 'preparing' ? 'font-medium' : 'text-muted-foreground'}>Preparando documento...</span>
      </div>
      <div className="flex items-center gap-2">
        {getStepIcon('signing')}
        <span className={step === 'signing' ? 'font-medium' : 'text-muted-foreground'}>Firmando transacción...</span>
      </div>
      <div className="flex items-center gap-2">
        {getStepIcon('confirming')}
        <span className={step === 'confirming' ? 'font-medium' : 'text-muted-foreground'}>Confirmando en blockchain...</span>
      </div>
    </div>
  );
};
