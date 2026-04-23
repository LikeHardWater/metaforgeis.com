'use client'

import { useState } from 'react'
import { Send, X, Loader2 } from 'lucide-react'

interface Props {
  quoteId: string
  defaultEmail?: string
}

export function SendQuoteModal({ quoteId, defaultEmail = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [toEmail, setToEmail] = useState(defaultEmail)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<'sent' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSend = async () => {
    setSending(true)
    setResult(null)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, message }),
      })
      const data = await res.json()
      if (!res.ok) { setResult('error'); setErrorMsg(data.error ?? 'Failed to send'); return }
      setResult('sent')
      setTimeout(() => { setOpen(false); setResult(null) }, 2000)
    } catch {
      setResult('error')
      setErrorMsg('Network error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
      >
        <Send className="w-4 h-4" /> Send Quote
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900">Send Quote via Email</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {result === 'sent' ? (
              <p className="text-green-600 font-medium text-center py-4">Quote sent successfully!</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Recipient Email *</label>
                  <input
                    type="email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Personal Message (optional)</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please find your quote attached…"
                    className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none resize-none"
                  />
                </div>
                {result === 'error' && <p className="text-red-600 text-xs">{errorMsg}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSend}
                    disabled={sending || !toEmail}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                  <button onClick={() => setOpen(false)} className="bg-slate-100 text-slate-600 font-semibold text-sm px-5 py-2.5 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
