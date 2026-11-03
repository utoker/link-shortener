import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runLinkCheck, blockedLinkEmail, defang } from '../linkCheck';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { checkUrlsSafety, type SafetyVerdict } from '@/lib/safeBrowsing';
import { sendEmail } from '@/lib/email';

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(),
}));
vi.mock('@/lib/safeBrowsing', () => ({ checkUrlsSafety: vi.fn() }));
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }));

type Row = {
  id: string;
  slug: string;
  url: string;
  user_id: string | null;
  safety_threats: string[] | null;
};

const row = (id: string, url: string, more: Partial<Row> = {}): Row => ({
  id,
  slug: `slug-${id}`,
  url,
  user_id: null,
  safety_threats: null,
  ...more,
});

const PHISHING: SafetyVerdict = {
  verdict: 'unsafe',
  threats: ['SOCIAL_ENGINEERING'],
};
const DOWN: SafetyVerdict = { verdict: 'unknown', reason: 'HTTP 503' };

// Google's answer per URL; anything not listed is safe
function google(verdicts: Record<string, SafetyVerdict> = {}) {
  vi.mocked(checkUrlsSafety).mockImplementation(
    async (urls) =>
      new Map(urls.map((url) => [url, verdicts[url] ?? { verdict: 'safe' }])),
  );
}

// Stand-in for the secret-key client: serves `rows`, records every update
// with its filters, and knows each user's email address.
function database(
  rows: Row[],
  options: {
    readError?: { message: string };
    /** ids whose block another run already started */
    alreadyBlocked?: string[];
    emails?: Record<string, string>;
  } = {},
) {
  const updates: {
    values: Record<string, unknown>;
    filters: Record<string, unknown>;
  }[] = [];

  const db = {
    from: () => ({
      select: () => ({
        order: () => ({
          range: async (from: number, to: number) =>
            options.readError
              ? { data: null, error: options.readError }
              : { data: rows.slice(from, to + 1), error: null },
        }),
      }),
      update: (values: Record<string, unknown>) => {
        const update = { values, filters: {} as Record<string, unknown> };
        updates.push(update);
        const query = {
          eq: (column: string, value: unknown) => {
            update.filters[column] = value;
            return query;
          },
          is: (column: string, value: unknown) => {
            update.filters[`${column} is`] = value;
            return query;
          },
          in: (column: string, value: unknown) => {
            update.filters[`${column} in`] = value;
            return query;
          },
          select: async () => ({
            data: options.alreadyBlocked?.includes(update.filters.id as string)
              ? []
              : [{ id: update.filters.id }],
            error: null,
          }),
          then: (resolve: (result: { error: null }) => void) =>
            resolve({ error: null }),
        };
        return query;
      },
    }),
    auth: {
      admin: {
        getUserById: async (id: string) => ({
          data: { user: { id, email: options.emails?.[id] } },
          error: null,
        }),
      },
    },
  };

  vi.mocked(createSupabaseAdminClient).mockReturnValue(db as never);
  return updates;
}

const sentTo = () => vi.mocked(sendEmail).mock.calls.map(([m]) => m.to);

