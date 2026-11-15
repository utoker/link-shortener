import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import ConfirmEmailLink from '../app/auth/confirm/page';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

const open = async (params: Record<string, string | string[]>) =>
  render(await ConfirmEmailLink({ searchParams: Promise.resolve(params) }));

describe('/auth/confirm page', () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear();
  });

  it('asks before using a password reset link', async () => {
    const { container } = await open({ token_hash: 'abc', type: 'recovery' });

    const button = screen.getByRole('button', { name: 'Choose a new password' });
    const form = button.closest('form')!;
    expect(form.getAttribute('method')).toBe('post');
    expect(form.getAttribute('action')).toBe('/auth/confirm/verify');
    expect(
      container.querySelector<HTMLInputElement>('input[name=token_hash]')!.value,
    ).toBe('abc');
    expect(
      container.querySelector<HTMLInputElement>('input[name=type]')!.value,
    ).toBe('recovery');
  });

  it('asks before confirming a sign-up', async () => {
    await open({ token_hash: 'abc', type: 'email' });
    expect(
      screen.getByRole('heading', { name: 'Confirm your email' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirm my email' })).toBeTruthy();
  });

  it.each([
    ['no token', { type: 'email' }],
    ['no type', { token_hash: 'abc' }],
    ['an unknown type', { token_hash: 'abc', type: 'sms' }],
    ['a repeated token', { token_hash: ['a', 'b'], type: 'email' }],
  ])('sends a link with %s to the expired message', async (_, params) => {
    await expect(open(params)).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/?auth=expired');
  });
});
