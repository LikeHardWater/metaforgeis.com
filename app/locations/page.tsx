import type { Metadata } from 'next'
import { LocationCard } from '@/app/components/sections/LocationCard'
import { CTASection } from '@/app/components/sections/CTASection'
import locationsData from '@/src/data/content/locations.json'
import seoData from '@/src/data/content/seo.json'
import type { Location, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/locations']?.title,
  description: seo['/locations']?.description,
}

export default function LocationsPage() {
  const locations = locationsData as Location[]

  return (
    <>
      <section className="bg-dark-secondary border-b border-dark-tertiary py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">Where We Operate</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Two Regional Locations
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Serving the DFW Metroplex from Flower Mound, TX and the Omaha-Council Bluffs metro from Crescent, IA.
            One call covers both regions: <a href="tel:8665638247" className="text-gold hover:text-gold-light">(866) 563-8247</a>.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {locations.map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
