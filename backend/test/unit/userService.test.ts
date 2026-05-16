/**
 * Tests for UserService - User profile management.
 * Covers: getUserById, getUserByUsername, getUserPublicKey,
 * updateProfile, updateAvatar, removeAvatar, searchUsers,
 * getAllUsers, deleteUser.
 */

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
    wallet: {
      deleteMany: jest.fn(),
    },
  },
}));

import { UserService } from '../../src/services/userService';
import prisma from '../../src/config/database';

describe('UserService', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById()', () => {
    it('should return user profile with wallets', async () => {
      const mockUser = {
        id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
        publicKey: 'pub-key-123',
        avatarUrl: null,
        createdAt: new Date(),
        wallets: [
          { id: 'w1', walletAddress: '0xabc', nickname: 'Main', isPrimary: true },
          { id: 'w2', walletAddress: '0xdef', nickname: 'Secondary', isPrimary: false },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserService.getUserById(mockUserId);

      expect(result).not.toBeNull();
      expect(result!.username).toBe('testuser');
      expect(result!.wallets).toHaveLength(2);
      expect(result!.wallets![0].address).toBe('0xabc');
      expect(result!.wallets![0].label).toBe('Main');
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserService.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserByUsername()', () => {
    it('should return user by username', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
        publicKey: 'pub-key',
        createdAt: new Date(),
      });

      const result = await UserService.getUserByUsername('testuser');

      expect(result).not.toBeNull();
      expect(result!.username).toBe('testuser');
    });

    it('should return null when not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserService.getUserByUsername('unknown');

      expect(result).toBeNull();
    });
  });

  describe('getUserPublicKey()', () => {
    it('should return public key', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        publicKey: 'pub-key-abc',
      });

      const result = await UserService.getUserPublicKey(mockUserId);

      expect(result).toBe('pub-key-abc');
    });

    it('should return null when not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserService.getUserPublicKey('unknown');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile()', () => {
    it('should update user profile fields', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: mockUserId,
        username: 'testuser',
        email: 'new@example.com',
        fullName: 'New Name',
        role: 'USER',
        publicKey: 'pub-key',
        createdAt: new Date(),
      });

      const result = await UserService.updateProfile(mockUserId, {
        email: 'new@example.com',
        fullName: 'New Name',
      });

      expect(result.email).toBe('new@example.com');
      expect(result.fullName).toBe('New Name');
    });

    it('should throw when email already in use', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'other-user',
        email: 'taken@example.com',
      });

      await expect(
        UserService.updateProfile(mockUserId, { email: 'taken@example.com' })
      ).rejects.toThrow('Email ya en uso');
    });
  });

  describe('updateAvatar()', () => {
    it('should update avatar URL', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
        publicKey: 'pub-key',
        avatarUrl: 'https://example.com/avatar.png',
        createdAt: new Date(),
      });

      const result = await UserService.updateAvatar(mockUserId, 'https://example.com/avatar.png');

      expect(result.avatarUrl).toBe('https://example.com/avatar.png');
    });
  });

  describe('removeAvatar()', () => {
    it('should set avatarUrl to null', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
        publicKey: 'pub-key',
        avatarUrl: null,
        createdAt: new Date(),
      });

      const result = await UserService.removeAvatar(mockUserId);

      expect(result.avatarUrl).toBeNull();
    });
  });

  describe('searchUsers()', () => {
    it('should search users by username', async () => {
      const mockUsers = [
        { id: 'u1', username: 'alice', fullName: 'Alice', email: 'alice@example.com', avatarUrl: null },
        { id: 'u2', username: 'alex', fullName: 'Alex', email: 'alex@example.com', avatarUrl: null },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await UserService.searchUsers('al');

      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('alice');
    });

    it('should respect limit parameter', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      await UserService.searchUsers('test', 5);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });

  describe('getAllUsers()', () => {
    it('should return paginated users', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(42);

      const result = await UserService.getAllUsers(1, 20);

      expect(result.total).toBe(42);
      expect(result.page).toBe(1);
    });
  });

  describe('deleteUser()', () => {
    it('should delete user and related data', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId });
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.wallet.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });
      (prisma.user.delete as jest.Mock).mockResolvedValue({});

      await UserService.deleteUser(mockUserId);

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: mockUserId } });
      expect(prisma.wallet.deleteMany).toHaveBeenCalledWith({ where: { userId: mockUserId } });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });

    it('should throw when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(UserService.deleteUser('nonexistent')).rejects.toThrow('Usuario no encontrado');
    });
  });
});
