import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { User } from '@supabase/supabase-js';
import { useUserContext } from '@/app/context/UserContext';
import SignedOutOnly from '../SignedOutOnly';

vi.mock('@/app/context/UserContext', () => ({
  useUserContext: vi.fn(),
}));

const withUser = (user: User | null) =>
  vi.mocked(useUserContext).mockReturnValue({ user } as ReturnType<typeof useUserContext>);

describe('SignedOutOnly', () => {
  it('should render its children for signed-out visitors', () => {
    withUser(null);
    render(<SignedOutOnly><p>Features</p></SignedOutOnly>);

    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('should hide its children once a user is signed in', () => {
    withUser({ id: 'user-1' } as User);
    render(<SignedOutOnly><p>Features</p></SignedOutOnly>);

    expect(screen.queryByText('Features')).not.toBeInTheDocument();
  });
});
