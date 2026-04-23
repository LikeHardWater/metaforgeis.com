import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateLead, addActivity, convertLeadToOpportunity } from '@/src/lib/actions/crm'
import { LeadSource, LeadStatus, ActivityType } from '@prisma/client'
import { MessageSquare, Phone, Mail, FileText, CheckSquare } from 'lucide-react'

const SOURCE_LABELS: Record<LeadSource, string> = {
  WEB_FORM: 'Web Form', REFERRAL: 'Referral', COLD_CALL: 'Cold Call',
  TRADE_SHOW: 'Trade Show', EMAIL_CAMPAIGN: 'Email Campaign',
  SOCIAL_MEDIA: 'Social Media', OTHER: 'Other',
}

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  NOTE:           <FileText className="w-3.5 h-3.5" />,
  EMAIL:          <Mail className="w-3.5 h-3.5" />,
  CALL:           <Phone className="w-3.5 h-3.5" />,
  MEETING:        <MessageSquare className="w-3.5 h-3.5" />,
  SMS:            <MessageSquare className="w-3.5 h-3.5" />,
  TASK_COMPLETED: <CheckSquare className="w-3.5 h-3.5" />,
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const lead = await prisma.crmLead.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { name: true, email: true } },
      activities: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!lead) notFound()

  const updateLeadWithId = updateLead.bind(null, lead.id)
  const convertWithId = convertLeadToOpportunity.bind(null, lead.id)
  const isConverted = !!lead.convertedAt

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/leads" className="text-gray-500 hover:text-slate-600 text-sm">← Leads</Link>
        <h1 className="text-2xl font-black tracking-tight mt-2">{lead.firstName} {lead.lastName}</h1>
        {lead.company && <p className="text-slate-500 text-sm mt-0.5">{lead.title ? `${lead.title} · ` : ''}{lead.company}</p>}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Edit form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider text-slate-500">Lead Details</h2>
            <form action={updateLeadWithId} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" name="firstName" defaultValue={lead.firstName} />
                <FormField label="Last Name" name="lastName" defaultValue={lead.lastName} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email" name="email" type="email" defaultValue={lead.email ?? ''} />
                <FormField label="Phone" name="phone" type="tel" defaultValue={lead.phone ?? ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Company" name="company" defaultValue={lead.company ?? ''} />
                <FormField label="Title" name="title" defaultValue={lead.title ?? ''} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                  <select name="status" defaultValue={lead.status} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                    {Object.values(LeadStatus).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Source</label>
                  <select name="source" defaultValue={lead.source} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                    {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Score (0–100)</label>
                  <input type="number" name="score" min={0} max={100} defaultValue={lead.score} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Notes</label>
                <textarea name="notes" rows={3} defaultValue={lead.notes ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none resize-none" />
              </div>
              <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-5 py-2 rounded-lg transition-colors">
                Save Changes
              </button>
            </form>
          </div>

          {/* Activity feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-500 text-sm uppercase tracking-wider mb-4">Activity</h2>
            <form action={addActivity} className="flex gap-2 mb-5">
              <input type="hidden" name="leadId" value={lead.id} />
              <input type="hidden" name="entityType" value="leads" />
              <input type="hidden" name="entityId" value={lead.id} />
              <input type="hidden" name="type" value={ActivityType.NOTE} />
              <input name="content" placeholder="Add a note..." className="flex-1 bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none" />
              <button type="submit" className="bg-slate-100 hover:border-gold border border-slate-200 text-slate-600 hover:text-slate-900 text-sm px-4 py-2 rounded-lg transition-colors">
                Add Note
              </button>
            </form>
            <div className="space-y-3">
              {lead.activities.map((a) => (
                <div key={a.id} className="flex gap-3 text-sm">
                  <div className="text-gray-500 mt-0.5">{ACTIVITY_ICONS[a.type]}</div>
                  <div className="flex-1">
                    <div className="text-slate-700">{a.content}</div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {a.user.name} · {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {lead.activities.length === 0 && <p className="text-gray-600 text-sm">No activity yet.</p>}
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
            <h2 className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Info</h2>
            <Row label="Owner" value={lead.owner.name ?? lead.owner.email} />
            <Row label="Created" value={new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            <Row label="Updated" value={new Date(lead.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            {lead.convertedAt && <Row label="Converted" value={new Date(lead.convertedAt).toLocaleDateString()} />}
          </div>

          {!isConverted && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-3">Convert to Opportunity</h2>
              <form action={convertWithId} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Opportunity Name</label>
                  <input
                    name="dealName"
                    defaultValue={`${lead.firstName} ${lead.lastName}${lead.company ? ` – ${lead.company}` : ''}`}
                    className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Est. Value ($)</label>
                  <input type="number" name="value" className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
                </div>
                <button type="submit" className="w-full bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                  Convert to Opportunity
                </button>
              </form>
            </div>
          )}

          {isConverted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
              Converted to opportunity on {new Date(lead.convertedAt!).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FormField({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  )
}
