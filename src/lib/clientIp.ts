// The visitor's IP address, which the rate limits count by. Vercel sets
// x-forwarded-for itself and drops any value the visitor sent, so it can't
// be faked there. Locally there is none, so everyone is 127.0.0.1.
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return '127.0.0.1';
}
