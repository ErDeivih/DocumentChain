/**
 * Extended unit tests for lib/utils.ts.
 */
import { describe, it, expect } from 'vitest';
import { formatRelativeTime, cn, downloadFile } from '../lib/utils';

describe('formatRelativeTime', () => {
  it('returns "No disponible" for null', () => {
    expect(formatRelativeTime(null)).toBe('No disponible');
  });

  it('returns "No disponible" for undefined', () => {
    expect(formatRelativeTime(undefined)).toBe('No disponible');
  });

  it('returns "Fecha no registrada" for invalid date', () => {
    expect(formatRelativeTime('not-a-date')).toBe('Fecha no registrada');
  });

  it('returns "ahora" for future dates', () => {
    const future = new Date(Date.now() + 60000);
    expect(formatRelativeTime(future.toISOString())).toBe('ahora');
  });

  it('returns relative seconds', () => {
    const fiveSecAgo = new Date(Date.now() - 5000);
    const result = formatRelativeTime(fiveSecAgo.toISOString());
    expect(result).toContain('segundo');
  });

  it('returns relative minutes', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const result = formatRelativeTime(tenMinAgo.toISOString());
    expect(result).toContain('minuto');
  });
});

describe('cn', () => {
  it('merges tailwind classes', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'visible');
    expect(result).toContain('base');
    expect(result).toContain('visible');
    expect(result).not.toContain('hidden');
  });

  it('handles arrays', () => {
    const result = cn(['px-4', 'py-2']);
    expect(result).toContain('px-4');
  });

  it('resolves tailwind conflicts', () => {
    const result = cn('px-4', 'px-6');
    expect(result).toContain('px-6');
    expect(result).not.toContain('px-4');
  });
});

describe('downloadFile', () => {
  it('creates an anchor element with correct attributes', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el: any) => el);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el: any) => el);
    const clickSpy = vi.fn();
    createElementSpy.mockReturnValue({ 
      href: '', 
      download: '', 
      click: clickSpy,
      style: {},
    } as any);

    downloadFile(blob, 'test.txt');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
