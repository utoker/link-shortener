/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
