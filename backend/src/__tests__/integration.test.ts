/**
 * Integration Tests - Backend Encryption Flows
 * Tests end-to-end flows without complex mocks
 */

import * as Encryption from '../lib/encryption';
import crypto from 'crypto';

describe('Backend Encryption - Integration Tests', () => {
  describe('Document Upload Flow', () => {
    it('should complete full encryption cycle: encrypt file → wrap key → decrypt', () => {
      // Simulate user uploads a file
      const originalFile = Buffer.from('My confidential document content', 'utf-8');
      
      // Step 1: Generate user RSA keys (done during registration)
      const userKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      // Step 2: Backend encrypts file (AES-256-GCM)
      const encryptionResult = Encryption.encryptFile(originalFile);
      
      expect(encryptionResult.encryptedData).not.toEqual(originalFile);
      expect(encryptionResult.symmetricKey).toBeTruthy();
      expect(encryptionResult.iv).toBeTruthy();
      expect(encryptionResult.authTag).toBeTruthy();
      
      // Step 3: Backend wraps symmetric key with user's public key
      const wrappedKey = Encryption.encryptSymmetricKey(
        encryptionResult.symmetricKey,
        userKeys.publicKey
      );
      
      expect(wrappedKey).toBeTruthy();
      expect(wrappedKey.length).toBeGreaterThan(500); // RSA-4096 ciphertext
      
      // Step 4: User downloads and decrypts
      // User unwraps symmetric key with their private key
      const unwrappedKey = Encryption.decryptSymmetricKey(wrappedKey, userKeys.privateKey);
      
      expect(unwrappedKey).toBe(encryptionResult.symmetricKey);
      
      // User decrypts file
      const decryptedFile = Encryption.decryptFile({
        encryptedData: encryptionResult.encryptedData,
        symmetricKey: unwrappedKey,
        iv: encryptionResult.iv,
        authTag: encryptionResult.authTag,
      });
      
      expect(decryptedFile.toString('utf-8')).toBe(originalFile.toString('utf-8'));
    });
  });

  describe('Share Flow', () => {
    it('should re-encrypt symmetric key for recipient', () => {
      // Setup: Owner has encrypted document
      const document = Buffer.from('Shared document', 'utf-8');
      
      const ownerKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      const recipientKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      // Step 1: Document is encrypted for owner
      const encrypted = Encryption.encryptFile(document);
      const wrappedForOwner = Encryption.encryptSymmetricKey(
        encrypted.symmetricKey,
        ownerKeys.publicKey
      );
      
      // Step 2: Owner wants to share - frontend decrypts symmetric key
      const ownerUnwrappedKey = Encryption.decryptSymmetricKey(
        wrappedForOwner,
        ownerKeys.privateKey
      );
      
      // Step 3: Frontend sends unwrapped key to backend (over HTTPS)
      // Step 4: Backend re-encrypts for recipient
      const wrappedForRecipient = Encryption.encryptSymmetricKey(
        ownerUnwrappedKey,
        recipientKeys.publicKey
      );
      
      // Step 5: Recipient can decrypt
      const recipientUnwrappedKey = Encryption.decryptSymmetricKey(
        wrappedForRecipient,
        recipientKeys.privateKey
      );
      
      const recipientDecrypted = Encryption.decryptFile({
        encryptedData: encrypted.encryptedData,
        symmetricKey: recipientUnwrappedKey,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      });
      
      expect(recipientDecrypted.toString('utf-8')).toBe(document.toString('utf-8'));
    });
  });

  describe('Version Flow', () => {
    it('should encrypt each version with independent symmetric keys', () => {
      const version1Content = Buffer.from('Version 1 content', 'utf-8');
      const version2Content = Buffer.from('Version 2 content - updated', 'utf-8');
      
      const userKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      // Version 1 encryption
      const v1Encrypted = Encryption.encryptFile(version1Content);
      const v1WrappedKey = Encryption.encryptSymmetricKey(
        v1Encrypted.symmetricKey,
        userKeys.publicKey
      );
      
      // Version 2 encryption (different symmetric key)
      const v2Encrypted = Encryption.encryptFile(version2Content);
      const v2WrappedKey = Encryption.encryptSymmetricKey(
        v2Encrypted.symmetricKey,
        userKeys.publicKey
      );
      
      // Keys should be different
      expect(v1Encrypted.symmetricKey).not.toBe(v2Encrypted.symmetricKey);
      expect(v1WrappedKey).not.toBe(v2WrappedKey);
      
      // Both versions can be decrypted independently
      const v1Decrypted = Encryption.decryptFile({
        encryptedData: v1Encrypted.encryptedData,
        symmetricKey: Encryption.decryptSymmetricKey(v1WrappedKey, userKeys.privateKey),
        iv: v1Encrypted.iv,
        authTag: v1Encrypted.authTag,
      });
      
      const v2Decrypted = Encryption.decryptFile({
        encryptedData: v2Encrypted.encryptedData,
        symmetricKey: Encryption.decryptSymmetricKey(v2WrappedKey, userKeys.privateKey),
        iv: v2Encrypted.iv,
        authTag: v2Encrypted.authTag,
      });
      
      expect(v1Decrypted.toString('utf-8')).toBe(version1Content.toString('utf-8'));
      expect(v2Decrypted.toString('utf-8')).toBe(version2Content.toString('utf-8'));
    });
  });

  describe('Transfer Ownership Flow', () => {
    it('should re-encrypt for new owner', () => {
      const document = Buffer.from('Document to transfer', 'utf-8');
      
      const oldOwnerKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      const newOwnerKeys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      
      // Document encrypted for old owner
      const encrypted = Encryption.encryptFile(document);
      const wrappedForOldOwner = Encryption.encryptSymmetricKey(
        encrypted.symmetricKey,
        oldOwnerKeys.publicKey
      );
      
      // Transfer process
      // 1. Frontend decrypts with old owner's private key
      const unwrappedKey = Encryption.decryptSymmetricKey(
        wrappedForOldOwner,
        oldOwnerKeys.privateKey
      );
      
      // 2. Frontend sends unwrapped key to backend
      // 3. Backend re-encrypts for new owner
      const wrappedForNewOwner = Encryption.encryptSymmetricKey(
        unwrappedKey,
        newOwnerKeys.publicKey
      );
      
      // 4. Old owner can no longer decrypt (lost wrapped key)
      // 5. New owner can decrypt
      const newOwnerUnwrapped = Encryption.decryptSymmetricKey(
        wrappedForNewOwner,
        newOwnerKeys.privateKey
      );
      
      const newOwnerDecrypted = Encryption.decryptFile({
        encryptedData: encrypted.encryptedData,
        symmetricKey: newOwnerUnwrapped,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      });
      
      expect(newOwnerDecrypted.toString('utf-8')).toBe(document.toString('utf-8'));
    });
  });

  describe('Multiple Simultaneous Shares', () => {
    it('should allow 3 users to access same encrypted file', () => {
      const document = Buffer.from('Shared with multiple users', 'utf-8');
      
      // Generate keys for 3 users
      const users = Array.from({ length: 3 }, () =>
        crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        })
      );
      
      // Encrypt document once
      const encrypted = Encryption.encryptFile(document);
      
      // Wrap symmetric key for each user
      const wrappedKeys = users.map((userKeys) =>
        Encryption.encryptSymmetricKey(encrypted.symmetricKey, userKeys.publicKey)
      );
      
      // Each user can independently decrypt
      users.forEach((userKeys, index) => {
        const unwrapped = Encryption.decryptSymmetricKey(
          wrappedKeys[index],
          
          userKeys.privateKey
        );
        
        const decrypted = Encryption.decryptFile({
          encryptedData: encrypted.encryptedData,
          symmetricKey: unwrapped,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
        });
        
        expect(decrypted.toString('utf-8')).toBe(document.toString('utf-8'));
      });
    });
  });
});
