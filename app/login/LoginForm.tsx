'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'

function LoginFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/app/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.ok) {
      router.push(callbackUrl)
    } else {
      setError(
        res?.error === 'account_locked'
          ? 'Your account is locked. Contact your administrator.'
          : 'Invalid email or password.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image src="/images/MFIS_Logo.svg" alt="MetaForge Industrial Systems" width={56} height={56} priority />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">MetaForge Platform</h1>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@metaforgeis.com"
                className="w-full bg-gray-100 border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition-colors min-h-[44px]" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-100 border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition-colors min-h-[44px]" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-dark-bg font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          MetaForge Industrial Systems · Authorized Access Only
        </p>
      </div>
    </div>
  )
}

export default function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  )
}
