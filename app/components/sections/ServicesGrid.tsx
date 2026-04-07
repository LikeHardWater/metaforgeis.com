import { ServiceCard } from '@/app/components/ui/ServiceCard'
import type { Service } from '@/src/types'

interface ServicesGridProps {
  services: Service[]
  title?: string
  subtitle?: string
}

export function ServicesGrid({ services, title, subtitle }: ServicesGridProps) {
  if (!services || services.length === 0) return null

  return (
    <section className="py-16 sm:py-20 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.slug + service.name} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
