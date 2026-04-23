import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AttachmentSection } from '@/app/components/crm/AttachmentSection'

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const [account, attachments] = await Promise.all([
    prisma.crmAccount.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { name: true, email: true } },
        contacts: { orderBy: { lastName: 'asc' } },
        deals: { include: { stage: true }, orderBy: { createdAt: 'desc' } },
        activities: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      },
    }),
    prisma.attachment.findMany({
      where: { entityType: 'account', entityId: params.id },
      include: { uploadedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  if (!account) notFound()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/accounts" className="text-gray-500 hover:text-slate-600 text-sm">← Accounts</Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-black tracking-tight">{account.name}</h1>
          <span className="text-xs border rounded px-2 py-0.5 text-slate-500 border-slate-200">{account.type}</span>
        </div>
        {account.industry && <p className="text-slate-500 text-sm mt-0.5">{account.industry}</p>}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Contacts */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-500 text-xs uppercase tracking-wider">Contacts ({account.contacts.length})</h2>
              <Link href={`/app/crm/contacts/new`} className="text-gold text-xs hover:underline">+ Add Contact</Link>
            </div>
            {account.contacts.length === 0 ? (
              <p className="text-gray-600 text-sm">No contacts linked.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {account.contacts.map((c) => (
                  <div key={c.id} className="py-2 flex items-center justify-between">
                    <Link href={`/app/crm/contacts/${c.id}`} className="text-slate-900 hover:text-gold text-sm transition-colors">
                      {c.firstName} {c.lastName}
                      {c.title && <span className="text-gray-500 ml-2 text-xs">{c.title}</span>}
                    </Link>
                    <span className="text-gray-500 text-xs">{c.email ?? ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deals */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-500 text-xs uppercase tracking-wider">Deals ({account.deals.length})</h2>
              <Link href="/app/crm/deals/new" className="text-gold text-xs hover:underline">+ New Deal</Link>
            </div>
            {account.deals.length === 0 ? (
              <p className="text-gray-600 text-sm">No deals yet.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {account.deals.map((d) => (
                  <div key={d.id} className="py-2 flex items-center justify-between">
                    <Link href={`/app/crm/deals/${d.id}`} className="text-slate-900 hover:text-gold text-sm transition-colors">{d.name}</Link>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{d.stage.name}</span>
                      {d.value && <span className="text-gold font-medium">${Number(d.value).toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <AttachmentSection entityType="account" entityId={account.id} attachments={attachments} />

          {/* Activity */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {account.activities.map((a) => (
                <div key={a.id} className="text-sm">
                  <div className="text-slate-700">{a.content}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{a.user.name} · {new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              {account.activities.length === 0 && <p className="text-gray-600 text-sm">No activity yet.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm space-y-3">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider">Details</h2>
            {account.phone && <Row label="Phone" value={account.phone} />}
            {account.email && <Row label="Email" value={account.email} />}
            {account.website && <Row label="Website" value={account.website} />}
            {account.city && <Row label="Location" value={[account.city, account.state].filter(Boolean).join(', ')} />}
            <Row label="Owner" value={account.owner.name ?? account.owner.email} />
            <Row label="Created" value={new Date(account.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
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
