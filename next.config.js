/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: {
    serverActions: {
      allowedForwardedHosts: ['localhost:3000', 'admin.buhuishangshu.cn'],
			allowedOrigins: ['localhost:3000', 'admin.buhuishangshu.cn'],
    }
  }
}

module.exports = nextConfig
