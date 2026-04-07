import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import path from 'path'
import fs from 'fs/promises'

/**
 * For production deployment on Vercel or similar platforms,
 * replace file-system writes with a database (e.g. PlanetScale, Supabase, or Vercel KV).
 * File system writes work correctly in local dev and on servers with persistent storage.
 */

const ALLOWED_SECTIONS = [
  'hero', 'services', 'gallery', 'brands',
  'testimonials', 'locations', 'about', 'team', 'contact', 'seo',
]

function getDataPath(section: string): string {
  return path.join(process.cwd(), 'src', 'data', 'content', `${section}.json`)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { section: string } }
) {
  const { section } = params

  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json({ error: 'Unknown section' }, { status: 404 })
  }

  // Auth check for admin routes
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const filePath = getDataPath(section)
    const content = await fs.readFile(filePath, 'utf-8')
    return NextResponse.json(JSON.parse(content))
  } catch {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { section: string } }
) {
  const { section } = params

  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json({ error: 'Unknown section' }, { status: 404 })
  }

  // Auth check
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const filePath = getDataPath(section)
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CMS Write Error]', err)
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 })
  }
}
