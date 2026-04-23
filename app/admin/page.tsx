'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Content Manager</h1>
          <p className="text-gray-500 text-sm">MetaForge Industrial Systems</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-100 border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition-colors min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-100 border border-gray-200 focus:border-gold rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition-colors min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-dark-bg font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          MetaForge Industrial Systems CMS · Authorized Access Only
        </p>
      </div>
    </div>
  )
}
