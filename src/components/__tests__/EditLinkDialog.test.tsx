import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateLink } from '@/app/actions/data/updateLink';
import EditLinkDialog from '../EditLinkDialog';

vi.mock('@/app/actions/data/updateLink', () => ({
  updateLink: vi.fn(),
}));

const LINK = { id: 'link-1', slug: 'abc123', url: 'https://example.com/old' };

function renderDialog(onSaved = vi.fn(), onOpenChange = vi.fn()) {
  render(
    <EditLinkDialog
      link={LINK}
      open
      onOpenChange={onOpenChange}
      onSaved={onSaved}
    />,
  );
  return { input: screen.getByLabelText('Destination'), onSaved, onOpenChange };
}

describe('EditLinkDialog', () => {
  it('should start from the saved destination with Save disabled', () => {
    const { input } = renderDialog();

    expect(input).toHaveValue('https://example.com/old');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.queryByText(/Google Safe Browsing/)).not.toBeInTheDocument();
  });

  it('should explain why a blocked link is blocked and how to lift it', () => {
    render(
      <EditLinkDialog
        link={{ ...LINK, safety_threats: ['MALWARE'] }}
        open
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        'Google Safe Browsing reports this destination as malware, so visitors see a warning page instead. Save a different destination to lift the block.',
      ),
    ).toBeInTheDocument();
  });

  it('should explain a refused destination while typing', async () => {
    const user = userEvent.setup();
    const { input } = renderDialog();

    await user.clear(input);
    await user.type(input, 'bit.ly/abc');

    expect(
      await screen.findByText(
        'Links to other URL shorteners are not allowed. Use the full destination link.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should save the new destination and close', async () => {
    vi.mocked(updateLink).mockResolvedValue({ success: true });
    const user = userEvent.setup();
    const { input, onSaved, onOpenChange } = renderDialog();

    await user.clear(input);
    await user.type(input, 'example.com/new');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled(),
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const fd = vi.mocked(updateLink).mock.calls[0][1];
    expect(fd.get('linkId')).toBe('link-1');
    expect(fd.get('url')).toBe('example.com/new');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should show the server's verdict under the field", async () => {
    vi.mocked(updateLink).mockResolvedValue({
      success: false,
      fieldErrors: {
        url: ['Google Safe Browsing reports this link as unsafe.'],
      },
    });
    const user = userEvent.setup();
    const { input, onSaved } = renderDialog();

    await user.clear(input);
    await user.type(input, 'bad.example/login');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled(),
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText(
        'Google Safe Browsing reports this link as unsafe.',
      ),
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
