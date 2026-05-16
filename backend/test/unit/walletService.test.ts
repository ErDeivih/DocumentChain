import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    wallet: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('ethers', () => ({
  __esModule: true,
  ethers: {
    isAddress: jest.fn((addr: string) => addr.startsWith('0x') && addr.length === 42),
    getAddress: jest.fn((addr: string) => addr),
    verifyMessage: jest.fn(),
  },
}));

import prisma from '../../src/config/database';
import { ethers } from 'ethers';
import { WalletService } from '../../src/services/walletService';

const mockPrisma = prisma as any;

describe('WalletService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserWallets', () => {
    it('returns mapped wallets ordered by primary first', async () => {
      mockPrisma.wallet.findMany.mockResolvedValue([
        { id: 'w-2', walletAddress: '0xB', nickname: 'Secondary', isPrimary: false },
        { id: 'w-1', walletAddress: '0xA', nickname: 'Primary', isPrimary: true },
      ]);

      const result = await WalletService.getUserWallets('user-1');

      expect(result).toEqual([
        { id: 'w-2', address: '0xB', label: 'Secondary', isPrimary: false },
        { id: 'w-1', address: '0xA', label: 'Primary', isPrimary: true },
      ]);
    });
  });

  describe('addWallet', () => {
    it('adds a new wallet and makes it primary if first wallet', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);
      mockPrisma.wallet.count.mockResolvedValue(0);
      mockPrisma.wallet.create.mockResolvedValue({
        id: 'w-1',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        nickname: 'Main',
        isPrimary: true,
      });

      const result = await WalletService.addWallet(
        'user-1',
        '0x1234567890abcdef1234567890abcdef12345678',
        'Main'
      );

      expect(result.isPrimary).toBe(true);
      expect(mockPrisma.wallet.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isPrimary: true,
            walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          }),
        })
      );
    });

    it('throws for invalid ethereum address', async () => {
      ((ethers as any).isAddress as jest.Mock).mockReturnValue(false);

      await expect(
        WalletService.addWallet('user-1', 'invalid-address')
      ).rejects.toThrow('Dirección Ethereum inválida');
    });

    it('throws if wallet already exists for user', async () => {
      ((ethers as any).isAddress as jest.Mock).mockReturnValue(true);
      mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        WalletService.addWallet('user-1', '0x1234567890abcdef1234567890abcdef12345678')
      ).rejects.toThrow('La wallet ya ha sido añadida');
    });

    it('throws if user already has 5 wallets', async () => {
      ((ethers as any).isAddress as jest.Mock).mockReturnValue(true);
      mockPrisma.wallet.findFirst.mockResolvedValue(null);
      mockPrisma.wallet.count.mockResolvedValue(5);

      await expect(
        WalletService.addWallet('user-1', '0x1234567890abcdef1234567890abcdef12345678')
      ).rejects.toThrow('Máximo 5 wallets por usuario');
    });

    it('unsets other primary wallets when adding as primary', async () => {
      ((ethers as any).isAddress as jest.Mock).mockReturnValue(true);
      mockPrisma.wallet.findFirst.mockResolvedValue(null);
      mockPrisma.wallet.count.mockResolvedValue(1);
      mockPrisma.wallet.create.mockResolvedValue({
        id: 'w-new',
        walletAddress: '0xNew',
        nickname: null,
        isPrimary: true,
      });

      await WalletService.addWallet('user-1', '0xNew', undefined, true);

      expect(mockPrisma.wallet.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { isPrimary: false },
      });
    });
  });

  describe('removeWallet', () => {
    it('removes a non-primary wallet', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({
        id: 'w-1',
        userId: 'user-1',
        isPrimary: false,
      });

      await WalletService.removeWallet('user-1', 'w-1');

      expect(mockPrisma.wallet.delete).toHaveBeenCalledWith({ where: { id: 'w-1' } });
    });

    it('throws if wallet not found', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);

      await expect(WalletService.removeWallet('user-1', 'w-1')).rejects.toThrow('Wallet no encontrada');
    });

    it('throws when trying to remove primary wallet while others exist', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({
        id: 'w-1',
        userId: 'user-1',
        isPrimary: true,
      });
      mockPrisma.wallet.count.mockResolvedValue(3);

      await expect(WalletService.removeWallet('user-1', 'w-1')).rejects.toThrow(
        'No se puede eliminar la wallet principal. Establezca otra wallet como principal primero.'
      );
    });
  });

  describe('setPrimaryWallet', () => {
    it('sets wallet as primary and unsets others', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' });
      mockPrisma.wallet.update.mockResolvedValue({
        id: 'w-1',
        walletAddress: '0xA',
        nickname: 'Main',
        isPrimary: true,
      });

      const result = await WalletService.setPrimaryWallet('user-1', 'w-1');

      expect(mockPrisma.wallet.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { isPrimary: false },
      });
      expect(result.isPrimary).toBe(true);
    });

    it('throws if wallet not found', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);

      await expect(WalletService.setPrimaryWallet('user-1', 'w-1')).rejects.toThrow('Wallet no encontrada');
    });
  });

  describe('updateWalletLabel', () => {
    it('updates wallet nickname', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' });
      mockPrisma.wallet.update.mockResolvedValue({
        id: 'w-1',
        walletAddress: '0xA',
        nickname: 'New Label',
        isPrimary: false,
      });

      const result = await WalletService.updateWalletLabel('user-1', 'w-1', 'New Label');

      expect(result.label).toBe('New Label');
    });

    it('throws if wallet not found', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);

      await expect(WalletService.updateWalletLabel('user-1', 'w-1', 'Label')).rejects.toThrow('Wallet no encontrada');
    });

    it('allows empty label to clear nickname', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' });
      mockPrisma.wallet.update.mockResolvedValue({
        id: 'w-1',
        walletAddress: '0xA',
        nickname: null,
        isPrimary: false,
      });

      const result = await WalletService.updateWalletLabel('user-1', 'w-1', '');

      expect(result.label).toBeNull();
    });

    it('trims whitespace from label before saving', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' });
      mockPrisma.wallet.update.mockResolvedValue({
        id: 'w-1',
        walletAddress: '0xA',
        nickname: 'My Wallet',
        isPrimary: false,
      });

      const result = await WalletService.updateWalletLabel('user-1', 'w-1', '  My Wallet  ');

      expect(result.label).toBe('My Wallet');
    });
  });

  describe('getPrimaryWallet', () => {
    it('returns primary wallet', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({
        id: 'w-1',
        walletAddress: '0xA',
        nickname: 'Main',
        isPrimary: true,
      });

      const result = await WalletService.getPrimaryWallet('user-1');

      expect(result).toEqual(expect.objectContaining({ isPrimary: true, address: '0xA' }));
    });

    it('returns null if no primary wallet', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);

      const result = await WalletService.getPrimaryWallet('user-1');

      expect(result).toBeNull();
    });
  });

  describe('verifyWalletSignature', () => {
    it('returns true when signature matches address', () => {
      ((ethers as any).verifyMessage as jest.Mock).mockReturnValue('0xABC');

      const result = WalletService.verifyWalletSignature('0xabc', 'message', 'sig');

      expect(result).toBe(true);
    });

    it('returns false when signature does not match', () => {
      ((ethers as any).verifyMessage as jest.Mock).mockReturnValue('0xDifferent');

      const result = WalletService.verifyWalletSignature('0xabc', 'message', 'sig');

      expect(result).toBe(false);
    });

    it('returns false on exception', () => {
      ((ethers as any).verifyMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const result = WalletService.verifyWalletSignature('0xabc', 'message', 'sig');

      expect(result).toBe(false);
    });
  });

  describe('generateChallengeMessage', () => {
    it('generates a challenge with address and timestamp', () => {
      const result = WalletService.generateChallengeMessage('0xABC');

      expect(result).toContain('0xABC');
      expect(result).toContain('Marca de tiempo');
    });
  });
});
