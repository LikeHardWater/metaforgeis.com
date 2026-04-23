import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { getSignedDownloadUrl } from '@/src/lib/s3'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const attachment = await prisma.attachment.findUnique({ where: { id: params.id } })
  if (!attachment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = await getSignedDownloadUrl(attachment.s3Key)
  return NextResponse.redirect(url)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const attachment = await prisma.attachment.findUnique({ where: { id: params.id } })
  if (!attachment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const { deleteFromS3 } = await import('@/src/lib/s3')
    await deleteFromS3(attachment.s3Key)
  } catch { /* continue even if S3 delete fails */ }

  await prisma.attachment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
