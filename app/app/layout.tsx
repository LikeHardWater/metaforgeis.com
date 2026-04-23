import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-slate-600 text-xs transition-colors"
          >
            ← Back to website
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
}

