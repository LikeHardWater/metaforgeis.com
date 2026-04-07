'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useScrollBanner } from '@/src/hooks/useScrollBanner'
import { Menu, X, Phone } from 'lucide-react'
import { cn } from '@/src/lib/utils'

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Our Work', href: '/our-work' },
  { label: 'Locations', href: '/locations' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const { isVisible: bannerVisible } = useScrollBanner()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const bannerHeight = bannerVisible ? 36 : 0

  return (
    <>
      {/* Spacer to prevent content from going under fixed header */}
      <div style={{ height: `${bannerHeight + 64}px` }} aria-hidden="true" />

      <header
        className={cn(
          'fixed left-0 right-0 z-40 transition-all duration-300',
          scrolled ? 'bg-dark-bg/95 backdrop-blur-sm shadow-lg' : 'bg-dark-bg'
        )}
        style={{ top: `${bannerHeight}px` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0" aria-label="MetaForge Industrial Systems Home">
              <div className="relative w-40 h-10">
                <Image
                  src="/images/MFIS_Logo.svg"
                  alt="MetaForge Industrial Systems"
                  fill
                  className="object-contain object-left"
                  priority
                  onError={(e) => {
                    // Fallback to text if logo missing
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = '<span style="color:#dab811;font-weight:700;font-size:14px;line-height:1.2;">MetaForge<br/>Industrial Systems</span>'
                    }
                  }}
                />
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white hover:text-gold transition-colors text-sm font-medium py-2"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="tel:8665638247"
                className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm font-semibold"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                (866) 563-8247
              </a>
              <Link
                href="/contact"
                className="bg-gold hover:bg-gold-dark text-dark-bg font-bold px-4 py-2 rounded transition-colors text-sm min-h-[44px] flex items-center"
              >
                Request a Quote
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-white hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-dark-secondary border-t border-dark-tertiary">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white hover:text-gold transition-colors py-3 text-base font-medium border-b border-dark-tertiary last:border-0 min-h-[44px] flex items-center"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <a
                  href="tel:8665638247"
                  className="flex items-center gap-2 text-gold font-semibold py-2 min-h-[44px]"
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  (866) 563-8247
                </a>
                <Link
                  href="/contact"
                  className="bg-gold hover:bg-gold-dark text-dark-bg font-bold py-3 px-4 rounded text-center transition-colors w-full min-h-[44px] flex items-center justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Request a Quote
                </Link>
                <a
                  href="tel:8336382767"
                  className="bg-emergency hover:bg-orange-700 text-white font-bold py-3 px-4 rounded text-center transition-colors w-full min-h-[44px] flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  Emergency: 833-META-SOS
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
