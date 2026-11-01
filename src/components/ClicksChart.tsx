// Clicks per day as columns, drawn with plain HTML/CSS on the server: no chart
// library and no client JavaScript. Hovering or tapping a day shows its count,
// and "Show the numbers" has every day as a table.
import {
  clicksText,
  formatDay,
  formatDayLong,
  yAxisTicks,
  type DayCount,
} from '@/lib/linkStats';

const compact = new Intl.NumberFormat('en', { notation: 'compact' });

export default function ClicksChart({ days }: { days: DayCount[] }) {
  const max = Math.max(0, ...days.map((d) => d.clicks));
  const ticks = yAxisTicks(max);
  const top = ticks[ticks.length - 1];
  const pct = (n: number) => `${(n / top) * 100}%`;
  // label the peak (the latest one on a tie) and the first, middle and last day
  const peak = max > 0 ? days.map((d) => d.clicks).lastIndexOf(max) : -1;
  const xLabels = [0, Math.floor((days.length - 1) / 2), days.length - 1];
  const total = days.reduce((sum, d) => sum + d.clicks, 0);

  return (
    <figure className="mt-4">
      <div
        role="img"
        aria-label={`Clicks per day: ${clicksText(total)} in ${days.length} days${
          peak >= 0 ? `, most on ${formatDay(days[peak].day)} (${max})` : ''
        }.`}
        className="flex gap-2"
      >
        {/* y-axis values, level with their gridlines */}
        <div className="relative h-44 w-7 shrink-0 text-right text-xs text-white/60 tabular-nums">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2"
              style={{ bottom: pct(t) }}
            >
              {compact.format(t)}
            </span>
          ))}
        </div>

        <div className="relative h-44 min-w-0 flex-1">
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 h-px bg-white/15"
              style={{ bottom: pct(t) }}
            />
          ))}

          {total === 0 && (
            <p className="absolute inset-x-0 top-1/3 text-center text-sm text-white/70">
              No clicks in the last {days.length} days yet.
            </p>
          )}

          <div className="absolute inset-0 flex items-end gap-0.5">
            {days.map((d, i) => (
              // tabIndex -1: a tap focuses the day (showing its count) without
              // adding 30 stops to keyboard navigation; the table has them all
              <div
                key={d.day}
                tabIndex={-1}
                className="group relative flex h-full flex-1 items-end justify-center outline-none"
              >
                <div
                  className="bg-chart-bar w-full max-w-5 rounded-t group-hover:brightness-125 group-focus:brightness-125"
                  style={{ height: pct(d.clicks) }}
                />
                {i === peak && (
                  <span
                    className="absolute text-xs text-white tabular-nums group-hover:hidden group-focus:hidden"
                    style={{ bottom: `calc(${pct(d.clicks)} + 2px)` }}
                  >
                    {compact.format(d.clicks)}
                  </span>
                )}
                <span
                  className={`pointer-events-none absolute z-10 hidden rounded-md bg-black px-2 py-1 text-xs whitespace-nowrap group-hover:block group-focus:block ${
                    i < 5 ? 'left-0' : i >= days.length - 5 ? 'right-0' : ''
                  }`}
                  style={{ bottom: `calc(${pct(d.clicks)} + 6px)` }}
                >
                  <strong className="text-white">{clicksText(d.clicks)}</strong>{' '}
                  <span className="text-white/70">{formatDayLong(d.day)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* x-axis: first, middle and last day under their columns */}
      <div
        className="relative mt-1 ml-9 h-4 text-xs text-white/60"
        aria-hidden="true"
      >
        {xLabels.map((i, n) => (
          <span
            key={i}
            className={`absolute whitespace-nowrap ${
              n === 0
                ? ''
                : n === xLabels.length - 1
                  ? '-translate-x-full'
                  : '-translate-x-1/2'
            }`}
            style={{
              left: `${n === 0 ? 0 : n === xLabels.length - 1 ? 100 : ((i + 0.5) / days.length) * 100}%`,
            }}
          >
            {formatDay(days[i].day)}
          </span>
        ))}
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-white/70 hover:text-white">
          Show the numbers
        </summary>
        <table className="mt-2 w-full max-w-xs tabular-nums">
          <thead>
            <tr className="text-left text-white/60">
              <th className="py-1 font-normal">Day</th>
              <th className="py-1 text-right font-normal">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.day} className="border-t border-white/10">
                <td className="py-1">{formatDayLong(d.day)}</td>
                <td className="py-1 text-right">
                  {d.clicks.toLocaleString('en')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
