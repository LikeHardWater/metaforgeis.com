import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { LeadStatus, LeadSource } from '@prisma/client'

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW:         'bg-blue-100 text-blue-700 border-blue-200',
  CONTACTED:   'bg-amber-100 text-amber-700 border-amber-200',
  QUALIFIED:   'bg-green-100 text-green-700 border-green-200',
  UNQUALIFIED: 'bg-slate-100 text-slate-500 border-slate-200',
  CONVERTED:   'bg-gold/10 text-gold border-gold/20',
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  WEB_FORM:       'Web Form',
  REFERRAL:       'Referral',
  COLD_CALL:      'Cold Call',
  TRADE_SHOW:     'Trade Show',
  EMAIL_CAMPAIGN: 'Email Campaign',
  SOCIAL_MEDIA:   'Social Media',
  OTHER:          'Other',
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string }
}) {
  const session = await auth()
  if (!session) redirect('/login')

  // Default: exclude CONVERTED unless a specific status is selected
  const statusFilter = searchParams.status
    ? { status: searchParams.status as LeadStatus }
    : { status: { not: LeadStatus.CONVERTED } }

  const where = {
    ...(searchParams.q
      ? {
          OR: [
            { firstName: { contains: searchParams.q, mode: 'insensitive' as const } },
            { lastName:  { contains: searchParams.q, mode: 'insensitive' as const } },
            { email:     { contains: searchParams.q, mode: 'insensitive' as const } },
            { company:   { contains: searchParams.q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...statusFilter,
  }

  const leads = await prisma.crmLead.findMany({
    where,
    include: { owner: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Leads</h1>
          <p className="text-slate-500 text-sm mt-0.5">{leads.length} records</p>
        </div>
        <Link
          href="/app/crm/leads/new"
          className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Lead
        </Link>
      </div>

      {/* Filters */}
      <form className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search leads..."
            className="w-full bg-white border border-slate-200 focus:border-gold rounded-lg pl-9 pr-4 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none"
          />
        </div>
        <select
          name="status"
          defaultValue={searchParams.status}
          className="bg-white border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none"
        >
          <option value="">All statuses</option>
          {Object.values(LeadStatus).map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}</option>
          ))}
        </select>
        <button type="submit" className="bg-white border border-slate-200 hover:border-gold text-slate-600 hover:text-slate-900 text-sm px-4 py-2 rounded-lg transition-colors">
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Company</th>
              <th className="text-left px-6 py-3">Source</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Score</th>
              <th className="text-left px-6 py-3">Owner</th>
              <th className="text-left px-6 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-100/40 transition-colors">
                <td className="px-6 py-3">
                  <Link href={`/app/crm/leads/${lead.id}`} className="text-slate-900 hover:text-gold font-medium transition-colors">
                    {lead.firstName} {lead.lastName}
                  </Link>
                  {lead.email && <div className="text-gray-500 text-xs">{lead.email}</div>}
                </td>
                <td className="px-6 py-3 text-slate-600">{lead.company ?? '—'}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{SOURCE_LABELS[lead.source]}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs border rounded px-2 py-0.5 ${STATUS_COLORS[lead.status]}`}>
                    {lead.status.charAt(0) + lead.status.slice(1).toLowerCase().replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-gold rounded-full h-1.5" style={{ width: `${lead.score}%` }} />
                    </div>
                    <span className="text-slate-500 text-xs">{lead.score}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs">{lead.owner.name ?? lead.owner.email}</td>
                <td className="px-6 py-3 text-gray-500 text-xs">
                  {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                  No leads found.{' '}
                  <Link href="/app/crm/leads/new" className="text-gold hover:underline">Create the first one.</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

