/**
 * Tests for Backend Encryption Library
 * Verifies AES-256-GCM encryption and RSA-4096 key wrapping
 */

import * as Encryption from '../encryption';
import { KeyManager } from '../crypto/KeyManager';
import crypto from 'crypto';

describe('Encryption Library - Backend Encryption Architecture', () => {
  describe('File Encryption (AES-256-GCM)', () => {
    it('should encrypt and decrypt a file correctly', () => {
      const originalData = Buffer.from('Test file content for encryption', 'utf-8');
      
      // Encrypt
      const encrypted = Encryption.encryptFile(originalData);
      
      expect(encrypted).toHaveProperty('encryptedData');
      expect(encrypted).toHaveProperty('symmetricKey');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('authTag');
      expect(encrypted).toHaveProperty('contentHash');
      
      // Verify encrypted data is different from original
      expect(encrypted.encryptedData).not.toEqual(originalData);
      
      // Verify key is base64-encoded 256 bits (32 bytes = 44 base64 chars)
      expect(encrypted.symmetricKey).toMatch(/^[A-Za-z0-9+/]+=*$/);
      expect(Buffer.from(encrypted.symmetricKey, 'base64').length).toBe(32);
      
      // Verify IV is 16 bytes
      expect(Buffer.from(encrypted.iv, 'base64').length).toBe(16);
      
      // Verify auth tag is 16 bytes
      expect(Buffer.from(encrypted.authTag, 'base64').length).toBe(16);
      
      // Decrypt
      const decrypted = Encryption.decryptFile({
        encryptedData: encrypted.encryptedData,
        symmetricKey: encrypted.symmetricKey,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      });
      
      // Verify decrypted matches original
      expect(decrypted.toString('utf-8')).toBe(originalData.toString('utf-8'));
    });

    it('should generate different IVs for each encryption', () => {
      const data = Buffer.from('Same content', 'utf-8');
      
      const encrypted1 = Encryption.encryptFile(data);
      const encrypted2 = Encryption.encryptFile(data);
      
      // Different IVs mean different ciphertext even with same content
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.encryptedData).not.toEqual(encrypted2.encryptedData);
    });

    it('should fail decryption with wrong auth tag', () => {
      const data = Buffer.from('Secure content', 'utf-8');
      const encrypted = Encryption.encryptFile(data);
      
      // Tamper with auth tag
      const tamperedAuthTag = Buffer.from(encrypted.authTag, 'base64');
      tamperedAuthTag[0] ^= 0xFF; // Flip bits
      
      expect(() => {
        Encryption.decryptFile({
          encryptedData: encrypted.encryptedData,
          symmetricKey: encrypted.symmetricKey,
          iv: encrypted.iv,
          authTag: tamperedAuthTag.toString('base64'),
        });
      }).toThrow();
    });

    it('should calculate consistent content hash', () => {
      const data = Buffer.from('Content for hashing', 'utf-8');
      
      const hash1 = Encryption.calculateHash(data);
      const hash2 = Encryption.calculateHash(data);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
    });
  });

  describe('RSA Key Wrapping (RSA-4096)', () => {
    let publicKey: string;
    let privateKey: string;

    beforeAll(() => {
      // Generate RSA key pair for testing
      const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });
      
      publicKey = keyPair.publicKey;
      privateKey = keyPair.privateKey;
    });

    it('should encrypt and decrypt symmetric key', () => {
      const symmetricKey = crypto.randomBytes(32).toString('base64'); // AES-256 key as base64
      
      // Encrypt symmetric key with RSA public key
      const encryptedKey = Encryption.encryptSymmetricKey(symmetricKey, publicKey);
      
      expect(encryptedKey).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64
      expect(encryptedKey.length).toBeGreaterThan(500); // RSA-4096 produces large ciphertext
      
      // Decrypt symmetric key with RSA private key
      const decryptedKey = Encryption.decryptSymmetricKey(encryptedKey, privateKey);
      
      // Verify decrypted key matches original (both are base64 strings)
      expect(decryptedKey).toBe(symmetricKey);
    });

    it('should fail decryption with wrong private key', () => {
      const symmetricKey = crypto.randomBytes(32).toString('base64');
      const encryptedKey = Encryption.encryptSymmetricKey(symmetricKey, publicKey);
      
      // Generate different key pair
      const wrongKeyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      expect(() => {
        Encryption.decryptSymmetricKey(encryptedKey, wrongKeyPair.privateKey);
      }).toThrow();
    });

    it('should handle large symmetric keys', () => {
      const largeKey = crypto.randomBytes(64).toString('base64'); // 512 bits
      
      const encrypted = Encryption.encryptSymmetricKey(largeKey, publicKey);
      const decrypted = Encryption.decryptSymmetricKey(encrypted, privateKey);
      
      expect(decrypted).toBe(largeKey);
    });
  });

  describe('Password-Based Encryption (User Private Keys)', () => {
    it('should encrypt and decrypt private key with password', () => {
      const privateKey = crypto.randomBytes(256).toString('base64'); // Simulated RSA private key
      const password = 'user-secure-password-123';
      
      // Encrypt with KeyManager
      const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, password);
      
      expect(encryptedPrivateKey).toBeTruthy();
      expect(typeof encryptedPrivateKey).toBe('string');
      
      // Decrypt with KeyManager
      const decrypted = KeyManager.decryptPrivateKey(encryptedPrivateKey, password);
      
      expect(decrypted).toBe(privateKey);
    });

    it('should fail decryption with wrong password', () => {
      const privateKey = 'secret-private-key-data';
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';
      
      const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, correctPassword);
      
      expect(() => {
        KeyManager.decryptPrivateKey(encryptedPrivateKey, wrongPassword);
      }).toThrow();
    });

    it('should generate different encrypted keys with different passwords', () => {
      const privateKey = 'same-private-key-data';
      
      const enc1 = KeyManager.encryptPrivateKey(privateKey, 'password1');
      const enc2 = KeyManager.encryptPrivateKey(privateKey, 'password2');
      
      expect(enc1).not.toBe(enc2);
    });
  });

  describe('Validation Functions', () => {
    it('should validate file size within limit', () => {
      expect(() => {
        Encryption.validateFileSize(50 * 1024 * 1024, 100); // 50MB, limit 100MB
      }).not.toThrow();
    });

    it('should reject files exceeding size limit', () => {
      expect(() => {
        Encryption.validateFileSize(150 * 1024 * 1024, 100); // 150MB, limit 100MB
      }).toThrow('File size exceeds maximum allowed size of 100MB');
    });

    it('should validate allowed MIME types', () => {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      
      expect(() => {
        Encryption.validateMimeType('application/pdf', allowedTypes);
      }).not.toThrow();
      
      expect(() => {
        Encryption.validateMimeType('image/png', allowedTypes);
      }).not.toThrow();
    });

    it('should reject disallowed MIME types', () => {
      const allowedTypes = ['application/pdf'];
      
      expect(() => {
        Encryption.validateMimeType('application/x-executable', allowedTypes);
      }).toThrow('File type application/x-executable is not allowed');
    });
  });

  describe('Re-encryption for Sharing', () => {
    it('should re-encrypt symmetric key for different user', () => {
      // User A encrypts file
      const fileData = Buffer.from('Shared document content', 'utf-8');
      const encrypted = Encryption.encryptFile(fileData);
      
      // Generate keys for User A and User B
      const userAKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      const userBKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      // Encrypt symmetric key for User A (encrypted.symmetricKey is already base64)
      const encryptedForA = Encryption.encryptSymmetricKey(encrypted.symmetricKey, userAKeys.publicKey);
      
      // User A decrypts to share with User B
      const decryptedKey = Encryption.decryptSymmetricKey(encryptedForA, userAKeys.privateKey);
      
      // Re-encrypt for User B
      const encryptedForB = Encryption.encryptSymmetricKey(decryptedKey, userBKeys.publicKey);
      
      // User B decrypts
      const userBKey = Encryption.decryptSymmetricKey(encryptedForB, userBKeys.privateKey);
      
      // User B decrypts file
      const decryptedFile = Encryption.decryptFile({
        encryptedData: encrypted.encryptedData,
        symmetricKey: userBKey,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      });
      
      expect(decryptedFile.toString('utf-8')).toBe(fileData.toString('utf-8'));
    });
  });
});
