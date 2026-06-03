import { KeyManager } from '../../backend/src/lib/crypto/KeyManager';
import { validateFile } from '../../backend/src/utils/fileValidation';
import { buildAttachmentDisposition } from '../../backend/src/utils/httpHeaders';

describe('regresiones locales de seguridad', () => {
  it('rechaza SVG aunque declare un MIME de imagen', () => {
    const result = validateFile('payload.svg', 'image/svg+xml', 1024);

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/extensión|MIME/i);
  });

  it('rechaza doble extensión ejecutable', () => {
    const result = validateFile('factura.pdf.exe', 'application/pdf', 1024);

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/extensión/i);
  });

  it('sanitiza Content-Disposition para evitar inyección de cabeceras', () => {
    const header = buildAttachmentDisposition('doc"\r\nX-Evil: 1.pdf');

    expect(header).toContain('attachment;');
    expect(header).not.toContain('\r');
    expect(header).not.toContain('\n');
    expect(header).not.toContain('X-Evil');
  });

  it('permite recifrar la clave privada tras reset con recovery key', () => {
    const { privateKey } = KeyManager.generateKeyPair();
    const oldPassword = 'OldPassword123';
    const newPassword = 'NewPassword123';
    const recoveryKey = KeyManager.generateRecoveryKey();

    const encryptedWithPassword = KeyManager.encryptPrivateKey(privateKey, oldPassword);
    const encryptedWithRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);

    expect(KeyManager.decryptPrivateKey(encryptedWithPassword, oldPassword)).toBe(privateKey);

    const recovered = KeyManager.decryptPrivateKeyWithRecovery(encryptedWithRecovery, recoveryKey);
    const reencrypted = KeyManager.encryptPrivateKey(recovered, newPassword);

    expect(KeyManager.decryptPrivateKey(reencrypted, newPassword)).toBe(privateKey);
    expect(() => KeyManager.decryptPrivateKey(reencrypted, oldPassword)).toThrow();
  });
});
