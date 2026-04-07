'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { Save, CheckCircle, AlertCircle, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react'
import type { BrandsData } from '@/src/types'

const SECTION = 'brands'

export default function BrandsEditorPage() {
  const [data, setData] = useState<BrandsData | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/content/${SECTION}`).then((r) => r.json()).then((d) => setData(d))
  }, [])

  const updateBrand = (catIdx: number, brandIdx: number, val: string) => {
    setData((prev) => {
      if (!prev) return prev
      const cats = prev.categories.map((c, ci) =>
        ci === catIdx ? { ...c, brands: c.brands.map((b, bi) => bi === brandIdx ? val : b) } : c
      )
      return { categories: cats }
    })
    setDirty(true)
  }

  const addBrand = (catIdx: number) => {
    setData((prev) => {
      if (!prev) return prev
      const cats = prev.categories.map((c, ci) => ci === catIdx ? { ...c, brands: [...c.brands, ''] } : c)
      return { categories: cats }
    })
    setDirty(true)
  }

  const removeBrand = (catIdx: number, brandIdx: number) => {
    setData((prev) => {
      if (!prev) return prev
      const cats = prev.categories.map((c, ci) => ci === catIdx ? { ...c, brands: c.brands.filter((_, bi) => bi !== brandIdx) } : c)
      return { categories: cats }
    })
    setDirty(true)
  }

  const addCategory = () => {
    setData((prev) => prev ? { categories: [...prev.categories, { name: 'New Category', brands: [] }] } : prev)
    setDirty(true)
  }

  const removeCategory = (catIdx: number) => {
    setData((prev) => prev ? { categories: prev.categories.filter((_, ci) => ci !== catIdx) } : prev)
    setDirty(true)
  }

  const updateCategoryName = (catIdx: number, val: string) => {
    setData((prev) => {
      if (!prev) return prev
      const cats = prev.categories.map((c, ci) => ci === catIdx ? { ...c, name: val } : c)
      return { categories: cats }
    })
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
            <h1 className="text-xl font-black text-white">Brands</h1>
            <p className="text-gray-400 text-sm">Brand ecosystem displayed by category</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/services/dock-equipment" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold text-sm flex items-center gap-1 min-h-[44px]">
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

        <div className="flex flex-col gap-6">
          {data.categories.map((cat, catIdx) => (
            <div key={catIdx} className="bg-dark-secondary border border-dark-tertiary rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <input type="text" value={cat.name} onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                  className="bg-transparent border-b border-dark-tertiary focus:border-gold text-white font-bold text-sm focus:outline-none pb-1 w-full max-w-xs" />
                <button onClick={() => removeCategory(catIdx)} className="text-gray-500 hover:text-red-400 transition-colors p-1 ml-3 min-h-[44px] flex items-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {cat.brands.map((brand, brandIdx) => (
                  <div key={brandIdx} className="flex items-center gap-1 bg-dark-bg border border-dark-tertiary rounded px-2 py-1">
                    <input type="text" value={brand} onChange={(e) => updateBrand(catIdx, brandIdx, e.target.value)}
                      className="bg-transparent text-white text-xs w-24 focus:outline-none" />
                    <button onClick={() => removeBrand(catIdx, brandIdx)} className="text-gray-500 hover:text-red-400 transition-colors" aria-label="Remove brand">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addBrand(catIdx)} className="flex items-center gap-1 text-gold hover:text-gold-light text-xs font-semibold transition-colors min-h-[44px]">
                <Plus className="w-3 h-3" /> Add Brand
              </button>
            </div>
          ))}
        </div>

        <button onClick={addCategory} className="flex items-center gap-2 text-gold hover:text-gold-light text-sm font-semibold transition-colors mt-4 min-h-[44px]">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>
    </AdminLayout>
  )
}
