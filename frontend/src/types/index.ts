/**
 * Tipos fundamentales del dominio de la aplicaci+¦n.
 * ================================
 * Incluye entidades de usuario, documentos, firmas, carpetas,
 * estad+¡sticas, paginaci+¦n, verificaci+¦n y tipos h+¡bridos blockchain.
 */

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string | null;
    role: 'ADMIN' | 'USER';
    isAdmin: boolean;
    publicKey: string;
  recoveryKeySalt?: string;
    emailVerified: boolean;

  // Claves de cifrado
    encryptedPrivateKey?: string;
    keySalt?: string;

  // Wallets
    wallets?: Array<{
    id: string;
    address: string;
    label: string | null;
    isPrimary: boolean;
  }>;
    walletAddress?: string;

    createdAt: string;
}

/**
 * Respuesta exitosa de autenticaci+¦n con tokens JWT.
 */
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
    recoveryKey?: string;
}

export type LoginResponse = AuthResponse;

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    publicKey: string
  recoveryKeySalt?: string;
    encryptedPrivateKey: string;
    salt: string;
    recoveryKeyHash: string;
    encryptedPrivateKeyRecovery: string;
}

export interface Wallet {
    id: string;
    address: string;
    label: string | null;
    isPrimary: boolean;
}

export interface Document {
    id: string;
    blockchainId: string | null;
    publicId?: string | null;
    name: string;
    description: string | null;
    mimeType: string;
    size: number;
    fileExtension: string;
    ownerId: string;
    folderId: string | null;
    tags: string[];
    visibility: 'PRIVATE' | 'PUBLIC';
    isEncrypted: boolean;

  // Campos de cifrado
    encryptedSymmetricKey?: string;
    encryptionIV?: string;
    encryptionAuthTag?: string;
    contentHash?: string;
    metadataHash?: string;

  // Metadata de sincronizaci+¦n ÔÇö eliminado, se usa blockchainTxHash
    blockchainTxHash?: string | null;

  // Timestamps
    createdAt: string;
    updatedAt: string;

  // Relaciones (pobladas desde la base de datos)
    owner?: {
    id: string;
    username: string;
    fullName: string | null;
  };
    folder?: Folder;
    role?: DocumentRole;
  isArchived?: boolean;
  operationalVersionNumber?: number;
}

export interface Version {
    id: string;
    documentId: string;
    userId: string;
    comment: string | null;
    versionNumber: number;
    ipfsCid: string | null;
    createdAt: string;
    isEncrypted?: boolean;

  // Metadata de sincronizaci+¦n ÔÇö eliminado, se usa blockchainTxHash
    blockchainTxHash?: string | null;

  // Relaciones
    user?: {
    username: string;
    fullName: string | null;
  };
}

export interface Signature {
    id: string;
    documentId?: string;
    versionId: string;
    versionNumber?: number;
    userId?: string | null;
    signerWalletId?: string | null;
    walletAddress?: string;
    signedAt?: string;
    blockchainTxHash?: string | null;

  // Metadata de sincronizaci+¦n ÔÇö eliminado, se usa blockchainTxHash

  // Relaciones
    user?: {
    username: string;
    fullName: string | null;
  };
    signer?: {
    userId: string | null;
    username: string | null;
    fullName: string | null;
    walletAddress: string;
    source: 'live' | 'snapshot';
  };
}

/**
 * Representaci+¦n p+¦blica y reducida de una versi+¦n de documento.
 */
export interface PublicDocumentVersion {
    id: string;
    versionNumber: number;
    comment: string | null;
    createdAt: string;
    ipfsCid: string | null;
}

/**
 * Representaci+¦n p+¦blica de una firma asociada a un documento.
 */
export interface PublicDocumentSignature {
    id: string;
    versionId: string;
    versionNumber: number;
    signedAt: string;
    signer: {
    username: string;
    fullName: string | null;
  } | null;
}

/**
 * Documento en su vista p+¦blica accesible sin autenticaci+¦n.
 */
export interface PublicDocument {
  operationalVersionNumber?: number;
    id: string;
    publicId: string;
    blockchainId: string | null;
    name: string;
    description: string | null;
    mimeType: string;
    size: number;
    fileExtension?: string | null;
    contentHash: string;
    metadataHash: string;
    visibility: 'PUBLIC';
    createdAt: string;
    owner: {
    id: string;
    username: string;
    fullName: string | null;
  };
    versions: PublicDocumentVersion[];
    signatures: PublicDocumentSignature[];
}

export interface Share {
    id: string;
    documentId: string;
    userId: string;
    role: DocumentRole;
    createdAt: string;
    user?: {
    username: string;
    fullName: string | null;
    email: string;
  };
}

export enum DocumentRole {
    OWNER = 'OWNER',
    SHARED_WRITE = 'SHARED_WRITE',
    SHARED_READ = 'SHARED_READ'
}

export type Role = DocumentRole;
export type ShareDocument = Share;

/**
 * Respuesta paginada de documentos.
 */
export interface PaginatedDocumentsResponse {
    documents: Document[];
    total: number;
    page: number;
    totalPages: number;
}

/**
 * Informaci+¦n de paginaci+¦n est+índar.
 */
export interface PaginationInfo {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}

/**
 * Estructura de error devuelta por el API.
 */
export interface ApiError {
    error: string;
    details?: string;
    missing?: string[];
}

// Tipos de carpeta
export interface Folder {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    parentId: string | null;
    color: string | null;
    icon: string | null;
    isShared: boolean;
    createdAt: string;
    updatedAt: string;
    parent?: Folder;
    children?: Folder[];
    _count?: {
    documents: number;
    children: number;
  };
}

/**
 * Representaci+¦n reducida de una carpeta para rutas de navegaci+¦n.
 */
export interface FolderPath {
    id: string;
    name: string;
}

/**
 * Estad+¡sticas de una carpeta.
 */

// Tipos de verificaci+¦n
/**
 * Resultado de la verificaci+¦n de un documento contra blockchain.
 */
export interface VerificationResult {
    exists: boolean;
    document?: {
    id: string;
    name: string;
    owner: string;
    ownerUsername?: string;
    uploadedAt: string;
    fileSize: number;
    ipfsHash: string;
    currentVersion: number;
  };
    versions?: Array<{
    versionNumber: number;
    createdAt: string;
    createdBy?: string;
    comment?: string;
  }>;
    shares?: Array<{
    sharedWith: string;
    sharedWithUsername?: string;
    role: string;
    sharedAt: string;
  }>;
    signatures?: Array<{
    signedBy: string;
    signedByUsername?: string;
    walletAddress: string;
    signedAt: string;
    versionNumber: number;
    comment?: string;
  }>;
    matchedVersion?: number;
    blockchain?: {
    documentId: string;
    ipfsHash: string;
    metadataHash: string;
    owner: string;
    isDeleted: boolean;
    blockNumber: number;
    transactionHash: string;
  };
}

// Tipos de filtros
/**
 * Filtros aplicables al listado de documentos.
 */
export interface DocumentFilters {
    search?: string;
    fileExtension?: string;
    folderId?: string;
    tags?: string[];

}

// ========================================
