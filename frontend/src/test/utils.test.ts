/**
 * Unit tests for lib/utils.ts — pure utility functions.
 */
import { describe, it, expect } from 'vitest';
import { formatBytes, formatDate, truncateAddress, MAX_FILE_SIZE } from '../lib/utils';

describe('formatBytes', () => {
  it('returns "0 Bytes" for zero', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });
  it('formats bytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });
  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });
  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });
  it('handles fractional values', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });
});

describe('formatDate', () => {
  it('returns "No disponible" for null', () => {
    expect(formatDate(null)).toBe('No disponible');
  });
  it('returns "No disponible" for undefined', () => {
    expect(formatDate(undefined)).toBe('No disponible');
  });
  it('returns "Fecha no registrada" for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('Fecha no registrada');
  });
  it('formats a valid date string', () => {
    const result = formatDate('2026-05-16T12:00:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('mayo');
  });
});

describe('truncateAddress', () => {
  it('returns short address as-is', () => {
    expect(truncateAddress('0x1234')).toBe('0x1234');
  });
  it('truncates with default 6/4', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    const result = truncateAddress(addr);
    expect(result).toBe('0x1234...5678');
    expect(result).toContain('...');
  });
  it('truncates with custom start/end', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    expect(truncateAddress(addr, 10, 8)).toBe('0x12345678...12345678');
  });
});

describe('MAX_FILE_SIZE', () => {
  it('equals 100MB in bytes', () => {
    expect(MAX_FILE_SIZE).toBe(100 * 1024 * 1024);
  });
});
