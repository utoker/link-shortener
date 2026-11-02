// One card of the stats page: clicks per site, country or device, as bars
// scaled to the biggest row, with each row's count and share.
import type { Row } from '@/lib/linkStats';
import s from './LinkStats.module.css';

interface StatsBreakdownProps {
  title: string;
  period: string; // e.g. "Last 30 days"
  rows: Row[];
  note?: string;
}

export default function StatsBreakdown({
  title,
  period,
  rows,
  note,
}: StatsBreakdownProps) {
  const total = rows.reduce((sum, r) => sum + r.clicks, 0);
  const max = Math.max(1, ...rows.map((r) => r.clicks));

  return (
    <section className={`${s.card} rounded-3xl border-2 border-black p-4`}>
      <h2 className="font-fredoka-one text-xl">{title}</h2>
      <p className="text-xs text-white/60">{period}</p>

      {total === 0 ? (
        <p className="mt-4 text-sm text-white/70">No clicks yet.</p>
      ) : (
        <ul className={`${s.rows} mt-4`}>
          {rows.map((r) => (
            <li key={r.label}>
              <div className={`${s.rowHead} text-sm`}>
                <span className="truncate">{r.label}</span>
                <span className={`${s.numbers} shrink-0`}>
                  <strong>{r.clicks.toLocaleString('en')}</strong>{' '}
                  <span className="text-white/60">
                    {Math.round((r.clicks / total) * 100)}%
                  </span>
                </span>
              </div>
              <div
                className={s.fill}
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
