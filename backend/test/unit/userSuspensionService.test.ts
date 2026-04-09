jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {},
}));

const mockIsUserSuspended = jest.fn();

jest.mock('../../src/config/blockchain', () => ({
  DOCUMENT_REGISTRY_ADDRESS: '0xregistry',
  documentRegistryInterface: {},
  provider: {},
  getDocumentRegistryReadContract: jest.fn(() => ({
    isUserSuspended: mockIsUserSuspended,
  })),
}));

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import logger from '../../src/utils/logger';
import { UserSuspensionService } from '../../src/services/userSuspensionService';

describe('UserSuspensionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('falls back to local state when the on-chain suspension read times out', async () => {
    jest.useFakeTimers();
    mockIsUserSuspended.mockImplementation(() => new Promise(() => undefined));

    const suspensionPromise = UserSuspensionService.getOnChainSuspensionState('0xabc');

    await jest.advanceTimersByTimeAsync(2500);

    await expect(suspensionPromise).resolves.toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      'La lectura on-chain de suspensión excedió el tiempo máximo; se usa fallback local',
      expect.objectContaining({
        walletAddress: '0xabc',
        timeoutMs: 2500,
      }),
    );
  });

  it('returns the on-chain value when the contract responds in time', async () => {
    mockIsUserSuspended.mockResolvedValue(true);

    await expect(UserSuspensionService.getOnChainSuspensionState('0xdef')).resolves.toBe(true);
  });
});