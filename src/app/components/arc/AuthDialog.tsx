'use client'

/**
 * ARC Raider Syndicate — Authentication Dialog
 *
 * Supports: Google · Email/Password · Phone (SMS)
 *
 * TODO: Add a "Sign in with Discord" tab/button here when Discord OAuth
 *       is ready. Insert it between Google and Email as the 4th option.
 *       Reference: src/lib/firebaseAuth.ts → Discord TODO comment.
 */

import { useState, useRef, useEffect, FormEvent } from 'react'
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import {
  signInWithGoogle,
  registerWithEmail,
  signInWithEmail,
  startPhoneSignIn,
  confirmPhoneCode,
  authErrorMessage,
} from '@/lib/firebaseAuth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'google' | 'email' | 'phone'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const PANEL: React.CSSProperties = { background: '#0b0d11', border: '1px solid #1e2433' }

const TAB_ACTIVE: React.CSSProperties = {
  background: '#dc2626',
  color: '#fff',
  borderColor: '#dc2626',
}
const TAB_INACTIVE: React.CSSProperties = {
  background: 'transparent',
  color: '#8b9ab3',
  borderColor: '#1e2433',
}

const INPUT_STYLE: React.CSSProperties = {
  background: '#13161e',
  borderColor: '#1e2433',
  color: '#e2e8f0',
}

// ─── Error display ────────────────────────────────────────────────────────────

function AuthError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p
      className="rounded px-3 py-2 text-xs"
      style={{ background: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.25)' }}
    >
      {message}
    </p>
  )
}

// ─── Google tab ───────────────────────────────────────────────────────────────

function GoogleTab({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      onSuccess()
    } catch (e) {
      setError(authErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-center" style={{ color: '#8b9ab3' }}>
        Sign in instantly using your Google account.
      </p>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="flex items-center justify-center gap-3 w-full rounded border py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ borderColor: '#1e2433', color: '#e2e8f0', background: '#13161e' }}
      >
        {/* Google logo */}
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {loading ? 'Signing in…' : 'Sign in with Google'}
      </button>

      <AuthError message={error} />
    </div>
  )
}

// ─── Email tab ────────────────────────────────────────────────────────────────

function EmailTab({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode]       = useState<'signin' | 'register'>('signin')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      onSuccess()
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex rounded overflow-hidden border" style={{ borderColor: '#1e2433' }}>
        {(['signin', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError('') }}
            className="flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
            style={mode === m ? TAB_ACTIVE : TAB_INACTIVE}
          >
            {m === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="arc-email" className="text-xs" style={{ color: '#8b9ab3' }}>Email</Label>
        <Input
          id="arc-email"
          type="email"
          placeholder="raider@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={INPUT_STYLE}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="arc-password" className="text-xs" style={{ color: '#8b9ab3' }}>Password</Label>
        <Input
          id="arc-password"
          type="password"
          placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
          value={password}
          onChange={(e) => setPass(e.target.value)}
          required
          style={INPUT_STYLE}
        />
      </div>

      <AuthError message={error} />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded py-2.5 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ background: '#dc2626', color: '#fff' }}
      >
        {loading
          ? mode === 'register' ? 'Creating account…' : 'Signing in…'
          : mode === 'register' ? 'Create Account' : 'Sign In'}
      </button>
    </form>
  )
}

// ─── Phone tab ────────────────────────────────────────────────────────────────

function PhoneTab({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep]                         = useState<'number' | 'code'>('number')
  const [phone, setPhone]                       = useState('')
  const [code, setCode]                         = useState('')
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState('')
  const confirmationRef                         = useRef<ConfirmationResult | null>(null)
  const verifierRef                             = useRef<RecaptchaVerifier | null>(null)

  // Clean up verifier when tab unmounts
  useEffect(() => {
    return () => {
      verifierRef.current?.clear()
      verifierRef.current = null
    }
  }, [])

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Create invisible reCAPTCHA bound to the hidden container in this component
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(auth, 'arc-recaptcha-container', {
          size: 'invisible',
        })
      }
      confirmationRef.current = await startPhoneSignIn(phone, verifierRef.current)
      setStep('code')
    } catch (err) {
      setError(authErrorMessage(err))
      // Reset verifier on failure so it can be recreated
      verifierRef.current?.clear()
      verifierRef.current = null
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault()
    if (!confirmationRef.current) return
    setLoading(true)
    setError('')
    try {
      await confirmPhoneCode(confirmationRef.current, code)
      onSuccess()
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Invisible reCAPTCHA mount point */}
      <div id="arc-recaptcha-container" />

      {step === 'number' ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4">
          <p className="text-xs" style={{ color: '#8b9ab3' }}>
            Enter your number in E.164 format, e.g.{' '}
            <span style={{ color: '#e2e8f0' }}>+12025551234</span>
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="arc-phone" className="text-xs" style={{ color: '#8b9ab3' }}>Phone number</Label>
            <Input
              id="arc-phone"
              type="tel"
              placeholder="+12025551234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={INPUT_STYLE}
            />
          </div>

          <AuthError message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded py-2.5 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#dc2626', color: '#fff' }}
          >
            {loading ? 'Sending code…' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <p className="text-xs" style={{ color: '#8b9ab3' }}>
            Enter the 6-digit code sent to{' '}
            <span style={{ color: '#e2e8f0' }}>{phone}</span>.{' '}
            <button
              type="button"
              className="underline"
              style={{ color: '#8b9ab3' }}
              onClick={() => { setStep('number'); setCode(''); setError('') }}
            >
              Change number
            </button>
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="arc-code" className="text-xs" style={{ color: '#8b9ab3' }}>Verification code</Label>
            <Input
              id="arc-code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              style={INPUT_STYLE}
            />
          </div>

          <AuthError message={error} />

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full rounded py-2.5 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#dc2626', color: '#fff' }}
          >
            {loading ? 'Verifying…' : 'Verify Code'}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [tab, setTab] = useState<Tab>('google')

  const handleSuccess = () => onOpenChange(false)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'google', label: 'Google', icon: 'G' },
    { id: 'email',  label: 'Email',  icon: '✉' },
    { id: 'phone',  label: 'Phone',  icon: '📱' },
    // TODO: Discord — add { id: 'discord', label: 'Discord', icon: '...' } here
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden" style={PANEL}>
        <DialogHeader className="px-6 pt-6 pb-0">
          {/* ARC brand header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-[0.18em] uppercase" style={{ color: '#dc2626' }}>ARC</span>
            <span className="text-xs font-bold tracking-widest uppercase text-white">Raider</span>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#991b1b' }}>Syndicate</span>
          </div>
          <DialogTitle className="text-base font-black uppercase tracking-widest" style={{ color: '#e2e8f0' }}>
            Join the Syndicate
          </DialogTitle>
          <p className="text-xs mt-0.5" style={{ color: '#8b9ab3' }}>
            Sign in to access blueprints, marketplace, and more.
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4 flex flex-col gap-5">
          {/* Tab selector */}
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 rounded border py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                style={tab === t.id ? TAB_ACTIVE : TAB_INACTIVE}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {tab === 'google' && <GoogleTab onSuccess={handleSuccess} />}
            {tab === 'email'  && <EmailTab  onSuccess={handleSuccess} />}
            {tab === 'phone'  && <PhoneTab  onSuccess={handleSuccess} />}
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-center" style={{ color: '#3b4660' }}>
            By signing in you agree to the ARC Raider Syndicate terms.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
