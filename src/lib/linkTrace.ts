// Follows a link's redirects to find where it ends, for the /link-checker
// page. Server only (the checkLink action).
//
// The server opens addresses a stranger typed, so each one is held to the
// public web: http(s) on the usual ports, no user name or password, and
// never an address inside a private network or on the server itself. That
// last check is made on the IP address the connection is actually opened to
// (guardedLookup), so a name that resolves to a private address, or that
// changes between a check and the connection, gets nowhere.
// Only the reply's status and Location header are read, never its body.

import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { isOwnUrl } from './blockedUrls';
import { isReservedSlug } from './reservedSlugs';

export const MAX_REDIRECTS = 10;
const HOP_TIMEOUT_MS = 4000;
const TOTAL_TIMEOUT_MS = 8000;
const MAX_URL_LENGTH = 2048;
const USER_AGENT = 'reqq.cc link checker (+https://reqq.cc/link-checker)';

export type TraceStep = {
  url: string;
  /** the reply's HTTP status; null when the address wasn't opened */
  status: number | null;
};

export type TraceEnd =
  | 'arrived' // the last step answered with something other than a redirect
  | 'too-many-redirects' // more than MAX_REDIRECTS, or a loop
  | 'not-allowed' // the last step isn't an address on the public web
  | 'unreachable' // the last step didn't answer
  | 'timeout' // the last step, or the whole chain, took too long
  | 'blocked' // the last step is a reqq.cc link blocked as unsafe
  | 'no-such-link'; // the last step is a reqq.cc link that doesn't exist

export type Trace = { steps: TraceStep[]; end: TraceEnd };

/** What opening one address gave. */
export type Visit =
  | { status: number; location: string | null }
  | { failed: 'not-allowed' | 'unreachable' | 'timeout' };

export type TraceOptions = {
  /** Opens one address. The default goes out to the network. */
  visit?: (url: URL, timeoutMs: number) => Promise<Visit>;
  /**
   * Where a reqq.cc short link leads, or null if there's none by that name.
   * Looked up instead of opened, so a check isn't counted as a click.
   */
  ownLink?: (slug: string) => Promise<{ url: string; blocked: boolean } | null>;
  now?: () => number;
};

// ── Which addresses may be opened ────────────────────────────────────────

// Private, loopback, link-local, carrier NAT, documentation, multicast and
// reserved ranges.
const PRIVATE = new net.BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  PRIVATE.addSubnet(address, prefix, 'ipv4');
}
for (const [address, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96], // NAT64: an IPv4 address in disguise
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  PRIVATE.addSubnet(address, prefix, 'ipv6');
}

/** True for an IP address on the public internet. */
export function isPublicAddress(address: string): boolean {
  const family = net.isIP(address);
  if (family === 4) return !PRIVATE.check(address, 'ipv4');
  if (family !== 6) return false;

  // "::ffff:127.0.0.1" is the IPv4 address 127.0.0.1
  const mapped = /^::ffff:(.+)$/i.exec(address);
  if (mapped) {
    const v4 = net.isIPv4(mapped[1]) ? mapped[1] : hexToIPv4(mapped[1]);
    return v4 !== null && !PRIVATE.check(v4, 'ipv4');
  }
  return !PRIVATE.check(address, 'ipv6');
}

/** "7f00:1" (the tail of ::ffff:7f00:1) → "127.0.0.1" */
function hexToIPv4(tail: string): string | null {
  const parts = tail.split(':');
  if (parts.length !== 2) return null;
  const [high, low] = parts.map((part) => parseInt(part, 16));
  if (!(high >= 0 && high <= 0xffff && low >= 0 && low <= 0xffff)) return null;
  return [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.');
}

/**
 * Whether an address may be opened at all, judged by its text: http(s), the
 * usual port, no user name or password, a host name with a dot or a public
 * IP address. What the name resolves to is checked when connecting.
 */
export function isAllowedTarget(url: URL): boolean {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  if (url.port !== '' || url.username !== '' || url.password !== '') {
    return false;
  }
  if (url.href.length > MAX_URL_LENGTH) return false;

  const host = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (net.isIP(host)) return isPublicAddress(host);
  return /^(?:[a-z0-9_-]+\.)+[a-z0-9-]+$/i.test(host);
}

// ── Opening one address ──────────────────────────────────────────────────

class NotAllowedError extends Error {}
class TimedOutError extends Error {}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address?: string | dns.LookupAddress[],
  family?: number,
) => void;

