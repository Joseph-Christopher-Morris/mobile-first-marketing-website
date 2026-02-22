/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export for S3 deployment
  trailingSlash: true,
  distDir: '.next',
  generateBuildId: () => 'static-build',
  outputFileTracingRoot: __dirname, // Fix workspace root warning
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
    scrollRestoration: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for static export
    formats: ['image/webp', 'image/avif'], // Modern formats for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Mobile-first optimized sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Reduced for mobile performance
    minimumCacheTTL: 31536000, // 1 year cache for static images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize for mobile-first performance
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  // Enable modern JavaScript features
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
};

module.exports = nextConfig;
