// One card of the stats page: clicks per site, country or device, as bars
// scaled to the biggest row, with each row's count and share.
import type { Row } from '@/lib/linkStats';

interface StatsBreakdownProps {
  title: string;
  rows: Row[];
  note?: string;
}

export default function StatsBreakdown({
  title,
  rows,
  note,
}: StatsBreakdownProps) {
  const total = rows.reduce((sum, r) => sum + r.clicks, 0);
  const max = Math.max(1, ...rows.map((r) => r.clicks));

  return (
    <section className="bg-chart-card rounded-3xl border-2 border-black p-4 sm:p-6">
      <h2 className="font-fredoka-one text-xl">{title}</h2>
      <p className="text-xs text-white/60">Last 30 days</p>

      {total === 0 ? (
        <p className="mt-3 text-sm text-white/70">No clicks yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{r.label}</span>
                <span className="shrink-0 tabular-nums">
                  <strong>{r.clicks.toLocaleString('en')}</strong>{' '}
                  <span className="text-white/60">
                    {Math.round((r.clicks / total) * 100)}%
                  </span>
                </span>
              </div>
              <div
                className="bg-chart-bar mt-1 h-2 rounded-r"
                style={{ width: `${(r.clicks / max) * 100}%` }}
              />
            </li>
          ))}
        </ul>
      )}

      {note && <p className="mt-4 text-xs text-white/60">{note}</p>}
    </section>
  );
}
