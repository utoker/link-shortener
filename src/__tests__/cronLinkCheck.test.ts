import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../app/api/cron/link-check/route';
import { runLinkCheck } from '../lib/linkCheck';

vi.mock('../lib/linkCheck', () => ({ runLinkCheck: vi.fn() }));

const call = (authorization?: string) =>
  GET(
    new Request('http://localhost:3000/api/cron/link-check', {
      headers: authorization ? { authorization } : {},
    }),
  );

describe('/api/cron/link-check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_SECRET', 'right-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ['no token', undefined],
    ['a wrong token', 'Bearer wrong-secret'],
    ['the secret without "Bearer"', 'right-secret'],
  ])('should turn away a request with %s', async (_name, authorization) => {
    const response = await call(authorization);

    expect(response.status).toBe(401);
    expect(runLinkCheck).not.toHaveBeenCalled();
  });

  it('should turn everyone away when CRON_SECRET is not set', async () => {
    vi.stubEnv('CRON_SECRET', '');

    const response = await call('Bearer ');

    expect(response.status).toBe(401);
    expect(runLinkCheck).not.toHaveBeenCalled();
  });

  it('should run the check for Vercel Cron and return what it did', async () => {
    const summary = {
      links: 2,
      checked: 2,
      skipped: 0,
      blocked: ['abc'],
      unblocked: [],
      problems: [],
    };
    vi.mocked(runLinkCheck).mockResolvedValue(summary);

    const response = await call('Bearer right-secret');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(summary);
  });
});
