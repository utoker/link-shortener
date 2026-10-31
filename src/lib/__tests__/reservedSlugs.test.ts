import { describe, it, expect } from 'vitest';
import { isReservedSlug } from '../reservedSlugs';
import { CreateLinkFormSchema } from '../schemas/CreateLinkFormSchema';

describe('isReservedSlug', () => {
  it('should reserve app routes and common paths', () => {
    for (const slug of [
      'auth',
      'protected',
      '404',
      'api',
      '_next',
      'admin',
      'about',
      'terms',
      'privacy',
      'robots',
      'sitemap',
      'favicon',
      'manifest',
    ]) {
      expect(isReservedSlug(slug)).toBe(true);
    }
  });

  it('should ignore case', () => {
    expect(isReservedSlug('Admin')).toBe(true);
    expect(isReservedSlug('PRIVACY')).toBe(true);
  });

  it('should allow other slugs', () => {
    expect(isReservedSlug('abc123')).toBe(false);
    expect(isReservedSlug('admins')).toBe(false);
    expect(isReservedSlug('my-about')).toBe(false);
    expect(isReservedSlug('')).toBe(false);
  });
});

describe('CreateLinkFormSchema slug', () => {
  const slug = CreateLinkFormSchema.shape.slug;

  it('should reject reserved slugs', () => {
    const result = slug.safeParse('About');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('This slug is reserved.');
  });

  it('should accept free, empty and missing slugs', () => {
    expect(slug.safeParse('my-link').success).toBe(true);
    expect(slug.safeParse('').success).toBe(true);
    expect(slug.safeParse(undefined).success).toBe(true);
  });
});
