/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import'],
  },
}

module.exports = nextConfig
