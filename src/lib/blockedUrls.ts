// Destinations reqq.cc won't shorten. A short link to another shortener hides
// where it really leads (and can be switched to a bad site later), and a link
// back to reqq.cc makes chains or redirect loops.

// General-purpose shorteners anyone can use. First-party short domains such
// as youtu.be or amzn.to only lead to their own site, so they stay allowed.
const SHORTENER_DOMAINS = new Set([
  'bit.ly',
  'bitly.com',
  'bit.do',
  'j.mp',
  'tinyurl.com',
  'tiny.cc',
  'tiny.one',
  't.ly',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'v.gd',
  'da.gd',
  'buff.ly',
  'rebrand.ly',
  'rb.gy',
  'cutt.ly',
  'cutt.us',
  'shorturl.at',
  'short.io',
  'short.gy',
  'bl.ink',
  's.id',
  'lnkd.in',
  'shorte.st',
  'adf.ly',
  'bc.vc',
  'ouo.io',
  'soo.gd',
  'x.gd',
  'clck.ru',
  'qrco.de',
  'trib.al',
  'dlvr.it',
  'ift.tt',
  'u.to',
  'gg.gg',
  'urlz.fr',
  'lc.cx',
  'kutt.it',
  't2m.io',
  'shor.by',
  'dub.sh',
  'spoo.me',
  'y.gy',
  'surl.li',
  'tny.im',
  '2.gp',
  'v.ht',
  'chilp.it',
  'po.st',
  'hyperurl.co',
  'ulvis.net',
  'zws.im',
  'leftl.ink',
]);

const OWN_DOMAINS = new Set(['reqq.cc']);
// This project's Vercel URLs: link-shortener-one-delta.vercel.app and
// per-deployment ones like link-shortener-<id>-utokers-projects.vercel.app.
const OWN_VERCEL_HOST = /^link-shortener(-[a-z0-9-]+)?\.vercel\.app$/;

/** Lower-case hostname without a trailing dot, or '' if the URL doesn't parse. */
function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/\.$/, '');
  } catch {
    return '';
  }
}

/** True when the host is one of the domains or a subdomain of one. */
function matchesDomain(host: string, domains: Set<string>): boolean {
  const labels = host.split('.');
  return labels.some((_, i) => domains.has(labels.slice(i).join('.')));
}

export function isOwnUrl(url: string): boolean {
  const host = hostname(url);
  return matchesDomain(host, OWN_DOMAINS) || OWN_VERCEL_HOST.test(host);
}

export function isShortenerUrl(url: string): boolean {
  return matchesDomain(hostname(url), SHORTENER_DOMAINS);
}
