'use server';

import { headers } from 'next/headers';
import { linkCheckerRateLimit } from '@/lib/rateLimit';
import { getClientIP } from '@/lib/clientIp';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import { checkUrlSafety } from '@/lib/safeBrowsing';
import { describeThreats } from '@/lib/threatNames';
import {
  isAllowedTarget,
  traceLink,
  type TraceEnd,
  type TraceStep,
} from '@/lib/linkTrace';
import { ensureProtocol } from '@/lib/utils';

// The /link-checker page: follows a link's redirects and asks Google Safe
// Browsing about where it ends. Anyone can call it. The link is not stored
// or logged.

export type CheckLinkResult =
  | {
      ok: true;
      /** every address on the way, the typed one first */
      steps: TraceStep[];
      end: TraceEnd;
      /** Google Safe Browsing on the last address */
      safety: 'safe' | 'unsafe' | 'unknown';
      /** what Google reports when unsafe, e.g. "malware" */
      threats?: string;
    }
  | { ok: false; error: string };

const INVALID_LINK ='Please enter a valid link (e.g., bit.ly/abc123).';

export async function checkLink(input: string): Promise<CheckLinkResult> {
  const { success } = await linkCheckerRateLimit.limit(
    getClientIP(await headers()),
  );
  if (!success) {
    return {
      ok: false,
      error: 'Too many checks. Please wait a minute before trying again.',
    };
  }

  const text = typeof input === 'string' ? input.trim() : '';
  let start: URL;
  try {
    if (!text || /\s/.test(text)) throw new Error('not a link');
    start = new URL(ensureProtocol(text));
  } catch {
    return { ok: false, error: INVALID_LINK };
  }
  if (!isAllowedTarget(start)) return { ok: false, error: INVALID_LINK };

  try {
    const { steps, end } = await traceLink(start, { ownLink });

    // An address that was never opened, or one of ours already blocked, has
    // nothing for Google to add.
    const last = steps[steps.length - 1];
    const result =
      end === 'not-allowed' || end === 'blocked'
        ? null
        : await checkUrlSafety(last.url);

    if (result?.verdict === 'unsafe') {
      return {
        ok: true,
        steps,
        end,
        safety: 'unsafe',
        threats: describeThreats(result.threats),
      };
    }
    return {
      ok: true,
      steps,
      end,
      safety: result?.verdict === 'safe' ? 'safe' : 'unknown',
    };
  } catch (err) {
    // no link in the log: only what went wrong
    console.error(
      'checkLink unexpected error:',
      err instanceof Error ? err.name : 'unknown',
    );
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

/** Where a reqq.cc short link leads, read from the database. */
async function ownLink(slug: string) {
  const { data, error } = await createSupabasePublicClient().rpc(
    'resolve_link',
    { p_slug: slug },
  );
  if (error) throw error;
  const link = data?.[0];
  return link ? { url: link.url, blocked: Boolean(link.blocked) } : null;
}
