/** @type {import('next').NextConfig} */
const nextConfig = {
  // Inline AUTH_SECRET at build time so Next.js Edge Runtime (middleware) can read it.
  // Edge Runtime doesn't have runtime process.env access; this bakes the value in during build.
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'metaforgeis.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.metaforgeis.com',
      },
    ],
  },
};

export default nextConfig;
