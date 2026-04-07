'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'

const serviceLinks = [
  { label: 'Dock Equipment', href: '/services/dock-equipment' },
  { label: 'Industrial Doors', href: '/services/industrial-doors' },
  { label: 'Emergency Repair', href: '/services/emergency-repair' },
  { label: 'Planned Maintenance', href: '/services/planned-maintenance' },
  { label: 'Parts Supply', href: '/services/parts-supply' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Our Work', href: '/our-work' },
  { label: 'Locations', href: '/locations' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="bg-dark-secondary border-t border-dark-tertiary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Brand column */}
          <div className="col-span-1">
            <div className="relative w-44 h-12 mb-4">
              <Image
                src="/images/MFIS_Logo.svg"
                alt="MetaForge Industrial Systems"
                fill
                className="object-contain object-left"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = '<span style="color:#dab811;font-weight:700;font-size:16px;">MetaForge Industrial Systems</span>'
                  }
                }}
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              High-Performance Equipment. Precision Installation. Zero Compromise.
            </p>
            <div className="flex flex-col gap-3">
              <a href="tel:8665638247" className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors text-sm min-h-[44px]">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" aria-hidden="true" />
                (866) 563-8247
              </a>
              <a href="tel:8336382767" className="flex items-center gap-2 text-emergency hover:text-orange-400 transition-colors text-sm font-semibold min-h-[44px]">
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Emergency: 833-META-SOS
              </a>
              <a href="mailto:info@metaforgeis.com" className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors text-sm min-h-[44px]">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" aria-hidden="true" />
                info@metaforgeis.com
              </a>
            </div>
          </div>

          {/* Services column */}
          <div className="col-span-1">
            <h3 className="text-gold font-bold text-sm uppercase tracking-widest mb-4">Services</h3>
            <ul className="flex flex-col gap-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm py-1 inline-block min-h-[44px] flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Locations column */}
          <div className="col-span-1">
            <h3 className="text-gold font-bold text-sm uppercase tracking-widest mb-4">Company</h3>
            <ul className="flex flex-col gap-2 mb-8">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm py-1 inline-block min-h-[44px] flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-gold font-bold text-sm uppercase tracking-widest mb-3">Locations</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-white font-medium">Flower Mound, TX</p>
                  <p>4351 Cross Timbers Rd, Suite 400</p>
                </div>
              </div>
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-white font-medium">Crescent, IA</p>
                  <p>902 Old Lincoln Hwy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-dark-tertiary flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} MetaForge Industrial Systems. All rights reserved.</p>
          <p>DFW &amp; Omaha-Council Bluffs</p>
        </div>
      </div>
    </footer>
  )
}
