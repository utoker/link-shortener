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
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/, // only import from TS/JS files
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
