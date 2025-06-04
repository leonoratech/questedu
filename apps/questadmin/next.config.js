/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['firebase-admin']
}

module.exports = nextConfig
