import { prisma } from '@/src/lib/prisma'
import AcceptForm from './AcceptForm'

export default async function AcceptQuotePage({ params }: { params: { token: string } }) {
  const quote = await prisma.quote.findUnique({
    where: { publicToken: params.token },
    include: { contact: { select: { firstName: true, lastName: true, email: true } } },
  })

  const defaultName = quote?.contact
    ? `${quote.contact.firstName} ${quote.contact.lastName}`.trim()
    : ''
  const defaultEmail = quote?.contact?.email ?? ''

  return <AcceptForm token={params.token} defaultName={defaultName} defaultEmail={defaultEmail} />
}
