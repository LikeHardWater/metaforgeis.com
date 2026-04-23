import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { canViewAuditLog } from '@/src/lib/permissions'
import { Download } from 'lucide-react'

const ACTION_COLORS: Record<string, string> = {
  LOGIN_SUCCESS: 'text-green-700',
  LOGIN_FAILED: 'text-red-600',
  USER_ROLE_CHANGED: 'text-amber-700',
  USER_ACTIVATED: 'text-green-700',
  USER_DEACTIVATED: 'text-slate-500',
  USER_UNLOCKED: 'text-blue-700',
  USER_CREATED: 'text-blue-700',
  LEAD_CREATED: 'text-indigo-700',
  LEAD_UPDATED: 'text-indigo-700',
  LEAD_CONVERTED: 'text-purple-700',
  DEAL_CREATED: 'text-teal-700',
  DEAL_UPDATED: 'text-teal-700',
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string; user?: string }
}) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!canViewAuditLog(session.user.systemRole)) redirect('/app/dashboard')

  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const pageSize = 50
  const skip = (page - 1) * pageSize

  const where = {
    ...(searchParams.action ? { action: searchParams.action } : {}),
    ...(searchParams.user
      ? {
          OR: [
            { userEmail: { contains: searchParams.user, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [logs, total, actions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-slate-900">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Audit Log</h1>
            <p className="text-slate-500 text-sm mt-1">
              Immutable record of all platform activity. {total.toLocaleString()} entries.
            </p>
          </div>
          <a
            href="/api/admin/audit/export"
            className="flex items-center gap-2 text-sm bg-white border border-slate-200 hover:border-gold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>

        {/* Filters */}
        <form className="flex gap-3 mb-6">
          <input
            name="user"
            defaultValue={searchParams.user}
            placeholder="Filter by email..."
            className="bg-white border border-slate-200 focus:border-gold rounded-lg px-4 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none"
          />
          <select
            name="action"
            defaultValue={searchParams.action}
            className="bg-white border border-slate-200 focus:border-gold rounded-lg px-4 py-2 text-slate-900 text-sm focus:outline-none"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a.action} value={a.action}>{a.action}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Filter
          </button>
          {(searchParams.action || searchParams.user) && (
            <a
              href="/app/admin/audit"
              className="text-sm text-slate-500 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              Clear
            </a>
          )}
        </form>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3">Time</th>
                <th className="text-left px-6 py-3">Action</th>
                <th className="text-left px-6 py-3">User</th>
                <th className="text-left px-6 py-3">Entity</th>
                <th className="text-left px-6 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-100/40 transition-colors">
                  <td className="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`font-mono text-xs font-medium ${ACTION_COLORS[log.action] ?? 'text-slate-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600 text-xs">
                    <div>{log.userEmail ?? '—'}</div>
                    {log.userRole && <div className="text-gray-500">{log.userRole}</div>}
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs">
                    {log.entity ? `${log.entity}${log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ''}` : '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs font-mono">
                    {log.ipAddress ?? '—'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`?page=${page - 1}${searchParams.action ? `&action=${searchParams.action}` : ''}${searchParams.user ? `&user=${searchParams.user}` : ''}`}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-gold rounded-lg transition-colors"
                >
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`?page=${page + 1}${searchParams.action ? `&action=${searchParams.action}` : ''}${searchParams.user ? `&user=${searchParams.user}` : ''}`}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-gold rounded-lg transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        )}
    </div>
  )
}

