'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { addActivity } from '@/src/lib/actions/crm'

interface Props {
  entityType: string
  entityId: string
  dealId?: string
  leadId?: string
  accountId?: string
  contactId?: string
}

export function ActivityForm({ entityType, entityId, dealId, leadId, accountId, contactId }: Props) {
  const [content, setContent] = useState('')
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    const fd = new FormData()
    fd.set('content', content.trim())
    fd.set('type', 'NOTE')
    fd.set('entityType', entityType)
    fd.set('entityId', entityId)
    if (dealId) fd.set('dealId', dealId)
    if (leadId) fd.set('leadId', leadId)
    if (accountId) fd.set('accountId', accountId)
    if (contactId) fd.set('contactId', contactId)
    startTransition(async () => {
      await addActivity(fd)
      setContent('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note..."
        className="flex-1 bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!content.trim() || pending}
        className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 hover:border-gold text-slate-600 hover:text-slate-900 disabled:opacity-50 text-sm px-4 py-2 rounded-lg transition-colors"
      >
        {pending && <Loader2 className="w-3 h-3 animate-spin" />}
        Add Note
      </button>
    </form>
  )
}
