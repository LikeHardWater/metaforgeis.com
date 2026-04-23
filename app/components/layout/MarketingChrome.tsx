'use client'

import { usePathname } from 'next/navigation'
import { EmergencyBanner } from './EmergencyBanner'
import { Header } from './Header'
import { Footer } from './Footer'

function isAppRoute(pathname: string | null) {
  return pathname?.startsWith('/app') || pathname?.startsWith('/login')
}

export function MarketingHeader() {
  const pathname = usePathname()
  if (isAppRoute(pathname)) return null
  return (
    <>
      <EmergencyBanner />
      <Header />
    </>
  )
}

export function MarketingFooter() {
  const pathname = usePathname()
  if (isAppRoute(pathname)) return null
  return <Footer />
}
