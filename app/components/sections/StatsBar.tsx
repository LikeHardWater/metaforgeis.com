'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin, Zap, Shield } from 'lucide-react'

const stats = [
  { icon: Clock, number: '30+', label: 'Years Experience' },
  { icon: MapPin, number: '2', label: 'Regional Locations' },
  { icon: Zap, number: '24/7', label: 'Emergency Response' },
  { icon: Shield, number: 'Zero', label: 'Excuses Policy' },
]

export function StatsBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-200 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-gold" aria-hidden="true" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{stat.number}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
