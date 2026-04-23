import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default async function ContactsPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const contacts = await prisma.crmContact.findMany({
    where: searchParams.q ? {
      OR: [
        { firstName: { contains: searchParams.q, mode: 'insensitive' } },
        { lastName:  { contains: searchParams.q, mode: 'insensitive' } },
        { email:     { contains: searchParams.q, mode: 'insensitive' } },
      ],
    } : {},
    include: { account: { select: { name: true } }, owner: { select: { name: true, email: true } } },
    orderBy: { lastName: 'asc' },
    take: 100,
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Contacts</h1>
          <p className="text-slate-500 text-sm mt-0.5">{contacts.length} records</p>
        </div>
        <Link href="/app/crm/contacts/new" className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Contact
        </Link>
      </div>
      <form className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input name="q" defaultValue={searchParams.q} placeholder="Search contacts..." className="w-full bg-white border border-slate-200 focus:border-gold rounded-lg pl-9 pr-4 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none" />
        </div>
        <button type="submit" className="bg-white border border-slate-200 hover:border-gold text-slate-600 hover:text-slate-900 text-sm px-4 py-2 rounded-lg transition-colors">Search</button>
      </form>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Title</th>
              <th className="text-left px-6 py-3">Account</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Phone</th>
              <th className="text-left px-6 py-3">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-100/40 transition-colors">
                <td className="px-6 py-3">
                  <Link href={`/app/crm/contacts/${c.id}`} className="text-slate-900 hover:text-gold font-medium transition-colors">{c.firstName} {c.lastName}</Link>
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs">{c.title ?? '—'}</td>
                <td className="px-6 py-3 text-slate-600 text-xs">{c.account?.name ?? '—'}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{c.email ?? '—'}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{c.phone ?? '—'}</td>
                <td className="px-6 py-3 text-slate-500 text-xs">{c.owner.name ?? c.owner.email}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-500">No contacts found. <Link href="/app/crm/contacts/new" className="text-gold hover:underline">Create one.</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

