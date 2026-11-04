// Weekly re-check of every link with Google Safe Browsing, run by
// /api/cron/link-check. A link Google flags is blocked: the middleware shows a
// warning page instead of redirecting, and the owner gets one email. The block
// is lifted once Google reports the URL clean again, or when the owner changes
// the URL (updateLink). Links Google couldn't answer for stay as they are until
// next week. ALERT_EMAIL only hears about runs where something went wrong.
// Every run also pings healthchecks.io (HEALTHCHECK_URL), which emails the
// owner when a Monday passes without one, i.e. when the job stopped running.
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { checkUrlsSafety } from '@/lib/safeBrowsing';
import { sendEmail } from '@/lib/email';
import { describeThreats } from '@/lib/threatNames';

const PAGE_SIZE = 1000; // the most rows the API returns at once
const IDS_PER_UPDATE = 100;
const REVIEW_URL = 'https://safebrowsing.google.com/safebrowsing/report_error/';

type Db = ReturnType<typeof createSupabaseAdminClient>;

type CheckedLink = {
  id: string;
  slug: string;
  url: string;
  user_id: string | null;
  safety_threats: string[] | null;
};

export type LinkCheckSummary = {
  links: number;
  /** links Google answered for */
  checked: number;
  /** links Google couldn't be reached for, left as they were */
  skipped: number;
  /** slugs blocked by this run */
  blocked: string[];
  /** slugs whose block this run lifted */
  unblocked: string[];
  /** anything that went wrong; each run with problems emails ALERT_EMAIL */
  problems: string[];
};

/** Never throws: failures end up in `problems`. */
export async function runLinkCheck(): Promise<LinkCheckSummary> {
  const summary: LinkCheckSummary = {
    links: 0,
    checked: 0,
    skipped: 0,
    blocked: [],
    unblocked: [],
    problems: [],
  };

  try {
    await checkAllLinks(createSupabaseAdminClient(), summary);
  } catch (err) {
    summary.problems.push(`The check stopped early: ${errorText(err)}`);
  }

  console.info('link check:', JSON.stringify(summary));
  if (summary.problems.length > 0) await sendAlert(summary);
  await pingHealthcheck(summary);
  return summary;
}

async function checkAllLinks(db: Db, summary: LinkCheckSummary) {
  const links = await readAllLinks(db);
  summary.links = links.length;

  const verdicts = await checkUrlsSafety(links.map((link) => link.url));
  const now = new Date().toISOString();
  const stillClean: string[] = [];
  let skipReason = '';

  for (const link of links) {
    const result = verdicts.get(link.url) ?? {
      verdict: 'unknown',
      reason: 'no answer',
    };
    if (result.verdict === 'unknown') {
      summary.skipped++;
      skipReason = result.reason;
      continue;
    }

    summary.checked++;
    if (result.verdict === 'unsafe') {
      await block(db, link, result.threats, now, summary);
    } else if (link.safety_threats) {
      await unblock(db, link, now, summary);
    } else {
      stillClean.push(link.id);
    }
  }

  for (let i = 0; i < stillClean.length; i += IDS_PER_UPDATE) {
    const { error } = await db
      .from('links')
      .update({ safety_checked_at: now })
      .in('id', stillClean.slice(i, i + IDS_PER_UPDATE));
    if (error) throw error;
  }

  if (summary.links > 0 && summary.checked === 0) {
    summary.problems.push(
      `Google Safe Browsing didn't answer for any of the ${summary.links} links (${skipReason}). ` +
        'Nothing was blocked or unblocked; they will be checked again next Monday.',
    );
  }
}

async function readAllLinks(db: Db): Promise<CheckedLink[]> {
  const links: CheckedLink[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await db
      .from('links')
      .select('id, slug, url, user_id, safety_threats')
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    links.push(...data);
    if (data.length < PAGE_SIZE) return links;
  }
}

async function block(
  db: Db,
  link: CheckedLink,
  threats: string[],
  now: string,
  summary: LinkCheckSummary,
) {
  if (link.safety_threats) {
    // still flagged: keep the block, note what Google reports now
    const { error } = await db
      .from('links')
      .update({ safety_threats: threats, safety_checked_at: now })
      .eq('id', link.id)
      .eq('url', link.url);
    if (error) throw error;
    return;
  }

  // Only the run that actually starts the block emails the owner (a cron
  // event can arrive twice), and nothing happens if the owner changed the URL
  // since it was read.
  const { data, error } = await db
    .from('links')
    .update({
      safety_threats: threats,
      safety_flagged_at: now,
      safety_checked_at: now,
    })
    .eq('id', link.id)
    .eq('url', link.url)
    .is('safety_threats', null)
    .select('id');
  if (error) throw error;
  if (data.length === 0) return;

  summary.blocked.push(link.slug);
  console.warn('link check: blocked', link.slug, link.url, threats);
  if (link.user_id) await emailOwner(db, link, link.user_id, threats, summary);
}

