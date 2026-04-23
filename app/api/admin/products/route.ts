import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { canManageUsers } from '@/src/lib/permissions'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !canManageUsers(session.user.systemRole))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fd = await req.formData()
  const name = (fd.get('name') as string)?.trim()
  const unitPrice = parseFloat(fd.get('unitPrice') as string)

  if (!name || isNaN(unitPrice)) return NextResponse.json({ error: 'Name and unit price are required' }, { status: 400 })

  const product = await prisma.product.create({
    data: {
      name,
      description: (fd.get('description') as string) || null,
      sku: (fd.get('sku') as string) || null,
      unitPrice,
      productType: (fd.get('productType') as string) || 'PRODUCT',
      taxable: fd.get('taxable') === 'on',
      category: (fd.get('category') as string) || null,
    },
  })

  return NextResponse.json(product)
}
