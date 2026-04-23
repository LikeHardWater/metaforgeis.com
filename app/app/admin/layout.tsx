import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import CrmNav from '@/app/app/crm/CrmNav'
import { Toaster } from '@/app/components/ui/Toaster'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <CrmNav userEmail={session.user.email} userName={session.user.name ?? undefined} />
      <main className="flex-1">{children}</main>
      <Suspense><Toaster /></Suspense>
    </div>
  )
}
