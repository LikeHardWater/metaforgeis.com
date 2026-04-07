'use client'

import { useEffect, useState } from 'react'

/**
 * Renders children only on the client side (no SSR).
 * Used to prevent next-auth's useSession from hanging during build-time static generation.
 */
export function NoSSR({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        {fallback ?? (
          <div className="text-gray-500 text-sm">Loading...</div>
        )}
      </div>
    )
  }

  return <>{children}</>
}
