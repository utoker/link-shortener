import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  })),
}));

const mockSlidingWindow = vi.fn();
vi.mock('@upstash/ratelimit', () => {
  const mockRatelimit = vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      remaining: 10,
      reset: Date.now() + 60000,
    }),
  }));
  
  mockRatelimit.slidingWindow = mockSlidingWindow;
  
  return {
    Ratelimit: mockRatelimit,
  };
});

describe('Rate Limiter Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      const { getClientIP } = await import('../rateLimit');
      const mockRequest = {
        headers: {
          get: vi.fn().mockImplementation((key) => {
            if (key === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
            if (key === 'x-real-ip') return null;
            return null;
          }),
        },
      } as any;

      const ip = getClientIP(mockRequest);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header when x-forwarded-for is not available', async () => {
      const { getClientIP } = await import('../rateLimit');
      const mockRequest = {
        headers: {
          get: vi.fn().mockImplementation((key) => {
            if (key === 'x-forwarded-for') return null;
            if (key === 'x-real-ip') return '192.168.1.1';
            return null;
          }),
        },
      } as any;

      const ip = getClientIP(mockRequest);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return localhost when no IP headers are present', async () => {
      const { getClientIP } = await import('../rateLimit');
      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as any;

      const ip = getClientIP(mockRequest);
      expect(ip).toBe('127.0.0.1');
    });
  });

  describe('Rate Limiter Instances', () => {
    it('should have different rate limiters for different use cases', async () => {
      const { redirectRateLimit, linkCreationRateLimit, authRateLimit } = await import('../rateLimit');
      expect(redirectRateLimit).toBeDefined();
      expect(linkCreationRateLimit).toBeDefined();
      expect(authRateLimit).toBeDefined();
    });

    it('should allow requests within limits', async () => {
      const { redirectRateLimit } = await import('../rateLimit');
      const result = await redirectRateLimit.limit('192.168.1.1');
      expect(result.success).toBe(true);
    });
  });
});