import type { NextConfig } from 'next'
process.env.BROWSERSLIST_IGNORE_OLD_DATA ??= 'true'
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA ??= 'true'

const next: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'polymarket-upload.s3.us-east-2.amazonaws.com'
      }
    ],
    unoptimized: true
  }
}

export default next
