'use client'

import { useState } from 'react'
import { Send, CheckCircle, MessageCircle, RotateCcw, Mail } from 'lucide-react'
import { QuoteReplyModal } from './QuoteReplyModal'

type QuoteEvent = {
  id: string
  type: 'SENT' | 'QUESTION' | 'REPLY' | 'ACCEPTED'
  authorName: string | null
  authorEmail: string | null
  content: string | null
  ipAddress: string | null
  createdAt: Date
}

interface Props {
  quoteId: string
  events: QuoteEvent[]
}

const EVENT_META = {
  SENT:     { icon: Send,          color: 'text-blue-500',  bg: 'bg-blue-50',  label: 'Quote Sent' },
  QUESTION: { icon: MessageCircle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Customer Question' },
  REPLY:    { icon: Mail,          color: 'text-purple-500',bg: 'bg-purple-50',label: 'Reply Sent' },
  ACCEPTED: { icon: CheckCircle,   color: 'text-green-500', bg: 'bg-green-50', label: 'Quote Accepted' },
}

export function QuoteHistory({ quoteId, events: initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents)
  const [replyTarget, setReplyTarget] = useState<{ email: string } | null>(null)

  const handleReplySent = (replyText: string) => {
    setReplyTarget(null)
    setEvents((prev) => [...prev, {
      id: `temp_${Date.now()}`,
      type: 'REPLY',
      authorName: 'You',
      authorEmail: null,
      content: replyText,
      ipAddress: null,
      createdAt: new Date(),
    }])
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-slate-500 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Communication History ({events.length})
      </h2>

      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">No communication history yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const meta = EVENT_META[event.type]
            const Icon = meta.icon
            return (
              <div key={event.id} className={`flex gap-3 p-3.5 rounded-lg border ${meta.bg} border-slate-100`}>
                <div className={`mt-0.5 flex-shrink-0 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-700">{meta.label}</span>
                      {event.authorName && (
                        <span className="text-xs text-slate-500 ml-1.5">· {event.authorName}</span>
                      )}
                      {event.authorEmail && (
                        <span className="text-xs text-slate-400 ml-1">({event.authorEmail})</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(event.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {event.content && (
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{event.content}</p>
                  )}
                  {event.type === 'ACCEPTED' && event.ipAddress && (
                    <p className="text-xs text-slate-400 mt-1">IP: {event.ipAddress}</p>
                  )}
                  {event.type === 'QUESTION' && event.authorEmail && (
                    <button
                      onClick={() => setReplyTarget({ email: event.authorEmail! })}
                      className="mt-2 text-xs font-medium text-gold hover:text-gold-dark transition-colors"
                    >
                      Reply →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {replyTarget && (
        <QuoteReplyModal
          quoteId={quoteId}
          toEmail={replyTarget.email}
          onClose={() => setReplyTarget(null)}
          onSent={handleReplySent}
        />
      )}
    </div>
  )
}
