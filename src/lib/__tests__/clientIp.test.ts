import { describe, it, expect } from 'vitest';
import { getClientIP } from '../clientIp';

describe('getClientIP', () => {
  it('should take the first address of x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      'x-real-ip': '10.0.0.2',
    });
    expect(getClientIP(headers)).toBe('192.168.1.1');
  });

  it('should fall back to x-real-ip', () => {
    expect(getClientIP(new Headers({ 'x-real-ip': '192.168.1.1' }))).toBe(
      '192.168.1.1',
    );
  });

  it('should return localhost when no IP headers are present', () => {
    expect(getClientIP(new Headers())).toBe('127.0.0.1');
  });
});
