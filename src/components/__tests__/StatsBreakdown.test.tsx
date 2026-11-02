import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsBreakdown from '../StatsBreakdown';
import s from '../LinkStats.module.css';

describe('StatsBreakdown', () => {
  it('should show each row with its count, share and a bar scaled to the top row', () => {
    const { container } = render(
      <StatsBreakdown
        title="Devices"
        period="Last 90 days"
        rows={[
          { label: 'Phone', clicks: 6 },
          { label: 'Computer', clicks: 3 },
          { label: 'Tablet', clicks: 1 },
        ]}
        note="A note"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Devices' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Last 90 days')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Phone6 60%');
    expect(items[2]).toHaveTextContent('Tablet1 10%');
    const bars = container.getElementsByClassName(
      s.fill,
    ) as HTMLCollectionOf<HTMLElement>;
    expect(Array.from(bars, (b) => b.style.width)).toEqual([
      '100%',
      '50%',
      '16.666666666666664%',
    ]);
    expect(screen.getByText('A note')).toBeInTheDocument();
  });

  it('should say so when there are no clicks', () => {
    render(<StatsBreakdown title="Countries" period="All time" rows={[]} />);

    expect(screen.getByText('No clicks yet.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
