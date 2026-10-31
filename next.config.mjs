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
