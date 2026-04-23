import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'

interface CTASectionProps {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaLink?: string
  showEmergency?: boolean
}

export function CTASection({
  headline = 'Stop waiting on unreliable vendors.',
  subheadline = 'MetaForge delivers precision equipment, professional installation, and real accountability — every time.',
  ctaText = 'Request a Quote',
  ctaLink = '/contact',
  showEmergency = true,
}: CTASectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-gold mb-4">{headline}</h2>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">{subheadline}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={ctaLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold px-8 py-4 rounded transition-colors text-base min-h-[44px]"
          >
            {ctaText}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          {showEmergency && (
            <a
              href="tel:8336382767"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-emergency text-emergency hover:bg-emergency hover:text-gray-900 font-bold px-8 py-4 rounded transition-colors text-base min-h-[44px]"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Emergency: 833-META-SOS
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
