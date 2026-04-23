import type { Metadata } from 'next'
import { Phone, Mail, Clock, MapPin } from 'lucide-react'
import { ContactForm } from '@/app/components/sections/ContactForm'
import { PageHero } from '@/app/components/sections/PageHero'
import contactData from '@/src/data/content/contact.json'
import seoData from '@/src/data/content/seo.json'
import type { ContactData, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/contact']?.title,
  description: seo['/contact']?.description,
}

export default function ContactPage() {
  const contact = contactData as ContactData

  return (
    <>
      <PageHero
        eyebrow="Get In Touch"
        title={contact.headline}
        subtitle={contact.subheadline}
        image="https://metaforgeis.com/wp-content/uploads/2025/07/IMG_0193-1920x1080.jpeg"
        imageAlt="MetaForge team at work"
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact info sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div>
                <h2 className="text-gray-900 font-bold text-xl mb-5">Contact Info</h2>
              </div>

              <a
                href="tel:8665638247"
                className="flex items-start gap-4 group min-h-[44px]"
              >
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Main Line</p>
                  <p className="text-gray-900 font-semibold group-hover:text-gold transition-colors">(866) 563-8247</p>
                </div>
              </a>

              <a
                href="tel:8336382767"
                className="flex items-start gap-4 group min-h-[44px]"
              >
                <div className="w-10 h-10 bg-emergency/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-emergency" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Emergency 24/7</p>
                  <p className="text-emergency font-bold group-hover:text-orange-400 transition-colors">833-META-SOS</p>
                </div>
              </a>

              <a
                href="mailto:info@metaforgeis.com"
                className="flex items-start gap-4 group min-h-[44px]"
              >
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-gray-900 font-semibold group-hover:text-gold transition-colors">info@metaforgeis.com</p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Hours</p>
                  <p className="text-gray-900 text-sm leading-relaxed">{contact.hours}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-gold font-bold text-xs uppercase tracking-widest mb-4">Sales Contact</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold" aria-hidden="true" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-900 mb-1">Eric Forbus</p>
                    <a href="mailto:eric.forbus@metaforgeis.com" className="hover:text-gold transition-colors block">
                      eric.forbus@metaforgeis.com
                    </a>
                    <a href="tel:5632054547" className="hover:text-gold transition-colors block">
                      (563) 205-4547
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="text-gray-900 font-bold text-xl mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
