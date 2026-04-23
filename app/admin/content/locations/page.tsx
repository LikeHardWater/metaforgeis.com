'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { Save, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import type { Location } from '@/src/types'

const SECTION = 'locations'

const FIELDS: { key: keyof Location; label: string; multiline?: boolean }[] = [
  { key: 'name', label: 'Location Name' },
  { key: 'region', label: 'Region' },
  { key: 'address', label: 'Street Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'ZIP' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'salesContact', label: 'Sales Email' },
  { key: 'salesPhone', label: 'Sales Phone' },
  { key: 'description', label: 'Description', multiline: true },
  { key: 'serviceArea', label: 'Service Area', multiline: true },
]

export default function LocationsEditorPage() {
  const [items, setItems] = useState<Location[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => { setItems(Array.isArray(d) ? d : []); setLoaded(true) })
  }, [])

  const update = (i: number, key: keyof Location, val: string) => {
    setItems((prev) => prev.map((loc, idx) => idx === i ? { ...loc, [key]: val } : loc))
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
            <h1 className="text-xl font-black text-gray-900">Locations</h1>
            <p className="text-gray-500 text-sm">DFW and Omaha location information</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/locations" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold text-sm flex items-center gap-1 min-h-[44px]">
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

        <div className="flex flex-col gap-8">
          {items.map((loc, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h2 className="text-gold font-bold text-sm uppercase tracking-widest mb-4">{loc.name || `Location #${i + 1}`}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map(({ key, label, multiline }) => (
                  <div key={key} className={multiline ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    {multiline ? (
                      <textarea value={String(loc[key] ?? '')} onChange={(e) => update(i, key, e.target.value)} rows={2}
                        className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none resize-y" />
                    ) : (
                      <input type="text" value={String(loc[key] ?? '')} onChange={(e) => update(i, key, e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none min-h-[44px]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
