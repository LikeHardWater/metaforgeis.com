'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Building2, TrendingUp, UserPlus, LayoutDashboard, LogOut, FileText, Percent, Package } from 'lucide-react'
import { signOut } from 'next-auth/react'

const NAV = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/crm/leads', label: 'Leads', icon: UserPlus },
  { href: '/app/crm/deals', label: 'Opportunities', icon: TrendingUp },
  { href: '/app/crm/accounts', label: 'Accounts', icon: Building2 },
  { href: '/app/crm/contacts', label: 'Contacts', icon: Users },
  { href: '/app/crm/quotes', label: 'Quotes', icon: FileText },
  { href: '/app/admin/products', label: 'Products', icon: Package },
  { href: '/app/admin/taxes', label: 'Tax Rates', icon: Percent },
]

export default function CrmNav({ userEmail, userName }: { userEmail: string; userName?: string }) {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-0 flex items-center gap-1">
      <div className="flex items-center gap-1 mr-6 py-3 border-r border-slate-200 pr-6">
        <span className="text-gold font-black text-sm tracking-tight">MetaForge</span>
        <span className="text-gray-500 text-xs ml-1">CRM</span>
      </div>

      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href) && href !== '/app/dashboard'
          ? true
          : pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors ${
              active
                ? 'border-gold text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        )
      })}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-gray-500 text-xs">{userName ?? userEmail}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-gray-500 hover:text-slate-900 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}

