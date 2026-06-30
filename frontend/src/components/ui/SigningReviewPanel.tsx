import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { FileText, Hash, Link2, Activity } from 'lucide-react';

/**
 * Propiedades del panel de revisión de firma.
 * @property operationName - Nombre de la operación que se va a firmar.
 * @property documentName - Nombre del documento implicado.
 * @property details - Pares clave-valor con los detalles de la transacción.
 * @property contractAddress - Dirección del contrato inteligente (opcional).
 */
interface SigningReviewPanelProps {
  operationName: string;
  documentName: string;
  details: Array<[string, string]>;
  contractAddress?: string;
}

/**
 * Panel que resume la operación blockchain antes de que el usuario la firme.
 *
 * Muestra el nombre de la operación, el documento afectado, los detalles
 * técnicos de la transacción y la dirección del contrato inteligente.
 * Se utiliza como paso previo a la confirmación en la wallet.
 *
 * @returns JSX.Element con el panel de revisión de firma.
 */
export const SigningReviewPanel: React.FC<SigningReviewPanelProps> = ({
  operationName,
  documentName,
  details,
  contractAddress,
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-700">
          <Activity className="w-4 h-4" />
          <span className="font-medium text-sm">{operationName}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{documentName}</span>
        </div>
        {details.map(([label, value]) => (
          <div key={label} className="flex items-start gap-2">
            <Hash className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">{label}: </span>
              <span className="font-mono text-xs break-all">{value}</span>
            </div>
          </div>
        ))}
        {contractAddress && (
          <div className="flex items-start gap-2">
            <Link2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">Contrato: </span>
              <span className="font-mono text-xs">{contractAddress}</span>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground pt-1 border-t">
          Abre tu wallet y confirma la transacción para completar la operación
        </p>
      </CardContent>
    </Card>
  );
};

export default SigningReviewPanel;
