import type { Metadata } from 'next'
import { ImageGallery } from '@/app/components/sections/ImageGallery'
import { CTASection } from '@/app/components/sections/CTASection'
import { PageHero } from '@/app/components/sections/PageHero'
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
      <PageHero
        eyebrow="Portfolio"
        title="Our Work"
        subtitle="Dock equipment installations, industrial door systems, and facility projects across DFW and Omaha-Council Bluffs."
        image="https://metaforgeis.com/wp-content/uploads/2025/07/IMG_4117-1920x1080.jpeg"
        imageAlt="MetaForge dock installation project"
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImageGallery images={images} />
        </div>
      </section>

      <CTASection />
    </>
  )
}
