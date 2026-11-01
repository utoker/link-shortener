// Shapes and display helpers for a link's stats page. The numbers come from
// the link_click_stats database function (see its migration).
import { QR_MARKER } from './qrMarker';

export interface Count {
  name: string | null; // null = not known (no referrer, no country)
  clicks: number;
}

export interface DayCount {
  day: string; // YYYY-MM-DD in the viewer's time zone
  clicks: number;
}

export interface LinkStats {
  slug: string;
  url: string;
  click_count: number;
  time_zone: string;
  detailed_clicks: number; // clicks stored with details, all time
  days: DayCount[];
  referrers: Count[];
  countries: Count[];
  devices: Count[];
}

export interface Row {
  label: string;
  clicks: number;
}

// Per-click details started with this release; earlier clicks are only in
// click_count.
export const DETAILS_SINCE = 'Nov 1, 2026';

// Gridline values from 0 to a round top at or above max, 2–5 steps of
// 1, 2 or 5 × 10ⁿ (whole clicks only).
export function yAxisTicks(max: number): number[] {
  if (max <= 0) return [0, 1];

  const rough = max / 4;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(
    1,
    [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough)!,
  );
  const top = Math.ceil(max / step) * step;

  return Array.from({ length: top / step + 1 }, (_, i) => i * step);
}

// The biggest groups, with the rest folded into one row. A single leftover
// group keeps its own row (an "Other" row of one would hide its name).
export function breakdownRows(
  counts: Count[],
  label: (name: string | null) => string,
  otherLabel: string,
  limit = 8,
): Row[] {
  const rows = [...counts]
    .sort((a, b) => b.clicks - a.clicks)
    .map((c) => ({ label: label(c.name), clicks: c.clicks }));
  if (rows.length <= limit + 1) return rows;

  const rest = rows.slice(limit).reduce((sum, r) => sum + r.clicks, 0);
  return [...rows.slice(0, limit), { label: otherLabel, clicks: rest }];
}

export const referrerLabel = (host: string | null) =>
  host === QR_MARKER ? 'QR code' : (host ?? 'Direct / unknown');

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function countryLabel(code: string | null): string {
  if (!code) return 'Unknown';
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

const DEVICE_LABELS: Record<string, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  computer: 'Computer',
};

export const deviceLabel = (device: string | null) =>
  (device && DEVICE_LABELS[device]) ?? 'Unknown';

// Days are calendar dates, so format them as UTC to keep the same day.
const shortDay = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const longDay = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const formatDay = (day: string) =>
  shortDay.format(new Date(`${day}T00:00:00Z`));
export const formatDayLong = (day: string) =>
  longDay.format(new Date(`${day}T00:00:00Z`));

export const clicksText = (n: number) =>
  `${n.toLocaleString('en')} ${n === 1 ? 'click' : 'clicks'}`;
