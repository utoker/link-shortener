import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { textQrPng, textQrSvg } from '@/lib/qr';
import QrGenerator from '../QrGenerator';

// qrContent stays real: it decides what the code holds
vi.mock('@/lib/qr', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/qr')>()),
  textQrSvg: vi.fn(),
  textQrPng: vi.fn(),
}));

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

describe('QrGenerator', () => {
  const downloads: { href: string; download: string }[] = [];

  beforeEach(() => {
    downloads.length = 0;
    vi.mocked(textQrSvg).mockReset().mockResolvedValue(SVG);
    vi.mocked(textQrPng).mockReset().mockResolvedValue('data:image/png;base64,AAAA');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push({ href: this.href, download: this.download });
    });
  });

  it('should start empty with the downloads switched off', () => {
    render(<QrGenerator />);

    expect(screen.getByText('Your QR code will show up here.')).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Download PNG' })
        .disabled,
    ).toBe(true);
    expect(textQrSvg).not.toHaveBeenCalled();
  });

  it('should draw a code for the typed link, adding https://', async () => {
    const user = userEvent.setup();
    render(<QrGenerator />);

    await user.type(screen.getByLabelText('Link or text'), 'example.com/menu');

    const img = await screen.findByAltText(
      'QR code for https://example.com/menu',
    );
    expect(img.getAttribute('src')).toBe(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`,
    );
    expect(textQrSvg).toHaveBeenLastCalledWith('https://example.com/menu');
    expect(screen.getByText('Scans as: https://example.com/menu')).toBeTruthy();
  });

  it('should download the PNG and the SVG', async () => {
    const user = userEvent.setup();
    render(<QrGenerator />);
    await user.type(screen.getByLabelText('Link or text'), 'hello there');
    await screen.findByAltText('QR code for hello there');

    await user.click(screen.getByRole('button', { name: 'Download PNG' }));
    await user.click(screen.getByRole('button', { name: 'Download SVG' }));

    expect(textQrPng).toHaveBeenCalledWith('hello there');
    expect(downloads).toEqual([
      { href: 'data:image/png;base64,AAAA', download: 'qr-code.png' },
      {
        href: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`,
        download: 'qr-code.svg',
      },
    ]);
  });

  it('should say so when the text does not fit in a code', async () => {
    vi.mocked(textQrSvg).mockRejectedValue(new Error('too big'));
    const user = userEvent.setup();
    render(<QrGenerator />);

    await user.type(screen.getByLabelText('Link or text'), 'x');

    expect(
      await screen.findByText(
        'That’s too long for one QR code. Try a shorter text.',
      ),
    ).toBeTruthy();
  });

  it('should clear the code when the box is emptied', async () => {
    const user = userEvent.setup();
    render(<QrGenerator />);
    const box = screen.getByLabelText('Link or text');
    await user.type(box, 'hello');
    await screen.findByAltText('QR code for hello');

    await user.clear(box);

    expect(
      await screen.findByText('Your QR code will show up here.'),
    ).toBeTruthy();
  });
});
