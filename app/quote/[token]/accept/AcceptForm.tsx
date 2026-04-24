'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

interface Props {
  token: string
  defaultName: string
  defaultEmail: string
}

export default function AcceptForm({ token, defaultName, defaultEmail }: Props) {
  const [name, setName] = useState(defaultName)
  const [email, setEmail] = useState(defaultEmail)
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed || !name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/quote/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setDone(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-slate-900 mb-2">Quote Accepted</h1>
        <p className="text-slate-500">Thank you, <strong>{name}</strong>. Your acceptance has been recorded and our team will be in touch shortly.</p>
        {email && <p className="text-slate-400 text-sm mt-2">A confirmation has been sent to <strong>{email}</strong>.</p>}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Accept Quote</h1>
        <p className="text-slate-500 mt-1">By signing below, you confirm your acceptance of this quote and its terms and conditions.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your full name as your digital signature"
                required
                className="w-full border border-slate-300 focus:border-yellow-500 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
              />
              <p className="text-xs text-slate-400 mt-1">This constitutes your digital signature</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-slate-400">(for confirmation)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-slate-300 focus:border-yellow-500 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm text-slate-700">
              I have read and agree to the terms and conditions of this quote. I understand this constitutes a binding digital acceptance.
            </span>
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!agreed || !name.trim() || submitting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors text-sm"
          >
            {submitting ? 'Submitting…' : 'Accept Quote'}
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Your name, timestamp, and IP address will be recorded for verification purposes.
      </p>
    </div>
  )
}
