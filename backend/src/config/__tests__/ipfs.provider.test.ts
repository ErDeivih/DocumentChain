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

  it('accepts the node alias and routes requests to the self-hosted API', async () => {
    process.env.IPFS_PROVIDER = 'node';

    let uploadToIPFS: (buffer: Buffer) => Promise<string>;
    jest.isolateModules(() => {
      ({ uploadToIPFS } = require('../ipfs'));
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Hash: 'bafy-node-alias' }),
    });

    await expect(uploadToIPFS!(Buffer.from('alias'))).resolves.toBe('bafy-node-alias');
  });

  it('rejects removed legacy provider values', async () => {
    process.env.IPFS_PROVIDER = 'pinata';

    let uploadToIPFS: ((buffer: Buffer) => Promise<string>) | undefined;
    jest.isolateModules(() => {
      ({ uploadToIPFS } = require('../ipfs'));
    });

    await expect(uploadToIPFS!(Buffer.from('fallback'))).rejects.toThrow(
      'Unsupported IPFS_PROVIDER "pinata". Use "self-hosted".'
    );
  });
});