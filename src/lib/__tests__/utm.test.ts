import { describe, it, expect } from 'vitest';
import { NO_TAGS, utmLink } from '../utm';

describe('utmLink', () => {
  it('should add the filled-in tags in the usual order', () => {
    expect(
      utmLink('https://example.com/page', {
        ...NO_TAGS,
        campaign: 'spring_sale',
        source: 'newsletter',
        medium: 'email',
      }),
    ).toBe(
      'https://example.com/page?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale',
    );
  });

  it('should add https:// to a link typed without it', () => {
    expect(utmLink(' example.com ', { ...NO_TAGS, source: 'x' })).toBe(
      'https://example.com/?utm_source=x',
    );
  });

  it("should keep the link's own parameters and its fragment", () => {
    expect(
      utmLink('https://example.com/p?id=7#top', { ...NO_TAGS, source: 'x' }),
    ).toBe('https://example.com/p?id=7&utm_source=x#top');
  });

  it('should replace tags the link already has and drop the emptied ones', () => {
    expect(
      utmLink('https://example.com/?utm_source=old&utm_medium=old&id=7', {
        ...NO_TAGS,
        source: 'new',
      }),
    ).toBe('https://example.com/?id=7&utm_source=new');
  });

  it('should trim tags and encode what a link cannot hold as is', () => {
    expect(
      utmLink('https://example.com/', {
        ...NO_TAGS,
        source: '  news letter ',
        campaign: 'a&b=c',
      }),
    ).toBe('https://example.com/?utm_source=news+letter&utm_campaign=a%26b%3Dc');
  });

  it('should return the link itself when no tag is filled in', () => {
    expect(utmLink('https://example.com/a', NO_TAGS)).toBe(
      'https://example.com/a',
    );
  });

  it.each(['', '   ', 'hello', 'two words.com', 'javascript:alert(1)', 'https://'])(
    'should return null for %j, which is not a web address',
    (link) => {
      expect(utmLink(link, { ...NO_TAGS, source: 'x' })).toBeNull();
    },
  );
});
