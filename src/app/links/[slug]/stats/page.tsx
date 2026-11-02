// /links/<slug>/stats – click stats for one of the signed-in user's links.
// Rendered on the server for each visit; the homepage stays static.
import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import ClicksChart from '@/components/ClicksChart';
import RefreshOnAuthChange from '@/components/RefreshOnAuthChange';
import StatsBreakdown from '@/components/StatsBreakdown';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  DETAILS_SINCE,
  RANGES,
  breakdownRows,
  clicksText,
  countryLabel,
  deviceLabel,
  formatSpan,
  parseRange,
  periodText,
  referrerLabel,
  type LinkStats,
} from '@/lib/linkStats';
import s from '@/components/LinkStats.module.css';

export const metadata: Metadata = {
  title: 'Link stats – reqq.cc',
  robots: { index: false, follow: false },
};

export default async function LinkStatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const { slug } = await params;
  const range = parseRange((await searchParams).range);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div
        className={`${s.signedOut} font-fredoka-one text-yellow mx-auto px-4 text-center text-2xl`}
      >
        <p>Log in to see the stats for your links.</p>
        <RefreshOnAuthChange />
      </div>
    );
  }

  // Days are counted in the visitor's time zone, which Vercel guesses from
  // their IP address (UTC when running locally).
  const timeZone = (await headers()).get('x-vercel-ip-timezone') ?? 'UTC';

  // Owner-only: another user's link comes back null, just like a missing one.
  const { data, error } = await supabase.rpc('link_stats', {
    p_slug: slug,
    p_time_zone: timeZone,
    p_range: range,
  });
  if (error) throw new Error(`link_stats failed: ${error.message}`);
  if (!data) notFound();

  const stats = data as unknown as LinkStats;
  const inRange = stats.buckets.reduce((sum, b) => sum + b.clicks, 0);
  const earlier = stats.click_count - stats.detailed_clicks;
  const period = periodText(stats);
  const base = `/links/${encodeURIComponent(stats.slug)}/stats`;

  return (
    <div className={`${s.page} font-baloo-thambi mx-auto w-full px-4`}>
      <RefreshOnAuthChange />

      <header>
        <Link
          href="/"
          prefetch={false}
          className={`${s.back} text-sm text-white/70 underline underline-offset-2`}
        >
          ← Your links
        </Link>
        <h1 className={`${s.slug} font-fredoka-one text-yellow mt-2 text-3xl`}>
          reqq.cc/{stats.slug}
        </h1>
        <p className="mt-1 truncate text-white/70">→ {stats.url}</p>
      </header>

      {/* Plain links, so each range is its own server-rendered page. */}
      <nav aria-label="Time range" className={s.ranges}>
        {RANGES.map((r) => {
          const current = r.value === stats.range;
          return (
            <Link
              key={r.value}
              href={r.value === '30d' ? base : `${base}?range=${r.value}`}
              prefetch={false}
              scroll={false}
              aria-current={current ? 'page' : undefined}
              className={`${s.range} ${current ? s.rangeCurrent : ''} font-fredoka-one rounded-full border-2 border-black text-sm`}
            >
              {r.label}
            </Link>
          );
        })}
      </nav>

      <div className="grid grid-cols-2 gap-4">
        <div className={`${s.card} rounded-3xl border-2 border-black p-4`}>
          <p className="text-sm text-white/70">Total clicks</p>
          <p className="font-fredoka-one text-5xl">
            {stats.click_count.toLocaleString('en')}
          </p>
        </div>
        <div className={`${s.card} rounded-3xl border-2 border-black p-4`}>
          <p className="text-sm text-white/70">{period}</p>
          <p className="font-fredoka-one mt-2 text-3xl">
            {inRange.toLocaleString('en')}
          </p>
        </div>
      </div>

      <section className={`${s.card} rounded-3xl border-2 border-black p-4`}>
        <h2 className="font-fredoka-one text-xl">Clicks per {stats.bucket}</h2>
        <p className="text-xs text-white/60">
          {formatSpan(stats.first_day, stats.last_day)}, in{' '}
          {stats.time_zone.replace(/_/g, ' ')} time
        </p>
        <ClicksChart buckets={stats.buckets} bucket={stats.bucket} />
      </section>

      {earlier > 0 && (
        <p className="text-sm text-white/70">
          Detailed stats started on {DETAILS_SINCE}. The first{' '}
          {earlier === 1 ? 'click' : clicksText(earlier)} only{' '}
          {earlier === 1 ? 'counts' : 'count'} toward the total.
        </p>
      )}

      <div className={`${s.breakdowns} grid gap-4`}>
        <StatsBreakdown
          title="Sites and apps"
          period={period}
          rows={breakdownRows(stats.referrers, referrerLabel, 'Other sites')}
          note="Apps like WhatsApp, iMessage and email often don’t say where a click came from, so those show as direct / unknown."
        />
        <StatsBreakdown
          title="Countries"
          period={period}
          rows={breakdownRows(stats.countries, countryLabel, 'Other countries')}
        />
        <StatsBreakdown
          title="Devices"
          period={period}
          rows={breakdownRows(stats.devices, deviceLabel, 'Other')}
        />
      </div>
    </div>
  );
}
