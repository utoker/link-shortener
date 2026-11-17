// UTM tags: the utm_… query parameters analytics tools (Google Analytics,
// Plausible, Matomo and others) read to tell where a visit came from.
// Used by the /utm-builder page.

import { ensureProtocol } from './utils';

export interface UtmTags {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

export const NO_TAGS: UtmTags = {
  source: '',
  medium: '',
  campaign: '',
  term: '',
  content: '',
};

const PARAMS: [keyof UtmTags, string][] = [
  ['source', 'utm_source'],
  ['medium', 'utm_medium'],
  ['campaign', 'utm_campaign'],
  ['term', 'utm_term'],
  ['content', 'utm_content'],
];

/**
 * `link` with the filled-in tags as utm_… parameters, or null when `link`
 * isn't a web address. Tags the link already has are replaced (or removed
 * when left empty); its other parameters and its #fragment are kept.
 */
export function utmLink(link: string, tags: UtmTags): string | null {
  const text = link.trim();
  if (!text || /\s/.test(text)) return null;

  let url: URL;
  try {
    url = new URL(ensureProtocol(text));
  } catch {
    return null;
  }
  // "hello" parses as a host too; a real one has a dot
  if (!url.hostname.includes('.')) return null;

  for (const [tag, param] of PARAMS) {
    const value = tags[tag].trim();
    url.searchParams.delete(param);
    if (value) url.searchParams.set(param, value);
  }
  return url.href;
}
