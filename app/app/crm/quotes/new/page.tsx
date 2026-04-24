import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createQuote } from '@/src/lib/actions/quotes'
import { QuoteAddressFields } from '@/app/components/crm/QuoteAddressFields'

export default async function NewQuotePage({ searchParams }: { searchParams: { dealId?: string; accountId?: string; contactId?: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const thirtyDaysOut = new Date()
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30)
  const defaultValidUntil = thirtyDaysOut.toISOString().split('T')[0]

  const [accounts, contacts, deals, stateTaxes] = await Promise.all([
    prisma.crmAccount.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.crmContact.findMany({ orderBy: { lastName: 'asc' }, select: { id: true, firstName: true, lastName: true } }),
    prisma.crmDeal.findMany({ where: { status: 'OPEN' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.stateTaxRate.findMany({ orderBy: { stateCode: 'asc' }, select: { stateCode: true, stateName: true } }),
  ])

  const empty = { street: '', city: '', state: '', zip: '', country: '' }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/quotes" className="text-gray-500 hover:text-slate-600 text-sm">← Quotes</Link>
        <h1 className="text-2xl font-black tracking-tight mt-3">New Quote</h1>
      </div>

      <form action={createQuote} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-slate-500 text-xs uppercase tracking-wider">Quote Information</h2>
          <Field label="Subject *" name="subject" required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valid Until" name="validUntil" type="date" defaultValue={defaultValidUntil} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Account</label>
              <select name="accountId" defaultValue={searchParams.accountId ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
                <option value="">— None —</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Contact</label>
              <select name="contactId" defaultValue={searchParams.contactId ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
                <option value="">— None —</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Opportunity</label>
              <select name="dealId" defaultValue={searchParams.dealId ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
                <option value="">— None —</option>
                {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <QuoteAddressFields billing={empty} shipping={empty} stateTaxes={stateTaxes} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-slate-500 text-xs uppercase tracking-wider">Terms &amp; Notes</h2>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Terms &amp; Conditions</label>
            <textarea name="terms" rows={4} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Internal Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none resize-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-6 py-2.5 rounded-lg transition-colors">Create Quote</button>
          <Link href="/app/crm/quotes" className="bg-slate-100 text-slate-600 font-semibold text-sm px-6 py-2.5 rounded-lg">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', required, defaultValue }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input type={type} name={name} required={required} defaultValue={defaultValue} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none" />
    </div>
  )
}
