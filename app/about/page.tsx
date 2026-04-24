import type { Metadata } from 'next'
import { SafeImage } from '@/app/components/ui/SafeImage'
import { CheckCircle } from 'lucide-react'
import { CTASection } from '@/app/components/sections/CTASection'
import { StatsBar } from '@/app/components/sections/StatsBar'
import { PageHero } from '@/app/components/sections/PageHero'
import aboutData from '@/src/data/content/about.json'
import seoData from '@/src/data/content/seo.json'
import type { AboutData, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/about']?.title,
  description: seo['/about']?.description,
}

export default function AboutPage() {
  const about = aboutData as AboutData

  return (
    <>
      <PageHero
        eyebrow="Who We Are"
        title={about.headline}
        subtitle={about.body}
        image="/images/MFIS/IMG_9925-1024x768.jpg"
        imageAlt="MetaForge Industrial Systems team"
      />

      <StatsBar />

      {/* Values */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">How We Operate</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {about.values.map((value) => (
              <div
                key={value.title}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-gold/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-gray-900 font-bold text-lg mb-2">{value.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip */}
      <section className="py-8 bg-gray-50 border-t border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              '/images/MFIS/IMG_0199.jpeg',
              '/images/MFIS/IMG_4299.jpeg',
              '/images/MFIS/IMG_2501.jpeg',
            ].map((url, i) => (
              <div key={i} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <SafeImage
                  src={url}
                  alt={`MetaForge team at work ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
