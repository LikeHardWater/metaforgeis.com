import type { Metadata } from 'next'
import { ServicePageTemplate } from '@/app/components/sections/ServicePageTemplate'
import servicesData from '@/src/data/content/services.json'
import seoData from '@/src/data/content/seo.json'
import type { Service, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/services/planned-maintenance']?.title,
  description: seo['/services/planned-maintenance']?.description,
}

export default function PlannedMaintenancePage() {
  const service = (servicesData as Service[]).find((s) => s.slug === 'planned-maintenance')!
  return <ServicePageTemplate service={service} />
}
