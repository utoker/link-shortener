import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type LimitResult = Awaited<ReturnType<Ratelimit['limit']>>;

// Upstash trouble mustn't take the site down: a check that fails lets the
// request through (and is logged), like one that runs past the limiter's
// `timeout` (5 s unless set).
function failOpen(name: string, limiter: Ratelimit) {
  return {
    async limit(identifier: string): Promise<LimitResult> {
      try {
        return await limiter.limit(identifier);
      } catch (err) {
        console.error(`rate limit ${name} failed, letting it through:`, err);
        return {
          success: true,
          limit: 0,
          remaining: 0,
          reset: 0,
          pending: Promise.resolve(),
        };
      }
    },
  };
}

// Each limiter needs its own prefix: without one they all count against the
// same "@upstash/ratelimit:<ip>" key, so e.g. opening 10 short links in a
// minute used to block creating a link, and 5 blocked signing in.
export const redirectRateLimit = failOpen(
  'redirect',
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:redirect',
    timeout: 1000, // a visitor is waiting for their redirect
  }),
);

export const linkCreationRateLimit = failOpen(
  'link-create',
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:link-create',
  }),
);

export const linkEditRateLimit = failOpen(
  'link-edit',
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:link-edit',
  }),
);

export const authRateLimit = failOpen(
  'auth',
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
);
