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
  const validation = validateFile(file.originalname, file.mimetype, 0); // El tamano se verificara despues de la subida
  
  if (!validation.valid) {
    return cb(Object.assign(new Error(validation.errors.join(', ')), { status: 400, code: 'INVALID_FILE_TYPE' }));
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
  // Los archivos cifrados son blobs binarios, aceptarlos
  cb(null, true);
};

/**
 * Instancia de Multer configurada para subida de archivos cifrados.
 * Usada por uploadEncrypted para recibir documentos del cliente.
 */

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
 * Middleware para la subida de un archivo cifrado.
 */
export const uploadEncrypted = uploadEncryptedMiddleware.single('encryptedFile');

