'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Check, X, Loader2, Package, Wrench } from 'lucide-react'

type Product = {
  id: string
  name: string
  description: string | null
  sku: string | null
  unitPrice: string | number
  productType: string
  taxable: boolean
  category: string | null
  isActive: boolean
}

function TypeBadge({ productType }: { productType: string }) {
  return productType === 'SERVICE'
    ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200"><Wrench className="w-2.5 h-2.5" />Service</span>
    : <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"><Package className="w-2.5 h-2.5" />Product</span>
}

function TypeToggle({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [val, setVal] = useState(defaultValue)
  return (
    <div className="flex items-center gap-1 text-xs">
      <input type="hidden" name={name} value={val} />
      {(['PRODUCT', 'SERVICE'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setVal(t)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${val === t ? (t === 'SERVICE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700') : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          {t === 'PRODUCT' ? 'Product' : 'Service'}
        </button>
      ))}
    </div>
  )
}

export default function ProductsTable({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial)
  const [showNew, setShowNew] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/admin/products', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setProducts((prev) => [...prev, data])
      setShowNew(false)
    })
  }

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'PATCH', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setProducts((prev) => prev.map((p) => p.id === id ? data : p))
      setEditId(null)
    })
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('isActive', String(!isActive))
      const res = await fetch(`/api/admin/products/${id}`, { method: 'PATCH', body: fd })
      const data = await res.json()
      if (res.ok) setProducts((prev) => prev.map((p) => p.id === id ? data : p))
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product / Service
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {showNew && (
        <form onSubmit={handleCreate} className="bg-white border border-gold/30 rounded-xl p-5 space-y-3">
          <p className="text-sm font-semibold text-slate-900">New Product / Service</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *" name="name" required />
            <Field label="SKU" name="sku" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
            <textarea name="description" rows={2} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-4 gap-3 items-end">
            <Field label="Unit Price *" name="unitPrice" type="number" required />
            <Field label="Category" name="category" />
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Type *</label>
              <TypeToggle name="productType" defaultValue="PRODUCT" />
            </div>
            <div className="pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" name="taxable" defaultChecked className="rounded border-slate-300" />
                Taxable
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="flex items-center gap-1.5 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50">
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
            </button>
            <button type="button" onClick={() => setShowNew(false)} className="text-slate-500 text-sm px-4 py-2">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Type</th>
              <th className="text-left px-6 py-3">SKU</th>
              <th className="text-left px-6 py-3">Category</th>
              <th className="text-right px-6 py-3">Unit Price</th>
              <th className="text-left px-6 py-3">Tax</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-right px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((p) => (
              <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                {editId === p.id ? (
                  <td colSpan={8} className="px-4 py-3">
                    <form onSubmit={(e) => handleUpdate(p.id, e)} className="flex flex-wrap gap-2 items-end">
                      <input name="name" defaultValue={p.name} required className="bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1.5 text-sm focus:outline-none" />
                      <input name="sku" defaultValue={p.sku ?? ''} placeholder="SKU" className="bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1.5 text-sm focus:outline-none w-24" />
                      <input name="category" defaultValue={p.category ?? ''} placeholder="Category" className="bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1.5 text-sm focus:outline-none w-28" />
                      <input name="unitPrice" type="number" step="0.01" defaultValue={Number(p.unitPrice)} required className="bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1.5 text-sm focus:outline-none w-24 text-right" />
                      <TypeToggle name="productType" defaultValue={p.productType} />
                      <label className="flex items-center gap-1.5 text-xs text-slate-700">
                        <input type="checkbox" name="taxable" defaultChecked={p.taxable} className="rounded" /> Taxable
                      </label>
                      <button type="submit" disabled={pending} className="text-green-700 hover:text-green-900 disabled:opacity-50"><Check className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">{p.name}</div>
                      {p.description && <div className="text-gray-500 text-xs truncate max-w-xs">{p.description}</div>}
                    </td>
                    <td className="px-6 py-3"><TypeBadge productType={p.productType} /></td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{p.sku ?? '—'}</td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{p.category ?? '—'}</td>
                    <td className="px-6 py-3 text-right font-medium">${Number(p.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-xs">
                      {p.taxable ? <span className="text-green-700">Taxable</span> : <span className="text-slate-400">Exempt</span>}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs border rounded px-2 py-0.5 ${p.isActive ? 'text-green-700 bg-green-100 border-green-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {pending && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                        <button onClick={() => setEditId(p.id)} className="text-slate-400 hover:text-gold transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleToggleActive(p.id, p.isActive)} disabled={pending} className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50">
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <input type={type} name={name} required={required} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
    </div>
  )
}
