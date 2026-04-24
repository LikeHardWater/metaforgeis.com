import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { sendEmailAsUser } from '@/src/lib/graph'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { toEmail, message } = await req.json()
  if (!toEmail) return NextResponse.json({ error: 'Recipient email required' }, { status: 400 })

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      lineItems: { orderBy: { sortOrder: 'asc' } },
      account: { select: { name: true } },
      contact: { select: { firstName: true, lastName: true, email: true } },
      owner: { select: { name: true, email: true } },
    },
  })

  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  // Ensure publicToken exists
  const publicToken = quote.publicToken ?? (await prisma.quote.update({
    where: { id: params.id },
    data: { publicToken: crypto.randomUUID() },
  })).publicToken!

  const baseUrl = process.env.METAFORGE_BASE_URL ?? 'https://metaforgeis.com'
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 })

  const lineItemRows = quote.lineItems.map((li: { description: string; quantity: unknown; unitPrice: unknown; discount: unknown; taxRate: unknown; lineTotal: unknown }) => {
    const base = Math.max(0, Number(li.quantity) * Number(li.unitPrice) - Number(li.discount))
    const taxAmt = base * Number(li.taxRate) / 100
    return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${li.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${Number(li.quantity)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${fmt(Number(li.unitPrice))}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${fmt(Number(li.discount))}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${fmt(taxAmt)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">$${fmt(Number(li.lineTotal))}</td>
    </tr>`
  }).join('')

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#1e293b;max-width:700px;margin:0 auto;padding:24px;">

  <!-- Header with logo -->
  <div style="border-bottom:3px solid #dab811;padding-bottom:16px;margin-bottom:24px;">
    <img src="${baseUrl}/images/MFIS_Logo.svg" alt="MetaForge Industrial Systems" height="48" style="display:block;" />
    <p style="color:#64748b;margin:6px 0 0;font-size:13px;">High-Performance Equipment. Precision Installation. Zero Compromise.</p>
  </div>

  <h2 style="font-size:18px;">Quote: ${quote.subject}</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
    <tr><td style="color:#64748b;width:120px;padding:3px 0;">Quote #</td><td><strong>${quote.quoteNumber}</strong></td></tr>
    <tr><td style="color:#64748b;padding:3px 0;">Stage</td><td>${quote.stage}</td></tr>
    ${quote.validUntil ? `<tr><td style="color:#64748b;padding:3px 0;">Valid Until</td><td>${new Date(quote.validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>` : ''}
    ${quote.account ? `<tr><td style="color:#64748b;padding:3px 0;">Account</td><td>${quote.account.name}</td></tr>` : ''}
  </table>

  ${message ? `<p style="background:#f8fafc;border-left:3px solid #dab811;padding:12px;margin:16px 0;">${message}</p>` : ''}

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-top:24px;">Quoted Items</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr style="background:#f8fafc;text-align:left;">
        <th style="padding:8px 12px;color:#64748b;font-weight:600;">Description</th>
        <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Qty</th>
        <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Unit Price</th>
        <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Discount</th>
        <th style="padding:8px 12px;color:#64748b;font-weight:600;text-align:right;">Tax ($)</th>
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

  ${quote.terms ? `<div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;font-size:13px;"><strong>Terms &amp; Conditions</strong><p style="margin:8px 0 0;color:#64748b;">${quote.terms}</p></div>` : ''}

  <!-- Action buttons -->
  <div style="margin-top:32px;text-align:center;">
    <a href="${baseUrl}/quote/${publicToken}/accept"
       style="display:inline-block;background:#dab811;color:#111827;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;margin-right:12px;">
      ✓ Accept Quote
    </a>
    <a href="${baseUrl}/quote/${publicToken}/question"
       style="display:inline-block;background:#1e293b;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
      ? Ask a Question
    </a>
  </div>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
    <p>Sent by ${quote.owner.name ?? quote.owner.email} · MetaForge Industrial Systems</p>
    <p>(866) 563-8247 · info@metaforgeis.com</p>
  </div>
</body>
</html>`

  async function sendWithFallback(primaryUserId: string, opts: Omit<Parameters<typeof sendEmailAsUser>[0], 'userId'>) {
    try {
      await sendEmailAsUser({ ...opts, userId: primaryUserId })
    } catch {
      const any = await prisma.account.findFirst({ where: { provider: 'microsoft-entra-id' }, select: { userId: true } })
      if (any && any.userId !== primaryUserId) {
        await sendEmailAsUser({ ...opts, userId: any.userId })
      } else {
        throw new Error('No Microsoft account available to send email. Please sign in with Microsoft SSO.')
      }
    }
  }

  try {
    await sendWithFallback(session.user.id, {
      to: [toEmail],
      subject: `Quote ${quote.quoteNumber}: ${quote.subject}`,
      htmlBody,
    })

    // If quote is linked to a deal, advance the deal to "Proposal Sent" stage
    if (quote.dealId) {
      const deal = await prisma.crmDeal.findUnique({
        where: { id: quote.dealId },
        include: { pipeline: { include: { stages: { orderBy: { order: 'asc' } } } }, stage: true },
      })
      if (deal) {
        const proposalStage = deal.pipeline.stages.find((s) =>
          s.name.toLowerCase().includes('proposal') || s.name.toLowerCase().includes('sent')
        )
        if (proposalStage && proposalStage.order > deal.stage.order) {
          await prisma.crmDeal.update({ where: { id: deal.id }, data: { stageId: proposalStage.id } })
        }
      }
    }

    await prisma.$transaction([
      prisma.quote.update({
        where: { id: params.id },
        data: { stage: 'SENT' },
      }),
      prisma.quoteEvent.create({
        data: {
          quoteId: params.id,
          type: 'SENT',
          authorName: session.user.name ?? session.user.email,
          authorEmail: toEmail,
          content: message ?? null,
        },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send email'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
