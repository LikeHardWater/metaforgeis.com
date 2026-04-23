import { prisma } from './prisma'

interface EmailAttachment {
  name: string
  contentType: string
  contentBytes: string // base64
}

interface SendEmailOptions {
  userId: string
  to: string[]
  subject: string
  htmlBody: string
  attachments?: EmailAttachment[]
}

async function refreshMicrosoftToken(accountId: string, refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.AZURE_AD_CLIENT_ID!,
    client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    scope: 'openid profile email offline_access Mail.Send',
  })

  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
    { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  if (!res.ok) throw new Error('Failed to refresh Microsoft access token')

  const data = await res.json()

  await prisma.account.update({
    where: { id: accountId },
    data: {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? refreshToken,
      expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    },
  })

  return data.access_token as string
}

export async function sendEmailAsUser({ userId, to, subject, htmlBody, attachments }: SendEmailOptions) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'microsoft-entra-id' },
  })

  if (!account?.access_token) {
    throw new Error('No Microsoft account linked. Sign in via Microsoft to send email.')
  }

  let token = account.access_token

  if (account.expires_at && account.expires_at * 1000 < Date.now()) {
    if (!account.refresh_token) throw new Error('Microsoft token expired and no refresh token available.')
    token = await refreshMicrosoftToken(account.id, account.refresh_token)
  }

  const message = {
    subject,
    body: { contentType: 'HTML', content: htmlBody },
    toRecipients: to.map((address) => ({ emailAddress: { address } })),
    attachments: attachments?.map((a) => ({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: a.name,
      contentType: a.contentType,
      contentBytes: a.contentBytes,
    })),
  }

  const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Graph API error: ${JSON.stringify(err)}`)
  }
}