async function unblock(
  db: Db,
  link: CheckedLink,
  now: string,
  summary: LinkCheckSummary,
) {
  const { error } = await db
    .from('links')
    .update({
      safety_threats: null,
      safety_flagged_at: null,
      safety_checked_at: now,
    })
    .eq('id', link.id)
    .eq('url', link.url);
  if (error) throw error;

  summary.unblocked.push(link.slug);
  console.info('link check: unblocked', link.slug, link.url);
}

async function emailOwner(
  db: Db,
  link: CheckedLink,
  userId: string,
  threats: string[],
  summary: LinkCheckSummary,
) {
  const { data, error } = await db.auth.admin.getUserById(userId);
  if (error) {
    summary.problems.push(
      `Couldn't look up the owner of reqq.cc/${link.slug} to tell them about its block: ${errorText(error)}`,
    );
    return;
  }
  const to = data.user?.email;
  if (!to) return; // an account without an email address

  const sent = await sendEmail({ to, ...blockedLinkEmail(link, threats) });
  if (!sent.ok) {
    summary.problems.push(
      `Couldn't email the owner of reqq.cc/${link.slug} about its block: ${sent.reason}`,
    );
  }
}

export function blockedLinkEmail(
  link: { slug: string; url: string },
  threats: string[],
) {
  const short = `reqq.cc/${link.slug}`;
  return {
    subject: `Your link ${short} has been blocked`,
    text: [
      'Hi,',
      '',
      `Google Safe Browsing now reports the destination of your short link ${short} as ${describeThreats(threats)}:`,
      '',
      `    ${defang(link.url)}`,
      '',
      'To protect visitors, the link now shows a warning page instead of sending them there.',
      '',
      'What you can do:',
      '- Point it somewhere else: sign in at https://reqq.cc, open My links and use the pencil next to the link.',
      `- If you think Google is wrong, ask Google to review the site: ${REVIEW_URL}`,
      '',
      'We check every link again each Monday and lift the block automatically once Google clears the site.',
      '',
      'reqq.cc',
    ].join('\n'),
  };
}

/** "https://bad.example/x" → "bad[.]example/x", so mail apps don't link it */
export function defang(url: string): string {
  const shown = url.replace(/^https?:\/\//i, '').replaceAll('.', '[.]');
  return shown.length > 120 ? `${shown.slice(0, 120)}…` : shown;
}

async function sendAlert(summary: LinkCheckSummary) {
  console.error('link check problems:', summary.problems);
  const to = process.env.ALERT_EMAIL;
  if (!to) return;

  const sent = await sendEmail({
    to,
    subject: 'reqq.cc link check: something went wrong',
    text: [
      'The weekly Google Safe Browsing check of all links ran into trouble:',
      '',
      ...summary.problems.map((problem) => `- ${problem}`),
      '',
      `Links: ${summary.links}. Checked: ${summary.checked}. Skipped: ${summary.skipped}.`,
      `Blocked by this run: ${summary.blocked.join(' ') || 'none'}.`,
      `Unblocked by this run: ${summary.unblocked.join(' ') || 'none'}.`,
    ].join('\n'),
  });
  if (!sent.ok) console.error('link check: alert email failed:', sent.reason);
}

/**
 * Tells healthchecks.io the run happened; a run with problems pings
 * ".../fail" so its check goes down at once. The ping carries only counts:
 * problem texts can hold an owner's email address and stay in the alert.
 * Never throws.
 */
async function pingHealthcheck(summary: LinkCheckSummary) {
  const url = process.env.HEALTHCHECK_URL;
  if (!url) return;

  const failed = summary.problems.length > 0;
  try {
    const res = await fetch(failed ? `${url}/fail` : url, {
      method: 'POST',
      body:
        `Links: ${summary.links}. Checked: ${summary.checked}. ` +
        `Skipped: ${summary.skipped}. Blocked: ${summary.blocked.length}. ` +
        `Unblocked: ${summary.unblocked.length}. ` +
        `Problems: ${summary.problems.length}.`,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error('link check: healthcheck ping failed: HTTP', res.status);
    }
  } catch (err) {
    console.error('link check: healthcheck ping failed:', errorText(err));
  }
}

function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    return String(err.message);
  }
  return String(err);
}
