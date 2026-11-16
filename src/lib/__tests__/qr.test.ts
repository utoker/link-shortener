import { describe, it, expect } from 'vitest';
import { qrContent, qrPng, qrSvg, qrTarget, textQrPng, textQrSvg } from '../qr';

describe('qrContent', () => {
  it('should add https:// to a link typed without it', () => {
    expect(qrContent('example.com')).toBe('https://example.com');
    expect(qrContent(' www.example.co.uk/menu?x=1 ')).toBe(
      'https://www.example.co.uk/menu?x=1',
    );
  });

  it('should leave full links and plain text alone', () => {
    expect(qrContent('http://example.com')).toBe('http://example.com');
    expect(qrContent('mailto:hi@example.com')).toBe('mailto:hi@example.com');
    expect(qrContent('hi@example.com')).toBe('hi@example.com');
    expect(qrContent('See you at 8.')).toBe('See you at 8.');
    expect(qrContent('   ')).toBe('');
  });
});

describe('textQrSvg', () => {
  it('should draw a code for any text', async () => {
    expect(await textQrSvg('hello there')).toMatch(/^<svg /);
  });

  it('should reject text too long for one code', async () => {
    await expect(textQrSvg('x'.repeat(5000))).rejects.toThrow();
  });
});

describe('textQrPng', () => {
  it('should make a PNG data URL', async () => {
    expect(await textQrPng('hello there', 64)).toMatch(
      /^data:image\/png;base64,/,
    );
  });
});

describe('qrTarget', () => {
  it('should point at the short link with the ?qr marker', () => {
    expect(qrTarget('abc123')).toBe('https://reqq.cc/abc123?qr');
  });
});

describe('qrSvg', () => {
  it('should draw a teal-on-white SVG', async () => {
    const svg = await qrSvg('abc123');
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('#13535d');
    expect(svg).toContain('#ffffff');
  });
});

describe('qrPng', () => {
  it('should make a 1024 px PNG by default', async () => {
    const dataUrl = await qrPng('abc123');
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);

    // PNG header: width and height are big-endian at bytes 16-23
    const png = Buffer.from(dataUrl.split(',')[1], 'base64');
    expect(png.readUInt32BE(16)).toBe(1024);
    expect(png.readUInt32BE(20)).toBe(1024);
  });
});
