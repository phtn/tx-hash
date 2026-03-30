import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

process.env.BROWSERSLIST_IGNORE_OLD_DATA ??= 'true'
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA ??= 'true'

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'dist/**', 'next-env.d.ts', 'bun.lock']
  },
  ...nextCoreWebVitals
]

export default config
