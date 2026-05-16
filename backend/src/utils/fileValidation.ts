/**
 * Configuración de extensiones de archivo permitidas.
 * Únicamente se admiten tipos de archivo considerados seguros.
 */

/**
 * Interfaz que define la configuración de un tipo de archivo permitido.
 */
export interface FileTypeConfig {
  extensions: string[];
  mimeTypes: string[];
  maxSize: number; // en bytes
  description: string;
}

// Documentos
export const DOCUMENT_TYPES: FileTypeConfig = {
  extensions: ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'],
  mimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/plain',
  ],
  maxSize: 100 * 1024 * 1024, // 100MB
  description: 'Documentos (PDF, Word, ODT, RTF, TXT)',
};

// Hojas de cálculo
export const SPREADSHEET_TYPES: FileTypeConfig = {
  extensions: ['.xls', '.xlsx', '.ods', '.csv'],
  mimeTypes: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
    'text/csv',
  ],
  maxSize: 50 * 1024 * 1024, // 50MB
  description: 'Hojas de cálculo (Excel, ODS, CSV)',
};

// Presentaciones
export const PRESENTATION_TYPES: FileTypeConfig = {
  extensions: ['.ppt', '.pptx', '.odp'],
  mimeTypes: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.presentation',
  ],
  maxSize: 100 * 1024 * 1024, // 100MB
  description: 'Presentaciones (PowerPoint, ODP)',
};

// Imágenes
export const IMAGE_TYPES: FileTypeConfig = {
  extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
  mimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
  ],
  maxSize: 25 * 1024 * 1024, // 25MB
  description: 'Imágenes (JPG, PNG, GIF, BMP, WebP, SVG)',
};

// Audio
export const AUDIO_TYPES: FileTypeConfig = {
  extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
  mimeTypes: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/flac',
  ],
  maxSize: 50 * 1024 * 1024, // 50MB
  description: 'Audio (MP3, WAV, OGG, M4A, FLAC)',
};

// Video
export const VIDEO_TYPES: FileTypeConfig = {
  extensions: ['.mp4', '.avi', '.mkv', '.mov', '.webm'],
  mimeTypes: [
    'video/mp4',
    'video/x-msvideo',
    'video/x-matroska',
    'video/quicktime',
    'video/webm',
  ],
  maxSize: 500 * 1024 * 1024, // 500MB
  description: 'Video (MP4, AVI, MKV, MOV, WebM)',
};

// Archivos comprimidos
export const ARCHIVE_TYPES: FileTypeConfig = {
  extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  mimeTypes: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ],
  maxSize: 200 * 1024 * 1024, // 200MB
  description: 'Archivos comprimidos (ZIP, RAR, 7Z, TAR, GZ)',
};

// Código fuente (solo lectura, sin ejecución)
export const CODE_TYPES: FileTypeConfig = {
  extensions: ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt'],
  mimeTypes: [
    'text/javascript',
    'application/typescript',
    'text/x-python',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'text/x-csharp',
    'text/x-go',
    'text/x-rust',
    'application/x-php',
    'text/x-ruby',
    'text/x-swift',
    'text/x-kotlin',
  ],
  maxSize: 10 * 1024 * 1024, // 10MB
  description: 'Código fuente (JS, TS, Python, Java, etc)',
};

// Todos los tipos permitidos
export const ALLOWED_FILE_TYPES = [
  DOCUMENT_TYPES,
  SPREADSHEET_TYPES,
  PRESENTATION_TYPES,
  IMAGE_TYPES,
  AUDIO_TYPES,
  VIDEO_TYPES,
  ARCHIVE_TYPES,
  CODE_TYPES,
];

// Lista plana de todas las extensiones permitidas
export const ALLOWED_EXTENSIONS = ALLOWED_FILE_TYPES.flatMap(type => type.extensions);

// Lista plana de todos los MIME types permitidos
export const ALLOWED_MIME_TYPES = ALLOWED_FILE_TYPES.flatMap(type => type.mimeTypes);

// Tamaño máximo absoluto (el más grande de todos los tipos)
export const MAX_FILE_SIZE = Math.max(...ALLOWED_FILE_TYPES.map(type => type.maxSize));

/**
 * Valida si la extensión de un archivo está dentro de la lista permitida.
 *
 * @param filename - Nombre del archivo a validar.
 * @returns `true` si la extensión es válida; de lo contrario, `false`.
 */
export function isValidExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Valida si un tipo MIME está dentro de la lista permitida.
 *
 * @param mimeType - Tipo MIME a validar.
 * @returns `true` si el tipo MIME es válido; de lo contrario, `false`.
 */
export function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Obtiene la extensión de un archivo, incluyendo el punto inicial.
 *
 * @param filename - Nombre del archivo.
 * @returns Extensión del archivo en minúsculas, o cadena vacía si no tiene extensión.
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
}

