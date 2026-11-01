import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { qrPng, qrSvg } from '@/lib/qr';
import QrCodeDialog from '../QrCodeDialog';

vi.mock('@/lib/qr', () => ({
  qrSvg: vi.fn(),
  qrPng: vi.fn(),
}));

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

describe('QrCodeDialog', () => {
  const downloads: { href: string; download: string }[] = [];

  beforeEach(() => {
    downloads.length = 0;
    vi.mocked(qrSvg).mockResolvedValue(SVG);
    vi.mocked(qrPng).mockResolvedValue('data:image/png;base64,AAAA');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push({ href: this.href, download: this.download });
    });
  });

  it('should show the QR code for the slug', async () => {
    render(<QrCodeDialog slug="abc123" open onOpenChange={() => {}} />);

    const img = await screen.findByAltText('QR code for reqq.cc/abc123');
    expect(img.getAttribute('src')).toBe(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`,
    );
    expect(qrSvg).toHaveBeenCalledWith('abc123');
  });

  it('should download the PNG and the SVG with the slug in the file name', async () => {
    const user = userEvent.setup();
    render(<QrCodeDialog slug="abc123" open onOpenChange={() => {}} />);
    await screen.findByAltText('QR code for reqq.cc/abc123');

    await user.click(screen.getByRole('button', { name: 'Download PNG' }));
    await user.click(screen.getByRole('button', { name: 'Download SVG' }));

    expect(downloads).toEqual([
      { href: 'data:image/png;base64,AAAA', download: 'reqq-abc123-qr.png' },
      {
        href: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`,
        download: 'reqq-abc123-qr.svg',
      },
    ]);
  });

  it('should not draw anything while closed', () => {
    render(<QrCodeDialog slug="abc123" open={false} onOpenChange={() => {}} />);
    expect(qrSvg).not.toHaveBeenCalled();
  });
});
