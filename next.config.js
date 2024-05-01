/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'development' ? 'standalone' : 'export',
  experimental: {
    optimizePackageImports: ['@ant-design/pro-components'],
    serverActions: {
      allowedForwardedHosts: ['localhost:3000', 'admin.buhuishangshu.cn'],
			allowedOrigins: ['localhost:3000', 'admin.buhuishangshu.cn'],
    }
  }
}

module.exports = nextConfig
