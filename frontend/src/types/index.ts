export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: 'ADMIN' | 'USER';
  isAdmin: boolean;  // Helper computed property
  twoFactorEnabled?: boolean;
  avatarUrl?: string | null;
  publicKey: string;
  isSuspended?: boolean;
  suspendedAt?: string | null;
  suspendReason?: string | null;
  
  // Encryption keys (Backend Encryption Architecture)
  encryptedPrivateKey?: string;  // AES-encrypted private key (password-based)
  keySalt?: string;              // Salt for password-derived key
  
  // Wallets
  wallets?: Array<{
    id: string;
    address: string;
    label: string | null;
    isPrimary: boolean;
  }>;
  walletAddress?: string;  // Helper for primary wallet address
  
  createdAt: string;
  lastLogin: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  user: User;
  recoveryKey?: string; // Only returned on registration
}

export interface TwoFactorChallengeResponse {
  requires2FA: true;
  tempToken: string;
  user: User;
}

export type LoginResponse = AuthResponse | TwoFactorChallengeResponse;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface Wallet {
  id: string;
  address: string;
  label: string | null;
  isPrimary: boolean;
}

export interface Document {
  id: string;
  blockchainId: string;
  publicId?: string | null;
  name: string;
  description: string | null;
  mimeType: string;
  size: string; // BigInt serialization
  fileExtension: string;
  ownerId: string;
  folderId: string | null;
  categoryId: string | null;
  tags: string[];
  visibility: 'PRIVATE' | 'PUBLIC';
  isEncrypted: boolean;
  
  // Encryption fields (Backend Encryption Architecture)
  encryptedSymmetricKey?: string;  // RSA-encrypted symmetric key
  encryptionIV?: string;            // Base64-encoded IV for AES-256-GCM
  encryptionAuthTag?: string;       // Base64-encoded auth tag
  
  // Archive status
  isArchived: boolean;
  archivedAt: string | null;
  
  // Metadata de sincronización
  blockchainStatus: 'PREPARING' | 'TX_SUBMITTED' | 'SYNCED' | 'FAILED';
  
  // Relaciones (populated desde DB)
  owner?: {
    username: string;
    fullName: string | null;
  };
  folder?: Folder;
  category?: Category;
  role?: DocumentRole;
}

export interface Version {
  id: string;
  documentId: string;
  userId: string;
  comment: string | null;
  versionNumber: number;
  ipfsCid: string | null;
  createdAt: string;
  isOperational: boolean;
  isEncrypted?: boolean;
  
  // Metadata de sincronización
  blockchainStatus: 'PREPARING' | 'TX_SUBMITTED' | 'SYNCED' | 'FAILED';
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
  // ❌ Campos eliminados (ahora solo en blockchain):
  // signature, message, comment, signedAt
  signedAt?: string;
  blockchainTxHash?: string | null;
  
  // Metadata de sincronización
  blockchainStatus: 'PREPARING' | 'TX_SUBMITTED' | 'SYNCED' | 'FAILED';
  
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

export interface PublicDocumentVersion {
  id: string;
  versionNumber: number;
  comment: string | null;
  createdAt: string;
  isOperational: boolean;
  ipfsCid: string | null;
  blockchainStatus: 'PREPARING' | 'TX_SUBMITTED' | 'SYNCED' | 'FAILED';
}

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

export interface PublicDocument {
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
  isArchived: boolean;
  isDeleted: boolean;
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

// Aliases for backward compatibility
export type Role = DocumentRole;
export type ShareDocument = Share;


export interface UserStats {
  userId: string;
  documentsOwned: number;
  documentsShared: number;
  totalVersions: number;
  totalSignatures: number;
  storageUsed: number;
}

export interface SystemStats {
  totalUsers: number;
  totalDocuments: number;
  totalVersions: number;
  totalSignatures: number;
  totalStorageUsed: number;
  activeUsers: number;
}

export interface DocumentStats {
  documentId: string;
  totalVersions: number;
  totalSignatures: number;
  totalShares: number;
  size: number;
}

export interface PaginatedResponse<T> {
  documents?: T[];
  users?: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ApiError {
  error: string;
  details?: string;
  missing?: string[];
}

// Folder types
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

export interface FolderPath {
  id: string;
  name: string;
}

export interface FolderStats {
  documentCount: number;
  totalSize: bigint;
  subfolderCount: number;
}

// Category types
export interface Category {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isPredefined: boolean;
  isActive: boolean;
  createdAt: string;
  _count?: {
    documents: number;
  };
}

export interface CategoryStats {
  category: Category;
  documentCount: number;
  totalSize: bigint;
  recentDocuments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    createdAt: string;
  }>;
}

// Verification types
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
    isArchived: boolean;
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

// File validation types
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  config?: {
    extensions: string[];
    maxSize: number;
    description: string;
  };
}

// Filter types
export interface DocumentFilters {
  search?: string;
  fileExtension?: string;  // Usar fileExtension (como backend)
  categoryId?: string;
  folderId?: string;
  tags?: string[];
  // ❌ NO incluir filtros de fechas (createdAt solo en blockchain)
  // ❌ NO incluir isArchived (solo en blockchain)
  // Si se necesitan, consultar BlockchainQueries después
}

// ========================================
// BLOCKCHAIN DATA TYPES
// ========================================
// Datos que vienen directamente de blockchain (source of truth)

export interface BlockchainDocument {
  blockchainId: string;
  owner: string; // wallet address
  ipfsCid: string;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockchainVersion {
  versionNumber: number;
  ipfsCid: string;
  creator: string; // wallet address
  createdAt: Date;
  isOperational: boolean;
  restoredFrom: number | null;
}

export interface BlockchainSignature {
  versionNumber: number;
  signer: string; // wallet address
  signature: string;
  message: string;
  comment: string;
  timestamp: Date;
}

// Hybrid: Combina datos de DB + Blockchain para la UI
export interface DocumentWithBlockchainData extends Document {
  // Datos de blockchain
  ipfsCid?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VersionWithBlockchainData extends Version {
  // Datos de blockchain
  versionNumber: number;
  ipfsCid: string | null;
  createdAt: string;
  isOperational: boolean;
}

export interface SignatureWithBlockchainData extends Signature {
  // Datos de blockchain
  signature?: string;
  message?: string;
  comment?: string | null;
  signedAt?: string;
}

