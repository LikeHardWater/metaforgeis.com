'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { Save, CheckCircle, AlertCircle, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react'
import type { TeamMember } from '@/src/types'

const SECTION = 'team'

const empty = (): TeamMember => ({ name: '', title: '', email: '', phone: '' })

export default function TeamEditorPage() {
  const [items, setItems] = useState<TeamMember[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => { setItems(Array.isArray(d) ? d : []); setLoaded(true) })
  }, [])

  const update = (i: number, key: keyof TeamMember, val: string) => {
    setItems((prev) => prev.map((t, idx) => idx === i ? { ...t, [key]: val } : t))
    setDirty(true)
  }

  const add = () => { setItems((p) => [...p, empty()]); setDirty(true) }
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
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">Team</h1>
            <p className="text-gray-500 text-sm">Leadership and key contacts</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/about" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold text-sm flex items-center gap-1 min-h-[44px]">
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

        <div className="flex flex-col gap-4 mb-4">
          {items.map((member, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gold text-xs uppercase tracking-widest font-bold">Member #{i + 1}</span>
                <button onClick={() => remove(i)} className="text-gray-500 hover:text-red-600 transition-colors p-1 min-h-[44px] flex items-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([['name', 'Full Name'], ['title', 'Title'], ['email', 'Email'], ['phone', 'Phone']] as [keyof TeamMember, string][]).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input type="text" value={String(member[key] ?? '')} onChange={(e) => update(i, key, e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-gold rounded px-3 py-2 text-gray-900 text-sm focus:outline-none min-h-[44px]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={add} className="flex items-center gap-2 text-gold hover:text-gold-light text-sm font-semibold transition-colors min-h-[44px]">
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>
    </AdminLayout>
  )
}
