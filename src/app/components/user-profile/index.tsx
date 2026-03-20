'use client'

import { useEffect, useState } from 'react'
import { watchAuthState } from '@/lib/firebaseAuth'
import { signOutUser } from '@/lib/firebaseAuth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import type { User } from 'firebase/auth'
import RaiderSyncCard from '@/app/components/arc/RaiderSyncCard'
import Link from 'next/link'

const RED   = '#dc2626'
const TEAL  = '#1db894'
const DIM   = 'rgba(255,255,255,0.45)'
const WHITE = '#ffffff'

interface UserStats {
  blueprintsObtained: number
  blueprintsTotal: number
  embarkUsername: string | null
  embarkLinked: boolean
  lastSync: string | null
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => watchAuthState(setUser), [])

  useEffect(() => {
    if (!user) { setStats(null); return }
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (!snap.exists()) { setStats({ blueprintsObtained: 0, blueprintsTotal: 74, embarkUsername: null, embarkLinked: false, lastSync: null }); return }
      const data = snap.data() as {
        obtainedBlueprints?: string[]
        embarkUsername?: string | null
        embarkLinked?: boolean
        lastSync?: { seconds: number } | null
      }
      setStats({
        blueprintsObtained: data.obtainedBlueprints?.length ?? 0,
        blueprintsTotal: 74,
        embarkUsername: data.embarkUsername ?? null,
        embarkLinked: data.embarkLinked ?? false,
        lastSync: data.lastSync ? new Date(data.lastSync.seconds * 1000).toLocaleDateString() : null,
      })
    }).catch(() => setStats(null))
  }, [user])

  const handleSignOut = async () => {
    setSigningOut(true)
    try { await signOutUser() } catch { /* ok */ } finally { setSigningOut(false) }
  }

  const initial = user?.displayName?.[0] ?? user?.email?.[0] ?? '?'
  const bpPct = stats ? Math.round((stats.blueprintsObtained / stats.blueprintsTotal) * 100) : 0

  if (user === undefined) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: WHITE, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Sign In Required
        </h2>
        <p style={{ fontSize: 14, color: DIM, lineHeight: 1.7, marginBottom: 24 }}>
          Sign in to view your Raider profile, link your Embark account, and track your blueprint progress.
        </p>
        <Link href="/" style={{ padding: '10px 24px', borderRadius: 6, background: RED, color: WHITE, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Go Home
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', color: RED, textTransform: 'uppercase', marginBottom: 6 }}>
          ARC Raider Syndicate
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: WHITE, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          Raider Profile
        </h1>
      </div>

      {/* Identity card */}
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 10,
        padding: 24,
        marginBottom: 24,
        display: 'flex',
        gap: 20,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(220,38,38,0.15)',
          border: '2px solid rgba(220,38,38,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 900, color: RED, textTransform: 'uppercase',
        }}>
          {initial.toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: WHITE, letterSpacing: '0.04em', marginBottom: 4 }}>
            {user.displayName ?? 'Raider'}
          </div>
          <div style={{ fontSize: 12, color: DIM, marginBottom: stats?.embarkLinked ? 8 : 0 }}>
            {user.email ?? user.phoneNumber ?? '—'}
          </div>
          {stats?.embarkLinked && stats.embarkUsername && (
            <div style={{ fontSize: 12, color: TEAL, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, boxShadow: `0 0 6px ${TEAL}`, flexShrink: 0 }} />
              Embark: {stats.embarkUsername}
              {stats.lastSync && <span style={{ color: DIM, fontWeight: 400 }}>· synced {stats.lastSync}</span>}
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: DIM, fontSize: 12, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>

      {/* Blueprint progress */}
      {stats && (
        <div style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM, marginBottom: 14 }}>
            Blueprint Progress
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: bpPct === 100 ? TEAL : WHITE, lineHeight: 1 }}>
              {bpPct}%
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 13, color: WHITE, fontWeight: 700 }}>{stats.blueprintsObtained} <span style={{ color: DIM, fontWeight: 400 }}>/ {stats.blueprintsTotal} collected</span></span>
              <span style={{ fontSize: 12, color: DIM }}>{stats.blueprintsTotal - stats.blueprintsObtained} blueprints still needed</span>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${bpPct}%`,
              background: bpPct === 100 ? TEAL : `linear-gradient(90deg, ${RED}, #5a9cf5)`,
              borderRadius: 3,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ marginTop: 14 }}>
            <Link href="/blueprints" style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: RED, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              Open Blueprint Tracker →
            </Link>
          </div>
        </div>
      )}

      {/* Two-column layout: Raider Sync + account info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Raider Sync */}
        <RaiderSyncCard />

        {/* Account details */}
        <div style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
          padding: '24px 24px 20px',
        }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.07)'].map((c, i) => (
              <div key={i} style={{ width: 22, height: 3, background: c, borderRadius: 2 }} />
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: 4 }}>
            Account
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: WHITE, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 20px' }}>
            Sign-In Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <StatRow label="Display Name" value={user.displayName ?? '—'} />
            <StatRow label="Email" value={user.email ?? '—'} />
            <StatRow label="Phone" value={user.phoneNumber ?? '—'} />
            <StatRow label="Account ID" value={user.uid.slice(0, 12) + '…'} />
            <StatRow label="Providers" value={user.providerData.map(p => p.providerId.replace('.com', '')).join(', ') || '—'} />
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: DIM, lineHeight: 1.6 }}>
            Need help with your account?{' '}
            <Link href="/player-support" style={{ color: '#5a9cf5', textDecoration: 'underline' }}>
              Player Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 11, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: WHITE, maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

function Spinner() {
  return (
    <>
      <div style={{ width: 28, height: 28, border: '2.5px solid rgba(220,38,38,0.2)', borderTopColor: RED, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
