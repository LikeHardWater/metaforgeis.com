import type { Metadata } from 'next'
import { LocationCard } from '@/app/components/sections/LocationCard'
import { CTASection } from '@/app/components/sections/CTASection'
import { PageHero } from '@/app/components/sections/PageHero'
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
      <PageHero
        eyebrow="Where We Operate"
        title="Two Regional Locations"
        subtitle="Serving DFW from Flower Mound, TX and the Omaha-Council Bluffs metro from Crescent, IA."
        image="/images/MFIS/IMG_4357-1920x1080.jpeg"
        imageAlt="MetaForge installation team on site"
      />

      <section className="py-16 sm:py-20 bg-white">
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
