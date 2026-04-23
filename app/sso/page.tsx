import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'

export default async function SSOPage() {
  const session = await auth()
  if (session) redirect('/app/dashboard')
  redirect('/api/auth/signin/microsoft-entra-id?callbackUrl=/app/dashboard')
}
