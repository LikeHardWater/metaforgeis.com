export interface Service {
  name: string
  slug: string
  shortDescription: string
  description: string
  bullets: string[]
  image: string
  brands: string[]
}

export interface GalleryImage {
  url: string
  alt: string
}

export interface Testimonial {
  quote: string
  name: string
  company: string
  title: string
}

export interface BrandCategory {
  name: string
  brands: string[]
}

export interface BrandsData {
  categories: BrandCategory[]
}

export interface Location {
  id: string
  name: string
  region: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  salesContact: string
  salesPhone: string
  description: string
  serviceArea: string
}

export interface HeroData {
  headline: string
  subheadline: string
  cta1Text: string
  cta1Link: string
  cta2Text: string
  cta2Link: string
  backgroundImage: string
}

export interface AboutData {
  headline: string
  body: string
  values: { title: string; description: string }[]
}

export interface TeamMember {
  name: string
  title: string
  email?: string
  phone?: string
}

export interface ContactData {
  headline: string
  subheadline: string
  phone: string
  emergencyPhone: string
  emergencyPhoneLink: string
  email: string
  formDestinationEmail: string
  hours: string
}

export interface SeoData {
  [route: string]: {
    title: string
    description: string
  }
}
