'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { Image, Star, MapPin, Info, Users, Mail, Search, Settings, Package, Wrench, ExternalLink } from 'lucide-react'

const sections = [
  { href: '/admin/content/hero', label: 'Hero Section', description: 'Headline, subheadline, CTAs, background image', icon: Settings, preview: '/' },
  { href: '/admin/content/services', label: 'Services', description: 'Service names, descriptions, bullets, images', icon: Wrench, preview: '/services' },
  { href: '/admin/content/gallery', label: 'Gallery', description: 'Add, remove, and reorder project photos', icon: Image, preview: '/our-work' },
  { href: '/admin/content/brands', label: 'Brands', description: 'Dock and door brand ecosystems', icon: Package, preview: '/services/dock-equipment' },
  { href: '/admin/content/testimonials', label: 'Testimonials', description: 'Customer quotes and attribution', icon: Star, preview: '/' },
  { href: '/admin/content/locations', label: 'Locations', description: 'Address, phones, service area info', icon: MapPin, preview: '/locations' },
  { href: '/admin/content/about', label: 'About Page', description: 'Company story, values, and mission copy', icon: Info, preview: '/about' },
  { href: '/admin/content/team', label: 'Team', description: 'Leadership names, titles, contacts', icon: Users, preview: '/about' },
  { href: '/admin/content/contact', label: 'Contact Info', description: 'Phones, email, hours, form destination', icon: Mail, preview: '/contact' },
  { href: '/admin/content/seo', label: 'SEO', description: 'Page titles and meta descriptions per route', icon: Search, preview: '/' },
]

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Dashboard</h1>
          <p className="text-gray-400 text-sm">Manage all site content from one place.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.href} className="bg-dark-secondary border border-dark-tertiary rounded-lg p-5 hover:border-gold/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold" aria-hidden="true" />
                  </div>
                  <a
                    href={section.preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gold transition-colors p-1"
                    aria-label={`Preview ${section.label} on site`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <h2 className="text-white font-bold text-sm mb-1">{section.label}</h2>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">{section.description}</p>
                <Link
                  href={section.href}
                  className="inline-block text-gold hover:text-gold-light text-xs font-semibold transition-colors min-h-[44px] flex items-center"
                >
                  Edit →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
