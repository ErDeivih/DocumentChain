/**
 * Tests for Argon2Service - Password hashing with Argon2id.
 * Covers: hash, verify, detectHashType, needsRehash, getConfig.
 */

const mockArgon2 = {
  hash: jest.fn(),
  verify: jest.fn(),
  needsRehash: jest.fn(),
  argon2id: 2,
  argon2i: 1,
  argon2d: 0,
};

jest.mock('argon2', () => mockArgon2);

import { Argon2Service } from '../../src/services/argon2Service';

describe('Argon2Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfig()', () => {
    it('should return the current argon2id configuration', () => {
      const config = Argon2Service.getConfig();

      expect(config.type).toBe(2); // argon2id
      expect(config.memoryCost).toBe(65536); // 64 MB
      expect(config.timeCost).toBe(3);
      expect(config.parallelism).toBe(4);
      expect(config.hashLength).toBe(32);
    });
  });

  describe('hash()', () => {
    it('should hash a password with default config', async () => {
      mockArgon2.hash.mockResolvedValue('$argon2id$v=19$m=65536,t=3,p=4$salt$hashvalue');

      const result = await Argon2Service.hash('MyPassword123!');

      expect(result).toBe('$argon2id$v=19$m=65536,t=3,p=4$salt$hashvalue');
      expect(mockArgon2.hash).toHaveBeenCalledWith('MyPassword123!', {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        hashLength: 32,
        raw: false,
      });
    });

    it('should throw on hashing error', async () => {
      mockArgon2.hash.mockRejectedValue(new Error('Argon2 error'));

      await expect(Argon2Service.hash('test')).rejects.toThrow('Error al hashear contraseña');
    });
  });

  describe('verify()', () => {
    it('should return true for matching password', async () => {
      mockArgon2.verify.mockResolvedValue(true);

      const result = await Argon2Service.verify('$argon2id$...', 'correct-password');

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      mockArgon2.verify.mockResolvedValue(false);

      const result = await Argon2Service.verify('$argon2id$...', 'wrong-password');

      expect(result).toBe(false);
    });

    it('should return false on verification error', async () => {
      mockArgon2.verify.mockRejectedValue(new Error('Verification failed'));

      const result = await Argon2Service.verify('$argon2id$...', 'test');

      expect(result).toBe(false);
    });
  });

  describe('detectHashType()', () => {
    it('should detect argon2id', () => {
      expect(Argon2Service.detectHashType('$argon2id$v=19$m=65536...')).toBe('argon2id');
    });

    it('should detect argon2i', () => {
      expect(Argon2Service.detectHashType('$argon2i$v=19$...')).toBe('argon2i');
    });

    it('should detect argon2d', () => {
      expect(Argon2Service.detectHashType('$argon2d$v=19$...')).toBe('argon2d');
    });

    it('should detect bcrypt $2a$', () => {
      expect(Argon2Service.detectHashType('$2a$10$hashvalue')).toBe('bcrypt');
    });

    it('should detect bcrypt $2b$', () => {
      expect(Argon2Service.detectHashType('$2b$10$hashvalue')).toBe('bcrypt');
    });

    it('should detect bcrypt $2y$', () => {
      expect(Argon2Service.detectHashType('$2y$10$hashvalue')).toBe('bcrypt');
    });

    it('should detect pbkdf2', () => {
      expect(Argon2Service.detectHashType('10000:hashvalue:more')).toBe('pbkdf2');
    });

    it('should return unknown for empty hash', () => {
      expect(Argon2Service.detectHashType('')).toBe('unknown');
    });

    it('should return unknown for unrecognized format', () => {
      expect(Argon2Service.detectHashType('some-random-string')).toBe('unknown');
    });
  });

  describe('needsRehash()', () => {
    it('should return true for bcrypt hash', async () => {
      const result = await Argon2Service.needsRehash('$2b$10$hashvalue');

      expect(result).toBe(true);
    });

    it('should return true for unknown hash type', async () => {
      const result = await Argon2Service.needsRehash('unknown-format');

      expect(result).toBe(true);
    });

    it('should delegate to argon2.needsRehash for argon2id', async () => {
      mockArgon2.needsRehash.mockResolvedValue(false);

      const result = await Argon2Service.needsRehash('$argon2id$v=19$m=65536...');

      expect(result).toBe(false);
      expect(mockArgon2.needsRehash).toHaveBeenCalledWith('$argon2id$v=19$m=65536...', {
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    });

    it('should return true when argon2.needsRehash says yes', async () => {
      mockArgon2.needsRehash.mockResolvedValue(true);

      const result = await Argon2Service.needsRehash('$argon2id$v=19$m=16384...');

      expect(result).toBe(true);
    });

    it('should return true on error during needsRehash check', async () => {
      mockArgon2.needsRehash.mockRejectedValue(new Error('Invalid hash'));

      const result = await Argon2Service.needsRehash('$argon2id$invalid');

      expect(result).toBe(true);
    });
  });
});
