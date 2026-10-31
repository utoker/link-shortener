import type { MetadataRoute } from 'next';

// /sitemap.xml: reqq.cc's own pages. Short links are redirects to other
// sites, not pages, so they're left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/about', '/terms', '/privacy'].map((path) => ({
    url: new URL(path, 'https://reqq.cc').href,
  }));
}
