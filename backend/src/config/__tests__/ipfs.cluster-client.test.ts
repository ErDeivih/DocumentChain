jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('IPFSClusterClient', () => {
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

  it('uses the cluster REST API default URL for add operations', async () => {
    process.env.IPFS_PROVIDER = 'cluster';
    delete process.env.IPFS_CLUSTER_API_URL;

    let IPFSClusterClientCtor: any;
    jest.isolateModules(() => {
      ({ IPFSClusterClient: IPFSClusterClientCtor } = require('../ipfs'));
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ cid: 'bafy-test-cid' }),
    });

    const client = new IPFSClusterClientCtor();
    await client.add(Buffer.from('hello world'));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:9094/add',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('calls the cluster REST pin endpoint with the configured base URL', async () => {
    process.env.IPFS_PROVIDER = 'cluster';
    process.env.IPFS_CLUSTER_API_URL = 'http://ipfs-cluster:9094';

    let IPFSClusterClientCtor: any;
    jest.isolateModules(() => {
      ({ IPFSClusterClient: IPFSClusterClientCtor } = require('../ipfs'));
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const client = new IPFSClusterClientCtor();
    await client.pin('bafy-pin-cid');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://ipfs-cluster:9094/pins/bafy-pin-cid',
      expect.objectContaining({ method: 'POST' })
    );
  });
});