/**
 * Tipos fundamentales del dominio de la aplicación.
 * ================================
 * Incluye entidades de usuario, documentos, firmas, carpetas,
 * estadísticas, paginación, verificación y tipos híbridos blockchain.
 */

/**
 * Representa un usuario registrado en el sistema.
 */
export interface User {
  /** Identificador único del usuario. */
  id: string;
  /** Nombre de usuario (login). */
  username: string;
  /** Correo electrónico. */
  email: string;
  /** Nombre completo, si fue proporcionado. */
  fullName: string | null;
  /** Rol del usuario en el sistema. */
  role: 'ADMIN' | 'USER';
  /** Propiedad computada: `true` si el rol es ADMIN. */
  isAdmin: boolean;
  /** URL del avatar, o `null` si no tiene. */
  avatarUrl?: string | null;
  /** Clave pública RSA del usuario (Base64). */
  publicKey: string;
  /** Indica si el correo electrónico ha sido verificado. */
  emailVerified: boolean;

  // Claves de cifrado (Arquitectura de Cifrado del Backend)
  /** Clave privada cifrada con AES (derivada de la contraseña). */
  encryptedPrivateKey?: string;
  /** Salt para la derivación de la clave a partir de la contraseña. */
  keySalt?: string;

  // Wallets
  /** Listado de wallets asociadas al usuario. */
  wallets?: Array<{
    id: string;
    address: string;
    label: string | null;
    isPrimary: boolean;
  }>;
  /** Dirección de la wallet principal (propiedad computada). */
  walletAddress?: string;

  /** Fecha de creación de la cuenta en formato ISO. */
  createdAt: string;
}

/**
 * Respuesta exitosa de autenticación con tokens JWT.
 */
export interface AuthResponse {
  /** Token de acceso JWT. */
  accessToken: string;
  /** Token de refresco para renovar la sesión. */
  refreshToken: string;
  /** Duración del token de acceso en segundos. */
  expiresIn: number;
  /** Datos del usuario autenticado. */
  user: User;
  /** Clave de recuperación; solo se devuelve tras el registro. */
  recoveryKey?: string;
}

/** Respuesta de inicio de sesión. */
export type LoginResponse = AuthResponse;

/** Solicitud de inicio de sesión con credenciales tradicionales. */
export interface LoginRequest {
  /** Nombre de usuario. */
  username: string;
  /** Contraseña del usuario. */
  password: string;
}

/** Solicitud de registro de nuevo usuario. */
export interface RegisterRequest {
  /** Nombre de usuario deseado. */
  username: string;
  /** Correo electrónico. */
  email: string;
  /** Contraseña. */
  password: string;
  /** Nombre completo opcional. */
  fullName?: string;
}

/**
 * Representa una wallet guardada en la base de datos.
 */
export interface Wallet {
  /** Identificador único de la wallet. */
  id: string;
  /** Dirección pública de la wallet. */
  address: string;
  /** Etiqueta descriptiva opcional. */
  label: string | null;
  /** Indica si es la wallet principal del usuario. */
  isPrimary: boolean;
}

/**
 * Representa un documento gestionado en el sistema.
 */
export interface Document {
  /** Identificador único en la base de datos. */
  id: string;
  /** Identificador on-chain del documento. */
  blockchainId: string;
  /** Identificador público para acceso público, o `null`. */
  publicId?: string | null;
  /** Nombre del documento. */
  name: string;
  /** Descripción opcional. */
  description: string | null;
  /** Tipo MIME del archivo. */
  mimeType: string;
  /** Tamaño en bytes. */
  size: number;
  /** Extensión del archivo. */
  fileExtension: string;
  /** Identificador del propietario. */
  ownerId: string;
  /** Identificador de la carpeta contenedora, o `null`. */
  folderId: string | null;
  /** Etiquetas asociadas al documento. */
  tags: string[];
  /** Nivel de visibilidad del documento. */
  visibility: 'PRIVATE' | 'PUBLIC';
  /** Indica si el contenido del documento está cifrado. */
  isEncrypted: boolean;

  // Campos de cifrado (Arquitectura de Cifrado del Backend)
  /** Clave simétrica cifrada con la clave pública RSA del propietario. */
  encryptedSymmetricKey?: string;
  /** Vector de inicialización (IV) para AES-256-GCM, codificado en Base64. */
  encryptionIV?: string;
  /** Tag de autenticación de AES-GCM, codificado en Base64. */
  encryptionAuthTag?: string;

