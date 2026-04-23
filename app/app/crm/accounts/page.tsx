import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { AccountType } from '@prisma/client'

const TYPE_COLORS: Record<AccountType, string> = {
  PROSPECT: 'text-blue-700 bg-blue-100 border-blue-200',
  CUSTOMER: 'text-green-700 bg-green-100 border-green-200',
  VENDOR:   'text-yellow-400 bg-yellow-900/20 border-yellow-800/40',
  PARTNER:  'text-purple-400 bg-purple-900/20 border-purple-800/40',
}

export default async function AccountsPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const accounts = await prisma.crmAccount.findMany({
    where: searchParams.q ? { name: { contains: searchParams.q, mode: 'insensitive' } } : {},
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { contacts: true, deals: true } },
    },
    orderBy: { name: 'asc' },
    take: 100,
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Accounts</h1>
          <p className="text-slate-500 text-sm mt-0.5">{accounts.length} records</p>
        </div>
        <Link href="/app/crm/accounts/new" className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Account
        </Link>
      </div>
      <form className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input name="q" defaultValue={searchParams.q} placeholder="Search accounts..." className="w-full bg-white border border-slate-200 focus:border-gold rounded-lg pl-9 pr-4 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none" />
        </div>
        <button type="submit" className="bg-white border border-slate-200 hover:border-gold text-slate-600 hover:text-slate-900 text-sm px-4 py-2 rounded-lg transition-colors">Search</button>
      </form>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Type</th>
              <th className="text-left px-6 py-3">Industry</th>
              <th className="text-left px-6 py-3">Contacts</th>
              <th className="text-left px-6 py-3">Deals</th>
              <th className="text-left px-6 py-3">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {accounts.map((a) => (
              <tr key={a.id} className="hover:bg-slate-100/40 transition-colors">
                <td className="px-6 py-3">
                  <Link href={`/app/crm/accounts/${a.id}`} className="text-slate-900 hover:text-gold font-medium transition-colors">{a.name}</Link>
                  {a.website && <div className="text-gray-500 text-xs">{a.website}</div>}
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs border rounded px-2 py-0.5 ${TYPE_COLORS[a.type]}`}>{a.type}</span>
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs">{a.industry ?? '—'}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{a._count.contacts}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{a._count.deals}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{a.owner.name ?? a.owner.email}</td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-500">No accounts found. <Link href="/app/crm/accounts/new" className="text-gold hover:underline">Create one.</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

