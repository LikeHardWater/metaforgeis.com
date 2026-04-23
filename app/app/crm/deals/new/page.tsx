import { createDeal } from '@/src/lib/actions/crm'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewDealPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const [pipeline, accounts, contacts] = await Promise.all([
    prisma.pipeline.findFirst({ where: { isDefault: true }, include: { stages: { orderBy: { order: 'asc' } } } }),
    prisma.crmAccount.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.crmContact.findMany({ orderBy: { lastName: 'asc' }, select: { id: true, firstName: true, lastName: true } }),
  ])

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/deals" className="text-gray-500 hover:text-slate-600 text-sm">← Opportunities</Link>
        <h1 className="text-2xl font-black tracking-tight mt-3">New Opportunity</h1>
      </div>
      <form action={createDeal} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <Field label="Deal Name *" name="name" required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Value ($)" name="value" type="number" />
          <Field label="Probability (%)" name="probability" type="number" />
        </div>
        {pipeline && (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Stage</label>
            <select name="stageId" className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
              {pipeline.stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Account</label>
          <select name="accountId" className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
            <option value="">— No account —</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Contact</label>
          <select name="contactId" className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
            <option value="">— No contact —</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </select>
        </div>
        <Field label="Expected Close Date" name="expectedCloseDate" type="date" />
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Notes</label>
          <textarea name="notes" rows={3} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-6 py-2.5 rounded-lg transition-colors">Create Opportunity</button>
          <Link href="/app/crm/deals" className="bg-slate-100 text-slate-600 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input type={type} name={name} required={required} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none" />
    </div>
  )
}

