import { createAccount } from '@/src/lib/actions/crm'
import { AccountType } from '@prisma/client'
import Link from 'next/link'

export default function NewAccountPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/app/crm/accounts" className="text-gray-500 hover:text-slate-600 text-sm">← Accounts</Link>
        <h1 className="text-2xl font-black tracking-tight mt-3">New Account</h1>
      </div>
      <form action={createAccount} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <Field label="Company Name *" name="name" required />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Type</label>
            <select name="type" className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none">
              {Object.values(AccountType).map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <Field label="Industry" name="industry" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Email" name="email" type="email" />
        </div>
        <Field label="Website" name="website" />
        <Field label="Address" name="addressLine1" />
        <div className="grid grid-cols-3 gap-4">
          <Field label="City" name="city" />
          <Field label="State" name="state" />
          <Field label="ZIP" name="zip" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Notes</label>
          <textarea name="notes" rows={3} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-6 py-2.5 rounded-lg transition-colors">Create Account</button>
          <Link href="/app/crm/accounts" className="bg-slate-100 text-slate-600 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">Cancel</Link>
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

