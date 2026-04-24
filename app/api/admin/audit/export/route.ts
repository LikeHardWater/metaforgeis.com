import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { canViewAuditLog } from '@/src/lib/permissions'

export async function GET() {
  const session = await auth()
  if (!session || !canViewAuditLog(session.user.systemRole)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10000,
  })

  const header = 'id,createdAt,action,userEmail,userRole,entity,entityId,ipAddress\n'
  const rows = logs.map((l) =>
    [
      l.id,
      l.createdAt.toISOString(),
      l.action,
      l.userEmail ?? '',
      l.userRole ?? '',
      l.entity ?? '',
      l.entityId ?? '',
      l.ipAddress ?? '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )

  const csv = header + rows.join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
