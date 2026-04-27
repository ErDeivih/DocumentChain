jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('SelfHostedIPFSClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('uses the Kubo API default URL for add operations', async () => {
    let SelfHostedIPFSClientCtor: any;
    jest.isolateModules(() => {
      ({ SelfHostedIPFSClient: SelfHostedIPFSClientCtor } = require('../ipfs'));
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Hash: 'bafy-test-cid' }),
    });

    const client = new SelfHostedIPFSClientCtor();
    await client.add(Buffer.from('hello world'));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5001/api/v0/add?pin=true&cid-version=1',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('calls the Kubo pin endpoint with the configured API URL', async () => {
    let SelfHostedIPFSClientCtor: any;
    jest.isolateModules(() => {
      ({ SelfHostedIPFSClient: SelfHostedIPFSClientCtor } = require('../ipfs'));
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const client = new SelfHostedIPFSClientCtor('http://ipfs-node:5001');
    await client.pin('bafy-pin-cid');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://ipfs-node:5001/api/v0/pin/add?arg=bafy-pin-cid',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('normalizes an unpinned response when Kubo reports the CID is missing', async () => {
    let SelfHostedIPFSClientCtor: any;
    jest.isolateModules(() => {
      ({ SelfHostedIPFSClient: SelfHostedIPFSClientCtor } = require('../ipfs'));
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'not pinned',
    });

    const client = new SelfHostedIPFSClientCtor();
    await expect(client.getPinStatus('bafy-missing')).resolves.toEqual({
      cid: 'bafy-missing',
      status: 'unpinned',
      peer_map: {},
    });
  });
});
