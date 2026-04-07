import { SessionProvider } from '@/app/components/admin/SessionProvider'
import { NoSSR } from '@/app/components/admin/NoSSR'

export const dynamic = 'force-dynamic'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NoSSR>{children}</NoSSR>
    </SessionProvider>
  )
}
