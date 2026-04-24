import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { sendEmailAsUser } from '@/src/lib/graph'

export const runtime = 'nodejs'

async function tryNotify(opts: Omit<Parameters<typeof sendEmailAsUser>[0], 'userId'>) {
  const account = await prisma.account.findFirst({
    where: { provider: 'microsoft-entra-id' },
    select: { userId: true },
  })
  if (!account) return
  try {
    await sendEmailAsUser({ ...opts, userId: account.userId })
  } catch {
    // Notification failure should never block the customer action
  }
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { name, email, message } = await req.json()
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  const quote = await prisma.quote.findUnique({
    where: { publicToken: params.token },
    include: { owner: { select: { email: true, name: true } } },
  })
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

  const baseUrl = process.env.METAFORGE_BASE_URL ?? 'https://metaforgeis.com'

  const notifyHtml = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;padding:24px;">
  <div style="border-bottom:3px solid #dab811;padding-bottom:16px;margin-bottom:24px;">
    <img src="${baseUrl}/images/MFIS_Logo.svg" alt="MetaForge Industrial Systems" height="48" style="display:block;" />
  </div>
  <h2 style="color:#d97706;">? Customer Question on Quote ${quote.quoteNumber}</h2>
  <p><strong>${name.trim()}</strong> (${email.trim()}) has a question about quote <strong>${quote.quoteNumber}</strong>:</p>
  <p style="background:#fefce8;border-left:3px solid #dab811;padding:12px;white-space:pre-wrap;">${message.trim()}</p>
  <a href="${baseUrl}/app/crm/quotes/${quote.id}" style="display:inline-block;background:#dab811;color:#111;font-weight:700;padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Reply in MetaForge</a>
  <div style="margin-top:32px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;">
    MetaForge Industrial Systems · (866) 563-8247
  </div>
</body></html>`

  await tryNotify({
    to: [quote.owner.email],
    subject: `Customer Question: Quote ${quote.quoteNumber} – ${name.trim()}`,
    htmlBody: notifyHtml,
  })

  return NextResponse.json({ ok: true })
}
