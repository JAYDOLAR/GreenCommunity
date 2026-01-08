/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  async rewrites() {
    // Use different API URLs based on environment
    const apiUrl = process.env.NODE_ENV === 'production'
      ? ''  // Same origin in production
      : 'http://localhost:5000';  // Development

    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
