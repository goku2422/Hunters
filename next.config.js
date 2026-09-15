/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/card',
        destination: '/shop/brew-and-bean',
      },
      {
        source: '/card/:shopSlug',
        destination: '/shop/:shopSlug',
      },
      {
        source: '/scan',
        destination: '/shop/brew-and-bean',
      },
      {
        source: '/scan/:merchantId',
        destination: '/shop/:merchantId',
      },
    ];
  },
};

module.exports = nextConfig;
