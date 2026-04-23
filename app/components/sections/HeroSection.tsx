'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'
import type { HeroData } from '@/src/types'

interface HeroSectionProps {
  data: HeroData
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="relative min-h-[60vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-gray-100">
      {/* Background image */}
      {data.backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={data.backgroundImage}
            alt="MetaForge Industrial Systems facility"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center lg:text-left">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-block bg-gold/20 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-6">
              Industrial Dock &amp; Door Specialists
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {data.headline}
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {data.subheadline}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href={data.cta1Link}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold px-8 py-4 rounded transition-colors text-base min-h-[44px]"
            >
              {data.cta1Text}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href={data.cta2Link}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emergency hover:bg-orange-700 text-white font-bold px-8 py-4 rounded transition-colors text-base min-h-[44px]"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {data.cta2Text}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
