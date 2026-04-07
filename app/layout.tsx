import type { Metadata } from 'next'
import './globals.css'
import { EmergencyBanner } from '@/app/components/layout/EmergencyBanner'
import { Header } from '@/app/components/layout/Header'
import { Footer } from '@/app/components/layout/Footer'

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
      <body className="antialiased bg-dark-bg text-white">
        <EmergencyBanner />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
