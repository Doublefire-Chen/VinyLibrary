/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  exportTrailingSlash: true,
}

module.exports = nextConfig