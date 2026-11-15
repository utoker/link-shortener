/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // The info pages used to live under /protected; keep old links working.
  async redirects() {
    return ['about', 'terms', 'privacy'].map((page) => ({
      source: `/protected/${page}`,
      destination: `/${page}`,
      permanent: true,
    }));
  },

  // No other site may show reqq.cc in a frame (so nobody can lay a hidden
  // sign-in form under their own page), and browsers mustn't guess file types.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      // The sign-up and password reset emails (supabase/templates) load the
      // heading font from here; mail apps that show web fonts load it cross-site.
      {
        source: '/fonts/:file*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
};

export default nextConfig;
