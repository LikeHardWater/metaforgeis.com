import { Phone, Mail, MapPin, User } from 'lucide-react'
import type { Location } from '@/src/types'

interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <article className="bg-dark-secondary border border-dark-tertiary rounded-lg overflow-hidden">
      {/* Map placeholder */}
      <div className="h-48 bg-dark-tertiary flex items-center justify-center relative">
        <div className="text-center">
          <MapPin className="w-10 h-10 text-gold mx-auto mb-2" aria-hidden="true" />
          <p className="text-gray-400 text-sm">{location.city}, {location.state}</p>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" aria-hidden="true" />
      </div>

      <div className="p-6">
        <div className="mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">{location.region}</span>
        </div>
        <h3 className="text-white font-black text-xl mb-4">{location.name}</h3>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex gap-3">
            <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-gray-300">
              <p>{location.address}</p>
              <p>{location.city}, {location.state} {location.zip}</p>
            </div>
          </div>

          <a href={`tel:${location.phone.replace(/\D/g, '')}`} className="flex items-center gap-3 text-gray-300 hover:text-gold transition-colors min-h-[44px]">
            <Phone className="w-4 h-4 text-gold flex-shrink-0" aria-hidden="true" />
            {location.phone}
          </a>

          <a href={`mailto:${location.email}`} className="flex items-center gap-3 text-gray-300 hover:text-gold transition-colors min-h-[44px]">
            <Mail className="w-4 h-4 text-gold flex-shrink-0" aria-hidden="true" />
            {location.email}
          </a>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-gray-300">
              <p className="font-medium text-white">Sales Contact</p>
              <a href={`mailto:${location.salesContact}`} className="hover:text-gold transition-colors block">
                {location.salesContact}
              </a>
              <a href={`tel:${location.salesPhone.replace(/\D/g, '')}`} className="hover:text-gold transition-colors block">
                {location.salesPhone}
              </a>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-sm mt-5 pt-5 border-t border-dark-tertiary leading-relaxed">
          {location.description}
        </p>
      </div>
    </article>
  )
}
