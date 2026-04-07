import type { Metadata } from 'next'
import Link from 'next/link'
import { SafeImage } from '@/app/components/ui/SafeImage'
import { ArrowRight } from 'lucide-react'
import { HeroSection } from '@/app/components/sections/HeroSection'
import { StatsBar } from '@/app/components/sections/StatsBar'
import { ServicesGrid } from '@/app/components/sections/ServicesGrid'
import { BrandGrid } from '@/app/components/sections/BrandGrid'
import { TestimonialSection } from '@/app/components/sections/TestimonialSection'
import { CTASection } from '@/app/components/sections/CTASection'
import { LocationCard } from '@/app/components/sections/LocationCard'
import heroData from '@/src/data/content/hero.json'
import servicesData from '@/src/data/content/services.json'
import brandsData from '@/src/data/content/brands.json'
import testimonialsData from '@/src/data/content/testimonials.json'
import locationsData from '@/src/data/content/locations.json'
import seoData from '@/src/data/content/seo.json'
import type { HeroData, Service, BrandsData, Testimonial, Location, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/']?.title,
  description: seo['/']?.description,
}

const galleryPreview = [
  'https://metaforgeis.com/wp-content/uploads/2025/07/IMG_2248-1920x1080.jpeg',
  'https://metaforgeis.com/wp-content/uploads/2025/07/IMG_4117-1920x1080.jpeg',
  'https://metaforgeis.com/wp-content/uploads/2025/07/IMG_2808-1920x1080.jpeg',
  'https://metaforgeis.com/wp-content/uploads/2025/07/IMG_9923-scaled-1920x1080.jpg',
]

export default function HomePage() {
  const hero = heroData as HeroData
  const services = servicesData as Service[]
  const brands = brandsData as BrandsData
  const testimonials = testimonialsData as Testimonial[]
  const locations = locationsData as Location[]

  return (
    <>
      <HeroSection data={hero} />
      <StatsBar />

      {/* Services */}
      <ServicesGrid
        services={services}
        title="What We Do"
        subtitle="Comprehensive dock and door services for commercial and industrial facilities across the DFW Metroplex and Omaha-Council Bluffs."
      />

      {/* About / Mission */}
      <section className="py-16 sm:py-20 bg-dark-secondary border-y border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">Our Mission</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Precision Built. Partner Driven.</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                MetaForge Industrial Systems delivers precision-engineered dock equipment, industrial doors, and
                material handling systems — installed right, serviced fast, and built to last.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Founded by operators with over 30 years of industry experience, we hold the line on quality,
                speed, and accountability in every job. Headquartered in Texas and the Midwest, MetaForge is
                building the next generation of industrial infrastructure — one system at a time.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-semibold transition-colors min-h-[44px]"
              >
                Learn More About MetaForge
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="relative h-72 sm:h-96 rounded-lg overflow-hidden bg-dark-tertiary">
              <SafeImage
                src="https://metaforgeis.com/wp-content/uploads/2025/07/IMG_2313-1024x768.jpeg"
                alt="MetaForge installation team at work"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand ecosystem */}
      <BrandGrid data={brands} />

      {/* Our Work preview */}
      <section className="py-16 sm:py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block">Portfolio</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Our Work</h2>
            </div>
            <Link
              href="/our-work"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-semibold transition-colors min-h-[44px] flex-shrink-0"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryPreview.map((url, i) => (
              <Link key={i} href="/our-work" className="group relative aspect-video bg-dark-tertiary rounded-lg overflow-hidden block">
                <SafeImage
                  src={url}
                  alt={`MetaForge project work ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-dark-bg/0 group-hover:bg-dark-bg/20 transition-colors duration-300" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TestimonialSection testimonials={testimonials} />

      {/* Locations */}
      <section className="py-16 sm:py-20 bg-dark-secondary border-t border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">Where We Operate</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Two Regional Locations</h2>
          </div>
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
