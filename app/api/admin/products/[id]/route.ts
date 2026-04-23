import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { canManageUsers } from '@/src/lib/permissions'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !canManageUsers(session.user.systemRole))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fd = await req.formData()
  const data: Record<string, unknown> = {}

  if (fd.has('name'))        data.name        = (fd.get('name') as string).trim()
  if (fd.has('description')) data.description = (fd.get('description') as string) || null
  if (fd.has('sku'))         data.sku         = (fd.get('sku') as string) || null
  if (fd.has('unitPrice'))   data.unitPrice   = parseFloat(fd.get('unitPrice') as string)
  if (fd.has('productType')) data.productType = (fd.get('productType') as string) || 'PRODUCT'
  if (fd.has('taxable'))     data.taxable     = fd.get('taxable') === 'on'
  if (fd.has('category'))    data.category    = (fd.get('category') as string) || null
  if (fd.has('isActive'))    data.isActive    = fd.get('isActive') === 'true'

  const product = await prisma.product.update({ where: { id: params.id }, data })
  return NextResponse.json(product)
}
