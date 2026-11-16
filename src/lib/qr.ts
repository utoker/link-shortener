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

export function qrSvg(slug: string): Promise<string> {
  return textQrSvg(qrTarget(slug));
}

/** PNG as a data: URL, `width` pixels square. */
export function qrPng(slug: string, width = 1024): Promise<string> {
  return textQrPng(qrTarget(slug), width);
}

// ── Codes for any text (the /qr-code-generator page) ─────────────────────

// A link typed without its scheme, like "example.com/menu".
const BARE_LINK = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]\S*)?$/i;

/**
 * What a typed text becomes in a code: trimmed, and "example.com" gets
 * https:// so phone cameras offer to open it instead of showing plain text.
 */
export function qrContent(input: string): string {
  const text = input.trim();
  return BARE_LINK.test(text) ? `https://${text}` : text;
}

/** Rejects when the text is too long to fit in one code. */
export async function textQrSvg(text: string): Promise<string> {
  const { toString } = await import('qrcode');
  return toString(text, { ...QR_OPTIONS, type: 'svg' });
}

/** PNG as a data: URL, `width` pixels square. */
export async function textQrPng(text: string, width = 1024): Promise<string> {
  const { toDataURL } = await import('qrcode');
  return toDataURL(text, { ...QR_OPTIONS, width });
}
