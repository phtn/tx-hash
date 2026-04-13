import { ConvexClientProvider } from '@/components/convex-client-provider'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ThemeProvider } from '@/components/theme-provider'
import WagmiContext from '@/ctx/wagmi'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import type React from 'react'
import './globals.css'

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
        url: '/icon-bordered-3.svg',
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
      <body className={`font-sans antialiased overflow-x-hidden`}>
        <WagmiContext>
          <ConvexClientProvider>
            <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
              <SmoothScroll>{children}</SmoothScroll>
              <Analytics />
            </ThemeProvider>
          </ConvexClientProvider>
        </WagmiContext>
      </body>
    </html>
  )
}
