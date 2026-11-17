import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { takePrefillUrl } from '@/lib/prefill';
import UtmBuilder from '../UtmBuilder';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const TAGGED =
  'https://example.com/page?utm_source=newsletter&utm_medium=email';

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Your link'), 'example.com/page');
  await user.type(screen.getByLabelText('Source'), 'newsletter');
  await user.type(screen.getByLabelText('Medium (optional)'), 'email');
}

describe('UtmBuilder', () => {
  beforeEach(() => {
    push.mockReset();
    sessionStorage.clear();
  });

  it('should start empty with the buttons switched off', () => {
    render(<UtmBuilder />);

    expect(screen.getByText('Your tagged link will show up here.')).toBeTruthy();
    for (const name of ['Copy link', 'Shorten it']) {
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name }).disabled,
      ).toBe(true);
    }
  });

  it('should show the tagged link as the boxes are filled in', async () => {
    const user = userEvent.setup();
    render(<UtmBuilder />);

    await fillIn(user);

    expect(screen.getByText(TAGGED)).toBeTruthy();
  });

  it('should ask for a source before showing a link', async () => {
    const user = userEvent.setup();
    render(<UtmBuilder />);

    await user.type(screen.getByLabelText('Your link'), 'example.com');
    await user.type(screen.getByLabelText('Medium (optional)'), 'email');

    expect(screen.getByText('Add a source to tag the link.')).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Copy link' })
        .disabled,
    ).toBe(true);
  });

  it('should say so when the link is not a web address', async () => {
    const user = userEvent.setup();
    render(<UtmBuilder />);

    await user.type(screen.getByLabelText('Your link'), 'hello');
    await user.type(screen.getByLabelText('Source'), 'newsletter');

    expect(
      screen.getByText('That doesn’t look like a web address.'),
    ).toBeTruthy();
  });

  it('should copy the tagged link', async () => {
    const user = userEvent.setup(); // also gives jsdom a clipboard
    render(<UtmBuilder />);
    await fillIn(user);

    await user.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeTruthy();
    expect(await navigator.clipboard.readText()).toBe(TAGGED);
  });

  it('should hand the tagged link to the shortener on the homepage', async () => {
    const user = userEvent.setup();
    render(<UtmBuilder />);
    await fillIn(user);

    await user.click(screen.getByRole('button', { name: 'Shorten it' }));

    expect(push).toHaveBeenCalledWith('/');
    expect(takePrefillUrl()).toBe(TAGGED);
    expect(takePrefillUrl()).toBe(''); // handed over once
  });
});