// The DNS lookup the connection itself uses: it fails when the name has any
// address that isn't public, so the socket is never opened.
function guardedLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: LookupCallback,
) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    if (
      addresses.length === 0 ||
      addresses.some(({ address }) => !isPublicAddress(address))
    ) {
      return callback(new NotAllowedError(`${hostname} is not public`));
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

/** Asks for `url` and reads only the status and where it redirects to. */
export function visitOverNetwork(url: URL, timeoutMs: number): Promise<Visit> {
  return new Promise((resolve) => {
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      {
        method: 'GET',
        agent: false, // a new connection each time, so the lookup always runs
        lookup: guardedLookup as net.LookupFunction,
        headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*;q=0.8' },
      },
      (res) => {
        clearTimeout(timer);
        const location = res.headers.location ?? null;
        res.destroy(); // the body isn't wanted
        resolve({ status: res.statusCode ?? 0, location });
      },
    );
    // covers the lookup, the connection and the wait for the reply
    const timer = setTimeout(() => req.destroy(new TimedOutError()), timeoutMs);
    req.on('error', (err) => {
      clearTimeout(timer);
      if (err instanceof NotAllowedError) resolve({ failed: 'not-allowed' });
      else if (err instanceof TimedOutError) resolve({ failed: 'timeout' });
      else resolve({ failed: 'unreachable' });
    });
    req.end();
  });
}

// ── Following the chain ──────────────────────────────────────────────────

const REDIRECTS = [301, 302, 303, 307, 308];

/** A reqq.cc address that is a short link ("/abc123"), as its slug. */
function ownSlug(url: URL): string | null {
  if (!isOwnUrl(url.href)) return null;
  const slug = url.pathname.slice(1);
  return /^[A-Za-z0-9_-]+$/.test(slug) && !isReservedSlug(slug) ? slug : null;
}

/**
 * Follows `start` through its redirects. Never throws. `steps` always has at
 * least `start`; `end` says why the last step is the last.
 */
export async function traceLink(
  start: URL,
  {
    visit = visitOverNetwork,
    ownLink,
    now = Date.now,
  }: TraceOptions = {},
): Promise<Trace> {
  const steps: TraceStep[] = [];
  const seen = new Set<string>();
  const deadline = now() + TOTAL_TIMEOUT_MS;
  let url = start;

  for (;;) {
    const step: TraceStep = { url: url.href, status: null };
    steps.push(step);

    if (!isAllowedTarget(url)) return { steps, end: 'not-allowed' };
    if (seen.has(url.href) || steps.length > MAX_REDIRECTS + 1) {
      return { steps, end: 'too-many-redirects' };
    }
    seen.add(url.href);

    const left = deadline - now();
    if (left <= 0) return { steps, end: 'timeout' };

    let next: string | null;
    const slug = ownLink ? ownSlug(url) : null;
    if (ownLink && slug) {
      // one of ours: read where it leads instead of opening it
      let link: Awaited<ReturnType<typeof ownLink>>;
      try {
        link = await ownLink(slug);
      } catch {
        return { steps, end: 'unreachable' };
      }
      if (!link) {
        step.status = 404;
        return { steps, end: 'no-such-link' };
      }
      if (link.blocked) return { steps, end: 'blocked' };
      step.status = 302;
      next = link.url;
    } else {
      const result = await visit(url, Math.min(HOP_TIMEOUT_MS, left));
      if ('failed' in result) return { steps, end: result.failed };
      step.status = result.status;
      if (!REDIRECTS.includes(result.status) || !result.location) {
        return { steps, end: 'arrived' };
      }
      next = result.location;
    }

    try {
      url = new URL(next, url); // a Location may be relative
    } catch {
      return { steps, end: 'arrived' }; // redirects to nonsense: it ends here
    }
  }
}
