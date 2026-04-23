import { createContact } from '@/src/lib/actions/crm'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewContactPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const accounts = await prisma.crmAccount.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/contacts" className="text-gray-500 hover:text-slate-600 text-sm">← Contacts</Link>
        <h1 className="text-2xl font-black tracking-tight mt-3">New Contact</h1>
      </div>
      <form action={createContact} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name *" name="firstName" required />
          <Field label="Last Name *" name="lastName" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" type="tel" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" name="title" />
          <Field label="Department" name="department" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Account</label>
          <select name="accountId" className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
            <option value="">— No account —</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Notes</label>
          <textarea name="notes" rows={3} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-6 py-2.5 rounded-lg transition-colors">Create Contact</button>
          <Link href="/app/crm/contacts" className="bg-slate-100 hover:bg-slate-100/80 text-slate-600 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">Cancel</Link>
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

