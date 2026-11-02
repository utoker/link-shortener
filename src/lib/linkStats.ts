// Shapes and display helpers for a link's stats page. The numbers come from
// the link_stats database function (see its migration).
import { QR_MARKER } from './qrMarker';

export interface Count {
  name: string | null; // null = not known (no referrer, no country)
  clicks: number;
}

export type Range = '7d' | '30d' | '90d' | 'all';
export type Bucket = 'day' | 'week' | 'month';

// One bar: the clicks of a day, a week (Monday to Sunday) or a month, cut to
// the range. Dates are YYYY-MM-DD in the viewer's time zone.
export interface BucketCount {
  start: string;
  end: string;
  partial: boolean; // the current week or month, so far
  clicks: number;
}

export interface LinkStats {
  slug: string;
  url: string;
  click_count: number;
  time_zone: string;
  range: Range;
  bucket: Bucket;
  first_day: string;
  last_day: string;
  detailed_clicks: number; // clicks stored with details, all time
  buckets: BucketCount[];
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

// The range buttons, in order.
export const RANGES: { value: Range; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
];

export const parseRange = (value: unknown): Range =>
  RANGES.find((r) => r.value === value)?.value ?? '30d';

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

const fullDate = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
const monthYear = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const utc = (day: string) => new Date(`${day}T00:00:00Z`);

export const formatDay = (day: string) => shortDay.format(utc(day));
export const formatDayLong = (day: string) => longDay.format(utc(day));
export const formatDate = (day: string) => fullDate.format(utc(day));

// "Aug 5 – Nov 2, 2026", with both years when they differ.
export function formatSpan(first: string, last: string): string {
  return first.slice(0, 4) === last.slice(0, 4)
    ? `${formatDay(first)} – ${formatDate(last)}`
    : `${formatDate(first)} – ${formatDate(last)}`;
}

// What the tiles and cards say the numbers cover.
export const periodText = (stats: Pick<LinkStats, 'range' | 'first_day'>) =>
  stats.range === 'all'
    ? `Since ${formatDate(stats.first_day)}`
    : `Last ${RANGES.find((r) => r.value === stats.range)!.label}`;

// What one bar covers, for its hover text and the table:
// "Sun, Nov 1", "Oct 26 – Nov 1", "Nov 2026" or "Nov 1 – Nov 2, 2026 (so far)".
export function bucketLabel(b: BucketCount, bucket: Bucket): string {
  const soFar = b.partial ? ' (so far)' : '';
  if (b.start === b.end) return formatDayLong(b.start) + soFar;

  const next = utc(b.end);
  next.setUTCDate(next.getUTCDate() + 1);
  const wholeMonth = b.start.endsWith('-01') && next.getUTCDate() === 1;
  if (bucket === 'month') {
    return wholeMonth
      ? monthYear.format(utc(b.start))
      : `${formatDay(b.start)} – ${formatDate(b.end)}${soFar}`;
  }
  return `${formatDay(b.start)} – ${formatDay(b.end)}${soFar}`;
}

// Under the chart: the day a bar starts, or its month.
export const bucketAxisLabel = (b: BucketCount, bucket: Bucket) =>
  bucket === 'month' ? monthYear.format(utc(b.start)) : formatDay(b.start);

export const clicksText = (n: number) =>
  `${n.toLocaleString('en')} ${n === 1 ? 'click' : 'clicks'}`;
