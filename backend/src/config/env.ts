import { cleanEnv, str, port, url, num, bool } from 'envalid';
import { normalizeEnvValue } from '../utils/env';

const normalizedProcessEnv = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [
    key,
    typeof value === 'string' ? normalizeEnvValue(value) : value,
  ]),
) as NodeJS.ProcessEnv;

const SECRET_MIN_LENGTH = 32;
const PRODUCTION_SECRET_PLACEHOLDER_PATTERNS = [
  /change-this/i,
  /your-secret-key/i,
  /your-super-secret/i,
  /genera_un_secret/i,
  /otro_secret_diferente/i,
  /secure-random-string/i,
];

/**
 * Valida que un secreto cumpla con la longitud mínima requerida.
 *
 * @param secretValue - Valor del secreto a validar.
 * @param secretName - Nombre del secreto (para mensajes de error).
 * @throws Error si el secreto es más corto de lo permitido.
 */
function validateSecretLength(secretValue: string | undefined, secretName: string): void {
  if (!secretValue) {
    return;
  }

  if (secretValue.length < SECRET_MIN_LENGTH) {
    throw new Error(`${secretName} debe tener al menos ${SECRET_MIN_LENGTH} caracteres`);
  }
}

/**
 * Valida que un secreto no utilice un valor placeholder en entornos de producción.
 *
 * @param secretValue - Valor del secreto a validar.
 * @param secretName - Nombre del secreto (para mensajes de error).
 * @throws Error si el secreto no está configurado o utiliza un placeholder.
 */
function validateProductionSecret(secretValue: string | undefined, secretName: string): void {
  if (!secretValue) {
    throw new Error(`${secretName} debe configurarse con un valor seguro en producción`);
  }

  if (PRODUCTION_SECRET_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(secretValue))) {
    throw new Error(`${secretName} no puede usar un placeholder en producción`);
  }
}

/**
 * Validación y tipado estricto de las variables de entorno.
 * Falla de forma inmediata durante el arranque si faltan variables críticas
 * o si sus valores no cumplen con los requisitos definidos.
 */
export const env = cleanEnv(normalizedProcessEnv, {
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
    default: '15m'
  }),
  JWT_REFRESH_SECRET: str({
    desc: 'Secret key for refresh token (minimum 32 characters)',
    default: undefined
  }),
  JWT_REFRESH_EXPIRES_IN: str({
    desc: 'Refresh token expiration time',
    default: '7d'
  }),
  ADMIN_REGISTRATION_SECRET: str({
    desc: 'Secret required to bootstrap the first admin account',
    default: ''
  }),
  
  // Blockchain
  BLOCKCHAIN_RPC_URL: url({
    desc: 'Ethereum RPC endpoint',
    default: 'http://localhost:8545'
  }),
  BLOCKCHAIN_PRIVATE_KEY: str({
    desc: 'Private key for backend wallet (for gas payments, 64 hex chars)',
    default: ''
  }),
  
  // Smart Contracts
  CONTRACT_DOCUMENT_REGISTRY: str({
    desc: 'DocumentRegistry consolidated contract address',
    default: ''
  }),
  
  // IPFS
  IPFS_API_URL: url({
    desc: 'IPFS HTTP API endpoint',
    default: 'http://localhost:5001'
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
  
  // Server
  USE_HTTPS: bool({
    desc: 'Enable HTTPS',
    default: false
  }),

  // SMTP
  SMTP_HOST: str({
    desc: 'SMTP server host',
    default: 'localhost'
  }),
  SMTP_PORT: num({
    desc: 'SMTP server port',
    default: 587
  }),
  SMTP_USER: str({
    desc: 'SMTP username',
    default: ''
  }),
  SMTP_PASS: str({
    desc: 'SMTP password',
    default: ''
  }),
  SMTP_SECURE: bool({
    desc: 'Use secure SMTP connection',
    default: false
  }),
  SMTP_TLS_REJECT_UNAUTHORIZED: bool({
    desc: 'Reject unauthorized TLS certificates',
    default: true
  }),
  EMAIL_FROM: str({
    desc: 'Email sender address',
    default: 'noreply@documentchain.local'
  }),
  EMAIL_FROM_NAME: str({
    desc: 'Email sender display name',
    default: 'DocumentChain'
  }),
  FRONTEND_URL: str({
    desc: 'Frontend URL',
    default: 'http://localhost:5173'
  }),

  // IPFS
  IPFS_PROVIDER: str({
    desc: 'IPFS provider (pinata, local, etc.)',
    default: 'pinata'
  }),
  PINATA_API_KEY: str({
    desc: 'Pinata API key',
    default: ''
  }),
  PINATA_SECRET_KEY: str({
    desc: 'Pinata secret key',
    default: ''
  }),
  PINATA_JWT: str({
    desc: 'Pinata JWT token',
    default: ''
  }),
  PINATA_GATEWAY_URL: str({
    desc: 'Pinata gateway URL',
    default: 'https://gateway.pinata.cloud'
  }),

  // Blockchain
  BLOCKCHAIN_CHAIN_ID: num({
    desc: 'Blockchain chain ID',
    default: 31337
  }),
  BLOCK_EXPLORER_URL: str({
    desc: 'Block explorer URL',
    default: ''
  }),
  SKIP_EMAIL_VERIFICATION: bool({
    desc: 'Skip email verification for development',
    default: false
  })
});

validateSecretLength(env.JWT_SECRET, 'JWT_SECRET');
validateSecretLength(env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
validateSecretLength(env.ADMIN_REGISTRATION_SECRET, 'ADMIN_REGISTRATION_SECRET');

if (env.NODE_ENV === 'production') {
  validateProductionSecret(env.JWT_SECRET, 'JWT_SECRET');
  validateProductionSecret(env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
  validateProductionSecret(env.ADMIN_REGISTRATION_SECRET, 'ADMIN_REGISTRATION_SECRET');
}
