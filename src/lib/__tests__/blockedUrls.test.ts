import { describe, it, expect } from 'vitest';
import { isOwnUrl, isShortenerUrl } from '../blockedUrls';
import { CreateLinkFormSchema } from '../schemas/CreateLinkFormSchema';

describe('isOwnUrl', () => {
  it('should match reqq.cc, its subdomains and this project on Vercel', () => {
    for (const url of [
      'https://reqq.cc/abc123',
      'https://www.reqq.cc/abc123',
      'http://REQQ.CC./abc123',
      'https://link-shortener-one-delta.vercel.app/abc123',
      'https://link-shortener-b27r1m1sx-utokers-projects.vercel.app/x',
    ]) {
      expect(isOwnUrl(url)).toBe(true);
    }
  });

  it('should not match lookalike hosts', () => {
    for (const url of [
      'https://notreqq.cc/x',
      'https://reqq.cc.example.com/x',
      'https://other-project.vercel.app/x',
      'https://example.com/?next=https://reqq.cc/x',
    ]) {
      expect(isOwnUrl(url)).toBe(false);
    }
  });
});

describe('isShortenerUrl', () => {
  it('should match shorteners and their subdomains', () => {
    for (const url of [
      'https://bit.ly/abc',
      'https://BIT.LY/abc',
      'https://bit.ly./abc',
      'https://www.tinyurl.com/abc',
      'https://t.co/abc',
      'https://leftl.ink/s/abc',
      'https://example.com@bit.ly/abc',
    ]) {
      expect(isShortenerUrl(url)).toBe(true);
    }
  });

  it('should allow other hosts, including first-party short domains', () => {
    for (const url of [
      'https://youtu.be/abc',
      'https://amzn.to/abc',
      'https://notbit.ly/abc',
      'https://bit.ly.example.com/abc',
      'https://example.com/?u=https://bit.ly/abc',
      'not a url',
    ]) {
      expect(isShortenerUrl(url)).toBe(false);
    }
  });
});

describe('CreateLinkFormSchema url', () => {
  const url = CreateLinkFormSchema.shape.url;

  it('should explain why a reqq.cc link is refused', () => {
    const result = url.safeParse('https://reqq.cc/abc123');
    expect(result.error?.issues[0].message).toBe(
      'That is already a reqq.cc link.',
    );
  });

  it('should explain why a shortener link is refused', () => {
    const result = url.safeParse('https://bit.ly/abc');
    expect(result.error?.issues[0].message).toBe(
      'Links to other URL shorteners are not allowed. Use the full destination link.',
    );
  });

  it('should accept ordinary links', () => {
    expect(url.safeParse('https://example.com/page').success).toBe(true);
    expect(url.safeParse('https://youtu.be/abc').success).toBe(true);
  });

  it('should still report an invalid URL as invalid', () => {
    const result = url.safeParse('https://exa mple.com');
    expect(result.error?.issues.map((i) => i.message)).toEqual([
      'Please enter a valid URL (e.g., https://example.com)',
    ]);
  });
});
