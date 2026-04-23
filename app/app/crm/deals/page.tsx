import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { DealStatus } from '@prisma/client'

const STATUS_COLORS: Record<DealStatus, string> = {
  OPEN: 'text-blue-700 bg-blue-100 border-blue-200',
  WON:  'text-green-700 bg-green-100 border-green-200',
  LOST: 'text-slate-500 bg-slate-100 border-slate-200',
}

export default async function DealsPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const deals = await prisma.crmDeal.findMany({
    where: searchParams.status ? { status: searchParams.status as DealStatus } : {},
    include: {
      stage: true,
      account: { select: { name: true } },
      contact: { select: { firstName: true, lastName: true } },
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const totalValue = deals.filter(d => d.status === 'OPEN').reduce((sum, d) => sum + Number(d.value ?? 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Opportunities</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {deals.length} records · <span className="text-gold">${totalValue.toLocaleString()}</span> open pipeline
          </p>
        </div>
        <Link href="/app/crm/deals/new" className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Opportunity
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {(['', 'OPEN', 'WON', 'LOST'] as const).map((s) => (
          <Link key={s} href={s ? `?status=${s}` : '/app/crm/deals'}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${searchParams.status === s || (!searchParams.status && !s) ? 'bg-gold/10 text-gold border-gold/30' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-gold/30'}`}>
            {s || 'All'}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">Deal</th>
              <th className="text-left px-6 py-3">Stage</th>
              <th className="text-left px-6 py-3">Value</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Account</th>
              <th className="text-left px-6 py-3">Close Date</th>
              <th className="text-left px-6 py-3">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {deals.map((d) => (
              <tr key={d.id} className="hover:bg-slate-100/40 transition-colors">
                <td className="px-6 py-3">
                  <Link href={`/app/crm/deals/${d.id}`} className="text-slate-900 hover:text-gold font-medium transition-colors">{d.name}</Link>
                  {d.contact && <div className="text-gray-500 text-xs">{d.contact.firstName} {d.contact.lastName}</div>}
                </td>
                <td className="px-6 py-3 text-slate-600 text-xs">{d.stage.name}</td>
                <td className="px-6 py-3 text-slate-700 font-medium">
                  {d.value ? `$${Number(d.value).toLocaleString()}` : '—'}
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs border rounded px-2 py-0.5 ${STATUS_COLORS[d.status]}`}>{d.status}</span>
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs">{d.account?.name ?? '—'}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">
                  {d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs">{d.owner.name ?? d.owner.email}</td>
              </tr>
            ))}
            {deals.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-500">No opportunities found. <Link href="/app/crm/deals/new" className="text-gold hover:underline">Create one.</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

