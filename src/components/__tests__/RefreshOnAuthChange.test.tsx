import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import RefreshOnAuthChange from '../RefreshOnAuthChange';

const refresh = vi.fn();
let context = { user: null as { id: string } | null, loading: true };

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/app/context/UserContext', () => ({ useUserContext: () => context }));

describe('RefreshOnAuthChange', () => {
  beforeEach(() => {
    refresh.mockClear();
    context = { user: null, loading: true };
  });

  it('should not refresh when the page first learns who is signed in', () => {
    const { rerender } = render(<RefreshOnAuthChange />);
    context = { user: { id: 'a' }, loading: false };
    rerender(<RefreshOnAuthChange />);

    expect(refresh).not.toHaveBeenCalled();
  });

  it('should refresh after signing in or out on the page', () => {
    const { rerender } = render(<RefreshOnAuthChange />);
    context = { user: null, loading: false };
    rerender(<RefreshOnAuthChange />);

    context = { user: null, loading: true }; // sign-in modal refetching
    rerender(<RefreshOnAuthChange />);
    context = { user: { id: 'a' }, loading: false };
    rerender(<RefreshOnAuthChange />);
    expect(refresh).toHaveBeenCalledTimes(1);

    context = { user: null, loading: false }; // signed out
    rerender(<RefreshOnAuthChange />);
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
