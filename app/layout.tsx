import type { Metadata } from 'next'
import './globals.css'
import { MarketingHeader, MarketingFooter } from '@/app/components/layout/MarketingChrome'

export const metadata: Metadata = {
  title: 'MetaForge Industrial Systems | Dock & Door Service TX & Midwest',
  description:
    'MetaForge Industrial Systems delivers precision dock equipment and industrial door installation, repair, and maintenance across DFW and Omaha. 24/7 emergency response.',
  metadataBase: new URL('https://metaforgeis.com'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MarketingHeader />
        <main>{children}</main>
        <MarketingFooter />
      </body>
    </html>
  )
}
