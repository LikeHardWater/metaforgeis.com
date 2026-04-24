import type { Metadata } from 'next'
import './globals.css'
import { MarketingHeader, MarketingFooter } from '@/app/components/layout/MarketingChrome'
import { ServiceWorkerRegistration } from '@/app/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'MetaForge Industrial Systems | Dock & Door Service TX & Midwest',
  description:
    'MetaForge Industrial Systems delivers precision dock equipment and industrial door installation, repair, and maintenance across DFW and Omaha. 24/7 emergency response.',
  metadataBase: new URL('https://metaforgeis.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MetaForge',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#dab811" />
        <link rel="apple-touch-icon" href="/images/MFIS_Logo.svg" />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegistration />
        <MarketingHeader />
        <main>{children}</main>
        <MarketingFooter />
      </body>
    </html>
  )
}
