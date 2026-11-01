import { describe, it, expect } from 'vitest';
import {
  clickDetails,
  country,
  deviceType,
  isCountedClick,
  referrerHost,
} from '../clickDetails';

const UA = {
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  androidPhone:
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  cubotPhone:
    'Mozilla/5.0 (Linux; Android 12; CUBOT X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  firefoxAndroidPhone:
    'Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
  instagramInApp:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0',
  ipadOld:
    'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
  androidTablet:
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  firefoxAndroidTablet:
    'Mozilla/5.0 (Android 14; Tablet; rv:131.0) Gecko/131.0 Firefox/131.0',
  chromeWindows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  safariMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
};

const BOTS = {
  facebook:
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  imessage:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0',
  whatsapp: 'WhatsApp/2.23.20.0 A',
  slack: 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
  telegram: 'TelegramBot (like TwitterBot)',
  discord: 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
  linkedin:
    'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  google:
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  curl: 'curl/8.5.0',
};

describe('referrerHost', () => {
  it('should keep only the site name', () => {
    expect(referrerHost('https://www.linkedin.com/feed/update/123?x=1')).toBe(
      'linkedin.com',
    );
    expect(referrerHost('https://news.ycombinator.com/item?id=1')).toBe(
      'news.ycombinator.com',
    );
    expect(referrerHost('https://WWW.Example.COM./a')).toBe('example.com');
  });

  it('should merge mobile and link-out pages into the main site', () => {
    expect(referrerHost('https://l.facebook.com/')).toBe('facebook.com');
    expect(referrerHost('https://lm.facebook.com/')).toBe('facebook.com');
    expect(referrerHost('https://m.facebook.com/')).toBe('facebook.com');
    expect(referrerHost('https://l.instagram.com/')).toBe('instagram.com');
    expect(referrerHost('https://out.reddit.com/t3_abc')).toBe('reddit.com');
    expect(referrerHost('https://old.reddit.com/r/x')).toBe('reddit.com');
  });

  it('should use one name for short and app referrers of the same site', () => {
    expect(referrerHost('https://t.co/')).toBe('x.com');
    expect(referrerHost('https://mobile.twitter.com/')).toBe('x.com');
    expect(referrerHost('https://lnkd.in/')).toBe('linkedin.com');
    expect(referrerHost('android-app://com.google.android.gm/')).toBe(
      'mail.google.com',
    );
    expect(referrerHost('android-app://com.linkedin.android/')).toBe(
      'linkedin.com',
    );
    expect(referrerHost('android-app://com.example.someapp/')).toBe(
      'com.example.someapp',
    );
  });

  it('should not strip a subdomain that is the whole site name', () => {
    expect(referrerHost('https://m.me/someone')).toBe('m.me');
  });

  it('should return null for a missing or unusable referrer', () => {
    expect(referrerHost(null)).toBeNull();
    expect(referrerHost('')).toBeNull();
    expect(referrerHost('not a url')).toBeNull();
    expect(referrerHost('about:blank')).toBeNull();
  });
});

describe('country', () => {
  it('should read the two-letter code Vercel sets', () => {
    expect(country(new Headers({ 'x-vercel-ip-country': 'TR' }))).toBe('TR');
    expect(country(new Headers({ 'x-vercel-ip-country': 'de' }))).toBe('DE');
  });

  it('should return null when the header is missing or odd', () => {
    expect(country(new Headers())).toBeNull();
    expect(country(new Headers({ 'x-vercel-ip-country': 'USA' }))).toBeNull();
    expect(country(new Headers({ 'x-vercel-ip-country': '' }))).toBeNull();
  });
});

describe('deviceType', () => {
  it.each([
    ['iphone', 'phone'],
    ['androidPhone', 'phone'],
    ['cubotPhone', 'phone'],
    ['firefoxAndroidPhone', 'phone'],
    ['instagramInApp', 'phone'],
    ['ipadOld', 'tablet'],
    ['androidTablet', 'tablet'],
    ['firefoxAndroidTablet', 'tablet'],
    ['chromeWindows', 'computer'],
    ['safariMac', 'computer'],
  ] as const)('should see %s as a %s', (name, device) => {
    expect(deviceType(UA[name])).toBe(device);
  });

  it('should treat an empty user-agent as a computer', () => {
    expect(deviceType('')).toBe('computer');
  });
});

describe('isCountedClick', () => {
  const req = (userAgent?: string, method = 'GET') =>
    new Request('https://reqq.cc/abc', {
      method,
      headers: userAgent ? { 'user-agent': userAgent } : {},
    });

  it.each(Object.keys(UA))('should count a click from %s', (name) => {
    expect(isCountedClick(req(UA[name as keyof typeof UA]))).toBe(true);
  });

  it.each(Object.keys(BOTS))('should not count the %s bot', (name) => {
    expect(isCountedClick(req(BOTS[name as keyof typeof BOTS]))).toBe(false);
  });

  it('should not count requests without a user-agent or HEAD requests', () => {
    expect(isCountedClick(req())).toBe(false);
    expect(isCountedClick(req(UA.iphone, 'HEAD'))).toBe(false);
  });
});

describe('clickDetails', () => {
  it('should combine the referrer, country and device of a request', () => {
    const request = new Request('https://reqq.cc/abc', {
      headers: {
        'user-agent': UA.iphone,
        referer: 'https://www.linkedin.com/feed/',
        'x-vercel-ip-country': 'TR',
      },
    });

    expect(clickDetails(request)).toEqual({
      referrerHost: 'linkedin.com',
      country: 'TR',
      device: 'phone',
    });
  });

  it('should record a QR code scan (?qr) as its own source', () => {
    const request = new Request('https://reqq.cc/abc?qr', {
      headers: {
        'user-agent': UA.iphone,
        // Google Lens opens scanned links from the Google app
        referer: 'android-app://com.google.android.googlequicksearchbox/',
      },
    });

    expect(clickDetails(request).referrerHost).toBe('qr');
  });

  it('should report unknowns as null', () => {
    const request = new Request('https://reqq.cc/abc', {
      headers: { 'user-agent': UA.chromeWindows },
    });

    expect(clickDetails(request)).toEqual({
      referrerHost: null,
      country: null,
      device: 'computer',
    });
  });
});
