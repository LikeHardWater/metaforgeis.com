import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import { canManageUsers } from '@/src/lib/permissions'
import ProductsTable from './ProductsTable'

export default async function ProductsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!canManageUsers(session.user.systemRole)) redirect('/app/dashboard')

  const raw = await prisma.product.findMany({ orderBy: { name: 'asc' } })
  const products = raw.map((p) => ({ ...p, unitPrice: Number(p.unitPrice), productType: p.productType }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Products &amp; Services</h1>
        <p className="text-slate-500 text-sm mt-1">Catalog of products and services available on quotes.</p>
      </div>
      <ProductsTable products={products} />
    </div>
  )
}
