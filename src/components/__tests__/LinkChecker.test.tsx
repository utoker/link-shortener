import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkLink, type CheckLinkResult } from '@/app/actions/data/checkLink';
import LinkChecker from '../LinkChecker';

vi.mock('@/app/actions/data/checkLink', () => ({ checkLink: vi.fn() }));

async function check(result: CheckLinkResult, link = 'bit.ly/abc') {
  vi.mocked(checkLink).mockResolvedValue(result);
  const user = userEvent.setup();
  render(<LinkChecker />);
  await user.type(screen.getByLabelText('Link to check'), link);
  await user.click(screen.getByRole('button', { name: 'Check link' }));
}

describe('LinkChecker', () => {
  beforeEach(() => {
    vi.mocked(checkLink).mockReset();
  });

  it('should start empty with the button switched off', () => {
    render(<LinkChecker />);

    expect(
      screen.getByText('Where the link leads will show up here.'),
    ).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Check link' })
        .disabled,
    ).toBe(true);
  });

  it('should list every address on the way, as text rather than links', async () => {
    await check({
      ok: true,
      steps: [
        { url: 'https://bit.ly/abc', status: 301 },
        { url: 'https://t.co/xyz', status: 302 },
        { url: 'https://example.com/landing', status: 200 },
      ],
      end: 'arrived',
      safety: 'safe',
    });

    expect(await screen.findByText('https://example.com/landing')).toBeTruthy();
    expect(checkLink).toHaveBeenCalledWith('bit.ly/abc');
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual([
      'https://bit.ly/abc (HTTP 301)',
      'https://t.co/xyz (HTTP 302)',
      'https://example.com/landing (HTTP 200)',
    ]);
    expect(
      screen.getByText(
        'This link redirects 2 times and ends at the last address.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(/Google Safe Browsing lists no threats/),
    ).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('should warn about an unsafe end and credit Google', async () => {
    await check({
      ok: true,
      steps: [
        { url: 'https://bit.ly/abc', status: 301 },
        { url: 'https://evil.example/', status: 200 },
      ],
      end: 'arrived',
      safety: 'unsafe',
      threats: 'malware',
    });

    expect(
      await screen.findByText(
        /Warning: Google Safe Browsing reports the last address as malware\./,
      ),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Advisory provided by Google' })
        .getAttribute('href'),
    ).toBe('https://developers.google.com/safe-browsing/v4/advisory');
  });

  it.each<[CheckLinkResult, RegExp]>([
    [
      {
        ok: true,
        steps: [{ url: 'https://example.com/', status: 200 }],
        end: 'arrived',
        safety: 'safe',
      },
      /doesn’t redirect/,
    ],
    [
      {
        ok: true,
        steps: [{ url: 'https://example.com/gone', status: 404 }],
        end: 'arrived',
        safety: 'safe',
      },
      /answered with an error \(HTTP 404\)/,
    ],
    [
      {
        ok: true,
        steps: [{ url: 'https://a.example/', status: 301 }],
        end: 'too-many-redirects',
        safety: 'safe',
      },
      /keeps redirecting/,
    ],
    [
      {
        ok: true,
        steps: [{ url: 'https://down.example/', status: null }],
        end: 'unreachable',
        safety: 'unknown',
      },
      /didn’t answer/,
    ],
    [
      {
        ok: true,
        steps: [{ url: 'https://slow.example/', status: null }],
        end: 'timeout',
        safety: 'unknown',
      },
      /took too long/,
    ],
    [
      {
        ok: true,
        steps: [{ url: 'https://reqq.cc/bad', status: null }],
        end: 'blocked',
        safety: 'unknown',
      },
      /reqq\.cc has blocked this short link/,
    ],
  ])('should explain how the check ended (%#)', async (result, message) => {
    await check(result);

    expect(await screen.findByText(message)).toBeTruthy();
  });

  it('should leave Google out when the last address was never opened', async () => {
    await check({
      ok: true,
      steps: [
        { url: 'https://evil.example/', status: 301 },
        { url: 'http://192.168.0.1/', status: null },
      ],
      end: 'not-allowed',
      safety: 'unknown',
    });

    expect(await screen.findByText(/isn’t a public web address/)).toBeTruthy();
    expect(screen.queryByText(/Google Safe Browsing/)).toBeNull();
  });

  it("should show the server's error", async () => {
    await check({ ok: false, error: 'Too many checks.' });

    expect(await screen.findByText('Too many checks.')).toBeTruthy();
  });

  it('should say so when the server cannot be reached', async () => {
    vi.mocked(checkLink).mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    render(<LinkChecker />);
    await user.type(screen.getByLabelText('Link to check'), 'bit.ly/abc');
    await user.click(screen.getByRole('button', { name: 'Check link' }));

    expect(
      await screen.findByText('Something went wrong. Please try again.'),
    ).toBeTruthy();
  });
});
