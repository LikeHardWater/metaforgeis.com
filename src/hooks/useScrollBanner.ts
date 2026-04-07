'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Returns true when at top of page (< 100px scroll), false when scrolled down.
 * Debounces the scroll listener for performance.
 */
export function useScrollBanner() {
  const [isVisible, setIsVisible] = useState(true)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    setIsVisible(scrollY < 100)
  }, [])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const debouncedScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 50)
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true })
    handleScroll() // run on mount

    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(timeoutId)
    }
  }, [handleScroll])

  return { isVisible }
}
