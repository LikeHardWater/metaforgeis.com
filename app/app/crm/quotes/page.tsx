import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { QuoteStage } from '@prisma/client'

const STAGE_COLORS: Record<QuoteStage, string> = {
  DRAFT:    'text-slate-500 bg-slate-100 border-slate-200',
  SENT:     'text-blue-700 bg-blue-100 border-blue-200',
  ACCEPTED: 'text-green-700 bg-green-100 border-green-200',
  DECLINED: 'text-red-700 bg-red-100 border-red-200',
  REVISED:  'text-amber-700 bg-amber-100 border-amber-200',
  EXPIRED:  'text-slate-400 bg-slate-50 border-slate-200',
}

export default async function QuotesPage({ searchParams }: { searchParams: { stage?: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const quotes = await prisma.quote.findMany({
    where: searchParams.stage ? { stage: searchParams.stage as QuoteStage } : {},
    include: {
      account: { select: { name: true } },
      contact: { select: { firstName: true, lastName: true } },
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const totalOpen = quotes.filter(q => q.stage !== 'DECLINED' && q.stage !== 'EXPIRED').reduce((s, q) => s + Number(q.grandTotal), 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Quotes</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {quotes.length} records · <span className="text-gold">${totalOpen.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> open value
          </p>
        </div>
        <Link href="/app/crm/quotes/new" className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Quote
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['', 'DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'REVISED', 'EXPIRED'] as const).map((s) => (
          <Link key={s} href={s ? `?stage=${s}` : '/app/crm/quotes'}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${(searchParams.stage === s || (!searchParams.stage && !s)) ? 'bg-gold/10 text-gold border-gold/30' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-gold/30'}`}>
            {s || 'All'}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">Quote</th>
              <th className="text-left px-6 py-3">Stage</th>
              <th className="text-left px-6 py-3">Account</th>
              <th className="text-left px-6 py-3">Contact</th>
              <th className="text-right px-6 py-3">Total</th>
              <th className="text-left px-6 py-3">Valid Until</th>
              <th className="text-left px-6 py-3">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3">
                  <Link href={`/app/crm/quotes/${q.id}`} className="text-slate-900 hover:text-gold font-medium transition-colors">{q.subject}</Link>
                  <div className="text-gray-500 text-xs">{q.quoteNumber}</div>
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs border rounded px-2 py-0.5 ${STAGE_COLORS[q.stage]}`}>{q.stage}</span>
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs">{q.account?.name ?? '—'}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{q.contact ? `${q.contact.firstName} ${q.contact.lastName}` : '—'}</td>
                <td className="px-6 py-3 text-right font-medium text-slate-900">
                  ${Number(q.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs">
                  {q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs">{q.owner.name ?? q.owner.email}</td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-500">No quotes found. <Link href="/app/crm/quotes/new" className="text-gold hover:underline">Create one.</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
