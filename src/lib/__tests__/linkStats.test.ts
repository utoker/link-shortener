import { describe, it, expect } from 'vitest';
import {
  breakdownRows,
  clicksText,
  countryLabel,
  deviceLabel,
  formatDay,
  formatDayLong,
  referrerLabel,
  yAxisTicks,
} from '../linkStats';

describe('yAxisTicks', () => {
  it.each([
    [0, [0, 1]],
    [1, [0, 1]],
    [3, [0, 1, 2, 3]],
    [7, [0, 2, 4, 6, 8]],
    [10, [0, 5, 10]],
    [43, [0, 20, 40, 60]],
    [100, [0, 50, 100]],
    [1234, [0, 500, 1000, 1500]],
  ])('should give round gridlines for a peak of %i', (max, ticks) => {
    expect(yAxisTicks(max)).toEqual(ticks);
  });
});

describe('breakdownRows', () => {
  const counts = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      name: `site${i}.com`,
      clicks: 100 - i,
    }));

  it('should sort by clicks and label unknowns', () => {
    const rows = breakdownRows(
      [
        { name: 'x.com', clicks: 2 },
        { name: null, clicks: 5 },
        { name: 'linkedin.com', clicks: 3 },
      ],
      referrerLabel,
      'Other sites',
    );

    expect(rows).toEqual([
      { label: 'Direct / unknown', clicks: 5 },
      { label: 'linkedin.com', clicks: 3 },
      { label: 'x.com', clicks: 2 },
    ]);
  });

  it('should label QR code scans', () => {
    expect(referrerLabel('qr')).toBe('QR code');
  });

  it('should fold everything after the top 8 into one row', () => {
    const rows = breakdownRows(counts(12), referrerLabel, 'Other sites');

    expect(rows).toHaveLength(9);
    expect(rows[7]).toEqual({ label: 'site7.com', clicks: 93 });
    expect(rows[8]).toEqual({
      label: 'Other sites',
      clicks: 92 + 91 + 90 + 89,
    });
  });

  it('should keep a single leftover row under its own name', () => {
    const rows = breakdownRows(counts(9), referrerLabel, 'Other sites');

    expect(rows).toHaveLength(9);
    expect(rows[8].label).toBe('site8.com');
  });
});

describe('labels', () => {
  it('should name countries in English', () => {
    expect(countryLabel('TR')).toBe('Türkiye');
    expect(countryLabel('US')).toBe('United States');
    expect(countryLabel(null)).toBe('Unknown');
  });

  it('should name devices', () => {
    expect(deviceLabel('phone')).toBe('Phone');
    expect(deviceLabel('tablet')).toBe('Tablet');
    expect(deviceLabel('computer')).toBe('Computer');
    expect(deviceLabel(null)).toBe('Unknown');
  });

  it('should format days without shifting them to another date', () => {
    expect(formatDay('2026-11-01')).toBe('Nov 1');
    expect(formatDayLong('2026-11-01')).toBe('Sun, Nov 1');
  });

  it('should count clicks in words', () => {
    expect(clicksText(1)).toBe('1 click');
    expect(clicksText(0)).toBe('0 clicks');
    expect(clicksText(1234)).toBe('1,234 clicks');
  });
});