  // Metadata de sincronización
  /** Estado actual de sincronización con blockchain. */
  blockchainStatus: 'PREPARING' | 'TX_SUBMITTED' | 'SYNCED' | 'FAILED';

  // Timestamps
  /** Fecha de creación en formato ISO. */
  createdAt: string;
  /** Fecha de última actualización en formato ISO. */
  updatedAt: string;

  // Relaciones (pobladas desde la base de datos)
  /** Propietario del documento. */
  owner?: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl?: string | null;
  };
  /** Carpeta contenedora. */
  folder?: Folder;
  /** Rol del usuario actual sobre el documento. */
  role?: DocumentRole;
}

/**
 * Representa una versión de un documento.
 */
export interface Version {
  /** Identificador único de la versión. */
  id: string;
  /** Identificador del documento padre. */
  documentId: string;
  /** Identificador del usuario que creó la versión. */
  userId: string;
  /** Comentario descriptivo de la versión, o `null`. */
  comment: string | null;
  /** Número secuencial de la versión. */
  versionNumber: number;
  /** CID de IPFS donde se almacena el contenido, o `null`. */
  ipfsCid: string | null;
  /** Fecha de creación en formato ISO. */
  createdAt: string;
  /** Indica si la versión está cifrada. */
  isEncrypted?: boolean;

  // Metadata de sincronización
  /** Estado de sincronización con blockchain. */
  blockchainStatus: 'PREPARING' | 'TX_SUBMITTED' | 'SYNCED' | 'FAILED';
  /** Hash de la transacción blockchain, o `null`. */
  blockchainTxHash?: string | null;

  // Relaciones
  /** Usuario que creó la versión. */
  user?: {
    username: string;
    fullName: string | null;
  };
}

/**
 * Representa una firma realizada sobre una versión de documento.
 */
export interface Signature {
  /** Identificador único de la firma. */
  id: string;
  /** Identificador del documento, si aplica. */
  documentId?: string;
  /** Identificador de la versión firmada. */
  versionId: string;
  /** Número de versión firmada. */
  versionNumber?: number;
  /** Identificador del usuario firmante, o `null` si es anónima. */
  userId?: string | null;
  /** Identificador de la wallet utilizada, o `null`. */
  signerWalletId?: string | null;
  /** Dirección de la wallet firmante. */
  walletAddress?: string;
  /** Fecha de firma en formato ISO. */
  signedAt?: string;
  /** Hash de la transacción blockchain, o `null`. */
  blockchainTxHash?: string | null;

  // Metadata de sincronización
  /** Estado de sincronización con blockchain. */
  blockchainStatus: 'PREPARING' | 'TX_SUBMITTED' | 'SYNCED' | 'FAILED';

  // Relaciones
  /** Usuario que realizó la firma. */
  user?: {
    username: string;
    fullName: string | null;
  };
  /** Información del firmante (en vivo o snapshot). */
  signer?: {
    userId: string | null;
    username: string | null;
    fullName: string | null;
    walletAddress: string;
    source: 'live' | 'snapshot';
    avatarUrl?: string | null;
  };
}

/**
 * Representación pública y reducida de una versión de documento.
 */
export interface PublicDocumentVersion {
  /** Identificador de la versión. */
  id: string;
  /** Número de versión. */
  versionNumber: number;
  /** Comentario de la versión. */
  comment: string | null;
  /** Fecha de creación. */
  createdAt: string;
  /** CID de IPFS. */
  ipfsCid: string | null;
  /** Estado de sincronización blockchain. */
  blockchainStatus: 'PREPARING' | 'TX_SUBMITTED' | 'SYNCED' | 'FAILED';
}

/**
 * Representación pública de una firma asociada a un documento.
 */
export interface PublicDocumentSignature {
  /** Identificador de la firma. */
  id: string;
  /** Identificador de la versión firmada. */
  versionId: string;
  /** Número de versión. */
  versionNumber: number;
  /** Fecha de firma. */
  signedAt: string;
  /** Información del firmante. */
  signer: {
    username: string;
    fullName: string | null;
    avatarUrl?: string | null;
  } | null;
}

/**
 * Documento en su vista pública accesible sin autenticación.
 */
