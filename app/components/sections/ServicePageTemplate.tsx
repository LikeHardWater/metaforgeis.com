import { SafeImage } from '@/app/components/ui/SafeImage'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, ArrowRight, Phone } from 'lucide-react'
import { CTASection } from '@/app/components/sections/CTASection'
import { BrandGrid } from '@/app/components/sections/BrandGrid'
import type { Service, BrandsData } from '@/src/types'

interface ServicePageTemplateProps {
  service: Service
  allBrands?: BrandsData
}

export function ServicePageTemplate({ service, allBrands }: ServicePageTemplateProps) {
  // Filter brand data down to only this service's brands if applicable
  const serviceBrandsData: BrandsData | null =
    service.brands && service.brands.length > 0 && allBrands
      ? {
          categories: allBrands.categories
            .map((cat) => ({
              name: cat.name,
              brands: cat.brands.filter((b) => service.brands.includes(b)),
            }))
            .filter((cat) => cat.brands.length > 0),
        }
      : null

  return (
    <>
      {/* Hero — same fixed height as all interior pages */}
      <section className="relative h-72 sm:h-80 flex items-center overflow-hidden">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-700" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            ← Back to Services
          </Link>
          <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">Services</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{service.name}</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold px-6 py-2.5 rounded transition-colors text-sm min-h-[44px]"
            >
              Request a Quote <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="tel:8336382767"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emergency hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded transition-colors text-sm min-h-[44px]"
            >
              <Phone className="w-4 h-4" aria-hidden="true" /> Emergency: 833-META-SOS
            </a>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Bullets */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">What&apos;s Included</h2>
              {service.bullets && service.bullets.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-600">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Contact us for details on this service.</p>
              )}
            </div>

            {/* Image */}
            <div className="relative h-72 sm:h-96 rounded-lg overflow-hidden bg-gray-100">
              {service.image ? (
                <SafeImage
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Brand ecosystem for this service */}
      {serviceBrandsData && <BrandGrid data={serviceBrandsData} />}

      <CTASection />
    </>
  )
}
