import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { User } from '@supabase/supabase-js';
import type { Link } from '@/lib/types/database';
import { toast } from 'sonner';
import { getUserAction } from '@/app/actions/auth';
import { getAllSlugs, getUserLinks } from '@/app/actions/data';
import { UserProvider, useUserContext } from '../UserContext';

vi.mock('@/app/actions/auth', () => ({
  getUserAction: vi.fn(),
}));

vi.mock('@/app/actions/data', () => ({
  getAllSlugs: vi.fn(),
  getUserLinks: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

const renderUserContext = async () => {
  const hook = renderHook(() => useUserContext(), { wrapper: UserProvider });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

describe('UserContext refetchLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllSlugs).mockResolvedValue([]);
  });

  it('should skip fetching links when signed out', async () => {
    vi.mocked(getUserAction).mockResolvedValue({ success: false });

    const { result } = await renderUserContext();
    await act(() => result.current.refetchLinks());

    expect(getUserLinks).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(result.current.links).toBeNull();
  });

  it('should refetch links when signed in', async () => {
    const link = { slug: 'abc123', url: 'https://example.com' } as Link;

    vi.mocked(getUserAction).mockResolvedValue({
      success: true,
      user: { id: 'user-1' } as User,
    });
    vi.mocked(getUserLinks).mockResolvedValue({ success: true, links: [] });

    const { result } = await renderUserContext();
    expect(getUserLinks).toHaveBeenCalledTimes(1);

    vi.mocked(getUserLinks).mockResolvedValue({ success: true, links: [link] });
    await act(() => result.current.refetchLinks());

    expect(getUserLinks).toHaveBeenCalledTimes(2);
    expect(result.current.links).toEqual([link]);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
