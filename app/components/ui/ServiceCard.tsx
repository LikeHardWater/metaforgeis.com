'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Service } from '@/src/types'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const href = `/services/${service.slug}`

  return (
    <motion.article
      className="group bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:border-gold/40 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-secondary/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-gray-900 font-bold text-lg mb-2 group-hover:text-gold transition-colors">
          {service.name}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
          {service.shortDescription}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-semibold text-sm transition-colors min-h-[44px]"
        >
          Learn More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  )
}