/**
 * Obtiene la configuración del tipo de archivo correspondiente a partir de su extensión.
 *
 * @param filename - Nombre del archivo.
 * @returns Configuración del tipo de archivo, o `null` si no se encuentra.
 */
export function getFileTypeConfig(filename: string): FileTypeConfig | null {
  const ext = getFileExtension(filename);
  return ALLOWED_FILE_TYPES.find(type => type.extensions.includes(ext)) || null;
}

/**
 * Valida que el tamaño de un archivo no exceda el límite definido para su tipo.
 *
 * @param filename - Nombre del archivo.
 * @param size - Tamaño del archivo en bytes.
 * @returns Objeto indicando si es válido y, en su caso, el tamaño máximo permitido.
 */
export function isValidFileSize(filename: string, size: number): { valid: boolean; maxSize?: number } {
  const config = getFileTypeConfig(filename);
  
  if (!config) {
    return { valid: false };
  }
  
  return {
    valid: size <= config.maxSize,
    maxSize: config.maxSize,
  };
}

/**
 * Interfaz que representa el resultado de la validación completa de un archivo.
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  config?: FileTypeConfig;
}

/**
 * Realiza una validación completa de un archivo comprobando extensión, tipo MIME y tamaño.
 *
 * @param filename - Nombre del archivo.
 * @param mimeType - Tipo MIME del archivo.
 * @param size - Tamaño del archivo en bytes.
 * @returns Resultado de la validación con posibles errores y configuración detectada.
 */
export function validateFile(filename: string, mimeType: string, size: number): FileValidationResult {
  const errors: string[] = [];
  
  // Validar extensión
  if (!isValidExtension(filename)) {
    errors.push(`Extensión de archivo no permitida. Extensiones válidas: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
  
  // Validar MIME type
  if (!isValidMimeType(mimeType)) {
    errors.push(`Tipo de archivo no permitido (MIME: ${mimeType})`);
  }
  
  // Validar tamaño
  const sizeValidation = isValidFileSize(filename, size);
  if (!sizeValidation.valid) {
    const maxSizeMB = sizeValidation.maxSize ? (sizeValidation.maxSize / 1024 / 1024).toFixed(2) : 'N/A';
    errors.push(`El archivo excede el tamaño máximo permitido (${maxSizeMB}MB)`);
  }
  
  const config = getFileTypeConfig(filename);
  
  return {
    valid: errors.length === 0,
    errors,
    config: config || undefined,
  };
}

/**
 * Obtiene el nombre del icono recomendado según la extensión del archivo.
 *
 * @param filename - Nombre del archivo.
 * @returns Identificador del icono asociado al tipo de archivo.
 */
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  
  // Documentos
  if (['.pdf'].includes(ext)) return 'file-pdf';
  if (['.doc', '.docx', '.odt', '.rtf'].includes(ext)) return 'file-text';
  if (['.txt'].includes(ext)) return 'file-text';
  
  // Hojas de cálculo
  if (['.xls', '.xlsx', '.ods', '.csv'].includes(ext)) return 'file-spreadsheet';
  
  // Presentaciones
  if (['.ppt', '.pptx', '.odp'].includes(ext)) return 'presentation';
  
  // Imágenes
  if (IMAGE_TYPES.extensions.includes(ext)) return 'image';
  
  // Audio
  if (AUDIO_TYPES.extensions.includes(ext)) return 'music';
  
  // Video
  if (VIDEO_TYPES.extensions.includes(ext)) return 'video';
  
  // Archivos comprimidos
  if (ARCHIVE_TYPES.extensions.includes(ext)) return 'archive';
  
  // Código
  if (CODE_TYPES.extensions.includes(ext)) return 'code';
  
  return 'file';
}

/**
 * Categorías predefinidas del sistema para la clasificación de documentos.
 */
export const PREDEFINED_CATEGORIES = [
  { id: 'cat_legal', name: 'Legal', description: 'Documentos legales y contratos', color: '#DC2626', icon: 'scale' },
  { id: 'cat_financial', name: 'Financiero', description: 'Informes financieros y facturas', color: '#16A34A', icon: 'dollar-sign' },
  { id: 'cat_personal', name: 'Personal', description: 'Documentos personales', color: '#2563EB', icon: 'user' },
  { id: 'cat_work', name: 'Trabajo', description: 'Documentos relacionados con el trabajo', color: '#7C3AED', icon: 'briefcase' },
  { id: 'cat_academic', name: 'Académico', description: 'Artículos académicos e investigación', color: '#0891B2', icon: 'graduation-cap' },
  { id: 'cat_medical', name: 'Médico', description: 'Registros e informes médicos', color: '#DB2777', icon: 'heart-pulse' },
  { id: 'cat_technical', name: 'Técnico', description: 'Documentación técnica', color: '#EA580C', icon: 'code' },
  { id: 'cat_other', name: 'Otros', description: 'Documentos varios', color: '#6B7280', icon: 'file' },
];
