'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import type { Testimonial } from '@/src/types'

interface TestimonialSectionProps {
  testimonials: Testimonial[]
}

export function TestimonialSection({ testimonials }: TestimonialSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">What Our Clients Say</h2>
        </div>

        {!testimonials || testimonials.length === 0 ? (
          <div className="text-center py-12 border border-dark-tertiary rounded-lg bg-dark-secondary">
            <Quote className="w-10 h-10 text-gold/30 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-400 text-lg font-medium">
              Testimonials coming soon — we let our work speak for itself.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Check out our project gallery to see the work in action.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="bg-dark-secondary border border-dark-tertiary rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Quote className="w-8 h-8 text-gold/40 mb-4" aria-hidden="true" />
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-gold text-xs">{t.title}</p>
                  <p className="text-gray-500 text-xs">{t.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
