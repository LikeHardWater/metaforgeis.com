import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { canManageUsers } from '@/src/lib/permissions'
import UsersTable from './UsersTable'

export default async function UsersPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!canManageUsers(session.user.systemRole)) redirect('/app/dashboard')

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.role.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage platform users, roles, and account status.
        </p>
      </div>
      <UsersTable users={users} roles={roles} currentUserId={session.user.id} />
    </div>
  )
}

