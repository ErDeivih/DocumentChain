/**
 * @fileoverview Tipos compartidos de los servicios blockchain.
 *
 * Define las interfaces de entrada para operaciones de subida,
 * compartición, firma y transferencia de documentos.
 */

import type { DocumentRole } from '../../types';

/** Datos de entrada para subir un documento. */
export interface UploadDocumentInput {
  /** Archivo a subir. */
  file: File;
  /** Metadatos del documento. */
  metadata: {
    /** Nombre del documento. */
    name: string;
    /** Descripción opcional. */
    description?: string;
    /** Identificador de carpeta opcional. */
    folderId?: string;
    /** Etiquetas opcionales. */
    tags?: string[];
  };
  /** Indica si debe cifrarse. */
  shouldEncrypt: boolean;
}

/** Datos de entrada para subir una nueva versión. */
export interface UploadVersionInput {
  /** Identificador del documento. */
  documentId: string;
  /** Archivo de la nueva versión. */
  file: File;
  /** Comentario de la versión. */
  comment: string;
  /** Indica si debe cifrarse. */
  shouldEncrypt: boolean;
}

/** Datos de entrada para compartir un documento. */
export interface ShareDocumentInput {
  /** Identificador del documento. */
  documentId: string;
  /** Nombre de usuario del destinatario. */
  username: string;
  /** Rol a otorgar. */
  role: DocumentRole;
  /** Contraseña opcional para descifrar clave. */
  password?: string;
}

/** Datos de entrada para cambiar el rol de un compartido. */
export interface ChangeShareRoleInput {
  /** Identificador del documento. */
  documentId: string;
  /** Identificador del usuario. */
  userId: string;
  /** Nuevo rol (solo lectura o escritura compartida). */
  newRole: DocumentRole.SHARED_READ | DocumentRole.SHARED_WRITE;
  /** Dirección conectada para validación. */
  connectedAddress: string;
}

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

/** Datos de entrada para transferir la propiedad. */
export interface TransferOwnershipInput {
  /** Identificador del documento. */
  documentId: string;
  /** Nombre de usuario del nuevo propietario. */
  newOwnerUsername: string;
  /** Wallet para firmar la transacción blockchain. */
  walletId: string;
  /** Contraseña para descifrar la clave privada. */
  password: string;
}

/** Resultado genérico de un servicio blockchain. */
export interface ServiceResult<T = void> {
  /** Indica si la operación fue exitosa. */
  success: boolean;
  /** Datos resultantes (si aplica). */
  data?: T;
  /** Mensaje de error (si aplica). */
  error?: string;
}
