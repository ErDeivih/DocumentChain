/**
 * Jest setup file - runs BEFORE any test suite is loaded.
 * Sets environment variables needed for module initialization.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests-with-32-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-unit-tests-32+chars';
process.env.BLOCKCHAIN_RPC_URL = 'http://localhost:8545';
process.env.BLOCKCHAIN_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001';
process.env.CONTRACT_DOCUMENT_REGISTRY = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
