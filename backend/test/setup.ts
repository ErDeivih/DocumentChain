/**
 * Jest Setup File
 * Runs before all tests
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock logger to avoid cluttering test output
jest.mock('../src/utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock uuid to avoid ES module issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-' + Math.random().toString(36).substr(2, 9)),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly enabled
  log: jest.fn(),
  debug: jest.fn(),
  // Keep error, warn for debugging
  error: console.error,
  warn: console.warn,
};
