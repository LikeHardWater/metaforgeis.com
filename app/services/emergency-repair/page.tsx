import type { Metadata } from 'next'
import { ServicePageTemplate } from '@/app/components/sections/ServicePageTemplate'
import servicesData from '@/src/data/content/services.json'
import seoData from '@/src/data/content/seo.json'
import type { Service, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/services/emergency-repair']?.title,
  description: seo['/services/emergency-repair']?.description,
}

export default function EmergencyRepairPage() {
  const service = (servicesData as Service[]).find((s) => s.slug === 'emergency-repair')!
  return <ServicePageTemplate service={service} />
}
