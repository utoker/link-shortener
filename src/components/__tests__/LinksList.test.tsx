import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { User } from '@supabase/supabase-js';
import { useUserContext } from '@/app/context/UserContext';
import { deleteLink } from '@/app/actions/data';
import LinksList from '../LinksList';

vi.mock('@/app/context/UserContext', () => ({
  useUserContext: vi.fn(),
}));

vi.mock('@/app/actions/data', () => ({
  deleteLink: vi.fn(),
}));

vi.mock('@/lib/qr', () => ({
  qrSvg: vi
    .fn()
    .mockResolvedValue('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
  qrPng: vi.fn(),
}));

vi.mock('@/app/actions/data/updateLink', () => ({
  updateLink: vi.fn(),
}));

// SVG icons are React components in the app (svgr); plain stand-ins here
vi.mock('@icons/copy-icon.svg', () => ({ default: () => null }));
vi.mock('@icons/delete-icon.svg', () => ({ default: () => null }));

const signedInWithTwoLinks = () =>
  vi.mocked(useUserContext).mockReturnValue({
    user: { id: 'user-1' } as User,
    links: [
      {
        id: '1',
        slug: 'first',
        url: 'https://example.com/1',
        click_count: 3,
      },
      {
        id: '2',
        slug: 'second',
        url: 'https://example.com/2',
        click_count: 0,
      },
    ],
    refetchLinks: vi.fn(),
  } as unknown as ReturnType<typeof useUserContext>);

describe('LinksList', () => {
  it('should open the QR code of the link whose button was pressed', async () => {
    signedInWithTwoLinks();
    const user = userEvent.setup();

    render(<LinksList />);
    const buttons = screen.getAllByRole('button', { name: 'Show QR code' });
    expect(buttons).toHaveLength(2);

    await user.click(buttons[1]);

    expect(
      await screen.findByAltText('QR code for reqq.cc/second'),
    ).toBeInTheDocument();
  });

  it('should mark only the links Google Safe Browsing flagged as blocked', () => {
    vi.mocked(useUserContext).mockReturnValue({
      user: { id: 'user-1' } as User,
      links: [
        {
          id: '1',
          slug: 'bad',
          url: 'https://bad.example/',
          click_count: 0,
          safety_threats: ['SOCIAL_ENGINEERING'],
        },
        {
          id: '2',
          slug: 'good',
          url: 'https://example.com/',
          click_count: 0,
          safety_threats: null,
        },
      ],
      refetchLinks: vi.fn(),
    } as unknown as ReturnType<typeof useUserContext>);

    render(<LinksList />);

    expect(screen.getAllByText('Blocked')).toHaveLength(1);
    expect(screen.getByText('Blocked').nextSibling).toHaveTextContent(
      'https://bad.example/',
    );
  });

  it('should ask before deleting a link, and delete it only once confirmed', async () => {
    signedInWithTwoLinks();
    vi.mocked(deleteLink).mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<LinksList />);
    const deleteButtons = screen.getAllByRole('button', {
      name: 'Delete shortlink',
    });

    await user.click(deleteButtons[1]);
    expect(
      await screen.findByText(/reqq\.cc\/second and its QR codes will stop working/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(deleteLink).not.toHaveBeenCalled();

    await user.click(deleteButtons[1]);
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteLink).toHaveBeenCalledTimes(1));
    const formData = vi.mocked(deleteLink).mock.calls[0][1];
    expect(formData.get('linkId')).toBe('2');
  });

  it('should open the edit dialog for the link whose pencil was pressed', async () => {
    signedInWithTwoLinks();
    const user = userEvent.setup();

    render(<LinksList />);
    await user.click(
      screen.getByRole('button', { name: 'Edit where reqq.cc/second leads' }),
    );

    expect(await screen.findByLabelText('Destination')).toHaveValue(
      'https://example.com/2',
    );
  });
});
