import type { Metadata } from 'next'
import Image from 'next/image'
import { SafeImage } from '@/app/components/ui/SafeImage'
import { CheckCircle } from 'lucide-react'
import { CTASection } from '@/app/components/sections/CTASection'
import { StatsBar } from '@/app/components/sections/StatsBar'
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
      {/* Hero */}
      <section className="relative bg-dark-secondary border-b border-dark-tertiary py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <Image
            src="https://metaforgeis.com/wp-content/uploads/2025/07/IMG_9925-1024x768.jpg"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-dark-secondary/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">Who We Are</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">{about.headline}</h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">{about.body}</p>
        </div>
      </section>

      <StatsBar />

      {/* Values */}
      <section className="py-16 sm:py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">How We Operate</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {about.values.map((value) => (
              <div
                key={value.title}
                className="bg-dark-secondary border border-dark-tertiary rounded-lg p-6 hover:border-gold/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">{value.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip */}
      <section className="py-8 bg-dark-secondary border-t border-dark-tertiary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              'https://metaforgeis.com/wp-content/uploads/2025/07/IMG_0199.jpeg',
              'https://metaforgeis.com/wp-content/uploads/2025/07/IMG_4299.jpeg',
              'https://metaforgeis.com/wp-content/uploads/2025/07/IMG_2501.jpeg',
            ].map((url, i) => (
              <div key={i} className="relative aspect-video bg-dark-tertiary rounded-lg overflow-hidden">
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
