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
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('does not touch the IPFS node on import and still works when first used', async () => {
    process.env.IPFS_PROVIDER = 'self-hosted';

    let uploadToIPFS: (buffer: Buffer) => Promise<string>;
    jest.isolateModules(() => {
      ({ uploadToIPFS } = require('../ipfs'));
    });

    expect(global.fetch).not.toHaveBeenCalled();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Hash: 'bafy-lazy-cid' }),
    });

    await expect(uploadToIPFS!(Buffer.from('hello world'))).resolves.toBe('bafy-lazy-cid');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5001/api/v0/add?pin=true&cid-version=1',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('accepts the legacy cluster provider value as an alias', async () => {
    process.env.IPFS_PROVIDER = 'cluster';

    let uploadToIPFS: (buffer: Buffer) => Promise<string>;
    jest.isolateModules(() => {
      ({ uploadToIPFS } = require('../ipfs'));
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Hash: 'bafy-cluster-alias' }),
    });

    await expect(uploadToIPFS!(Buffer.from('alias'))).resolves.toBe('bafy-cluster-alias');
  });

  it('falls back to the self-hosted node when the removed pinata value is present', async () => {
    process.env.IPFS_PROVIDER = 'pinata';

    let uploadToIPFS: (buffer: Buffer) => Promise<string>;
    jest.isolateModules(() => {
      ({ uploadToIPFS } = require('../ipfs'));
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Hash: 'bafy-self-hosted-fallback' }),
    });

    await expect(uploadToIPFS!(Buffer.from('fallback'))).resolves.toBe('bafy-self-hosted-fallback');
  });
});