'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { ImagePreviewInput } from '@/app/components/admin/ImagePreviewInput'
import { Save, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import type { HeroData } from '@/src/types'

const SECTION = 'hero'

export default function HeroEditorPage() {
  const [data, setData] = useState<HeroData | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => setData(d))
  }, [])

  const update = (key: keyof HeroData, val: string) => {
    setData((prev) => prev ? { ...prev, [key]: val } : prev)
    setDirty(true)
  }

  const save = async () => {
    setStatus('saving')
    const res = await fetch(`/api/admin/content/${SECTION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setStatus(res.ok ? 'saved' : 'error')
    if (res.ok) setDirty(false)
    setTimeout(() => setStatus('idle'), 3000)
  }

  if (!data) return <AdminLayout><div className="text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">Hero Section</h1>
            <p className="text-gray-500 text-sm">Homepage above-the-fold content</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold text-sm flex items-center gap-1 min-h-[44px]">
              <ExternalLink className="w-4 h-4" /> Preview
            </a>
            <button
              onClick={save}
              disabled={status === 'saving' || !dirty}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark disabled:opacity-50 text-dark-bg font-bold px-5 py-2.5 rounded transition-colors text-sm min-h-[44px]"
            >
              {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {status === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {status === 'saved' && (
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-800 rounded p-3 mb-6">
            <CheckCircle className="w-4 h-4" /> Saved successfully.
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3 mb-6">
            <AlertCircle className="w-4 h-4" /> Save failed. Check server logs.
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Headline</label>
            <input type="text" value={data.headline} onChange={(e) => update('headline', e.target.value)}
              className="w-full bg-white border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 focus:outline-none transition-colors min-h-[44px] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Subheadline</label>
            <textarea value={data.subheadline} onChange={(e) => update('subheadline', e.target.value)} rows={2}
              className="w-full bg-white border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 focus:outline-none transition-colors resize-y text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CTA 1 Text</label>
              <input type="text" value={data.cta1Text} onChange={(e) => update('cta1Text', e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 focus:outline-none transition-colors min-h-[44px] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CTA 1 Link</label>
              <input type="text" value={data.cta1Link} onChange={(e) => update('cta1Link', e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 focus:outline-none transition-colors min-h-[44px] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CTA 2 Text</label>
              <input type="text" value={data.cta2Text} onChange={(e) => update('cta2Text', e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 focus:outline-none transition-colors min-h-[44px] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CTA 2 Link</label>
              <input type="text" value={data.cta2Link} onChange={(e) => update('cta2Link', e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 focus:outline-none transition-colors min-h-[44px] text-sm" />
            </div>
          </div>
          <ImagePreviewInput
            id="backgroundImage"
            label="Background Image URL"
            value={data.backgroundImage}
            onChange={(val) => update('backgroundImage', val)}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
