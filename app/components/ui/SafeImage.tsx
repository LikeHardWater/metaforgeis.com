'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackClassName?: string
}

/**
 * Wrapper around next/image that handles load errors gracefully.
 * Uses a client component so onError (event handler) is allowed.
 * Shows a dark placeholder div on error rather than a broken image icon.
 */
export function SafeImage({ fallbackClassName, className, alt, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`w-full h-full bg-dark-tertiary flex items-center justify-center ${fallbackClassName ?? ''}`}>
        <ImageOff className="w-8 h-8 text-gray-600" aria-hidden="true" />
      </div>
    )
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}
