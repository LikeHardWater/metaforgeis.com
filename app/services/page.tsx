import type { Metadata } from 'next'
import { ServicesGrid } from '@/app/components/sections/ServicesGrid'
import { CTASection } from '@/app/components/sections/CTASection'
import { PageHero } from '@/app/components/sections/PageHero'
import servicesData from '@/src/data/content/services.json'
import seoData from '@/src/data/content/seo.json'
import type { Service, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/services']?.title,
  description: seo['/services']?.description,
}

export default function ServicesPage() {
  const services = servicesData as Service[]

  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Industrial Dock & Door Services"
        subtitle="End-to-end dock and door services for commercial and industrial facilities — from first installation to 24/7 emergency repair."
        image="https://metaforgeis.com/wp-content/uploads/2025/07/IMG_2248-1920x1080.jpeg"
        imageAlt="MetaForge dock installation"
      />

      <ServicesGrid services={services} />
      <CTASection />
    </>
  )
}
