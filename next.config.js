/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: process.env.NODE_ENV === 'development' ? 'standalone' : 'export',
  output: 'standalone',
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ['@ant-design/pro-components'],
    serverActions: {
      allowedForwardedHosts: ['localhost:3000', 'admin.buhuishangshu.cn', 'test.buhuishangshu.cn', 'dev.admin.buhuishangshu.cn'],
			allowedOrigins: ['localhost:3000', 'admin.buhuishangshu.cn', 'test.buhuishangshu.cn', 'dev.admin.buhuishangshu.cn'],
    }
  },
}

module.exports = nextConfig
