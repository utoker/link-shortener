import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ClicksChart from '../ClicksChart';

// 30 days ending Nov 1, 2026, with clicks on a few of them
const days = Array.from({ length: 30 }, (_, i) => {
  const day = new Date(Date.UTC(2026, 9, 3 + i)).toISOString().slice(0, 10);
  const clicks = { 0: 2, 20: 7, 29: 3 }[i] ?? 0;
  return { day, clicks };
});

describe('ClicksChart', () => {
  it('should draw one column per day, scaled to round gridlines', () => {
    const { container } = render(<ClicksChart days={days} />);
    const chart = screen.getByRole('img');

    expect(chart).toHaveAccessibleName(
      'Clicks per day: 12 clicks in 30 days, most on Oct 23 (7).',
    );
    const bars = container.querySelectorAll('.bg-chart-bar');
    expect(bars).toHaveLength(30);
    // peak 7 → gridlines 0/2/4/6/8, so 7 clicks reach 87.5% of the height
    expect((bars[20] as HTMLElement).style.height).toBe('87.5%');
    expect((bars[1] as HTMLElement).style.height).toBe('0%');
    expect(within(chart).getByText('8')).toBeInTheDocument();
  });

  it('should label the peak, the axis days and every day in the table', () => {
    render(<ClicksChart days={days} />);

    // the peak value sits above its column (the tooltip repeats it on hover)
    expect(within(screen.getByRole('img')).getByText('7')).toBeInTheDocument();
    for (const label of ['Oct 3', 'Oct 17', 'Nov 1']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(31); // header + 30 days, newest first
    const cells = within(rows[1]).getAllByRole('cell');
    expect(cells.map((c) => c.textContent)).toEqual(['Sun, Nov 1', '3']);
    expect(screen.getAllByText('7 clicks')).toHaveLength(1);
  });

  it('should say so when there are no clicks yet', () => {
    render(<ClicksChart days={days.map((d) => ({ ...d, clicks: 0 }))} />);

    expect(
      screen.getByText('No clicks in the last 30 days yet.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Clicks per day: 0 clicks in 30 days.',
    );
  });
});
