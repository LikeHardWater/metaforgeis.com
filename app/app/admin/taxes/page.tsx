import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import { canManageUsers } from '@/src/lib/permissions'
import TaxTable from './TaxTable'

export default async function TaxesPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!canManageUsers(session.user.systemRole)) redirect('/app/dashboard')

  const raw = await prisma.stateTaxRate.findMany({ orderBy: { stateCode: 'asc' } })
  const taxes = raw.map((t) => ({ ...t, taxRate: Number(t.taxRate) }))

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">State Tax Rates</h1>
        <p className="text-slate-500 text-sm mt-1">
          Sales tax rates by state and whether installation/repair services are taxable.
          Click a rate to edit it; click the service badge to toggle taxability.
        </p>
      </div>
      <TaxTable taxes={taxes} />
    </div>
  )
}
