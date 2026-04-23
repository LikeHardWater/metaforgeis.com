'use client'

import { useState } from 'react'
import { History, ChevronDown, ChevronUp } from 'lucide-react'

type QuoteVersion = {
  id: string
  revision: number
  savedBy: string | null
  createdAt: Date
  snapshot: Record<string, unknown>
}

interface Props {
  versions: QuoteVersion[]
  currentRevision: number
  quoteNumber: string
}

export function QuoteRevisions({ versions, currentRevision, quoteNumber }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (versions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <History className="w-3.5 h-3.5" /> Revision History
        </h2>
        <p className="text-gray-500 text-sm">No saved revisions yet. Revisions are created each time you save quote details.</p>
      </div>
    )
  }

  const fmt = (v: unknown) => {
    if (v === null || v === undefined || v === '') return '—'
    if (typeof v === 'number') return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    return String(v)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-4">
        <History className="w-3.5 h-3.5" /> Revision History
        <span className="ml-1 text-slate-400">· Current: Rev. {currentRevision}</span>
      </h2>

      <div className="space-y-2">
        {/* Current revision badge */}
        <div className="flex items-center gap-3 px-3 py-2 bg-gold/10 border border-gold/30 rounded-lg">
          <span className="text-xs font-bold text-gold">Rev. {currentRevision}</span>
          <span className="text-xs text-slate-600">Current version</span>
          <span className="ml-auto text-xs text-slate-400">{quoteNumber}</span>
        </div>

        {[...versions].reverse().map((v) => (
          <div key={v.id} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === v.id ? null : v.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
            >
              <span className="text-xs font-semibold text-slate-600">Rev. {v.revision}</span>
              <span className="text-xs text-slate-500">
                Saved by {v.savedBy ?? 'unknown'}
              </span>
              <span className="ml-auto text-xs text-slate-400">
                {new Date(v.createdAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })}
              </span>
              {expanded === v.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            {expanded === v.id && (
              <div className="px-3 pb-3 border-t border-slate-100 bg-slate-50 text-xs space-y-1.5 pt-2">
                {[
                  ['Subject', v.snapshot.subject],
                  ['Stage', v.snapshot.stage],
                  ['Grand Total', v.snapshot.grandTotal],
                  ['Valid Until', v.snapshot.validUntil ? new Date(v.snapshot.validUntil as string).toLocaleDateString() : null],
                  ['Terms', v.snapshot.terms],
                  ['Notes', v.snapshot.notes],
                ].map(([label, value]) => value !== null && value !== undefined && value !== '' ? (
                  <div key={label as string} className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0">{String(label)}</span>
                    <span className="text-slate-700">{fmt(value)}</span>
                  </div>
                ) : null)}

                {Array.isArray((v.snapshot as Record<string, unknown>).lineItems) && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-slate-400 mb-1">Line Items ({((v.snapshot as Record<string, unknown>).lineItems as unknown[]).length})</p>
                    {((v.snapshot as Record<string, unknown>).lineItems as Array<Record<string, unknown>>).map((li, i) => (
                      <div key={i} className="flex justify-between text-slate-600 py-0.5">
                        <span>{li.itemType === 'SERVICE' ? '⚙ ' : '📦 '}{String(li.description)}</span>
                        <span>${Number(li.lineTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
