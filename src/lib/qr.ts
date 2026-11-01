// QR codes for short links. They point at https://reqq.cc/<slug>?qr so click
// stats can tell scans apart; the redirect ignores the query string. Printed
// codes can't be changed later, so keep this format stable.
//
// The qrcode library is imported on demand, so it only loads when someone
// opens a QR code.

import { QR_MARKER } from './qrMarker';

const QR_OPTIONS = {
  errorCorrectionLevel: 'M', // survives ~15% damage, keeps the code small
  margin: 2,
  color: { dark: '#13535d', light: '#ffffff' }, // site teal on white
} as const;

export function qrTarget(slug: string): string {
  return `https://reqq.cc/${slug}?${QR_MARKER}`;
}

export async function qrSvg(slug: string): Promise<string> {
  const { toString } = await import('qrcode');
  return toString(qrTarget(slug), { ...QR_OPTIONS, type: 'svg' });
}

/** PNG as a data: URL, `width` pixels square. */
export async function qrPng(slug: string, width = 1024): Promise<string> {
  const { toDataURL } = await import('qrcode');
  return toDataURL(qrTarget(slug), { ...QR_OPTIONS, width });
}
