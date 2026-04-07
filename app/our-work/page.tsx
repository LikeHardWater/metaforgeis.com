import type { Metadata } from 'next'
import { ImageGallery } from '@/app/components/sections/ImageGallery'
import { CTASection } from '@/app/components/sections/CTASection'
import galleryData from '@/src/data/content/gallery.json'
import seoData from '@/src/data/content/seo.json'
import type { GalleryImage, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/our-work']?.title,
  description: seo['/our-work']?.description,
}

export default function OurWorkPage() {
  const images = galleryData as GalleryImage[]

  return (
    <>
      <section className="bg-dark-secondary border-b border-dark-tertiary py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3 block">Portfolio</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">Our Work</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Dock equipment installations, industrial door systems, and facility projects
            across DFW and Omaha-Council Bluffs.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImageGallery images={images} />
        </div>
      </section>

      <CTASection />
    </>
  )
}
