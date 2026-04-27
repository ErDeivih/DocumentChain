describe('env config validation', () => {
  const originalEnv = process.env;

  const baseEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: 'http://localhost:5432',
    JWT_SECRET: 'documentchain-prod-jwt-secret-2026-strong-key',
    JWT_REFRESH_SECRET: 'documentchain-prod-refresh-secret-2026-strong-key',
    ADMIN_REGISTRATION_SECRET: 'documentchain-admin-bootstrap-secret-2026-key',
    BLOCKCHAIN_PRIVATE_KEY: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    CONTRACT_DOCUMENT_REGISTRY: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    BLOCKCHAIN_RPC_URL: 'http://localhost:8545',
    IPFS_API_URL: 'http://localhost:5001',
    IPFS_GATEWAY_URL: 'http://localhost:8080',
    ALLOWED_ORIGINS: 'http://localhost:5173',
    SSL_KEY_PATH: './ssl/private-key.pem',
    SSL_CERT_PATH: './ssl/certificate.pem',
  };

  afterEach(() => {
    jest.resetModules();
    process.env = originalEnv;
  });

  function loadEnvModule(overrides: Record<string, string | undefined> = {}) {
    process.env = {
      ...originalEnv,
      ...baseEnv,
      ...overrides,
    };

    let loadedModule: typeof import('../../src/config/env');
    jest.isolateModules(() => {
      loadedModule = require('../../src/config/env');
    });

    return loadedModule!;
  }

  it('accepts strong secrets in production', () => {
    const { env } = loadEnvModule();

    expect(env.JWT_SECRET).toBe(baseEnv.JWT_SECRET);
    expect(env.JWT_REFRESH_SECRET).toBe(baseEnv.JWT_REFRESH_SECRET);
    expect(env.ADMIN_REGISTRATION_SECRET).toBe(baseEnv.ADMIN_REGISTRATION_SECRET);
  });

  it('rejects placeholder JWT secret in production', () => {
    expect(() => loadEnvModule({
      JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production-min-32-chars',
    })).toThrow('JWT_SECRET no puede usar un placeholder en producción');
  });

  it('rejects missing admin bootstrap secret in production', () => {
    expect(() => loadEnvModule({
      ADMIN_REGISTRATION_SECRET: '',
    })).toThrow('ADMIN_REGISTRATION_SECRET debe configurarse con un valor seguro en producción');
  });
});