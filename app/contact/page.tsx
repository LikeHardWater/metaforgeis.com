import type { Metadata } from 'next'
import { Phone, Mail, Clock, MapPin } from 'lucide-react'
import { ContactForm } from '@/app/components/sections/ContactForm'
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
      <section className="bg-dark-secondary border-b border-dark-tertiary py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">Get In Touch</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{contact.headline}</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{contact.subheadline}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact info sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div>
                <h2 className="text-white font-bold text-xl mb-5">Contact Info</h2>
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
                  <p className="text-white font-semibold group-hover:text-gold transition-colors">(866) 563-8247</p>
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
                  <p className="text-white font-semibold group-hover:text-gold transition-colors">info@metaforgeis.com</p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Hours</p>
                  <p className="text-white text-sm leading-relaxed">{contact.hours}</p>
                </div>
              </div>

              <div className="border-t border-dark-tertiary pt-6">
                <h3 className="text-gold font-bold text-xs uppercase tracking-widest mb-4">Sales Contact</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold" aria-hidden="true" />
                  </div>
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-white mb-1">Eric Forbus</p>
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
              <h2 className="text-white font-bold text-xl mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
