import multer from 'multer';
import { validateFile } from '../utils/fileValidation';

/**
 * Configuración de almacenamiento en memoria para Multer.
 */
const storage = multer.memoryStorage();

/**
 * Filtro de archivos que valida los tipos permitidos mediante la lista blanca de validación.
 *
 * @param req - Objeto de solicitud de Express.
 * @param file - Archivo recibido por Multer.
 * @param cb - Callback de filtrado de Multer.
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const validation = validateFile(file.originalname, file.mimetype, 0); // Size will be checked after upload
  
  if (!validation.valid) {
    return cb(new Error(validation.errors.join(', ')));
  }
  
  cb(null, true);
};

/**
 * Filtro de archivos para contenido cifrado.
 * Acepta cualquier tipo de archivo ya que el contenido se encuentra cifrado.
 *
 * @param req - Objeto de solicitud de Express.
 * @param file - Archivo recibido por Multer.
 * @param cb - Callback de filtrado de Multer.
 */
const encryptedFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Encrypted files are binary blobs, accept them
  cb(null, true);
};

/**
 * Instancia de Multer configurada para la subida de archivos estándar.
 * Tamaño máximo: 100 MB.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max file size
  }
});

/**
 * Instancia de Multer configurada para la subida de archivos cifrados.
 * Tamaño máximo: 200 MB (mayor debido al sobrecoste de cifrado).
 */
export const uploadEncryptedMiddleware = multer({
  storage,
  fileFilter: encryptedFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB max for encrypted files (larger due to encryption overhead)
  }
});

/**
 * Middleware para la subida de un único archivo estándar.
 */
export const uploadSingle = upload.single('file');

/**
 * Middleware para la subida de múltiples archivos (máximo 10).
 */
export const uploadMultiple = upload.array('files', 10);

/**
 * Middleware para la subida de un archivo cifrado.
 */
export const uploadEncrypted = uploadEncryptedMiddleware.single('encryptedFile');

/**
 * Filtro de archivos para avatares: solo imágenes, máximo 2 MB.
 *
 * @param req - Objeto de solicitud de Express.
 * @param file - Archivo recibido por Multer.
 * @param cb - Callback de filtrado de Multer.
 */
const avatarFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Solo se permiten archivos de imagen'));
  }
  cb(null, true);
};

/**
 * Instancia de Multer configurada para la subida de avatares.
 * Solo acepta imágenes y limita el tamaño a 2 MB.
 */
export const uploadAvatarMiddleware = multer({
  storage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  }
});

/**
 * Middleware para la subida de un avatar individual.
 */
export const uploadAvatar = uploadAvatarMiddleware.single('avatar');
