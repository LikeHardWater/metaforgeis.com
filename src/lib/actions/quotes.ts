"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { auditLog } from '@/src/lib/audit'
import { QuoteStage } from '@prisma/client'

async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.quote.count()
  return `QU-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function createQuote(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthenticated')

  const quoteNumber = await generateQuoteNumber()

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      subject: formData.get('subject') as string,
      stage: QuoteStage.DRAFT,
      validUntil: formData.get('validUntil') ? new Date(formData.get('validUntil') as string) : null,
      accountId: (formData.get('accountId') as string) || null,
      contactId: (formData.get('contactId') as string) || null,
      dealId:    (formData.get('dealId') as string) || null,
      billingStreet:   (formData.get('billingStreet') as string) || null,
      billingCity:     (formData.get('billingCity') as string) || null,
      billingState:    (formData.get('billingState') as string) || null,
      billingZip:      (formData.get('billingZip') as string) || null,
      billingCountry:  (formData.get('billingCountry') as string) || null,
      shippingStreet:  (formData.get('shippingStreet') as string) || null,
      shippingCity:    (formData.get('shippingCity') as string) || null,
      shippingState:   (formData.get('shippingState') as string) || null,
      shippingZip:     (formData.get('shippingZip') as string) || null,
      shippingCountry: (formData.get('shippingCountry') as string) || null,
      terms: (formData.get('terms') as string) || null,
      notes: (formData.get('notes') as string) || null,
      ownerId: session.user.id,
    },
  })

  await auditLog({ action: 'QUOTE_CREATED', userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: 'Quote', entityId: quote.id })
  redirect(`/app/crm/quotes/${quote.id}?notify=created`)
}

export async function updateQuoteDetails(quoteId: string, formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthenticated')

  // Snapshot current state before overwriting
  const current = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
  })

  if (current) {
    await prisma.$transaction([
      prisma.quoteVersion.create({
        data: {
          quoteId,
          revision: current.revision,
          savedBy: session.user.name ?? session.user.email,
          snapshot: JSON.parse(JSON.stringify(current)),
        },
      }),
      prisma.quote.update({
        where: { id: quoteId },
        data: {
          revision: { increment: 1 },
          subject:  formData.get('subject') as string,
          stage:    formData.get('stage') as QuoteStage,
          validUntil: formData.get('validUntil') ? new Date(formData.get('validUntil') as string) : null,
          accountId: (formData.get('accountId') as string) || null,
          contactId: (formData.get('contactId') as string) || null,
          dealId:    (formData.get('dealId') as string) || null,
          billingStreet:   (formData.get('billingStreet') as string) || null,
          billingCity:     (formData.get('billingCity') as string) || null,
          billingState:    (formData.get('billingState') as string) || null,
          billingZip:      (formData.get('billingZip') as string) || null,
          billingCountry:  (formData.get('billingCountry') as string) || null,
          shippingStreet:  (formData.get('shippingStreet') as string) || null,
          shippingCity:    (formData.get('shippingCity') as string) || null,
          shippingState:   (formData.get('shippingState') as string) || null,
          shippingZip:     (formData.get('shippingZip') as string) || null,
          shippingCountry: (formData.get('shippingCountry') as string) || null,
          terms: (formData.get('terms') as string) || null,
          notes: (formData.get('notes') as string) || null,
        },
      }),
    ])
  }

  revalidatePath(`/app/crm/quotes/${quoteId}`)
}

export async function saveQuoteLineItems(quoteId: string, lineItemsJson: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthenticated')

  type LineItemInput = {
    id?: string
    productId?: string
    description: string
    quantity: number
    unitPrice: number
    discount: number
    taxRate: number
    lineTotal: number
    sortOrder: number
  }

  const items: LineItemInput[] = JSON.parse(lineItemsJson)

  await prisma.$transaction(async (tx) => {
    await tx.quoteLineItem.deleteMany({ where: { quoteId } })

    if (items.length > 0) {
      await tx.quoteLineItem.createMany({
        data: items.map((item) => ({
          quoteId,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          taxRate: item.taxRate,
          lineTotal: item.lineTotal,
          sortOrder: item.sortOrder,
        })),
      })
    }

    const subTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const discountAmount = items.reduce((sum, i) => sum + i.discount, 0)
    const taxAmount = items.reduce((sum, i) => {
      const taxable = (i.unitPrice * i.quantity - i.discount)
      return sum + (taxable * i.taxRate) / 100
    }, 0)
    const grandTotal = subTotal - discountAmount + taxAmount

    await tx.quote.update({
      where: { id: quoteId },
      data: {
        subTotal: Math.max(0, subTotal),
        discountAmount: Math.max(0, discountAmount),
        taxAmount: Math.max(0, taxAmount),
        grandTotal: Math.max(0, grandTotal),
      },
    })
  })

  revalidatePath(`/app/crm/quotes/${quoteId}`)
}

export async function deleteAttachment(attachmentId: string, entityType: string, entityId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthenticated')

  const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } })
  if (!attachment) throw new Error('Not found')

  // Delete from S3 if configured
  if (process.env.AWS_S3_BUCKET) {
    try {
      const { deleteFromS3 } = await import('@/src/lib/s3')
      await deleteFromS3(attachment.s3Key)
    } catch {
      // Don't block UI if S3 delete fails
    }
  }

  await prisma.attachment.delete({ where: { id: attachmentId } })
  revalidatePath(`/app/crm/${entityType}/${entityId}`)
}
