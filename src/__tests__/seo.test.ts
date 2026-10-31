import { describe, it, expect } from 'vitest';
import robots from '../app/robots';
import sitemap from '../app/sitemap';

describe('robots.txt', () => {
  it('should allow crawling except auth pages and point to the sitemap', () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth/', '/protected/reset-password'],
      },
      sitemap: 'https://reqq.cc/sitemap.xml',
    });
  });
});

describe('sitemap.xml', () => {
  it("should list reqq.cc's own pages and no short links", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      'https://reqq.cc/',
      'https://reqq.cc/about',
      'https://reqq.cc/terms',
      'https://reqq.cc/privacy',
    ]);
  });
});
