module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
    '!**/blockchain.test.ts', // Exclude blockchain integration tests (requires chai setup)
    '!**/ipfs.provider.test.ts', // Exclude IPFS provider tests (requires Docker IPFS node)
    '!**/ipfs.self-hosted-client.test.ts', // Exclude self-hosted IPFS tests (requires Docker)
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json', diagnostics: false }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@prisma|ethers)/)', // Transform uuid, @prisma/client, ethers ES modules
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^uuid$': require.resolve('uuid'), // Force CommonJS uuid
  },
  setupFiles: ['<rootDir>/test/env-setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 10000,
  verbose: true,
};