describe('runLinkCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ALERT_EMAIL', 'admin@example.com');
    vi.mocked(sendEmail).mockResolvedValue({ ok: true });
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should block a newly flagged link and email its owner once', async () => {
    const updates = database(
      [
        row('1', 'https://bad.example/login', { user_id: 'u1' }),
        row('2', 'https://example.com/'),
      ],
      { emails: { u1: 'owner@example.com' } },
    );
    google({ 'https://bad.example/login': PHISHING });

    const summary = await runLinkCheck();

    expect(summary).toEqual({
      links: 2,
      checked: 2,
      skipped: 0,
      blocked: ['slug-1'],
      unblocked: [],
      problems: [],
    });
    // the block only starts if the URL is unchanged and no run started it yet
    expect(updates).toContainEqual({
      values: {
        safety_threats: ['SOCIAL_ENGINEERING'],
        safety_flagged_at: expect.any(String),
        safety_checked_at: expect.any(String),
      },
      filters: {
        id: '1',
        url: 'https://bad.example/login',
        'safety_threats is': null,
      },
    });
    // clean links only get the time of the check
    expect(updates).toContainEqual({
      values: { safety_checked_at: expect.any(String) },
      filters: { 'id in': ['2'] },
    });
    expect(sentTo()).toEqual(['owner@example.com']);
    const email = vi.mocked(sendEmail).mock.calls[0][0];
    expect(email.subject).toBe('Your link reqq.cc/slug-1 has been blocked');
    expect(email.text).toContain('bad[.]example/login');
    expect(email.text).not.toContain('https://bad.example');
  });

  it('should block a link without an account without emailing anyone', async () => {
    database([row('1', 'https://bad.example/')]);
    google({ 'https://bad.example/': PHISHING });

    const summary = await runLinkCheck();

    expect(summary.blocked).toEqual(['slug-1']);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should keep a blocked link blocked without emailing again', async () => {
    const updates = database([
      row('1', 'https://bad.example/', {
        user_id: 'u1',
        safety_threats: ['MALWARE'],
      }),
    ]);
    google({ 'https://bad.example/': PHISHING });

    const summary = await runLinkCheck();

    expect(summary.blocked).toEqual([]);
    expect(updates).toEqual([
      {
        values: {
          safety_threats: ['SOCIAL_ENGINEERING'],
          safety_checked_at: expect.any(String),
        },
        filters: { id: '1', url: 'https://bad.example/' },
      },
    ]);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should lift the block once Google reports the URL clean', async () => {
    const updates = database([
      row('1', 'https://cleaned.example/', { safety_threats: ['MALWARE'] }),
    ]);
    google();

    const summary = await runLinkCheck();

    expect(summary.unblocked).toEqual(['slug-1']);
    expect(updates).toEqual([
      {
        values: {
          safety_threats: null,
          safety_flagged_at: null,
          safety_checked_at: expect.any(String),
        },
        filters: { id: '1', url: 'https://cleaned.example/' },
      },
    ]);
  });

  it('should leave links Google could not answer for as they were', async () => {
    const updates = database([
      row('1', 'https://a.example/', { safety_threats: ['MALWARE'] }),
      row('2', 'https://b.example/'),
    ]);
    google({ 'https://a.example/': DOWN });

    const summary = await runLinkCheck();

    expect(summary).toMatchObject({ checked: 1, skipped: 1, problems: [] });
    expect(updates).toEqual([
      {
        values: { safety_checked_at: expect.any(String) },
        filters: { 'id in': ['2'] },
      },
    ]);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should alert when Google answers for no link at all', async () => {
    const updates = database([
      row('1', 'https://a.example/'),
      row('2', 'https://b.example/'),
    ]);
    google({ 'https://a.example/': DOWN, 'https://b.example/': DOWN });

    const summary = await runLinkCheck();

    expect(updates).toEqual([]);
    expect(summary.problems).toEqual([
      "Google Safe Browsing didn't answer for any of the 2 links (HTTP 503). " +
        'Nothing was blocked or unblocked; they will be checked again next Monday.',
    ]);
    expect(sentTo()).toEqual(['admin@example.com']);
    expect(vi.mocked(sendEmail).mock.calls[0][0].text).toContain(
      "didn't answer for any of the 2 links",
    );
  });

  it('should not email the owner when another run started the block first', async () => {
    database([row('1', 'https://bad.example/', { user_id: 'u1' })], {
      alreadyBlocked: ['1'],
      emails: { u1: 'owner@example.com' },
    });
    google({ 'https://bad.example/': PHISHING });

    const summary = await runLinkCheck();

    expect(summary.blocked).toEqual([]);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("should alert when the owner's email could not be sent", async () => {
    database([row('1', 'https://bad.example/', { user_id: 'u1' })], {
      emails: { u1: 'owner@example.com' },
    });
    google({ 'https://bad.example/': PHISHING });
    vi.mocked(sendEmail).mockResolvedValueOnce({
      ok: false,
      reason: 'HTTP 500',
    });

    const summary = await runLinkCheck();

    expect(summary.blocked).toEqual(['slug-1']);
    expect(summary.problems).toEqual([
      "Couldn't email the owner of reqq.cc/slug-1 about its block: HTTP 500",
    ]);
    expect(sentTo()).toEqual(['owner@example.com', 'admin@example.com']);
  });

  it('should alert instead of throwing when the links cannot be read', async () => {
    database([], { readError: { message: 'database down' } });
    google();

    const summary = await runLinkCheck();

    expect(summary.problems).toEqual([
      'The check stopped early: database down',
    ]);
    expect(checkUrlsSafety).not.toHaveBeenCalled();
    expect(sentTo()).toEqual(['admin@example.com']);
  });

  it('should still finish when there is nobody to alert', async () => {
    vi.stubEnv('ALERT_EMAIL', '');
    database([], { readError: { message: 'database down' } });

    const summary = await runLinkCheck();

    expect(summary.problems).toHaveLength(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe('blockedLinkEmail', () => {
  it('should name the threats in plain words', () => {
    const { text } = blockedLinkEmail(
      { slug: 'abc', url: 'https://bad.example/' },
      ['MALWARE', 'UNWANTED_SOFTWARE'],
    );
    expect(text).toContain(
      'your short link reqq.cc/abc as malware and unwanted software:',
    );
  });
});

describe('defang', () => {
  it('should drop the scheme and break up every dot', () => {
    expect(defang('https://a.b.example/x.html?q=1')).toBe(
      'a[.]b[.]example/x[.]html?q=1',
    );
  });

  it('should shorten very long URLs', () => {
    const shown = defang(`https://example.com/${'x'.repeat(300)}`);
    expect(shown).toHaveLength(121);
    expect(shown.endsWith('…')).toBe(true);
  });
});
