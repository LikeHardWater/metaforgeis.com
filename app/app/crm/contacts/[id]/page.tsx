import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateContact, addActivity } from '@/src/lib/actions/crm'
import { ActivityType } from '@prisma/client'

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const [contact, accounts] = await Promise.all([
    prisma.crmContact.findUnique({
      where: { id: params.id },
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { name: true, email: true } },
        activities: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        deals: { include: { stage: true }, orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.crmAccount.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])
  if (!contact) notFound()

  const updateContactWithId = updateContact.bind(null, contact.id)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/contacts" className="text-gray-500 hover:text-slate-600 text-sm">← Contacts</Link>
        <h1 className="text-2xl font-black tracking-tight mt-2">{contact.firstName} {contact.lastName}</h1>
        {contact.title && <p className="text-slate-500 text-sm mt-0.5">{contact.title}{contact.account ? ` · ${contact.account.name}` : ''}</p>}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider mb-4">Contact Details</h2>
            <form action={updateContactWithId} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" name="firstName" defaultValue={contact.firstName} />
                <Field label="Last Name" name="lastName" defaultValue={contact.lastName} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" name="email" type="email" defaultValue={contact.email ?? ''} />
                <Field label="Phone" name="phone" type="tel" defaultValue={contact.phone ?? ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Mobile" name="mobile" type="tel" defaultValue={contact.mobile ?? ''} />
                <Field label="Title" name="title" defaultValue={contact.title ?? ''} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Account</label>
                <select name="accountId" defaultValue={contact.accountId ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                  <option value="">— No account —</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Notes</label>
                <textarea name="notes" rows={3} defaultValue={contact.notes ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none resize-none" />
              </div>
              <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-5 py-2 rounded-lg transition-colors">Save Changes</button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider mb-4">Activity</h2>
            <form action={addActivity} className="flex gap-2 mb-5">
              <input type="hidden" name="contactId" value={contact.id} />
              <input type="hidden" name="entityType" value="contacts" />
              <input type="hidden" name="entityId" value={contact.id} />
              <input type="hidden" name="type" value={ActivityType.NOTE} />
              <input name="content" placeholder="Add a note..." className="flex-1 bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none" />
              <button type="submit" className="bg-slate-100 border border-slate-200 hover:border-gold text-slate-600 hover:text-slate-900 text-sm px-4 py-2 rounded-lg transition-colors">Add Note</button>
            </form>
            <div className="space-y-3">
              {contact.activities.map((a) => (
                <div key={a.id} className="text-sm">
                  <div className="text-slate-700">{a.content}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{a.user.name} · {new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              {contact.activities.length === 0 && <p className="text-gray-600 text-sm">No activity yet.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider">Info</h2>
            <Row label="Owner" value={contact.owner.name ?? contact.owner.email} />
            <Row label="Created" value={new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
          </div>
          {contact.deals.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-slate-500 text-xs uppercase tracking-wider mb-3">Deals</h2>
              <div className="space-y-2">
                {contact.deals.map((d) => (
                  <Link key={d.id} href={`/app/crm/deals/${d.id}`} className="block text-sm text-slate-900 hover:text-gold transition-colors">
                    {d.name}
                    <span className="text-gray-500 text-xs ml-2">{d.stage.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
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
