import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { QuoteStage } from '@prisma/client'
import { updateQuoteDetails } from '@/src/lib/actions/quotes'
import { QuoteLineItemBuilder } from '@/app/components/crm/QuoteLineItemBuilder'
import { AttachmentSection } from '@/app/components/crm/AttachmentSection'
import { SendQuoteModal } from '@/app/components/crm/SendQuoteModal'
import { QuoteHistory } from '@/app/components/crm/QuoteHistory'
import { QuoteAddressFields } from '@/app/components/crm/QuoteAddressFields'
import { QuoteRevisions } from '@/app/components/crm/QuoteRevisions'

const STAGE_COLORS: Record<QuoteStage, string> = {
  DRAFT:    'text-slate-500 bg-slate-100 border-slate-200',
  SENT:     'text-blue-700 bg-blue-100 border-blue-200',
  ACCEPTED: 'text-green-700 bg-green-100 border-green-200',
  DECLINED: 'text-red-700 bg-red-100 border-red-200',
  REVISED:  'text-amber-700 bg-amber-100 border-amber-200',
  EXPIRED:  'text-slate-400 bg-slate-50 border-slate-200',
}

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const [quote, accounts, contacts, deals, products, stateTaxes, attachments, events, versions] = await Promise.all([
    prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        deal: { select: { id: true, name: true } },
        owner: { select: { name: true, email: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.crmAccount.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.crmContact.findMany({ orderBy: { lastName: 'asc' }, select: { id: true, firstName: true, lastName: true } }),
    prisma.crmDeal.findMany({ where: { status: 'OPEN' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.stateTaxRate.findMany({ orderBy: { stateCode: 'asc' } }),
    prisma.attachment.findMany({
      where: { entityType: 'quote', entityId: params.id },
      include: { uploadedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quoteEvent.findMany({
      where: { quoteId: params.id },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.quoteVersion.findMany({
      where: { quoteId: params.id },
      orderBy: { revision: 'asc' },
    }),
  ])

  if (!quote) notFound()

  const updateWithId = updateQuoteDetails.bind(null, quote.id)

  const defaultTaxRate = quote.shippingState
    ? Number(stateTaxes.find((t) => t.stateCode === quote.shippingState)?.taxRate ?? 0)
    : 0

  const initialItems = quote.lineItems.map((li) => ({
    _key: '',
    productId: li.productId ?? '',
    description: li.description,
    quantity: Number(li.quantity),
    unitPrice: Number(li.unitPrice),
    discount: Number(li.discount),
    taxRate: Number(li.taxRate),
    taxStateCode: stateTaxes.find((t) => Number(t.taxRate) === Number(li.taxRate))?.stateCode ?? '',
    lineTotal: Number(li.lineTotal),
    sortOrder: li.sortOrder,
  }))

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Page header */}
      <div className="mb-4">
        <Link href="/app/crm/quotes" className="text-gray-500 hover:text-slate-600 text-sm">← Quotes</Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight">{quote.subject}</h1>
            <span className={`text-xs border rounded px-2 py-0.5 ${STAGE_COLORS[quote.stage]}`}>{quote.stage}</span>
            <span className="text-slate-400 text-sm">Rev. {quote.revision}</span>
          </div>
          <SendQuoteModal quoteId={quote.id} defaultEmail={quote.contact?.email ?? ''} />
        </div>
        <p className="text-slate-500 text-sm mt-0.5">{quote.quoteNumber}</p>
      </div>

      {/* Info bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 mb-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
        <InfoItem label="Owner" value={quote.owner.name ?? quote.owner.email} />
        <InfoItem label="Created" value={new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
        {quote.account && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs">Account</span>
            <Link href={`/app/crm/accounts/${quote.account.id}`} className="text-gold hover:underline font-medium">{quote.account.name}</Link>
          </div>
        )}
        {quote.contact && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs">Contact</span>
            <Link href={`/app/crm/contacts/${quote.contact.id}`} className="text-gold hover:underline font-medium">{quote.contact.firstName} {quote.contact.lastName}</Link>
          </div>
        )}
        {quote.deal && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs">Opportunity</span>
            <Link href={`/app/crm/deals/${quote.deal.id}`} className="text-gold hover:underline font-medium">{quote.deal.name}</Link>
          </div>
        )}
        {quote.validUntil && (
          <InfoItem label="Valid Until" value={new Date(quote.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
        )}
      </div>

      {/* Totals banner */}
      {Number(quote.grandTotal) > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Subtotal',   value: `$${fmt(Number(quote.subTotal))}` },
            { label: 'Discount',   value: `-$${fmt(Number(quote.discountAmount))}` },
            { label: 'Tax',        value: `$${fmt(Number(quote.taxAmount))}` },
            { label: 'Grand Total',value: `$${fmt(Number(quote.grandTotal))}`, gold: true },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{item.label}</p>
              <p className={`text-xl font-black ${item.gold ? 'text-gold' : 'text-slate-900'}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full-width content */}
      <div className="space-y-6">

        {/* Line Items */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <QuoteLineItemBuilder
            quoteId={quote.id}
            products={products.map((p) => ({ ...p, unitPrice: Number(p.unitPrice) }))}
            stateTaxes={stateTaxes.map((t) => ({ ...t, taxRate: Number(t.taxRate), taxesServices: t.taxesServices }))}
            defaultTaxRate={defaultTaxRate}
            shippingStateCode={quote.shippingState ?? ''}
            initialItems={initialItems}
          />
        </div>

        {/* Quote details form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-500 text-xs uppercase tracking-wider mb-4">Quote Details</h2>
          <form action={updateWithId} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Subject" name="subject" defaultValue={quote.subject} />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Stage</label>
                <select name="stage" defaultValue={quote.stage} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                  {Object.values(QuoteStage).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Account</label>
                <select name="accountId" defaultValue={quote.accountId ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                  <option value="">— None —</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Contact</label>
                <select name="contactId" defaultValue={quote.contactId ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                  <option value="">— None —</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Opportunity</label>
                <select name="dealId" defaultValue={quote.dealId ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
                  <option value="">— None —</option>
                  {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <Field label="Valid Until" name="validUntil" type="date" defaultValue={quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : ''} />
            </div>

            <QuoteAddressFields
              billing={{
                street: quote.billingStreet ?? '',
                city: quote.billingCity ?? '',
                state: quote.billingState ?? '',
                zip: quote.billingZip ?? '',
                country: quote.billingCountry ?? '',
              }}
              shipping={{
                street: quote.shippingStreet ?? '',
                city: quote.shippingCity ?? '',
                state: quote.shippingState ?? '',
                zip: quote.shippingZip ?? '',
                country: quote.shippingCountry ?? '',
              }}
              stateTaxes={stateTaxes.map((t) => ({ stateCode: t.stateCode, stateName: t.stateName }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Terms &amp; Conditions</label>
                <textarea name="terms" rows={4} defaultValue={quote.terms ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Internal Notes</label>
                <textarea name="notes" rows={4} defaultValue={quote.notes ?? ''} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none resize-none" />
              </div>
            </div>
            <button type="submit" className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-5 py-2 rounded-lg transition-colors">Save Details</button>
          </form>
        </div>

        {/* Attachments */}
        <AttachmentSection entityType="quote" entityId={quote.id} attachments={attachments} />

        {/* Communication History */}
        <QuoteHistory quoteId={quote.id} events={events} />

        {/* Revision History */}
        <QuoteRevisions
          versions={versions.map((v) => ({ ...v, snapshot: v.snapshot as Record<string, unknown> }))}
          currentRevision={quote.revision}
          quoteNumber={quote.quoteNumber}
        />
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  )
}

function Field({ label, name, defaultValue = '', type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue} className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none" />
    </div>
  )
}
