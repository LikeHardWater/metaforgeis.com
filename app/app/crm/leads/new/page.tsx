import { createLead } from '@/src/lib/actions/crm'
import { LeadSource } from '@prisma/client'
import Link from 'next/link'

const SOURCE_LABELS: Record<LeadSource, string> = {
  WEB_FORM: 'Web Form', REFERRAL: 'Referral', COLD_CALL: 'Cold Call',
  TRADE_SHOW: 'Trade Show', EMAIL_CAMPAIGN: 'Email Campaign',
  SOCIAL_MEDIA: 'Social Media', OTHER: 'Other',
}

export default function NewLeadPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/leads" className="text-gray-500 hover:text-slate-600 text-sm">← Leads</Link>
        <h1 className="text-2xl font-black tracking-tight mt-3">New Lead</h1>
      </div>

      <form action={createLead} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name *" name="firstName" required />
          <Field label="Last Name *" name="lastName" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" type="tel" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company" name="company" />
          <Field label="Title" name="title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Lead Source</label>
          <select name="source" className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
            {Object.entries(SOURCE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Notes</label>
          <textarea name="notes" rows={3} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-6 py-2.5 rounded-lg transition-colors">
            Create Lead
          </button>
          <Link href="/app/crm/leads" className="bg-slate-100 hover:bg-slate-100/80 text-slate-600 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input type={type} name={name} required={required} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none" />
    </div>
  )
}

