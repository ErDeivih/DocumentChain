// Documentos
const DOCUMENT_TYPES = {
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
const SPREADSHEET_TYPES = {
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
const PRESENTATION_TYPES = {
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
const IMAGE_TYPES = {
  extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  mimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
  ],
  maxSize: 25 * 1024 * 1024, // 25MB
  description: 'Imágenes (JPG, PNG, GIF, BMP, WebP, SVG)',
};

// Audio
const AUDIO_TYPES = {
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
const VIDEO_TYPES = {
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
const ARCHIVE_TYPES = {
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
const CODE_TYPES = {
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
const ALLOWED_FILE_TYPES = [
  DOCUMENT_TYPES,
  SPREADSHEET_TYPES,
  PRESENTATION_TYPES,
  IMAGE_TYPES,
  AUDIO_TYPES,
  VIDEO_TYPES,
  ARCHIVE_TYPES,
];

/**
 * Valida si la extensión de un archivo está dentro de la lista permitida.
 *
 * @param filename - Nombre del archivo a validar.
 * @returns `true` si la extensión es válida; de lo contrario, `false`.
 */
function isValidExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ALLOWED_FILE_TYPES.flatMap(type => type.extensions).includes(ext);
}

/**
 * Valida si un tipo MIME está dentro de la lista permitida.
 *
 * @param mimeType - Tipo MIME a validar.
 * @returns `true` si el tipo MIME es válido; de lo contrario, `false`.
 */
function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.flatMap(type => type.mimeTypes).includes(mimeType);
}

/**
 * Obtiene la extensión de un archivo, incluyendo el punto inicial.
 *
 * @param filename - Nombre del archivo.
 * @returns Extensión del archivo en minúsculas, o cadena vacía si no tiene extensión.
 */
function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
}

/**
 * Obtiene la configuración del tipo de archivo correspondiente a partir de su extensión.
 *
 * @param filename - Nombre del archivo.
 * @returns Configuración del tipo de archivo, o `null` si no se encuentra.
 */
function getFileTypeConfig(filename: string): { extensions: string[]; mimeTypes: string[]; maxSize: number; description: string } | null {
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
function isValidFileSize(filename: string, size: number): { valid: boolean; maxSize?: number } {
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
 * Realiza una validación completa de un archivo comprobando extensión, tipo MIME y tamaño.
 *
 * @param filename - Nombre del archivo.
 * @param mimeType - Tipo MIME del archivo.
 * @param size - Tamaño del archivo en bytes.
 * @returns Resultado de la validación con posibles errores y configuración detectada.
 */
export function validateFile(filename: string, mimeType: string, size: number): { valid: boolean; errors: string[]; config?: { extensions: string[]; mimeTypes: string[]; maxSize: number; description: string } } {
  const errors: string[] = [];
  
  const allowedExtensions = ALLOWED_FILE_TYPES.flatMap(type => type.extensions);
  
  // Validar extensión
  if (!isValidExtension(filename)) {
    errors.push(`Extensión de archivo no permitida. Extensiones válidas: ${allowedExtensions.join(', ')}`);
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
 * Normaliza un filtro de extensión de archivo añadiendo el punto si no lo tiene.
 * @param fileType - Extensión de archivo opcional.
 * @returns Extensión normalizada o undefined.
 */
export function normalizeFileExtensionFilter(fileType?: string): string | undefined {
  if (!fileType) return undefined;
  const trimmed = fileType.trim().toLowerCase();
  if (!trimmed) return undefined;
  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}
