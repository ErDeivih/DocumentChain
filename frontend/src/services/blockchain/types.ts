import type { DocumentRole } from '../../types';

export interface UploadDocumentInput {
  file: File;
  metadata: {
    name: string;
    description?: string;
    folderId?: string;
    categoryId?: string;
    tags?: string[];
  };
  shouldEncrypt: boolean;
}

export interface UploadVersionInput {
  documentId: string;
  file: File;
  comment: string;
  shouldEncrypt: boolean;
}

export interface ShareDocumentInput {
  documentId: string;
  username: string;
  role: DocumentRole;
  password?: string;
}

export interface ChangeShareRoleInput {
  documentId: string;
  userId: string;
  newRole: DocumentRole.SHARED_READ | DocumentRole.SHARED_WRITE;
  connectedAddress: string;
}

export interface SignDocumentInput {
  documentId: string;
  versionNumber: number;
  walletId: string;
  comment?: string;
}

export interface TransferOwnershipInput {
  documentId: string;
  newOwnerUsername: string;
  walletId: string;  // Wallet to sign blockchain transaction
  password: string;  // User password to decrypt private key
}

export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
