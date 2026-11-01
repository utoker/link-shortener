import { describe, it, expect } from 'vitest';
import { qrPng, qrSvg, qrTarget } from '../qr';

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
