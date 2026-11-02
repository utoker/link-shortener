import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ClicksChart from '../ClicksChart';
import s from '../LinkStats.module.css';
import type { BucketCount } from '@/lib/linkStats';

const day = (d: Date) => d.toISOString().slice(0, 10);

// 30 days ending Nov 1, 2026, with clicks on a few of them
const days: BucketCount[] = Array.from({ length: 30 }, (_, i) => {
  const date = day(new Date(Date.UTC(2026, 9, 3 + i)));
  const clicks = { 0: 2, 20: 7, 29: 3 }[i] ?? 0;
  return { start: date, end: date, partial: false, clicks };
});

// 90 days from Wed Aug 5 to Mon Nov 2, 2026, by Monday weeks: the first week
// is cut to Aug 5–9 and the last is today so far
const weeks: BucketCount[] = [
  { start: '2026-08-05', end: '2026-08-09', partial: false, clicks: 4 },
  ...Array.from({ length: 12 }, (_, i) => {
    const start = new Date(Date.UTC(2026, 7, 10 + 7 * i));
    const end = new Date(Date.UTC(2026, 7, 16 + 7 * i));
    return {
      start: day(start),
      end: day(end),
      partial: false,
      clicks: i === 5 ? 40 : 10,
    };
  }),
  { start: '2026-11-02', end: '2026-11-02', partial: true, clicks: 1 },
];

const months: BucketCount[] = [
  { start: '2026-11-05', end: '2026-11-30', partial: false, clicks: 3 },
  { start: '2026-12-01', end: '2026-12-31', partial: false, clicks: 9 },
  { start: '2027-01-01', end: '2027-01-12', partial: true, clicks: 2 },
];

describe('ClicksChart', () => {
  it('should draw one column per day, scaled to round gridlines', () => {
    const { container } = render(<ClicksChart buckets={days} bucket="day" />);
    const chart = screen.getByRole('img');

    expect(chart).toHaveAccessibleName(
      'Clicks per day: 12 clicks in 30 days, most on Fri, Oct 23 (7).',
    );
    const bars = container.getElementsByClassName(s.bar);
    expect(bars).toHaveLength(30);
    // peak 7 → gridlines 0/2/4/6/8, so 7 clicks reach 87.5% of the height
    expect((bars[20] as HTMLElement).style.height).toBe('87.5%');
    expect((bars[1] as HTMLElement).style.height).toBe('0%');
    expect(within(chart).getByText('8')).toBeInTheDocument();
  });

  it('should label the peak, the axis days and every day in the table', () => {
    render(<ClicksChart buckets={days} bucket="day" />);

    // the peak value sits above its column (the tooltip repeats it on hover)
    expect(within(screen.getByRole('img')).getByText('7')).toBeInTheDocument();
    for (const label of ['Oct 3', 'Oct 17', 'Nov 1']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(31); // header + 30 days, newest first
    expect(rows[0]).toHaveTextContent('dayClicks');
    const cells = within(rows[1]).getAllByRole('cell');
    expect(cells.map((c) => c.textContent)).toEqual(['Sun, Nov 1', '3']);
    expect(screen.getAllByText('7 clicks')).toHaveLength(1);
  });

  it('should show weeks with their dates, cut weeks included', () => {
    const { container } = render(<ClicksChart buckets={weeks} bucket="week" />);

    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Clicks per week: 155 clicks in 14 weeks, most in Sep 14 – Sep 20 (40).',
    );
    expect(container.getElementsByClassName(s.bar)).toHaveLength(14);
    const axis = container.getElementsByClassName(s.xAxis)[0];
    expect(Array.from(axis.children, (c) => c.textContent)).toEqual([
      'Aug 5',
      'Sep 14',
      'Nov 2',
    ]);
    const cells = within(screen.getByRole('table'))
      .getAllByRole('cell')
      .map((c) => c.textContent);
    expect(cells.slice(0, 2)).toEqual(['Mon, Nov 2 (so far)', '1']);
    expect(cells.slice(-2)).toEqual(['Aug 5 – Aug 9', '4']);
  });

  it('should show whole months by name and cut months with their dates', () => {
    const { container } = render(
      <ClicksChart buckets={months} bucket="month" />,
    );

    const axis = container.getElementsByClassName(s.xAxis)[0];
    expect(Array.from(axis.children, (c) => c.textContent)).toEqual([
      'Nov 2026',
      'Dec 2026',
      'Jan 2027',
    ]);
    const cells = within(screen.getByRole('table'))
      .getAllByRole('cell')
      .map((c) => c.textContent);
    expect(cells).toEqual([
      'Jan 1 – Jan 12, 2027 (so far)',
      '2',
      'Dec 2026',
      '9',
      'Nov 5 – Nov 30, 2026',
      '3',
    ]);
  });

  it('should label a single bar once', () => {
    render(<ClicksChart buckets={days.slice(-1)} bucket="day" />);

    expect(screen.getByText('Nov 1')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Clicks per day: 3 clicks in 1 day, most on Sun, Nov 1 (3).',
    );
  });

  it('should centre axis labels under wide columns and pin them to the edges of narrow ones', () => {
    const positions = (buckets: BucketCount[]) => {
      const { container, unmount } = render(
        <ClicksChart buckets={buckets} bucket="day" />,
      );
      const axis = container.getElementsByClassName(s.xAxis)[0];
      const left = Array.from(
        axis.children,
        (c) => (c as HTMLElement).style.left,
      );
      unmount();
      return left;
    };

    expect(positions(days.slice(-2))).toEqual(['25%', '75%']);
    expect(positions(days)).toEqual(['0%', '48.333333333333336%', '100%']);
  });

  it('should say so when there are no clicks yet', () => {
    render(
      <ClicksChart
        buckets={days.map((d) => ({ ...d, clicks: 0 }))}
        bucket="day"
      />,
    );

    expect(
      screen.getByText('No clicks in this period yet.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Clicks per day: 0 clicks in 30 days.',
    );
  });
});
