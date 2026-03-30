import type { NextConfig } from 'next'
process.env.BROWSERSLIST_IGNORE_OLD_DATA ??= 'true'
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA ??= 'true'

const next: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  }
}

export default next
