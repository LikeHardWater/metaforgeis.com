'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useScrollBanner } from '@/src/hooks/useScrollBanner'
import { Phone } from 'lucide-react'

export function EmergencyBanner() {
  const { isVisible } = useScrollBanner()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="emergency-banner"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <a
            href="tel:8336382767"
            className="flex items-center justify-center w-full bg-emergency text-white font-bold py-2 px-4 cursor-pointer hover:bg-orange-700 transition-colors"
            aria-label="Emergency Line: Call 833-META-SOS"
          >
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm md:text-base">
              Emergency? Click to Call:{' '}
              <span className="underline underline-offset-2">833-META-SOS</span>
            </span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
