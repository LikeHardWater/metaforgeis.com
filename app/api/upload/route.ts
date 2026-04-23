import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { uploadToS3, buildS3Key } from '@/src/lib/s3'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const entityType = formData.get('entityType') as string | null
  const entityId = formData.get('entityId') as string | null

  if (!file || !entityType || !entityId) {
    return NextResponse.json({ error: 'Missing file, entityType, or entityId' }, { status: 400 })
  }

  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 25 MB limit' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const key = buildS3Key(entityType, entityId, file.name)

  await uploadToS3(key, buffer, file.type || 'application/octet-stream')

  const attachment = await prisma.attachment.create({
    data: {
      entityType,
      entityId,
      filename: file.name,
      s3Key: key,
      mimeType: file.type || null,
      sizeBytes: file.size,
      uploadedById: session.user.id,
    },
  })

  return NextResponse.json({ id: attachment.id, filename: attachment.filename })
}
