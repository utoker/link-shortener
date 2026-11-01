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
import s from './LinkStats.module.css';

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
        <div className={`${s.yAxis} ${s.numbers} text-xs text-white/60`}>
          {ticks.map((t) => (
            <span key={t} className={s.yValue} style={{ bottom: pct(t) }}>
              {compact.format(t)}
            </span>
          ))}
        </div>

        <div className={s.plot}>
          {ticks.map((t) => (
            <div key={t} className={s.gridline} style={{ bottom: pct(t) }} />
          ))}

          {total === 0 && (
            <p className={`${s.empty} text-center text-sm text-white/70`}>
              No clicks in the last {days.length} days yet.
            </p>
          )}

          <div className={s.columns}>
            {days.map((d, i) => (
              // tabIndex -1: a tap focuses the day (showing its count) without
              // adding 30 stops to keyboard navigation; the table has them all
              <div key={d.day} tabIndex={-1} className={s.column}>
                <div className={s.bar} style={{ height: pct(d.clicks) }} />
                {i === peak && (
                  <span
                    className={`${s.peak} ${s.numbers} text-xs text-white`}
                    style={{ bottom: `calc(${pct(d.clicks)} + 2px)` }}
                  >
                    {compact.format(d.clicks)}
                  </span>
                )}
                <span
                  className={`${s.tip} ${
                    i < 5 ? s.tipStart : i >= days.length - 5 ? s.tipEnd : ''
                  } text-xs`}
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
      <div className={`${s.xAxis} text-xs text-white/60`} aria-hidden="true">
        {xLabels.map((i, n) => {
          const last = n === xLabels.length - 1;
          return (
            <span
              key={i}
              className={`${s.xLabel} ${
                n === 0 ? '' : last ? s.xLabelEnd : s.xLabelMiddle
              }`}
              style={{
                left: `${n === 0 ? 0 : last ? 100 : ((i + 0.5) / days.length) * 100}%`,
              }}
            >
              {formatDay(days[i].day)}
            </span>
          );
        })}
      </div>

      <details className="mt-4 text-sm">
        <summary className={`${s.back} cursor-pointer text-white/70`}>
          Show the numbers
        </summary>
        <table className={`${s.numbers} mt-2 w-full max-w-xs`}>
          <thead>
            <tr className="text-left text-white/60">
              <th className="py-1 font-normal">Day</th>
              <th className={`${s.right} py-1 font-normal`}>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.day} className="border-t border-white/10">
                <td className="py-1">{formatDayLong(d.day)}</td>
                <td className={`${s.right} py-1`}>
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
