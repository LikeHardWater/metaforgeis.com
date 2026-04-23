'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, Image, Star, MapPin, Info, Users, Mail, Search, Settings, Package, Wrench } from 'lucide-react'
import { cn } from '@/src/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/content/hero', label: 'Hero', icon: Settings },
  { href: '/admin/content/services', label: 'Services', icon: Wrench },
  { href: '/admin/content/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/content/brands', label: 'Brands', icon: Package },
  { href: '/admin/content/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/content/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/content/about', label: 'About', icon: Info },
  { href: '/admin/content/team', label: 'Team', icon: Users },
  { href: '/admin/content/contact', label: 'Contact', icon: Mail },
  { href: '/admin/content/seo', label: 'SEO', icon: Search },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0 hidden md:flex">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <p className="text-gold font-black text-sm">MetaForge CMS</p>
          <p className="text-gray-500 text-xs mt-0.5">Content Manager</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors min-h-[44px]',
                  active
                    ? 'bg-gold/10 text-gold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-xs font-medium">Logged in as</p>
              <p className="text-gold text-xs">{session?.user?.name ?? 'admin'}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/admin' })}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <p className="text-gold font-black text-sm">MetaForge CMS</p>
          <button
            onClick={() => signOut({ callbackUrl: '/admin' })}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm min-h-[44px]"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Mobile nav scroll */}
        <div className="md:hidden overflow-x-auto bg-gray-50 border-b border-gray-200">
          <nav className="flex px-4 py-2 gap-2 min-w-max" aria-label="Mobile admin navigation">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded text-xs font-medium whitespace-nowrap transition-colors min-h-[44px] flex items-center',
                    active ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
