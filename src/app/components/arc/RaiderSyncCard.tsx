'use client'

/**
 * RaiderSyncCard — links a player's Embark ARC Raiders profile to their
 * Raider Syndicate account.
 *
 * Current flow (MetaForge public API has no player profile endpoints yet):
 *   1. Player enters their Embark display name.
 *   2. We save it to Firestore via POST /api/raider-sync.
 *   3. The saved name is used across the dashboard for personalization.
 *
 * Future flow (once MetaForge publishes player auth):
 *   1. "Sync via MetaForge" button → POST /api/raider-sync/start → returns URL.
 *   2. Open MetaForge consent page in a popup.
 *   3. MetaForge redirects to /api/raider-sync/callback with a token.
 *   4. Callback saves the full MfProfile to Firestore.
 *   5. This card reads and displays the synced profile.
 *
 * See: src/app/api/raider-sync/route.ts for the server-side counterpart.
 */

import { useEffect, useState } from 'react'
import { watchAuthState } from '@/lib/firebaseAuth'
import { getRaiderSyncProfile, saveEmbarkUsername, clearEmbarkLink } from '@/lib/raiderSync'
import type { RaiderSyncProfile } from '@/lib/raiderSync'
import type { User } from 'firebase/auth'

const RED    = '#dc2626'
const TEAL   = '#1db894'
const DIM    = 'rgba(255,255,255,0.45)'
const WHITE  = '#ffffff'
const COBALT = '#5a9cf5'

// ─── Small sub-components ────────────────────────────────────────────────────

function SyncStatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: 12, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: WHITE }}>{value}</span>
    </div>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 4,
      background: 'rgba(90,156,245,0.15)', border: '1px solid rgba(90,156,245,0.35)',
      color: COBALT,
    }}>
      {platform}
    </span>
  )
}

// ─── RaiderSyncCard ──────────────────────────────────────────────────────────

