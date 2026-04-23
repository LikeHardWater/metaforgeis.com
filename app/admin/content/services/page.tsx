'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { ImagePreviewInput } from '@/app/components/admin/ImagePreviewInput'
import { Save, CheckCircle, AlertCircle, ExternalLink, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Service } from '@/src/types'

const SECTION = 'services'

export default function ServicesEditorPage() {
  const [items, setItems] = useState<Service[]>([])
  const [expanded, setExpanded] = useState<number | null>(0)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => { setItems(Array.isArray(d) ? d : []); setLoaded(true) })
  }, [])

  const updateField = (i: number, key: keyof Service, val: string | string[]) => {
    setItems((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
    setDirty(true)
  }

  const updateBullet = (si: number, bi: number, val: string) => {
    setItems((prev) => prev.map((s, idx) => idx === si ? { ...s, bullets: s.bullets.map((b, bIdx) => bIdx === bi ? val : b) } : s))
    setDirty(true)
  }

  const addBullet = (si: number) => {
    setItems((prev) => prev.map((s, idx) => idx === si ? { ...s, bullets: [...s.bullets, ''] } : s))
    setDirty(true)
  }

  const removeBullet = (si: number, bi: number) => {
    setItems((prev) => prev.map((s, idx) => idx === si ? { ...s, bullets: s.bullets.filter((_, bIdx) => bIdx !== bi) } : s))
    setDirty(true)
  }

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
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">Services</h1>
            <p className="text-gray-500 text-sm">Edit each service listing</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/services" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold text-sm flex items-center gap-1 min-h-[44px]">
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

        <div className="flex flex-col gap-3">
          {items.map((service, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100/50 transition-colors min-h-[44px]"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span className="text-gray-900 font-bold text-sm">{service.name || `Service #${i + 1}`}</span>
                {expanded === i ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {expanded === i && (
                <div className="px-5 pb-5 flex flex-col gap-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input type="text" value={service.name} onChange={(e) => updateField(i, 'name', e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none min-h-[44px]" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL Slug</label>
                      <input type="text" value={service.slug} onChange={(e) => updateField(i, 'slug', e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none min-h-[44px]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Short Description (card)</label>
                    <textarea value={service.shortDescription} onChange={(e) => updateField(i, 'shortDescription', e.target.value)} rows={2}
                      className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none resize-y" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Full Description (page)</label>
                    <textarea value={service.description} onChange={(e) => updateField(i, 'description', e.target.value)} rows={3}
                      className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none resize-y" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Service Bullets</label>
                    {service.bullets.map((b, bi) => (
                      <div key={bi} className="flex items-center gap-2 mb-2">
                        <input type="text" value={b} onChange={(e) => updateBullet(i, bi, e.target.value)}
                          className="flex-1 bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none min-h-[44px]" />
                        <button onClick={() => removeBullet(i, bi)} className="text-gray-500 hover:text-red-600 transition-colors p-1 min-h-[44px] flex items-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addBullet(i)} className="flex items-center gap-1 text-gold hover:text-gold-light text-xs font-semibold transition-colors min-h-[44px]">
                      <Plus className="w-3 h-3" /> Add Bullet
                    </button>
                  </div>

                  <ImagePreviewInput
                    id={`service-image-${i}`}
                    label="Service Image URL"
                    value={service.image}
                    onChange={(val) => updateField(i, 'image', val)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
