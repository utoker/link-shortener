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
  breakdownRows,
  clicksText,
  countryLabel,
  deviceLabel,
  referrerLabel,
  type LinkStats,
} from '@/lib/linkStats';

export const metadata: Metadata = {
  title: 'Link stats – reqq.cc',
  robots: { index: false, follow: false },
};

export default async function LinkStatsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="font-fredoka-one text-yellow mx-auto px-4 py-16 text-center text-2xl">
        <p>Log in to see the stats for your links.</p>
        <RefreshOnAuthChange />
      </div>
    );
  }

  // Days are counted in the visitor's time zone, which Vercel guesses from
  // their IP address (UTC when running locally).
  const timeZone = (await headers()).get('x-vercel-ip-timezone') ?? 'UTC';

  // Owner-only: another user's link comes back null, just like a missing one.
  const { data, error } = await supabase.rpc('link_click_stats', {
    p_slug: slug,
    p_time_zone: timeZone,
  });
  if (error) throw new Error(`link_click_stats failed: ${error.message}`);
  if (!data) notFound();

  const stats = data as unknown as LinkStats;
  const recent = stats.days.reduce((sum, d) => sum + d.clicks, 0);
  const earlier = stats.click_count - stats.detailed_clicks;

  return (
    <div className="font-baloo-thambi mx-auto w-full max-w-4xl space-y-6 px-4 pb-16">
      <RefreshOnAuthChange />

      <header className="min-w-0">
        <Link
          href="/"
          prefetch={false}
          className="text-sm text-white/70 underline underline-offset-2 hover:text-white"
        >
          ← Your links
        </Link>
        <h1 className="font-fredoka-one text-yellow mt-2 text-3xl break-all sm:text-5xl">
          reqq.cc/{stats.slug}
        </h1>
        <p className="mt-1 truncate text-white/70">→ {stats.url}</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-chart-card rounded-3xl border-2 border-black p-4 sm:p-6">
          <p className="text-sm text-white/70">Total clicks</p>
          <p className="font-fredoka-one text-5xl">
            {stats.click_count.toLocaleString('en')}
          </p>
        </div>
        <div className="bg-chart-card rounded-3xl border-2 border-black p-4 sm:p-6">
          <p className="text-sm text-white/70">Last 30 days</p>
          <p className="font-fredoka-one mt-2 text-3xl">
            {recent.toLocaleString('en')}
          </p>
        </div>
      </div>

      <section className="bg-chart-card rounded-3xl border-2 border-black p-4 sm:p-6">
        <h2 className="font-fredoka-one text-xl">Clicks per day</h2>
        <p className="text-xs text-white/60">
          Last 30 days, in {stats.time_zone.replace(/_/g, ' ')} time
        </p>
        <ClicksChart days={stats.days} />
      </section>

      {earlier > 0 && (
        <p className="text-sm text-white/70">
          Detailed stats started on {DETAILS_SINCE}. The first{' '}
          {earlier === 1 ? 'click' : clicksText(earlier)} only{' '}
          {earlier === 1 ? 'counts' : 'count'} toward the total.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatsBreakdown
          title="Sites and apps"
          rows={breakdownRows(stats.referrers, referrerLabel, 'Other sites')}
          note="Apps like WhatsApp, iMessage and email often don’t say where a click came from, so those show as direct / unknown."
        />
        <StatsBreakdown
          title="Countries"
          rows={breakdownRows(stats.countries, countryLabel, 'Other countries')}
        />
        <StatsBreakdown
          title="Devices"
          rows={breakdownRows(stats.devices, deviceLabel, 'Other')}
        />
      </div>
    </div>
  );
}
