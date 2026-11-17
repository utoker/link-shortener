// Hands a link from a tool page (/utm-builder) to the shortener on the
// homepage. It travels in sessionStorage rather than in the address, so it
// never shows up in server logs or the browser history.

const KEY = 'reqq:prefill-url';

/** Remembers `url` for the homepage to pick up. False if it couldn't. */
export function setPrefillUrl(url: string): boolean {
  try {
    sessionStorage.setItem(KEY, url);
    return true;
  } catch {
    return false; // storage switched off: the homepage just opens empty
  }
}

/** The remembered link, once: reading it forgets it. */
export function takePrefillUrl(): string {
  try {
    const url = sessionStorage.getItem(KEY) ?? '';
    sessionStorage.removeItem(KEY);
    return url;
  } catch {
    return '';
  }
}
