import multer from 'multer';
import { validateFile } from '../utils/fileValidation';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter to validate file types using our whitelist
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const validation = validateFile(file.originalname, file.mimetype, 0); // Size will be checked after upload
  
  if (!validation.valid) {
    return cb(new Error(validation.errors.join(', ')));
  }
  
  cb(null, true);
};

// File filter for encrypted files (accepts any file type since it's encrypted)
const encryptedFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Encrypted files are binary blobs, accept them
  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max file size
  }
});

// Configure multer for encrypted files
export const uploadEncryptedMiddleware = multer({
  storage,
  fileFilter: encryptedFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB max for encrypted files (larger due to encryption overhead)
  }
});

// Single file upload middleware
export const uploadSingle = upload.single('file');

// Multiple files upload middleware (for future use)
export const uploadMultiple = upload.array('files', 10); // Max 10 files

// Encrypted file upload middleware
export const uploadEncrypted = uploadEncryptedMiddleware.single('encryptedFile');
