import { auth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { canManageUsers, canViewAuditLog } from '@/src/lib/permissions'
import { Users, ScrollText, ShieldCheck, TrendingUp, FileText, Package } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = canManageUsers(session.user.systemRole)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">MetaForge Platform</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="text-gold">{session.user.name ?? session.user.email}</span>
          </p>
          <p className="text-gray-600 text-xs mt-1">Role: {session.user.role}</p>
        </div>

        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">CRM</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NavCard href="/app/crm/leads" icon={<TrendingUp className="w-5 h-5" />} title="Leads" description="Manage inbound leads and pipeline" />
            <NavCard href="/app/crm/contacts" icon={<Users className="w-5 h-5" />} title="Contacts" description="People at your accounts" />
            <NavCard href="/app/crm/accounts" icon={<TrendingUp className="w-5 h-5" />} title="Accounts" description="Companies and organizations" />
            <NavCard href="/app/crm/deals" icon={<TrendingUp className="w-5 h-5" />} title="Opportunities" description="Opportunities and pipeline" />
            <NavCard href="/app/crm/quotes" icon={<FileText className="w-5 h-5" />} title="Quotes" description="Create and send customer quotes" />
          </div>
        </div>

        {isAdmin && (
          <div>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Administration</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <NavCard href="/app/admin/users" icon={<Users className="w-5 h-5" />} title="User Management" description="Manage users, assign roles, lock accounts" />
              <NavCard href="/app/admin/products" icon={<Package className="w-5 h-5" />} title="Products &amp; Services" description="Manage the quote line item catalog" />
              {canViewAuditLog(session.user.systemRole) && (
                <NavCard
                  href="/app/admin/audit"
                  icon={<ScrollText className="w-5 h-5" />}
                  title="Audit Log"
                  description="Immutable record of all platform activity"
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NavCard
              href="/app/settings/mfa"
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Two-Factor Authentication"
              description="Set up or manage your authenticator app"
            />
          </div>
        </div>

        <div className="mt-16 text-gray-700 text-xs">
          Phase 1.2 CRM · Phase 1.3 Billing · Phase 2 Field Services — coming soon
        </div>
      </div>
    </div>
  )
}

function NavCard({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <a
      href={href}
      className="group bg-white border border-slate-200 hover:border-gold rounded-xl p-6 transition-colors"
    >
      <div className="text-gold mb-3">{icon}</div>
      <div className="font-semibold text-slate-900 group-hover:text-gold transition-colors mb-1">{title}</div>
      <div className="text-slate-500 text-sm">{description}</div>
    </a>
  )
}

