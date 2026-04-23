import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const quote = await prisma.quote.findUnique({ where: { publicToken: params.token } })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (quote.stage === 'ACCEPTED') return NextResponse.json({ error: 'Already accepted' }, { status: 409 })

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  await prisma.$transaction([
    prisma.quote.update({
      where: { id: quote.id },
      data: { stage: 'ACCEPTED' },
    }),
    prisma.quoteEvent.create({
      data: {
        quoteId: quote.id,
        type: 'ACCEPTED',
        authorName: name.trim(),
        content: `Digitally accepted by ${name.trim()}`,
        ipAddress: ip,
      },
    }),
  ])

  return NextResponse.json({ ok: true })
}
