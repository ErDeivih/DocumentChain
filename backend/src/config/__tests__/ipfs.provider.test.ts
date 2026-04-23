jest.mock('../ipfsPinataAdapter', () => ({
  PinataAdapter: jest.fn().mockImplementation(() => ({ kind: 'pinata' })),
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('IPFS provider selection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses the cluster adapter when IPFS_PROVIDER=cluster', () => {
    process.env.IPFS_PROVIDER = 'cluster';

    jest.isolateModules(() => {
      const { ipfsClient, IPFSClusterClient } = require('../ipfs');

      expect(ipfsClient).toBeInstanceOf(IPFSClusterClient);
    });
  });

  it('uses the Pinata adapter when IPFS_PROVIDER=pinata', () => {
    process.env.IPFS_PROVIDER = 'pinata';

    jest.isolateModules(() => {
      const { ipfsClient } = require('../ipfs');
      const { PinataAdapter } = require('../ipfsPinataAdapter');

      expect(PinataAdapter).toHaveBeenCalled();
      expect(ipfsClient).toEqual({ kind: 'pinata' });
    });
  });

  it('falls back to Pinata when the provider is unknown', () => {
    process.env.IPFS_PROVIDER = 'unsupported-provider';

    jest.isolateModules(() => {
      const { ipfsClient } = require('../ipfs');
      const { PinataAdapter } = require('../ipfsPinataAdapter');

      expect(PinataAdapter).toHaveBeenCalled();
      expect(ipfsClient).toEqual({ kind: 'pinata' });
    });
  });
});