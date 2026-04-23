'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'

const MESSAGES: Record<string, string> = {
  saved: 'Changes saved successfully',
  created: 'Record created',
  converted: 'Lead converted to Opportunity',
  invited: 'User invited',
}

export function Toaster() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const notify = searchParams.get('notify')
    if (!notify) return

    setMsg(MESSAGES[notify] ?? notify)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('notify')
    router.replace(`${pathname}${params.size ? `?${params}` : ''}`)

    const t = setTimeout(() => setMsg(null), 4000)
    return () => clearTimeout(t)
  }, [searchParams, pathname, router])

  if (!msg) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-fade-in">
      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
      <span>{msg}</span>
      <button onClick={() => setMsg(null)} className="ml-2 text-slate-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
