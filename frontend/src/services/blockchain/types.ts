/** Datos de entrada para firmar un documento. */
export interface SignDocumentInput {
  /** Identificador del documento. */
  documentId: string;
  /** Número de versión a firmar. */
  versionNumber: number;
  /** Identificador de la wallet firmante. */
  walletId: string;
  /** Comentario opcional. */
  comment?: string;
}
