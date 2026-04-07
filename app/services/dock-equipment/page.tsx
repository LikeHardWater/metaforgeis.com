import type { Metadata } from 'next'
import { ServicePageTemplate } from '@/app/components/sections/ServicePageTemplate'
import servicesData from '@/src/data/content/services.json'
import brandsData from '@/src/data/content/brands.json'
import seoData from '@/src/data/content/seo.json'
import type { Service, BrandsData, SeoData } from '@/src/types'

const seo = seoData as SeoData

export const metadata: Metadata = {
  title: seo['/services/dock-equipment']?.title,
  description: seo['/services/dock-equipment']?.description,
}

export default function DockEquipmentPage() {
  const service = (servicesData as Service[]).find((s) => s.slug === 'dock-equipment')!
  return <ServicePageTemplate service={service} allBrands={brandsData as BrandsData} />
}
