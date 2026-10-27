import { describe, it, expect } from 'vitest';
import { ensureProtocol } from '../utils';

describe('ensureProtocol', () => {
  it('should prefix https:// when the scheme is missing', () => {
    expect(ensureProtocol('example.com')).toBe('https://example.com');
    expect(ensureProtocol('example.com/path?q=1')).toBe('https://example.com/path?q=1');
  });

  it('should keep existing http and https schemes', () => {
    expect(ensureProtocol('https://example.com')).toBe('https://example.com');
    expect(ensureProtocol('http://example.com')).toBe('http://example.com');
    expect(ensureProtocol('HTTPS://example.com')).toBe('HTTPS://example.com');
  });

  it('should prefix other schemes so they are validated as hosts', () => {
    expect(ensureProtocol('javascript:alert(1)')).toBe('https://javascript:alert(1)');
  });
});
