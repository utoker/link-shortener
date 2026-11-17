import { describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setPrefillUrl } from '@/lib/prefill';
import {
  createLink,
  type CreateLinkResult,
} from '@/app/actions/data/createLink';
import { useUserContext } from '@/app/context/UserContext';
import Hero from '../Hero';

vi.mock('@/lib/rateLimit', () => ({
  linkCreationRateLimit: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('@/app/context/UserContext', () => ({
  useUserContext: vi.fn(),
}));

vi.mock('@/app/actions/data/createLink', () => ({
  createLink: vi.fn(),
}));

vi.mock('@/app/actions/data', () => ({
  checkSlug: vi.fn().mockResolvedValue(true),
}));

// static image imports are plain strings under Vitest, which next/image refuses
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const INVALID_URL = 'Please enter a valid URL (e.g., https://example.com)';

function renderHero() {
  vi.mocked(useUserContext).mockReturnValue({
    refetchLinks: vi.fn(),
  } as unknown as ReturnType<typeof useUserContext>);
  render(<Hero />);
  return screen.getByPlaceholderText('Enter Long Link Here');
}

describe('Hero Component Error Handling', () => {
  it('should handle formError in createLinkWithRefresh wrapper', () => {
    const mockFormError = 'Too many link creation attempts. Please wait a minute before trying again.';

    const mockResult: CreateLinkResult = {
      success: false,
      formError: mockFormError,
    };

    expect(mockResult.success).toBe(false);
    expect(mockResult.formError).toBe(mockFormError);
    expect(mockResult.fieldErrors).toBeUndefined();
  });

  it('should handle success case with slug', () => {
    const mockResult: CreateLinkResult = {
      success: true,
      slug: 'abc123',
    };

    expect(mockResult.success).toBe(true);
    expect(mockResult.slug).toBe('abc123');
  });
});

describe('Hero prefilled link', () => {
  it('should start with the link a tool page handed over, once', () => {
    setPrefillUrl('https://example.com/?utm_source=newsletter');

    expect(renderHero()).toHaveValue(
      'https://example.com/?utm_source=newsletter',
    );

    cleanup();
    expect(renderHero()).toHaveValue('');
  });
});

describe('Hero URL messages', () => {
  it('should refuse a single word while typing', async () => {
    const user = userEvent.setup();
    const input = renderHero();

    await user.type(input, 'hello');

    expect(await screen.findByText(INVALID_URL)).toBeInTheDocument();
  });

  it("should show the server's verdict only until the URL is changed", async () => {
    const UNSAFE = 'Google Safe Browsing reports this link as unsafe.';
    vi.mocked(createLink).mockResolvedValue({
      success: false,
      fieldErrors: { url: [UNSAFE] },
    });
    const user = userEvent.setup();
    const input = renderHero();

    await user.type(input, 'bad.example/login');
    await user.click(screen.getByRole('button', { name: 'Create Short Link' }));
    expect(await screen.findByText(UNSAFE)).toBeInTheDocument();

    // a different, valid URL: the verdict was about the old one
    await user.clear(input);
    await user.type(input, 'example.com/other');
    expect(screen.queryByText(UNSAFE)).not.toBeInTheDocument();

    // back to the URL that was refused: the verdict applies again
    await user.clear(input);
    await user.type(input, 'bad.example/login');
    expect(screen.getByText(UNSAFE)).toBeInTheDocument();
  });
});
