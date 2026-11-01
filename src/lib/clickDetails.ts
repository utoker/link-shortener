// What reqq.cc keeps about a click on a short link: the referring site's host
// name, the visitor's country and a device type. The full referrer URL, the
// user-agent and the IP address are only read here, never stored.
import { isbot } from 'isbot';

export type Device = 'phone' | 'tablet' | 'computer';

export interface ClickDetails {
  referrerHost: string | null; // null = direct / unknown
  country: string | null;
  device: Device;
}

// Subdomains that only mark a mobile site or a link-out page
// (www.linkedin.com, m.facebook.com, l.instagram.com, out.reddit.com, …).
const EXTRA_SUBDOMAIN = /^(?:www|m|l|lm|mobile|out|old)\./;

// Other names for the same site. Android apps send their package name
// (android-app://com.google.android.gm/) instead of a web address.
const SITE_ALIASES: Record<string, string> = {
  't.co': 'x.com',
  'twitter.com': 'x.com',
  'lnkd.in': 'linkedin.com',
  'com.google.android.gm': 'mail.google.com',
  'com.google.android.googlequicksearchbox': 'google.com',
  'com.linkedin.android': 'linkedin.com',
  'com.twitter.android': 'x.com',
  'com.facebook.katana': 'facebook.com',
  'com.instagram.android': 'instagram.com',
  'com.reddit.frontpage': 'reddit.com',
  'com.slack': 'slack.com',
  'com.discord': 'discord.com',
  'com.whatsapp': 'whatsapp.com',
  'org.telegram.messenger': 'telegram.org',
};

export function referrerHost(referer: string | null): string | null {
  if (!referer) return null;

  let host: string;
  try {
    host = new URL(referer).hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return null;
  }

  const site = host.replace(EXTRA_SUBDOMAIN, '');
  if (site.includes('.')) host = site; // keep m.me, not "me"
  host = SITE_ALIASES[host] ?? host;

  return host && host.length <= 253 ? host : null;
}

// Two-letter code Vercel sets from the visitor's IP (absent when run locally).
export function country(headers: Headers): string | null {
  const code = headers.get('x-vercel-ip-country')?.toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

// iPads usually describe themselves as Macs, so most of them count as computers.
export function deviceType(userAgent: string): Device {
  if (/iPad|Tablet|Kindle|Silk\/|Android(?!.*Mobile)/i.test(userAgent)) {
    return 'tablet';
  }
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return 'phone';
  return 'computer';
}

// Link-preview bots (Facebook, iMessage, WhatsApp, Slack, …), scripts without
// a user-agent and HEAD-only link checkers are redirected but not counted.
export function isCountedClick(req: Request): boolean {
  const userAgent = req.headers.get('user-agent');
  return req.method === 'GET' && !!userAgent && !isbot(userAgent);
}

export function clickDetails(req: Request): ClickDetails {
  return {
    referrerHost: referrerHost(req.headers.get('referer')),
    country: country(req.headers),
    device: deviceType(req.headers.get('user-agent') ?? ''),
  };
}
