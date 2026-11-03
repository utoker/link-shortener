// Plain words for Google Safe Browsing threat types (see safeBrowsing.ts).
// Kept apart from safeBrowsing.ts so the edit dialog can use it without the
// protobuf reader.

const NAMES: Record<string, string> = {
  SOCIAL_ENGINEERING: 'phishing or a deceptive site',
  MALWARE: 'malware',
  UNWANTED_SOFTWARE: 'unwanted software',
  POTENTIALLY_HARMFUL_APPLICATION: 'harmful apps',
};

/** e.g. ['MALWARE', 'UNWANTED_SOFTWARE'] → "malware and unwanted software" */
export function describeThreats(threats: string[]): string {
  const names = Array.from(new Set(threats.map((t) => NAMES[t] ?? 'unsafe')));
  if (names.length === 0) return 'unsafe';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
