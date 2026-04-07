'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'

interface ImagePreviewInputProps {
  id: string
  label: string
  value: string
  onChange: (val: string) => void
}

export function ImagePreviewInput({ id, label, value, onChange }: ImagePreviewInputProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        id={id}
        type="url"
        value={value}
        onChange={(e) => { setImgError(false); onChange(e.target.value) }}
        className="w-full bg-dark-bg border border-dark-tertiary focus:border-gold rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors min-h-[44px] text-sm"
        placeholder="https://... or /images/filename.jpg"
      />
      <p className="text-gray-600 text-xs mt-1">
        To use your own images, upload to <code className="text-gray-500">public/images/</code> and enter the filename, or paste any external URL.
      </p>
      {value && (
        <div className="mt-3 relative h-40 w-full max-w-xs bg-dark-tertiary rounded-lg overflow-hidden border border-dark-tertiary">
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="w-8 h-8 text-gray-600" />
            </div>
          ) : (
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-contain"
              onError={() => setImgError(true)}
              unoptimized={value.startsWith('http')}
            />
          )}
        </div>
      )}
    </div>
  )
}
