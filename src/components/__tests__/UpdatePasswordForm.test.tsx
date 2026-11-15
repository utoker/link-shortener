import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UpdatePasswordForm from '../UpdatePasswordForm';
import { useUserContext } from '@/app/context/UserContext';

vi.mock('@/app/context/UserContext', () => ({ useUserContext: vi.fn() }));
vi.mock('@/app/actions/auth', () => ({ updatePasswordAction: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const as = (user: object | null, loading = false) =>
  vi.mocked(useUserContext).mockReturnValue({ user, loading } as any);

describe('UpdatePasswordForm', () => {
  it('asks for a new link when nobody is signed in', () => {
    as(null);
    render(<UpdatePasswordForm />);
    expect(
      screen.getByText(
        'This link has expired or was already used. Please request a new one.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
  });

  it('shows the form to the signed-in user', () => {
    as({ id: 'u1' });
    render(<UpdatePasswordForm />);
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
  });

  it('shows the form while the user is still loading', () => {
    as(null, true);
    render(<UpdatePasswordForm />);
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
  });
});
