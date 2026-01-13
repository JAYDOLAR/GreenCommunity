/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://js.razorpay.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https: blob:;
              font-src 'self' data:;
              connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com;
              frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  },
  async rewrites() {
    // Use different API URLs based on environment with fallback support
    const getProductionApiUrl = () => {
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
      
      // Check for fallback flag
      if (process.env.NEXT_PUBLIC_USE_AZURE_FALLBACK === 'true') {
        return 'https://green-community.azurewebsites.net';
      }
      
      // Default to custom domain
      return 'https://www.green-community.app';
    };
    
    const apiUrl = process.env.NODE_ENV === 'production'
      ? getProductionApiUrl()  // Custom domain with fallback in production
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
