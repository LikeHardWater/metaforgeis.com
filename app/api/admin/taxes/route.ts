import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { canManageUsers } from '@/src/lib/permissions'

export async function GET() {
  const session = await auth()
  if (!session || !canManageUsers(session.user.systemRole))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const taxes = await prisma.stateTaxRate.findMany({ orderBy: { stateCode: 'asc' } })
  return NextResponse.json(taxes)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || !canManageUsers(session.user.systemRole))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, taxRate, taxesServices } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const updated = await prisma.stateTaxRate.update({
    where: { id },
    data: {
      ...(taxRate !== undefined ? { taxRate: parseFloat(taxRate) } : {}),
      ...(taxesServices !== undefined ? { taxesServices } : {}),
    },
  })

  return NextResponse.json(updated)
}
