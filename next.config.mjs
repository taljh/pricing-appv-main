/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['framer-motion'],
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  compiler: {
    styledComponents: true,
  },
}

export default nextConfig
