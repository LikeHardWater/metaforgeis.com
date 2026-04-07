'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import type { GalleryImage } from '@/src/types'

interface ImageGalleryProps {
  images: GalleryImage[]
  limit?: number
}

export function ImageGallery({ images, limit }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [errorSet, setErrorSet] = useState<Set<number>>(new Set())

  const displayImages = limit ? images.slice(0, limit) : images

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-16 border border-dark-tertiary rounded-lg bg-dark-secondary">
        <ImageOff className="w-12 h-12 text-gray-600 mx-auto mb-4" aria-hidden="true" />
        <p className="text-gray-400">Gallery images coming soon.</p>
      </div>
    )
  }

  const closeLightbox = () => setLightboxIndex(null)
  const prev = () => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : 0))
  const next = () => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : 0))

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayImages.map((img, i) => (
          <button
            key={i}
            className="relative aspect-video bg-dark-tertiary rounded-lg overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
            onClick={() => setLightboxIndex(i)}
            aria-label={`View: ${img.alt}`}
          >
            {errorSet.has(i) ? (
              <div className="w-full h-full bg-dark-tertiary flex items-center justify-center">
                <ImageOff className="w-8 h-8 text-gray-600" aria-hidden="true" />
              </div>
            ) : (
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onError={() => setErrorSet((s) => new Set(s).add(i))}
              />
            )}
            <div className="absolute inset-0 bg-dark-bg/0 group-hover:bg-dark-bg/30 transition-colors duration-300" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={prev}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={next}
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-5xl aspect-video">
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <p className="absolute bottom-6 left-0 right-0 text-center text-gray-400 text-sm px-4">
            {images[lightboxIndex].alt} ({lightboxIndex + 1} / {images.length})
          </p>
        </div>
      )}
    </>
  )
}
