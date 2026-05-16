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
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};
jest.mock('../src/utils/logger', () => ({
  __esModule: true,
  default: mockLogger,
  logger: mockLogger,
  FlowLogger: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockReturnValue('flow-id'),
    step: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  })),
  logBlockchainError: jest.fn(),
  logBlockchainEvent: jest.fn(),
  logIPFSError: jest.fn(),
  logUserActivity: jest.fn(),
  logAuthError: jest.fn(),
  withLogging: jest.fn((fn: any) => fn),
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
