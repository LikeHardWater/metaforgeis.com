'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { SeoData } from '@/src/types'

const SECTION = 'seo'

const ROUTES = [
  { route: '/', label: 'Homepage' },
  { route: '/services', label: 'Services' },
  { route: '/services/dock-equipment', label: 'Dock Equipment' },
  { route: '/services/industrial-doors', label: 'Industrial Doors' },
  { route: '/services/emergency-repair', label: 'Emergency Repair' },
  { route: '/services/planned-maintenance', label: 'Planned Maintenance' },
  { route: '/services/parts-supply', label: 'Parts Supply' },
  { route: '/our-work', label: 'Our Work' },
  { route: '/locations', label: 'Locations' },
  { route: '/about', label: 'About' },
  { route: '/contact', label: 'Contact' },
]

export default function SeoEditorPage() {
  const [data, setData] = useState<SeoData | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => setData(d))
  }, [])

  const update = (route: string, key: 'title' | 'description', val: string) => {
    setData((prev) => prev ? { ...prev, [route]: { ...prev[route], [key]: val } } : prev)
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
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">SEO</h1>
            <p className="text-gray-500 text-sm">Page titles and meta descriptions per route</p>
          </div>
          <button onClick={save} disabled={status === 'saving' || !dirty}
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark disabled:opacity-50 text-dark-bg font-bold px-5 py-2.5 rounded transition-colors text-sm min-h-[44px]">
            {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {status === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {status === 'saved' && <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-800 rounded p-3 mb-6"><CheckCircle className="w-4 h-4" /> Saved.</div>}
        {status === 'error' && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3 mb-6"><AlertCircle className="w-4 h-4" /> Save failed.</div>}

        <div className="flex flex-col gap-4">
          {ROUTES.map(({ route, label }) => (
            <div key={route} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">{label}</span>
                <span className="text-gray-600 text-xs font-mono">{route}</span>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Page Title <span className="text-gray-600">({(data[route]?.title ?? '').length}/70 chars)</span>
                  </label>
                  <input type="text" value={data[route]?.title ?? ''}
                    onChange={(e) => update(route, 'title', e.target.value)}
                    maxLength={80}
                    className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Meta Description <span className="text-gray-600">({(data[route]?.description ?? '').length}/160 chars)</span>
                  </label>
                  <textarea value={data[route]?.description ?? ''}
                    onChange={(e) => update(route, 'description', e.target.value)}
                    rows={2} maxLength={200}
                    className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none resize-y" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
