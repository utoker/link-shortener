import { describe, it, expect } from 'vitest';
import { describeThreats } from '../threatNames';

describe('describeThreats', () => {
  it.each([
    [['SOCIAL_ENGINEERING'], 'phishing or a deceptive site'],
    [
      ['MALWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      'malware and harmful apps',
    ],
    // no comma before "and"
    [
      ['MALWARE', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      'malware, unwanted software and harmful apps',
    ],
    [['THREAT_9', 'THREAT_10'], 'unsafe'],
    [[], 'unsafe'],
  ])('%j → %s', (threats, words) => {
    expect(describeThreats(threats)).toBe(words);
  });
});
