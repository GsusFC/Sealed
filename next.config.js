/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  experimental: {
    serverActions: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: '/api/manifest',
      },
    ];
  },
};

module.exports = nextConfig;
