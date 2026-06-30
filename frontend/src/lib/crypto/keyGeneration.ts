/**
 * Generación de material criptográfico para registro de usuarios.
 * Centraliza la secuencia de creación de par RSA + recovery key.
 */

import { KeyManager } from './KeyManager';
import { generateRandomBytes } from './utils';

export interface KeyMaterial {
  keyPair: { publicKey: string; encryptedPrivateKey: string; salt: string };
  recoveryKey: string;
  recoveryKeySalt: Uint8Array;
  recoveryKeyHash: string;
  encryptedPrivateKeyRecovery: string;
}

/**
 * Genera todo el material criptográfico necesario para un nuevo usuario:
 * par RSA, recovery key, hash de recovery y clave privada re-cifrada para recovery.
 *
 * @param password - Contraseña del usuario para derivar la clave de cifrado RSA.
 * @returns Material criptográfico completo.
 */
export async function generateKeyMaterial(password: string): Promise<KeyMaterial> {
  const keyPair = await KeyManager.generateKeyPair(password);
  const recoveryKey = KeyManager.generateRecoveryKey();
  const recoveryKeySalt = generateRandomBytes(32);
  const recoveryKeyHash = await KeyManager.hashRecoveryKey(recoveryKey, recoveryKeySalt);

  const privateKey = await KeyManager.decryptPrivateKey(
    keyPair.encryptedPrivateKey, password, keyPair.salt
  );
  const privateKeyPem = await KeyManager.exportPrivateKeyAsPkcs8(privateKey);
  const encryptedPrivateKeyRecovery = await KeyManager.encryptPrivateKeyWithRecovery(
    privateKeyPem, recoveryKey, recoveryKeySalt
  );

  return { keyPair, recoveryKey, recoveryKeySalt, recoveryKeyHash, encryptedPrivateKeyRecovery };
}