export interface PublicDocument {
  /** Identificador interno. */
  id: string;
  /** Identificador público para acceso directo. */
  publicId: string;
  /** Identificador on-chain. */
  blockchainId: string | null;
  /** Nombre del documento. */
  name: string;
  /** Descripción. */
  description: string | null;
  /** Tipo MIME. */
  mimeType: string;
  /** Tamaño en bytes. */
  size: number;
  /** Extensión del archivo. */
  fileExtension?: string | null;
  /** Hash del contenido. */
  contentHash: string;
  /** Hash de los metadatos. */
  metadataHash: string;
  /** Visibilidad (siempre PUBLIC). */
  visibility: 'PUBLIC';
  /** Fecha de creación. */
  createdAt: string;
  /** Propietario del documento. */
  owner: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl?: string | null;
  };
  /** Versiones públicas del documento. */
  versions: PublicDocumentVersion[];
  /** Firmas públicas del documento. */
  signatures: PublicDocumentSignature[];
}

/**
 * Representa un registro de compartición de un documento.
 */
export interface Share {
  /** Identificador del registro de compartición. */
  id: string;
  /** Identificador del documento compartido. */
  documentId: string;
  /** Identificador del usuario con quien se comparte. */
  userId: string;
  /** Rol otorgado al usuario compartido. */
  role: DocumentRole;
  /** Fecha de compartición. */
  createdAt: string;
  /** Información del usuario receptor. */
  user?: {
    username: string;
    fullName: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

/** Roles posibles sobre un documento. */
export enum DocumentRole {
  /** Propietario del documento. */
  OWNER = 'OWNER',
  /** Permiso de lectura y escritura compartido. */
  SHARED_WRITE = 'SHARED_WRITE',
  /** Permiso de solo lectura compartido. */
  SHARED_READ = 'SHARED_READ'
}

/** Alias de retrocompatibilidad para el rol de documento. */
export type Role = DocumentRole;
/** Alias de retrocompatibilidad para el registro de compartición. */
export type ShareDocument = Share;

/**
 * Respuesta paginada de documentos.
 */
export interface PaginatedDocumentsResponse {
  /** Documentos paginados. */
  documents: Document[];
  /** Total de elementos disponibles. */
  total: number;
  /** Página actual. */
  page: number;
  /** Total de páginas. */
  totalPages: number;
}

/**
 * Respuesta paginada de usuarios.
 */
export interface PaginatedUsersResponse {
  /** Usuarios paginados. */
  users: User[];
  /** Total de elementos disponibles. */
  total: number;
  /** Página actual. */
  page: number;
  /** Total de páginas. */
  totalPages: number;
}

/**
 * Información de paginación estándar.
 */
export interface PaginationInfo {
  /** Total de elementos. */
  total: number;
  /** Página actual. */
  page: number;
  /** Total de páginas. */
  totalPages: number;
  /** Elementos por página. */
  limit: number;
}

/**
 * Estructura de error devuelta por el API.
 */
export interface ApiError {
  /** Mensaje descriptivo del error. */
  error: string;
  /** Detalles adicionales, si los hay. */
  details?: string;
  /** Lista de campos faltantes o inválidos. */
  missing?: string[];
}

// Tipos de carpeta
/**
 * Representa una carpeta jerárquica de documentos.
 */
export interface Folder {
  /** Identificador único. */
  id: string;
  /** Identificador del propietario. */
  userId: string;
  /** Nombre de la carpeta. */
  name: string;
  /** Descripción opcional. */
  description: string | null;
  /** Identificador de la carpeta padre, o `null` si es raíz. */
  parentId: string | null;
  /** Color asociado a la carpeta. */
  color: string | null;
  /** Icono asociado a la carpeta. */
  icon: string | null;
  /** Indica si la carpeta ha sido compartida. */
  isShared: boolean;
  /** Fecha de creación. */
  createdAt: string;
  /** Fecha de última actualización. */
  updatedAt: string;
  /** Carpeta padre. */
  parent?: Folder;
  /** Subcarpetas. */
  children?: Folder[];
  /** Conteos de documentos y subcarpetas. */
  _count?: {
    documents: number;
    children: number;
  };
}

/**
 * Representación reducida de una carpeta para rutas de navegación.
 */
export interface FolderPath {
  /** Identificador de la carpeta. */
  id: string;
  /** Nombre de la carpeta. */
  name: string;
}

/**
 * Estadísticas de una carpeta.
 */
export interface FolderStats {
  /** Número de documentos contenidos. */
  documentCount: number;
  /** Tamaño total de los documentos. */
  totalSize: number;
  /** Número de subcarpetas. */
  subfolderCount: number;
}

// Tipos de verificación
/**
 * Resultado de la verificación de un documento contra blockchain.
 */
export interface VerificationResult {
  /** Indica si el documento existe en el registro. */
  exists: boolean;
  /** Información del documento verificado. */
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
  /** Versiones verificadas. */
  versions?: Array<{
    versionNumber: number;
    createdAt: string;
    createdBy?: string;
    comment?: string;
  }>;
  /** Comparticiones verificadas. */
  shares?: Array<{
    sharedWith: string;
    sharedWithUsername?: string;
    role: string;
    sharedAt: string;
  }>;
  /** Firmas verificadas. */
  signatures?: Array<{
    signedBy: string;
    signedByUsername?: string;
    walletAddress: string;
    signedAt: string;
    versionNumber: number;
    comment?: string;
  }>;
  /** Versión coincidente, si aplica. */
  matchedVersion?: number;
  /** Datos on-chain del documento. */
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

// Tipos de validación de archivos
/**
 * Resultado de la validación de un archivo subido.
 */
export interface FileValidationResult {
  /** Indica si el archivo cumple las restricciones. */
  valid: boolean;
  /** Listado de errores detectados. */
  errors: string[];
  /** Configuración aplicada para la validación. */
  config?: {
    extensions: string[];
    maxSize: number;
    description: string;
  };
}

// Tipos de filtros
/**
 * Filtros aplicables al listado de documentos.
 */
export interface DocumentFilters {
  /** Texto de búsqueda en nombre o descripción. */
  search?: string;
  /** Extensión de archivo a filtrar. */
  fileExtension?: string;
  /** Identificador de carpeta. */
  folderId?: string;
  /** Etiquetas requeridas. */
  tags?: string[];

}

// ========================================
// TIPOS DE DATOS BLOCKCHAIN
// ========================================
// Datos que vienen directamente de blockchain (fuente de verdad)

/**
 * Representación de un documento tal como se almacena en el contrato inteligente.
 */
export interface BlockchainDocument {
  /** Identificador on-chain. */
  blockchainId: string;
  /** Dirección del propietario (wallet). */
  owner: string;
  /** CID de IPFS del contenido. */
  ipfsCid: string;
  /** Indica si está archivado. */
  isArchived: boolean;
  /** Indica si está eliminado. */
  isDeleted: boolean;
  /** Fecha de creación on-chain. */
  createdAt: Date;
  /** Fecha de última actualización on-chain. */
  updatedAt: Date;
}

/**
 * Representación de una versión tal como se almacena en el contrato inteligente.
 */
export interface BlockchainVersion {
  /** Número de versión. */
  versionNumber: number;
  /** CID de IPFS. */
  ipfsCid: string;
  /** Dirección del creador (wallet). */
  creator: string;
  /** Fecha de creación on-chain. */
  createdAt: Date;
  /** Indica si es la versión operativa. */
  isOperational: boolean;
  /** Versión restaurada, o `null`. */
  restoredFrom: number | null;
}

/**
 * Representación de una firma tal como se almacena en el contrato inteligente.
 */
export interface BlockchainSignature {
  /** Número de versión firmada. */
  versionNumber: number;
  /** Dirección del firmante (wallet). */
  signer: string;
  /** Firma criptográfica. */
  signature: string;
  /** Mensaje firmado. */
  message: string;
  /** Comentario asociado a la firma. */
  comment: string;
  /** Marca temporal de la firma. */
  timestamp: Date;
}

// Híbridos: combinan datos de DB + Blockchain para la UI

/**
 * Documento enriquecido con datos adicionales provenientes de blockchain.
 */
export interface DocumentWithBlockchainData extends Document {
  /** CID de IPFS (desde blockchain). */
  ipfsCid?: string;
  /** Indica si está eliminado (desde blockchain). */
  isDeleted?: boolean;
}

/**
 * Versión enriquecida con datos adicionales provenientes de blockchain.
 */
export interface VersionWithBlockchainData extends Version {
  /** Número de versión (garantizado desde blockchain). */
  versionNumber: number;
  /** CID de IPFS (desde blockchain). */
  ipfsCid: string | null;
  /** Fecha de creación (desde blockchain). */
  createdAt: string;
  /** Indica si es operativa (desde blockchain). */
  isOperational: boolean;
}

/**
 * Firma enriquecida con datos adicionales provenientes de blockchain.
 */
export interface SignatureWithBlockchainData extends Signature {
  /** Firma criptográfica (desde blockchain). */
  signature?: string;
  /** Mensaje firmado (desde blockchain). */
  message?: string;
  /** Comentario de la firma (desde blockchain). */
  comment?: string | null;
  /** Fecha de firma (desde blockchain). */
  signedAt?: string;
}
