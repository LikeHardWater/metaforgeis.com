import { Phone, Mail, MapPin, User } from 'lucide-react'
import type { Location } from '@/src/types'

const MAP_EMBEDS: Record<string, string> = {
  dfw: 'https://www.openstreetmap.org/export/embed.html?bbox=-97.0770%2C32.9998%2C-97.0470%2C33.0298&layer=mapnik&marker=33.0148%2C-97.0620',
  omaha: 'https://www.openstreetmap.org/export/embed.html?bbox=-95.8662%2C41.3447%2C-95.8362%2C41.3747&layer=mapnik&marker=41.3597%2C-95.8512',
}

interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <article className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* Map */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {MAP_EMBEDS[location.id] ? (
          <iframe
            src={MAP_EMBEDS[location.id]}
            className="w-full h-full border-0"
            title={`Map of ${location.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-gold mx-auto mb-2" aria-hidden="true" />
              <p className="text-gray-500 text-sm">{location.city}, {location.state}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">{location.region}</span>
        </div>
        <h3 className="text-gray-900 font-black text-xl mb-4">{location.name}</h3>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex gap-3">
            <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-gray-600">
              <p>{location.address}</p>
              <p>{location.city}, {location.state} {location.zip}</p>
            </div>
          </div>

          <a href={`tel:${location.phone.replace(/\D/g, '')}`} className="flex items-center gap-3 text-gray-600 hover:text-gold transition-colors min-h-[44px]">
            <Phone className="w-4 h-4 text-gold flex-shrink-0" aria-hidden="true" />
            {location.phone}
          </a>

          <a href={`mailto:${location.email}`} className="flex items-center gap-3 text-gray-600 hover:text-gold transition-colors min-h-[44px]">
            <Mail className="w-4 h-4 text-gold flex-shrink-0" aria-hidden="true" />
            {location.email}
          </a>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">Sales Contact</p>
              <a href={`mailto:${location.salesContact}`} className="hover:text-gold transition-colors block">
                {location.salesContact}
              </a>
              <a href={`tel:${location.salesPhone.replace(/\D/g, '')}`} className="hover:text-gold transition-colors block">
                {location.salesPhone}
              </a>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-5 pt-5 border-t border-gray-200 leading-relaxed">
          {location.description}
        </p>
      </div>
    </article>
  )
}
