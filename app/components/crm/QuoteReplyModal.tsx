'use client'

import { useState } from 'react'
import { X, Send, Loader2 } from 'lucide-react'

interface Props {
  quoteId: string
  toEmail: string
  onClose: () => void
  onSent: () => void
}

export function QuoteReplyModal({ quoteId, toEmail, onClose, onSent }: Props) {
  const [replyText, setReplyText] = useState('')
  const [includeQuote, setIncludeQuote] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!replyText.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, replyText, includeQuote }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to send reply'); return }
      onSent()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Reply to Customer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
            <p className="text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{toEmail}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Reply Message <span className="text-red-500">*</span></label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              placeholder="Type your reply…"
              className="w-full border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeQuote}
              onChange={(e) => setIncludeQuote(e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm text-slate-700">Include updated quote in this email</span>
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!replyText.trim() || sending}
            className="flex items-center gap-1.5 bg-gold hover:bg-gold-dark disabled:opacity-50 text-dark-bg font-bold text-sm px-5 py-2 rounded-lg transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}
