import { ConvexClientProvider } from '@/components/convex-client-provider'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Bebas_Neue, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import type React from 'react'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans'
})
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono'
})
const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' })

export const metadata: Metadata = {
  title: {
    default: 'tx-hash',
    template: '%s ・ tx-hash'
  },
  description:
    'A SaaS payment infrastructure platform connecting businesses to multiple gateways and processors through one integration for cards, crypto/Web3, e-wallets, and bank transfers.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        media: '(prefers-color-scheme: light)'
      },
      {
        url: '/icon-active.svg',
        media: '(prefers-color-scheme: dark)'
      },
      {
        url: '/icon-bordered-2.svg',
        type: 'image/svg+xml'
      }
    ],
    apple: '/icon.svg'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} font-sans antialiased overflow-x-hidden`}>
        <ConvexClientProvider>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            <div className='noise-overlay' aria-hidden='true' />
            <SmoothScroll>{children}</SmoothScroll>
            <Analytics />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
