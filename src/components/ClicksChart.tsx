// Clicks per day, week or month as columns, drawn with plain HTML/CSS on the
// server: no chart library and no client JavaScript. Hovering or tapping a
// column shows its count, and "Show the numbers" has every column as a table.
import {
  bucketAxisLabel,
  bucketLabel,
  clicksText,
  yAxisTicks,
  type Bucket,
  type BucketCount,
} from '@/lib/linkStats';
import s from './LinkStats.module.css';

const compact = new Intl.NumberFormat('en', { notation: 'compact' });

interface ClicksChartProps {
  buckets: BucketCount[];
  bucket: Bucket;
}

export default function ClicksChart({ buckets, bucket }: ClicksChartProps) {
  const n = buckets.length;
  const max = Math.max(0, ...buckets.map((b) => b.clicks));
  const ticks = yAxisTicks(max);
  const top = ticks[ticks.length - 1];
  const pct = (clicks: number) => `${(clicks / top) * 100}%`;
  // label the peak (the latest one on a tie) and the first, middle and last bar
  const peak = max > 0 ? buckets.map((b) => b.clicks).lastIndexOf(max) : -1;
  const xLabels = Array.from(new Set([0, Math.floor((n - 1) / 2), n - 1]));
  const total = buckets.reduce((sum, b) => sum + b.clicks, 0);
  const label = (b: BucketCount) => bucketLabel(b, bucket);

  return (
    <figure className="mt-4">
      <div
        role="img"
        aria-label={`Clicks per ${bucket}: ${clicksText(total)} in ${n} ${bucket}${n === 1 ? '' : 's'}${
          peak >= 0
            ? `, most ${bucket === 'day' ? 'on' : 'in'} ${label(buckets[peak])} (${max})`
            : ''
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
              No clicks in this period yet.
            </p>
          )}

          <div className={s.columns}>
            {buckets.map((b, i) => {
              // keep hover text inside the card near either edge
              const at = i / (n - 1 || 1);
              const tipSide = at < 0.2 ? s.tipStart : at > 0.8 ? s.tipEnd : '';
              return (
                // tabIndex -1: a tap focuses the column (showing its count)
                // without adding every bar to keyboard navigation; the table
                // has them all
                <div key={b.start} tabIndex={-1} className={s.column}>
                  <div className={s.bar} style={{ height: pct(b.clicks) }} />
                  {i === peak && (
                    <span
                      className={`${s.peak} ${s.numbers} text-xs text-white`}
                      style={{ bottom: `calc(${pct(b.clicks)} + 2px)` }}
                    >
                      {compact.format(b.clicks)}
                    </span>
                  )}
                  <span
                    className={`${s.tip} ${tipSide} text-xs`}
                    style={{ bottom: `calc(${pct(b.clicks)} + 6px)` }}
                  >
                    <strong className="text-white">
                      {clicksText(b.clicks)}
                    </strong>{' '}
                    <span className="text-white/70">{label(b)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* x-axis: first, middle and last bar, centred under their columns;
          with many narrow columns the outer two line up with the plot's
          edges instead, so they stay inside the card */}
      <div className={`${s.xAxis} text-xs text-white/60`} aria-hidden="true">
        {xLabels.map((i, k) => {
          const first = n > 12 && k === 0;
          const last = n > 12 && k === xLabels.length - 1;
          return (
            <span
              key={i}
              className={`${s.xLabel} ${
                first ? '' : last ? s.xLabelEnd : s.xLabelMiddle
              }`}
              style={{
                left: `${first ? 0 : last ? 100 : ((i + 0.5) / n) * 100}%`,
              }}
            >
              {bucketAxisLabel(buckets[i], bucket)}
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
              <th className={`${s.unit} py-1 font-normal`}>{bucket}</th>
              <th className={`${s.right} py-1 font-normal`}>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {[...buckets].reverse().map((b) => (
              <tr key={b.start} className="border-t border-white/10">
                <td className="py-1">{label(b)}</td>
                <td className={`${s.right} py-1`}>
                  {b.clicks.toLocaleString('en')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
