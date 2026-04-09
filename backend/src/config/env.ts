import { cleanEnv, str, port, url, num } from 'envalid';

/**
 * Validación y tipado de variables de entorno
 * Falla rápido al inicio si faltan variables críticas
 */
export const env = cleanEnv(process.env, {
  // Database
  DATABASE_URL: url({
    desc: 'PostgreSQL connection string'
  }),
  
  // JWT
  JWT_SECRET: str({
    desc: 'Secret key for JWT signing (minimum 32 characters)'
  }),
  JWT_EXPIRES_IN: str({
    desc: 'JWT expiration time',
    default: '24h'
  }),
  JWT_REFRESH_SECRET: str({
    desc: 'Secret key for refresh token (minimum 32 characters)',
    default: undefined
  }),
  JWT_REFRESH_EXPIRES_IN: str({
    desc: 'Refresh token expiration time',
    default: '7d'
  }),
  
  // Blockchain
  BLOCKCHAIN_RPC_URL: url({
    desc: 'Ethereum RPC endpoint',
    default: 'http://localhost:8545'
  }),
  BLOCKCHAIN_PRIVATE_KEY: str({
    desc: 'Private key for backend wallet (for gas payments, 64 hex chars)'
  }),
  
  // Smart Contracts
  CONTRACT_DOCUMENT_REGISTRY: str({
    desc: 'DocumentRegistry consolidated contract address'
  }),
  
  // IPFS
  IPFS_API_URL: url({
    desc: 'IPFS HTTP API endpoint',
    default: 'http://localhost:5001'
  }),
  IPFS_CLUSTER_API_URL: url({
    desc: 'IPFS Cluster API endpoint',
    default: 'http://localhost:9095'
  }),
  IPFS_GATEWAY_URL: url({
    desc: 'IPFS Gateway for retrieving files',
    default: 'http://localhost:8080'
  }),
  
  // Server
  PORT: port({
    desc: 'HTTP/HTTPS server port',
    default: 3000
  }),
  NODE_ENV: str({
    desc: 'Environment',
    choices: ['development', 'production', 'test'],
    default: 'development'
  }),
  
  // CORS
  ALLOWED_ORIGINS: str({
    desc: 'Comma-separated list of allowed CORS origins',
    default: 'http://localhost:5173,https://localhost:5173'
  }),
  
  // SSL
  SSL_KEY_PATH: str({
    desc: 'Path to SSL private key',
    default: './ssl/private-key.pem'
  }),
  SSL_CERT_PATH: str({
    desc: 'Path to SSL certificate',
    default: './ssl/certificate.pem'
  }),
  
  // Rate Limiting (opcional, usa defaults del código)
  RATE_LIMIT_WINDOW_MS: num({
    desc: 'Rate limit window in milliseconds',
    default: 15 * 60 * 1000 // 15 minutes
  }),
  RATE_LIMIT_MAX_REQUESTS: num({
    desc: 'Max requests per window',
    default: 100
  })
});
