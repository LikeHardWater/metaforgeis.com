'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { Save, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import type { ContactData } from '@/src/types'

const SECTION = 'contact'

const FIELDS: { key: keyof ContactData; label: string }[] = [
  { key: 'headline', label: 'Page Headline' },
  { key: 'subheadline', label: 'Subheadline' },
  { key: 'phone', label: 'Main Phone' },
  { key: 'emergencyPhone', label: 'Emergency Phone (display)' },
  { key: 'emergencyPhoneLink', label: 'Emergency Phone (tel: link)' },
  { key: 'email', label: 'Email' },
  { key: 'formDestinationEmail', label: 'Form Destination Email' },
  { key: 'hours', label: 'Office Hours' },
]

export default function ContactEditorPage() {
  const [data, setData] = useState<ContactData | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => setData(d))
  }, [])

  const update = (key: keyof ContactData, val: string) => {
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

  if (!data) return <AdminLayout><div className="text-gray-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-white">Contact Info</h1>
            <p className="text-gray-400 text-sm">Phone numbers, email, hours, form routing</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/contact" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold text-sm flex items-center gap-1 min-h-[44px]">
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

        <div className="bg-dark-secondary border border-dark-tertiary rounded-lg p-5 flex flex-col gap-4">
          {FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1">{label}</label>
              <input type="text" value={String(data[key] ?? '')} onChange={(e) => update(key, e.target.value)}
                className="w-full bg-dark-bg border border-dark-tertiary focus:border-gold rounded px-3 py-2 text-white text-sm focus:outline-none min-h-[44px]" />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
