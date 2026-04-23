import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { name, email, message } = await req.json()
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  const quote = await prisma.quote.findUnique({ where: { publicToken: params.token } })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  await prisma.quoteEvent.create({
    data: {
      quoteId: quote.id,
      type: 'QUESTION',
      authorName: name.trim(),
      authorEmail: email.trim(),
      content: message.trim(),
    },
  })

  return NextResponse.json({ ok: true })
}
