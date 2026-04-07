'use client'

import { motion } from 'framer-motion'
import type { BrandsData } from '@/src/types'

interface BrandGridProps {
  data: BrandsData
}

export function BrandGrid({ data }: BrandGridProps) {
  if (!data?.categories || data.categories.length === 0) return null

  const allBrands = data.categories.flatMap((cat) => cat.brands)
  if (allBrands.length === 0) return null

  return (
    <section className="py-16 sm:py-20 bg-dark-secondary border-y border-dark-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Our Brand Ecosystem</h2>
          <p className="text-gray-400">
            We work with the industry&apos;s leading manufacturers — so you get the right equipment, not just what&apos;s on the shelf.
          </p>
        </div>

        {data.categories.map((category) => (
          <div key={category.name} className="mb-8 last:mb-0">
            <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4 text-center">
              {category.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {category.brands.map((brand, i) => (
                <motion.div
                  key={brand}
                  className="bg-dark-bg border border-dark-tertiary rounded-md px-3 py-3 flex items-center justify-center text-center hover:border-gold/40 transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <span className="text-gray-300 text-sm font-medium">{brand}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
