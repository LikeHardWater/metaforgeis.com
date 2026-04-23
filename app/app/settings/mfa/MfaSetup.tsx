'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, ShieldOff, Loader2, AlertCircle, CheckCircle2, Copy } from 'lucide-react'
import { generateMfaSecret, verifyAndEnableMfa, disableMfa } from '@/src/lib/actions/mfa'

type Step = 'idle' | 'setup' | 'verify' | 'done'

interface Props {
  mfaEnabled: boolean
  backupCodesRemaining: number
}

export default function MfaSetup({ mfaEnabled, backupCodesRemaining }: Props) {
  const [step, setStep] = useState<Step>('idle')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const [disableToken, setDisableToken] = useState('')
  const [disabling, setDisabling] = useState(false)

  const handleStartSetup = () => {
    startTransition(async () => {
      const result = await generateMfaSecret()
      setQrDataUrl(result.qrDataUrl)
      setSecret(result.secret)
      setBackupCodes(result.backupCodes)
      setStep('setup')
    })
  }

  const handleVerify = () => {
    setError('')
    startTransition(async () => {
      const result = await verifyAndEnableMfa(token)
      if (result.success) {
        setStep('done')
      } else {
        setError(result.error ?? 'Invalid code.')
      }
    })
  }

  const handleDisable = () => {
    setError('')
    startTransition(async () => {
      const result = await disableMfa(disableToken)
      if (result.success) {
        window.location.reload()
      } else {
        setError(result.error ?? 'Invalid code.')
      }
    })
  }

  // ── MFA already enabled ──────────────────────────────────────────────────
  if (mfaEnabled && step !== 'done') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-green-900/20 border border-green-800/40 rounded-xl p-4">
          <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <div className="text-green-400 font-semibold text-sm">MFA is enabled</div>
            <div className="text-slate-500 text-xs mt-0.5">
              {backupCodesRemaining} backup code{backupCodesRemaining !== 1 ? 's' : ''} remaining
            </div>
          </div>
        </div>

        {disabling ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <p className="text-sm text-slate-600">
              Enter your authenticator code to confirm disabling MFA.
            </p>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-3 text-slate-900 text-center text-xl tracking-widest focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDisable}
                disabled={pending || disableToken.length < 6}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-slate-900 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                Disable MFA
              </button>
              <button
                onClick={() => { setDisabling(false); setError('') }}
                className="flex-1 bg-slate-100 hover:bg-slate-100/80 text-slate-600 font-semibold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setDisabling(true)}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-800/40 hover:border-red-600 px-4 py-2.5 rounded-lg transition-colors"
          >
            <ShieldOff className="w-4 h-4" /> Disable MFA
          </button>
        )}
      </div>
    )
  }

  // ── Step: done ───────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-green-900/20 border border-green-800/40 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div className="text-green-400 font-semibold text-sm">MFA enabled successfully</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Save your backup codes</h2>
          <p className="text-slate-500 text-sm mb-4">
            Store these somewhere safe. Each code can only be used once if you lose access to your authenticator.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((code) => (
              <div key={code} className="font-mono text-sm bg-slate-100 rounded px-3 py-2 text-slate-700 tracking-wider">
                {code}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" /> Copy all codes
          </button>
        </div>
        <a
          href="/app/dashboard"
          className="block w-full text-center bg-gold hover:bg-gold-dark text-dark-bg font-bold py-3 rounded-lg transition-colors"
        >
          Done
        </a>
      </div>
    )
  }

  // ── Step: scan QR ────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-1">1. Scan this QR code</h2>
          <p className="text-slate-500 text-sm mb-5">
            Open your authenticator app (Google Authenticator, Authy, etc.) and scan the code below.
          </p>
          {qrDataUrl && (
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="MFA QR Code" className="rounded-lg w-48 h-48" />
            </div>
          )}
          <p className="text-xs text-gray-500 text-center">
            Can&apos;t scan? Enter this key manually:
          </p>
          <p className="font-mono text-xs text-gold text-center mt-1 break-all">{secret}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-1">2. Enter the 6-digit code</h2>
          <p className="text-slate-500 text-sm mb-4">
            Enter the code shown in your authenticator app to confirm setup.
          </p>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-4 py-3 text-slate-900 text-center text-2xl tracking-widest focus:outline-none mb-4"
          />
          <button
            onClick={handleVerify}
            disabled={pending || token.length < 6}
            className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-dark-bg font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Verify & Enable
          </button>
        </div>
      </div>
    )
  }

  // ── Step: idle (not enabled) ─────────────────────────────────────────────
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <ShieldOff className="w-5 h-5 text-gray-500" />
        <div>
          <div className="font-semibold text-slate-900 text-sm">MFA is not enabled</div>
          <div className="text-slate-500 text-xs mt-0.5">
            Protect your account with a time-based one-time password.
          </div>
        </div>
      </div>
      <button
        onClick={handleStartSetup}
        disabled={pending}
        className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-dark-bg font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        {pending ? 'Generating...' : 'Set Up MFA'}
      </button>
    </div>
  )
}

