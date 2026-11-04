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
  
  Object.assign(mockRatelimit, { slidingWindow: mockSlidingWindow });
  
  return {
    Ratelimit: mockRatelimit,
  };
});

describe('Rate Limiter Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limiter Instances', () => {
    it('should have different rate limiters for different use cases', async () => {
      const { redirectRateLimit, linkCreationRateLimit, authRateLimit } = await import('../rateLimit');
      expect(redirectRateLimit).toBeDefined();
      expect(linkCreationRateLimit).toBeDefined();
      expect(authRateLimit).toBeDefined();
    });

    it('should give every limiter its own counter', async () => {
      vi.resetModules();
      await import('../rateLimit');
      const { Ratelimit } = await import('@upstash/ratelimit');

      const prefixes = vi
        .mocked(Ratelimit)
        .mock.calls.map(([config]) => config.prefix);
      expect(prefixes).toEqual([
        'ratelimit:redirect',
        'ratelimit:link-create',
        'ratelimit:link-edit',
        'ratelimit:auth',
      ]);
    });

    it('should give a redirect only a second before letting it through', async () => {
      vi.resetModules();
      await import('../rateLimit');
      const { Ratelimit } = await import('@upstash/ratelimit');

      const [redirect, ...others] = vi
        .mocked(Ratelimit)
        .mock.calls.map(([config]) => config.timeout);
      expect(redirect).toBe(1000);
      expect(others).toEqual([undefined, undefined, undefined]); // 5 s
    });

    it('should let requests through when Upstash fails', async () => {
      vi.resetModules();
      const { redirectRateLimit } = await import('../rateLimit');
      const { Ratelimit } = await import('@upstash/ratelimit');
      const upstash = vi.mocked(Ratelimit).mock.results[0].value;
      upstash.limit.mockRejectedValueOnce(new Error('ERR max requests limit exceeded'));
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await redirectRateLimit.limit('192.168.1.1');

      expect(result.success).toBe(true);
      expect(error).toHaveBeenCalledWith(
        'rate limit redirect failed, letting it through:',
        expect.any(Error),
      );
      error.mockRestore();
    });

    it('should allow requests within limits', async () => {
      const { redirectRateLimit } = await import('../rateLimit');
      const result = await redirectRateLimit.limit('192.168.1.1');
      expect(result.success).toBe(true);
    });
  });
});