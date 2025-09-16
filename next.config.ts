import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable react production optimizations
  reactStrictMode: true,
  
  // Enable compression for production
  compress: true,
  
  // Configure image optimization for production
  images: {
    // Add your production domains here
    domains: [
      'http://redeem.acronis.lk/',
      'localhost'
    ],
  },
  
  // Enable production logging optimizations
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Enable production performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-*',
      '@dnd-kit/*'
    ],
  },
};

export default nextConfig;