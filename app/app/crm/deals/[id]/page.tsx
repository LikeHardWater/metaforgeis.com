import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateDeal } from '@/src/lib/actions/crm'
import { DealStatus } from '@prisma/client'
import { ActivityForm } from '@/app/components/crm/ActivityForm'
import { FileText } from 'lucide-react'

const STATUS_COLORS: Record<DealStatus, string> = {
  OPEN: 'text-blue-700 bg-blue-100 border-blue-200',
  WON:  'text-green-700 bg-green-100 border-green-200',
  LOST: 'text-slate-500 bg-slate-100 border-slate-200',
}

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const [deal, accounts, contacts] = await Promise.all([
    prisma.crmDeal.findUnique({
      where: { id: params.id },
      include: {
        stage: true,
        pipeline: { include: { stages: { orderBy: { order: 'asc' } } } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        owner: { select: { name: true, email: true } },
        activities: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.crmAccount.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.crmContact.findMany({ orderBy: { lastName: 'asc' }, select: { id: true, firstName: true, lastName: true } }),
  ])

  if (!deal) notFound()

  const updateDealWithId = updateDeal.bind(null, deal.id)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/deals" className="text-gray-500 hover:text-slate-600 text-sm">← Opportunities</Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight">{deal.name}</h1>
            <span className={`text-xs border rounded px-2 py-0.5 ${STATUS_COLORS[deal.status]}`}>{deal.status}</span>
          </div>
          <Link
            href={`/app/crm/quotes/new?dealId=${deal.id}${deal.accountId ? `&accountId=${deal.accountId}` : ''}${deal.contactId ? `&contactId=${deal.contactId}` : ''}`}
            className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" /> Create Quote
          </Link>
        </div>
        {deal.value && <p className="text-gold font-bold text-lg mt-1">${Number(deal.value).toLocaleString()}</p>}
      </div>

      {/* Pipeline stage bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-1">
          {deal.pipeline.stages.map((s) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <div className={`flex-1 h-1.5 rounded-full ${s.id === deal.stageId ? 'bg-gold' : s.order < deal.stage.order ? 'bg-gold/40' : 'bg-slate-100'}`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {deal.pipeline.stages.map((s) => (
            <span key={s.id} className={`text-xs ${s.id === deal.stageId ? 'text-gold font-semibold' : 'text-gray-600'}`}>{s.name}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Edit form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider mb-4">Opportunity Details</h2>
            <form action={updateDealWithId} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Name</label>
                <input name="name" defaultValue={deal.name} required className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                  <select name="status" defaultValue={deal.status} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                    {Object.values(DealStatus).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Stage</label>
                  <select name="stageId" defaultValue={deal.stageId} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                    {deal.pipeline.stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Value ($)</label>
                  <input type="number" name="value" defaultValue={deal.value ? Number(deal.value) : ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Expected Close Date</label>
                  <input type="date" name="expectedCloseDate" defaultValue={deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Probability (%)</label>
                  <input type="number" name="probability" min={0} max={100} defaultValue={deal.probability ?? deal.stage.probability ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Account</label>
                  <select name="accountId" defaultValue={deal.account?.id ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                    <option value="">— No account —</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Contact</label>
                  <select name="contactId" defaultValue={deal.contact?.id ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                    <option value="">— No contact —</option>
                    {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Notes</label>
                <textarea name="notes" rows={3} defaultValue={deal.notes ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none resize-none" />
              </div>
              <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-5 py-2 rounded-lg transition-colors">
                Save Changes
              </button>
            </form>
          </div>

          {/* Activity */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider mb-4">Activity</h2>
            <ActivityForm entityType="deals" entityId={deal.id} dealId={deal.id} />
            <div className="space-y-3">
              {deal.activities.map((a) => (
                <div key={a.id} className="text-sm">
                  <div className="text-slate-700">{a.content}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{a.user.name} · {new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              {deal.activities.length === 0 && <p className="text-gray-600 text-sm">No activity yet.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm space-y-3">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider">Opportunity Info</h2>
            <Row label="Stage" value={deal.stage.name} />
            <Row label="Owner" value={deal.owner.name ?? deal.owner.email} />
            <Row label="Created" value={new Date(deal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            {deal.account && (
              <div className="flex justify-between">
                <span className="text-gray-500">Account</span>
                <Link href={`/app/crm/accounts/${deal.account.id}`} className="text-gold hover:underline">{deal.account.name}</Link>
              </div>
            )}
            {deal.contact && (
              <div className="flex justify-between">
                <span className="text-gray-500">Contact</span>
                <Link href={`/app/crm/contacts/${deal.contact.id}`} className="text-gold hover:underline">{deal.contact.firstName} {deal.contact.lastName}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-slate-700 text-right">{value}</span>
    </div>
  )
}
