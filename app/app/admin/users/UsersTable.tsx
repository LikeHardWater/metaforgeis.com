'use client'

import { useState, useTransition } from 'react'
import { Loader2, Lock, Unlock, UserCheck, UserX, ShieldCheck, Plus, X, KeyRound } from 'lucide-react'
import { assignRole, toggleUserActive, unlockUser, createUser, setUserPassword } from '@/src/lib/actions/users'

type Role = { id: string; name: string; systemRole: string | null }
type User = {
  id: string
  email: string
  name: string | null
  image: string | null
  isActive: boolean
  lockedAt: Date | null
  lastLoginAt: Date | null
  microsoftId: string | null
  role: Role
}

interface Props {
  users: User[]
  roles: Role[]
  currentUserId: string
}

export default function UsersTable({ users, roles, currentUserId }: Props) {
  const [showInvite, setShowInvite] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {showInvite && (
        <InviteUserForm roles={roles} onClose={() => setShowInvite(false)} />
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">User</th>
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Auth</th>
              <th className="text-left px-6 py-3">Last Login</th>
              <th className="text-right px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                roles={roles}
                isSelf={user.id === currentUserId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InviteUserForm({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        await createUser(formData)
      } catch (e: unknown) {
        if (e instanceof Error && !e.message.includes('NEXT_REDIRECT')) {
          setError(e.message)
        }
      }
    })
  }

  return (
    <div className="bg-white border border-gold/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Invite New User</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Email *</label>
            <input
              name="email"
              type="email"
              required
              placeholder="user@company.com"
              className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Name</label>
            <input
              name="name"
              type="text"
              placeholder="Full name (optional)"
              className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Role *</label>
          <select
            name="roleId"
            required
            className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none"
          >
            <option value="">— Select a role —</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Password <span className="text-slate-400">(optional — required for credentials login)</span></label>
          <input
            name="password"
            type="password"
            placeholder="Min 8 characters"
            className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none"
          />
        </div>
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <p className="text-slate-500 text-xs">Users can sign in via Microsoft SSO or with email + password if a password is set.</p>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create User
          </button>
          <button type="button" onClick={onClose} className="bg-slate-100 text-slate-600 font-semibold text-sm px-5 py-2 rounded-lg">Cancel</button>
        </div>
      </form>
    </div>
  )
}

function SetPasswordModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await setUserPassword(userId, password)
        setDone(true)
        setTimeout(onClose, 1200)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to set password')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Set Password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        {done ? (
          <p className="text-green-600 text-sm font-medium">Password set successfully.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              required
              minLength={8}
              className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={pending || password.length < 8} className="flex-1 bg-gold hover:bg-gold-dark disabled:opacity-50 text-dark-bg font-bold text-sm py-2 rounded-lg transition-colors">
                {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Set Password'}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function UserRow({ user, roles, isSelf }: { user: User; roles: Role[]; isSelf: boolean }) {
  const [pending, startTransition] = useTransition()
  const [roleId, setRoleId] = useState(user.role.id)
  const [showSetPassword, setShowSetPassword] = useState(false)

  const handleRoleChange = (newRoleId: string) => {
    setRoleId(newRoleId)
    startTransition(() => assignRole(user.id, newRoleId))
  }

  const handleToggleActive = () => {
    startTransition(() => toggleUserActive(user.id, !user.isActive))
  }

  const handleUnlock = () => {
    startTransition(() => unlockUser(user.id))
  }

  const isLocked = !!user.lockedAt

  return (
    <tr className={`hover:bg-slate-100/40 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}>
      {/* User */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs flex-shrink-0">
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-slate-900">{user.name ?? '—'}</div>
            <div className="text-slate-500 text-xs">{user.email}</div>
          </div>
          {isSelf && (
            <span className="text-xs bg-gold/10 text-gold border border-gold/20 rounded px-1.5 py-0.5">you</span>
          )}
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <select
          value={roleId}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={pending || isSelf}
          className="bg-slate-100 border border-slate-200 focus:border-gold text-slate-900 text-xs rounded px-2 py-1.5 focus:outline-none disabled:opacity-50 cursor-pointer"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 border border-red-200 rounded px-2 py-0.5">
              <Lock className="w-3 h-3" /> Locked
            </span>
          ) : user.isActive ? (
            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 border border-green-200 rounded px-2 py-0.5">
              <UserCheck className="w-3 h-3" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded px-2 py-0.5">
              <UserX className="w-3 h-3" /> Inactive
            </span>
          )}
        </div>
      </td>

      {/* Auth method */}
      <td className="px-6 py-4">
        {user.microsoftId ? (
          <span className="flex items-center gap-1 text-xs text-blue-700">
            <ShieldCheck className="w-3 h-3" /> Microsoft
          </span>
        ) : (
          <span className="text-xs text-gray-500">Password</span>
        )}
      </td>

      {/* Last login */}
      <td className="px-6 py-4 text-slate-500 text-xs">
        {user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })
          : '—'}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />}
          {isLocked && !isSelf && (
            <button
              onClick={handleUnlock}
              disabled={pending}
              className="text-xs text-gold hover:text-gold-dark disabled:opacity-50 flex items-center gap-1"
            >
              <Unlock className="w-3 h-3" /> Unlock
            </button>
          )}
          <button
            onClick={() => setShowSetPassword(true)}
            disabled={pending}
            className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-50 flex items-center gap-1"
          >
            <KeyRound className="w-3 h-3" /> Set Password
          </button>
          {!isSelf && (
            <button
              onClick={handleToggleActive}
              disabled={pending}
              className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-50"
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
        {showSetPassword && <SetPasswordModal userId={user.id} onClose={() => setShowSetPassword(false)} />}
      </td>
    </tr>
  )
}
