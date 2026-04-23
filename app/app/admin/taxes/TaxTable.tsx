'use client'

import { useState, useTransition } from 'react'
import { Check, X, Pencil } from 'lucide-react'

type StateTax = {
  id: string
  stateCode: string
  stateName: string
  taxRate: number
  taxesServices: boolean
}

export default function TaxTable({ taxes: initial }: { taxes: StateTax[] }) {
  const [taxes, setTaxes] = useState(initial)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState('')
  const [pending, startTransition] = useTransition()

  const startEdit = (t: StateTax) => {
    setEditId(t.id)
    setEditRate(String(t.taxRate))
  }

  const cancelEdit = () => setEditId(null)

  const saveRate = (id: string) => {
    const rate = parseFloat(editRate)
    if (isNaN(rate)) return
    startTransition(async () => {
      const res = await fetch('/api/admin/taxes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, taxRate: rate }),
      })
      if (res.ok) {
        const updated = await res.json()
        setTaxes((prev) => prev.map((t) => (t.id === id ? { ...t, taxRate: Number(updated.taxRate) } : t)))
        setEditId(null)
      }
    })
  }

  const toggleServices = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await fetch('/api/admin/taxes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, taxesServices: !current }),
      })
      if (res.ok) {
        setTaxes((prev) => prev.map((t) => (t.id === id ? { ...t, taxesServices: !current } : t)))
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
            <th className="text-left px-5 py-3 w-16">Code</th>
            <th className="text-left px-5 py-3">State</th>
            <th className="text-right px-5 py-3 w-36">Sales Tax Rate</th>
            <th className="text-center px-5 py-3 w-48">Taxes Installation/Repair</th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {taxes.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-mono text-xs font-bold text-slate-500">{t.stateCode}</td>
              <td className="px-5 py-3 font-medium text-slate-900">{t.stateName}</td>
              <td className="px-5 py-3 text-right">
                {editId === t.id ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      max="20"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="w-24 text-right bg-slate-100 border border-slate-300 focus:border-gold rounded px-2 py-1 text-sm focus:outline-none"
                      autoFocus
                    />
                    <span className="text-slate-500 text-xs">%</span>
                    <button
                      onClick={() => saveRate(t.id)}
                      disabled={pending}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="tabular-nums">{Number(t.taxRate).toFixed(4)}%</span>
                )}
              </td>
              <td className="px-5 py-3 text-center">
                <button
                  onClick={() => toggleServices(t.id, t.taxesServices)}
                  disabled={pending}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors disabled:opacity-50 ${
                    t.taxesServices
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t.taxesServices ? 'Yes — taxed' : 'No — exempt'}
                </button>
              </td>
              <td className="px-3 py-3 text-right">
                {editId !== t.id && (
                  <button onClick={() => startEdit(t)} className="text-slate-300 hover:text-slate-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
