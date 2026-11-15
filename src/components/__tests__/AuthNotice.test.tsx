import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { toast } from 'sonner';
import AuthNotice from '../AuthNotice';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const show = async (path: string) => {
  window.history.replaceState(null, '', path);
  render(<AuthNotice />);
  await act(() => vi.runAllTimersAsync());
};

describe('AuthNotice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('welcomes a confirmed sign-up and cleans the address', async () => {
    await show('/?auth=confirmed&x=1#top');
    expect(toast.success).toHaveBeenCalledWith(
      'Your email is confirmed. Welcome!',
      expect.anything(),
    );
    expect(window.location.pathname + window.location.search).toBe('/?x=1');
    expect(window.location.hash).toBe('#top');
  });

  it('explains an expired link as an error', async () => {
    await show('/?auth=expired');
    expect(toast.error).toHaveBeenCalledWith(
      'This link has expired or was already used. Please request a new one.',
      expect.anything(),
    );
    expect(window.location.search).toBe('');
  });

  it.each(['/', '/?auth=nonsense', '/?auth=toString'])(
    'shows nothing for %s',
    async (path) => {
      await show(path);
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    },
  );

  it('shows the message once in React development double runs', async () => {
    window.history.replaceState(null, '', '/?auth=failed');
    const { unmount } = render(<AuthNotice />);
    unmount(); // the first run's cleanup
    render(<AuthNotice />);
    await act(() => vi.runAllTimersAsync());
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
