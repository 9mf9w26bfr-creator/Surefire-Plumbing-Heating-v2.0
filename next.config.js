/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 👇 仅此一行，全部页面都不再报 Suspense 警告
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;