import type { MetadataRoute } from 'next';

// /sitemap.xml: reqq.cc's own pages. Short links are redirects to other
// sites, not pages, so they're left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/qr-code-generator',
    '/link-click-counter',
    '/url-shortener-without-sign-up',
    '/bitly-alternative',
    '/about',
    '/terms',
    '/privacy',
  ].map((path) => ({
    url: new URL(path, 'https://reqq.cc').href,
  }));
}
