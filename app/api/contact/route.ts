import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, company, email, phone, service, message } = body

    // Basic server-side validation
    if (!name || !company || !email || !service || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In a production deployment, integrate an email service here
    // (e.g. Resend, SendGrid, Nodemailer via SMTP).
    // For now we log to the console and return success so the form works.
    console.log('[Contact Form Submission]', {
      name,
      company,
      email,
      phone: phone || 'N/A',
      service,
      message,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
