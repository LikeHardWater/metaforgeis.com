import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import MfaSetup from './MfaSetup'

export default async function MfaPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mfaEnabled: true, mfaBackupCodes: true },
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-8">
          <a href="/app/dashboard" className="text-gray-500 hover:text-slate-600 text-sm">
            ← Back to dashboard
          </a>
          <h1 className="text-2xl font-black tracking-tight mt-4">
            Two-Factor Authentication
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Add an extra layer of security to your account.
          </p>
        </div>
        <MfaSetup
          mfaEnabled={user?.mfaEnabled ?? false}
          backupCodesRemaining={user?.mfaBackupCodes.length ?? 0}
        />
      </div>
    </div>
  )
}