export default function RaiderSyncCard() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [profile, setProfile] = useState<RaiderSyncProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputName, setInputName] = useState('')
  const [saving, setSaving] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Track auth state
  useEffect(() => watchAuthState(setUser), [])

  // Load Firestore profile when user is known
  useEffect(() => {
    if (user === undefined) return
    if (!user) { setLoading(false); setProfile(null); return }
    getRaiderSyncProfile(user.uid)
      .then(p => { setProfile(p); setInputName(p.embarkUsername ?? '') })
      .catch(() => setError('Failed to load sync profile.'))
      .finally(() => setLoading(false))
  }, [user])

  const handleSave = async () => {
    if (!user) return
    if (!inputName.trim()) { setError('Enter your Embark display name.'); return }
    setError(''); setSuccessMsg(''); setSaving(true)
    try {
      const res = await fetch('/api/raider-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, embarkUsername: inputName.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setProfile(json.profile)
      setSuccessMsg('Embark profile saved.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleUnlink = async () => {
    if (!user) return
    if (!confirm('Unlink your Embark profile? Your collected blueprints will not be affected.')) return
    setError(''); setSuccessMsg(''); setUnlinking(true)
    try {
      const res = await fetch('/api/raider-sync', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      })
      if (!res.ok) throw new Error('Unlink failed')
      await clearEmbarkLink(user.uid)
      setProfile(p => p ? { ...p, embarkLinked: false, embarkUsername: null, embarkId: null, lastSync: null } : p)
      setInputName('')
      setSuccessMsg('Embark profile unlinked.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUnlinking(false)
    }
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (user === undefined || loading) {
    return (
      <div style={cardStyle}>
        <CardHeader />
        <div style={{ padding: '28px 0', textAlign: 'center' }}>
          <Spinner />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={cardStyle}>
        <CardHeader />
        <p style={{ fontSize: 14, color: DIM, lineHeight: 1.7, marginTop: 12 }}>
          Sign in to link your Embark ARC Raiders profile and sync your blueprints, stash, and progress across the dashboard.
        </p>
      </div>
    )
  }

  const isLinked = profile?.embarkLinked && !!profile?.embarkUsername
  const lastSyncStr = profile?.lastSync
    ? new Date((profile.lastSync as unknown as { seconds: number }).seconds * 1000).toLocaleString()
    : null

  return (
    <div style={cardStyle}>
      <CardHeader />

      {/* Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 4 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: isLinked ? TEAL : 'rgba(255,255,255,0.2)',
          boxShadow: isLinked ? `0 0 8px ${TEAL}` : 'none',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: isLinked ? TEAL : DIM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {isLinked ? 'Embark Profile Linked' : 'Not Linked'}
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
        {isLinked
          ? 'Your Embark profile is linked. Blueprint progress, maps, and trials will be personalized to your account.'
          : 'Link your Embark display name to personalize the dashboard — blueprints owned, missing pieces, active quests, and more.'}
      </p>

      {/* Linked profile stats */}
      {isLinked && profile && (
        <div style={{ marginBottom: 20, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: DIM }}>
              Linked Profile
            </span>
          </div>
          <div style={{ padding: '2px 16px 10px' }}>
            <SyncStatRow label="Embark Name" value={profile.embarkUsername ?? '—'} />
            {profile.embarkId && <SyncStatRow label="Embark ID" value={profile.embarkId} />}
            {profile.metaForgeProfileId && <SyncStatRow label="MetaForge ID" value={profile.metaForgeProfileId} />}
            {profile.stashValue > 0 && <SyncStatRow label="Stash Value" value={profile.stashValue.toLocaleString()} />}
            {lastSyncStr && <SyncStatRow label="Last Sync" value={lastSyncStr} />}
          </div>
          {profile.platforms.length > 0 && (
            <div style={{ padding: '8px 16px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {profile.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
            </div>
          )}
        </div>
      )}

      {/* Input + save */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM }}>
          Embark Display Name
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={inputName}
            onChange={e => { setInputName(e.target.value); setError(''); setSuccessMsg('') }}
            placeholder="Your in-game display name"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{
              flex: 1, minWidth: 160,
              padding: '9px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6,
              color: WHITE,
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 18px',
              borderRadius: 6,
              background: saving ? 'rgba(220,38,38,0.4)' : RED,
              border: 'none',
              color: WHITE,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
          >
            {saving ? 'Saving…' : isLinked ? 'Update' : 'Link Profile'}
          </button>
        </div>
      </div>

      {/* Error / success */}
      {error && (
        <div style={{ marginTop: 10, fontSize: 13, color: RED, lineHeight: 1.5 }}>
          ⚠ {error}
        </div>
      )}
      {successMsg && (
        <div style={{ marginTop: 10, fontSize: 13, color: TEAL, lineHeight: 1.5 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Unlink */}
      {isLinked && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleUnlink}
            disabled={unlinking}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid rgba(220,38,38,0.35)',
              color: 'rgba(220,38,38,0.7)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: unlinking ? 'not-allowed' : 'pointer',
            }}
          >
            {unlinking ? 'Unlinking…' : 'Unlink Embark Profile'}
          </button>
        </div>
      )}

      {/* Future MetaForge deep-sync notice */}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
        {/* TODO: Replace this notice with a "Sync via MetaForge" button once MetaForge
            publishes player profile / auth endpoints.  The backend route at
            /api/raider-sync will handle the OAuth callback and save the full profile. */}
        Full Embark profile sync (stash, quests, blueprints) will be available once
        MetaForge publishes player profile endpoints.{' '}
        <a href="https://discord.gg/8UEK9TrQDs" target="_blank" rel="noopener noreferrer" style={{ color: COBALT }}>
          Follow MetaForge on Discord
        </a>{' '}
        for updates.
      </div>
    </div>
  )
}

// ─── Styles + helpers ────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid rgba(220,38,38,0.25)',
  borderRadius: 10,
  padding: '24px 24px 20px',
  boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
}

function CardHeader() {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[RED, '#5a9cf5', TEAL].map((c, i) => (
          <div key={i} style={{ width: 22, height: 3, background: c, borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: RED, textTransform: 'uppercase', marginBottom: 4 }}>
        Raider Sync
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: WHITE, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0, lineHeight: 1.2 }}>
        Embark Profile
      </h2>
    </div>
  )
}

function Spinner() {
  return (
    <>
      <div style={{ width: 24, height: 24, margin: '0 auto', border: '2.5px solid rgba(220,38,38,0.2)', borderTopColor: RED, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
