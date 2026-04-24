'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface Props {
  token: string
  defaultName: string
  defaultEmail: string
}

export default function QuestionForm({ token, defaultName, defaultEmail }: Props) {
  const [name, setName] = useState(defaultName)
  const [email, setEmail] = useState(defaultEmail)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/quote/${token}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
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
        <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-slate-900 mb-2">Question Submitted</h1>
        <p className="text-slate-500">Thanks, <strong>{name}</strong>. We received your question and will get back to you at <strong>{email}</strong> shortly.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Ask a Question</h1>
        <p className="text-slate-500 mt-1">Have a question about this quote? Send it to our team and we&apos;ll get back to you promptly.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-slate-300 focus:border-yellow-500 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-300 focus:border-yellow-500 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Your Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="What would you like to know about this quote?"
              className="w-full border border-slate-300 focus:border-yellow-500 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200 resize-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors text-sm"
          >
            {submitting ? 'Sending…' : 'Send Question'}
          </button>
        </form>
      </div>
    </div>
  )
}
