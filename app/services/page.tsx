import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { ServicesGrid } from '@/app/components/sections/ServicesGrid'
import { CTASection } from '@/app/components/sections/CTASection'
import servicesData from '@/src/data/content/services.json'
import seoData from '@/src/data/content/seo.json'
import type { Service, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/services']?.title,
  description: seo['/services']?.description,
}

export default function ServicesPage() {
  const services = servicesData as Service[]

  return (
    <>
      {/* Page hero */}
      <section className="bg-dark-secondary border-b border-dark-tertiary py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">What We Do</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Industrial Dock &amp; Door Services
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            End-to-end dock and door services for commercial and industrial facilities —
            from first installation to 24/7 emergency repair.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold px-8 py-4 rounded transition-colors min-h-[44px]"
            >
              Request a Quote <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="tel:8336382767"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emergency hover:bg-orange-700 text-white font-bold px-8 py-4 rounded transition-colors min-h-[44px]"
            >
              <Phone className="w-4 h-4" aria-hidden="true" /> Emergency: 833-META-SOS
            </a>
          </div>
        </div>
      </section>

      <ServicesGrid services={services} />
      <CTASection />
    </>
  )
}
