import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { sendEmailAsUser } from '@/src/lib/graph'

export const runtime = 'nodejs'

function buildQuoteHtml(quote: NonNullable<Awaited<ReturnType<typeof getQuote>>>, baseUrl: string) {
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 })
  const lineItemRows = quote.lineItems.map((li: { description: string; quantity: unknown; unitPrice: unknown; discount: unknown; taxRate: unknown; lineTotal: unknown }) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${li.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${Number(li.quantity)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${fmt(Number(li.unitPrice))}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${fmt(Number(li.discount))}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${Number(li.taxRate)}%</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">$${fmt(Number(li.lineTotal))}</td>
    </tr>`).join('')

  return `
    <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-top:24px;">Quoted Items</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f8fafc;text-align:left;">
          <th style="padding:8px 12px;color:#64748b;font-weight:600;">Description</th>
          <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Qty</th>
          <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Unit Price</th>
          <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Discount</th>
          <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Tax</th>
          <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${lineItemRows}</tbody>
    </table>
    <div style="margin-top:16px;text-align:right;">
      <table style="margin-left:auto;min-width:260px;font-size:14px;">
        <tr><td style="padding:4px 12px;color:#64748b;">Subtotal</td><td style="padding:4px 12px;text-align:right;">$${fmt(Number(quote.subTotal))}</td></tr>
        <tr><td style="padding:4px 12px;color:#64748b;">Discount</td><td style="padding:4px 12px;text-align:right;">-$${fmt(Number(quote.discountAmount))}</td></tr>
        <tr><td style="padding:4px 12px;color:#64748b;">Tax</td><td style="padding:4px 12px;text-align:right;">$${fmt(Number(quote.taxAmount))}</td></tr>
        <tr style="border-top:2px solid #e2e8f0;font-weight:700;font-size:16px;">
          <td style="padding:8px 12px;">Grand Total</td>
          <td style="padding:8px 12px;text-align:right;color:#dab811;">$${fmt(Number(quote.grandTotal))}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top:24px;text-align:center;">
      <a href="${baseUrl}/quote/${quote.publicToken}/accept" style="display:inline-block;background:#dab811;color:#111;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;margin-right:12px;">✓ Accept Quote</a>
      <a href="${baseUrl}/quote/${quote.publicToken}/question" style="display:inline-block;background:#1e293b;color:#fff;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">? Ask a Question</a>
    </div>`
}

async function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      lineItems: { orderBy: { sortOrder: 'asc' } },
      owner: { select: { name: true, email: true } },
    },
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { toEmail, replyText, includeQuote } = await req.json()
  if (!toEmail || !replyText?.trim()) {
    return NextResponse.json({ error: 'Recipient email and reply text are required' }, { status: 400 })
  }

  const quote = await getQuote(params.id)
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  const baseUrl = process.env.METAFORGE_BASE_URL ?? 'https://metaforgeis.com'

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#1e293b;max-width:700px;margin:0 auto;padding:24px;">
  <div style="border-bottom:3px solid #dab811;padding-bottom:16px;margin-bottom:24px;">
    <img src="${baseUrl}/images/MFIS_Logo.svg" alt="MetaForge Industrial Systems" height="48" style="display:block;" />
  </div>

  <h2 style="font-size:18px;">Re: Quote ${quote.quoteNumber}</h2>

  <p style="background:#f8fafc;border-left:3px solid #dab811;padding:12px;margin:16px 0;white-space:pre-wrap;">${replyText}</p>

  ${includeQuote ? buildQuoteHtml(quote, baseUrl) : ''}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
    <p>Sent by ${quote.owner.name ?? quote.owner.email} · MetaForge Industrial Systems</p>
    <p>(866) 563-8247 · info@metaforgeis.com</p>
  </div>
</body>
</html>`

  try {
    await sendEmailAsUser({
      userId: session.user.id,
      to: [toEmail],
      subject: `Re: Quote ${quote.quoteNumber}`,
      htmlBody,
    })

    await prisma.quoteEvent.create({
      data: {
        quoteId: params.id,
        type: 'REPLY',
        authorName: session.user.name ?? session.user.email,
        authorEmail: session.user.email,
        content: replyText.trim(),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send reply'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
