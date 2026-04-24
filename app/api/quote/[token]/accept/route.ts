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
  const { name, email } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const quote = await prisma.quote.findUnique({
    where: { publicToken: params.token },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      contact: { select: { email: true, firstName: true, lastName: true } },
    },
  })
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (quote.stage === 'ACCEPTED') return NextResponse.json({ error: 'Already accepted' }, { status: 409 })

  // Parse real client IP from x-forwarded-for (CloudFront prepends IPs as "client, proxy, ...")
  const rawIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ip = rawIp.split(',')[0].trim()

  const acceptedAt = new Date()

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
        authorEmail: email?.trim() ?? null,
        content: `Digitally accepted by ${name.trim()}`,
        ipAddress: ip,
      },
    }),
  ])

  // Auto-convert linked deal to WON
  if (quote.dealId) {
    await prisma.crmDeal.update({
      where: { id: quote.dealId },
      data: { status: 'WON' },
    }).catch(() => {})
  }

  const baseUrl = process.env.METAFORGE_BASE_URL ?? 'https://metaforgeis.com'

  // Notify quote owner
  const ownerNotifyHtml = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;padding:24px;">
  <div style="border-bottom:3px solid #dab811;padding-bottom:16px;margin-bottom:24px;">
    <img src="${baseUrl}/images/MFIS_Logo.svg" alt="MetaForge Industrial Systems" height="48" style="display:block;" />
  </div>
  <h2 style="color:#16a34a;">✓ Quote Accepted</h2>
  <p><strong>${name.trim()}</strong> has accepted quote <strong>${quote.quoteNumber}</strong>.</p>
  <p style="color:#64748b;font-size:13px;">Accepted at: ${acceptedAt.toLocaleString('en-US', { timeZoneName: 'short' })}<br/>IP Address: ${ip}</p>
  <a href="${baseUrl}/app/crm/quotes/${quote.id}" style="display:inline-block;background:#dab811;color:#111;font-weight:700;padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">View Quote</a>
  <div style="margin-top:32px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;">
    MetaForge Industrial Systems · (866) 563-8247
  </div>
</body></html>`

  await tryNotify({
    to: [quote.owner.email],
    subject: `Quote ${quote.quoteNumber} Accepted by ${name.trim()}`,
    htmlBody: ownerNotifyHtml,
  })

  // Send customer confirmation if email provided
  const customerEmail = email?.trim() ?? quote.contact?.email
  if (customerEmail) {
    const confirmHtml = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;padding:24px;">
  <div style="border-bottom:3px solid #dab811;padding-bottom:16px;margin-bottom:24px;">
    <img src="${baseUrl}/images/MFIS_Logo.svg" alt="MetaForge Industrial Systems" height="48" style="display:block;" />
  </div>
  <h2 style="color:#16a34a;">✓ Quote Acceptance Confirmed</h2>
  <p>Hi <strong>${name.trim()}</strong>,</p>
  <p>We have received your acceptance of quote <strong>${quote.quoteNumber}</strong>. Your digital signature has been recorded.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
    <tr><td style="color:#64748b;padding:4px 0;width:140px;">Quote Number</td><td><strong>${quote.quoteNumber}</strong></td></tr>
    <tr><td style="color:#64748b;padding:4px 0;">Subject</td><td>${quote.subject}</td></tr>
    <tr><td style="color:#64748b;padding:4px 0;">Accepted By</td><td>${name.trim()}</td></tr>
    <tr><td style="color:#64748b;padding:4px 0;">Date &amp; Time</td><td>${acceptedAt.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</td></tr>
  </table>
  <p>Our team will be in touch shortly to confirm next steps. If you have any questions, please reply to this email.</p>
  <div style="margin-top:32px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;">
    <p>MetaForge Industrial Systems · (866) 563-8247 · info@metaforgeis.com</p>
  </div>
</body></html>`

    await tryNotify({
      to: [customerEmail],
      subject: `Confirmation: Quote ${quote.quoteNumber} Accepted`,
      htmlBody: confirmHtml,
    })
  }

  return NextResponse.json({ ok: true })
}
