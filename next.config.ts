import type { NextConfig } from 'next';

const APPWRITE_ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mediatechliberia.online/v1').replace(/\/$/, '');

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              `default-src 'self'`,
              `script-src 'self' 'unsafe-eval' 'unsafe-inline'`,
              `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
              `font-src 'self' data: https://fonts.gstatic.com`,
              `connect-src 'self' ${APPWRITE_ENDPOINT} wss: ws: https:`,
              `img-src 'self' data: blob: ${APPWRITE_ENDPOINT} https:`,
              `media-src 'self' blob: ${APPWRITE_ENDPOINT} https:`,
              `frame-src 'self'`,
              `worker-src 'self' blob:`,
            ].join('; '),
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-avatar', '@radix-ui/react-dialog', 'recharts'],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
