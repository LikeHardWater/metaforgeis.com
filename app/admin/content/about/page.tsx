'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { Save, CheckCircle, AlertCircle, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react'
import type { AboutData } from '@/src/types'

const SECTION = 'about'

export default function AboutEditorPage() {
  const [data, setData] = useState<AboutData | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => setData(d))
  }, [])

  const set = (key: keyof AboutData, val: string) => {
    setData((prev) => prev ? { ...prev, [key]: val } : prev)
    setDirty(true)
  }

  const updateValue = (i: number, key: 'title' | 'description', val: string) => {
    setData((prev) => {
      if (!prev) return prev
      return { ...prev, values: prev.values.map((v, idx) => idx === i ? { ...v, [key]: val } : v) }
    })
    setDirty(true)
  }

  const addValue = () => {
    setData((prev) => prev ? { ...prev, values: [...prev.values, { title: '', description: '' }] } : prev)
    setDirty(true)
  }

  const removeValue = (i: number) => {
    setData((prev) => prev ? { ...prev, values: prev.values.filter((_, idx) => idx !== i) } : prev)
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

  if (!data) return <AdminLayout><div className="text-gray-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-white">About Page</h1>
            <p className="text-gray-400 text-sm">Company story, headline, and core values</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/about" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold text-sm flex items-center gap-1 min-h-[44px]">
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
        {status === 'error' && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3 mb-6"><AlertCircle className="w-4 h-4" /> Save failed.</div>}

        <div className="bg-dark-secondary border border-dark-tertiary rounded-lg p-5 flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Headline</label>
            <input type="text" value={data.headline} onChange={(e) => set('headline', e.target.value)}
              className="w-full bg-dark-bg border border-dark-tertiary focus:border-gold rounded px-3 py-2 text-white text-sm focus:outline-none min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Body Copy</label>
            <textarea value={data.body} onChange={(e) => set('body', e.target.value)} rows={5}
              className="w-full bg-dark-bg border border-dark-tertiary focus:border-gold rounded px-3 py-2 text-white text-sm focus:outline-none resize-y" />
          </div>
        </div>

        <h2 className="text-white font-bold text-sm mb-3">Core Values</h2>
        <div className="flex flex-col gap-3 mb-4">
          {data.values.map((v, i) => (
            <div key={i} className="bg-dark-secondary border border-dark-tertiary rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gold text-xs uppercase tracking-widest font-bold">Value #{i + 1}</span>
                <button onClick={() => removeValue(i)} className="text-gray-500 hover:text-red-400 transition-colors p-1 min-h-[44px] flex items-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <input type="text" value={v.title} placeholder="Value title" onChange={(e) => updateValue(i, 'title', e.target.value)}
                  className="w-full bg-dark-bg border border-dark-tertiary focus:border-gold rounded px-3 py-2 text-white text-sm focus:outline-none min-h-[44px]" />
                <textarea value={v.description} placeholder="Description" onChange={(e) => updateValue(i, 'description', e.target.value)} rows={2}
                  className="w-full bg-dark-bg border border-dark-tertiary focus:border-gold rounded px-3 py-2 text-white text-sm focus:outline-none resize-y" />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addValue} className="flex items-center gap-2 text-gold hover:text-gold-light text-sm font-semibold transition-colors min-h-[44px]">
          <Plus className="w-4 h-4" /> Add Value
        </button>
      </div>
    </AdminLayout>
  )
}
