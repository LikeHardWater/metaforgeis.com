'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { Save, CheckCircle, AlertCircle, ExternalLink, Loader2, Plus, Trash2, ImageOff } from 'lucide-react'
import type { GalleryImage } from '@/src/types'

const SECTION = 'gallery'

export default function GalleryEditorPage() {
  const [items, setItems] = useState<GalleryImage[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => { setItems(Array.isArray(d) ? d : []); setLoaded(true) })
  }, [])

  const update = (i: number, key: keyof GalleryImage, val: string) => {
    setItems((prev) => prev.map((img, idx) => idx === i ? { ...img, [key]: val } : img))
    setDirty(true)
  }

  const add = () => { setItems((p) => [...p, { url: '', alt: '' }]); setDirty(true) }
  const remove = (i: number) => { setItems((p) => p.filter((_, idx) => idx !== i)); setDirty(true) }

  const save = async () => {
    setStatus('saving')
    const res = await fetch(`/api/admin/content/${SECTION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    })
    setStatus(res.ok ? 'saved' : 'error')
    if (res.ok) setDirty(false)
    setTimeout(() => setStatus('idle'), 3000)
  }

  if (!loaded) return <AdminLayout><div className="text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">Gallery</h1>
            <p className="text-gray-500 text-sm">Project photos — shown on Our Work page</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/our-work" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold text-sm flex items-center gap-1 min-h-[44px]">
              <ExternalLink className="w-4 h-4" /> Preview
            </a>
            <button onClick={save} disabled={status === 'saving' || !dirty}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark disabled:opacity-50 text-dark-bg font-bold px-5 py-2.5 rounded transition-colors text-sm min-h-[44px]">
              {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {status === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {status === 'saved' && <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-800 rounded p-3 mb-6"><CheckCircle className="w-4 h-4" /> Saved.</div>}
        {status === 'error' && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3 mb-6"><AlertCircle className="w-4 h-4" /> Save failed.</div>}

        <p className="text-gray-600 text-xs mb-4">
          Note: Drag-to-reorder will be available in a future update. To reorder, delete and re-add images in the desired sequence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {items.map((img, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-xs">Image #{i + 1}</span>
                <button onClick={() => remove(i)} className="text-gray-500 hover:text-red-600 transition-colors p-1 min-h-[44px] flex items-center" aria-label="Remove image">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
                {img.url && !imgErrors.has(i) ? (
                  <Image src={img.url} alt={img.alt || 'Gallery image'} fill className="object-cover"
                    onError={() => setImgErrors((s) => new Set(s).add(i))} unoptimized={img.url.startsWith('http')} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input type="url" value={img.url} placeholder="Image URL"
                  onChange={(e) => { setImgErrors((s) => { const n = new Set(s); n.delete(i); return n }); update(i, 'url', e.target.value) }}
                  className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-xs focus:outline-none min-h-[44px]" />
                <input type="text" value={img.alt} placeholder="Alt text (describe the image)"
                  onChange={(e) => update(i, 'alt', e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-xs focus:outline-none min-h-[44px]" />
              </div>
            </div>
          ))}
        </div>

        <button onClick={add} className="flex items-center gap-2 text-gold hover:text-gold-light text-sm font-semibold transition-colors min-h-[44px]">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>
    </AdminLayout>
  )
}
