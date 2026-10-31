import type { MetadataRoute } from 'next';

// /robots.txt. Short links stay crawlable (they redirect to other sites);
// the login callback and password reset pages aren't worth indexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth/', '/protected/reset-password'],
    },
    sitemap: 'https://reqq.cc/sitemap.xml',
  };
}
