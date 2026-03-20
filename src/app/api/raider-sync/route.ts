/**
 * /api/raider-sync — Raider Sync route handlers
 *
 * POST  /api/raider-sync          Save Embark username for the authed user
 * DELETE /api/raider-sync         Unlink the Embark profile
 *
 * All writes go to Firestore (server → Admin SDK or client-side helper).
 * No MetaForge secrets are needed here yet because the MetaForge player
 * profile API is not publicly available.  When it launches, add:
 *
 *   METAFORGE_API_SECRET=...   (server-only, no NEXT_PUBLIC_ prefix)
 *
 * to .env.local and use it in getMfProfileByToken() / getMfProfileById()
 * from src/lib/metaforge.ts.
 *
 * Auth strategy (current):
 *   The client passes { uid } in the request body.  For a production app
 *   you should validate a Firebase ID token on the server using the
 *   Firebase Admin SDK.  Add `firebase-admin` and verify with:
 *     admin.auth().verifyIdToken(idToken)
 *   TODO: upgrade to proper token verification once firebase-admin is added.
 */

import { NextRequest, NextResponse } from 'next/server'
import { saveEmbarkUsername, clearEmbarkLink, getRaiderSyncProfile } from '@/lib/raiderSync'

// ─── POST — save Embark username ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { uid?: string; embarkUsername?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { uid, embarkUsername } = body

  if (!uid || typeof uid !== 'string') {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
  }
  if (!embarkUsername || typeof embarkUsername !== 'string' || !embarkUsername.trim()) {
    return NextResponse.json({ error: 'Missing or empty embarkUsername' }, { status: 400 })
  }

  try {
    await saveEmbarkUsername(uid, embarkUsername)
    const profile = await getRaiderSyncProfile(uid)
    return NextResponse.json({ ok: true, profile })
  } catch (err) {
    console.error('[raider-sync POST]', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}

// ─── DELETE — unlink Embark profile ──────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  let body: { uid?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { uid } = body
  if (!uid || typeof uid !== 'string') {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
  }

  try {
    await clearEmbarkLink(uid)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[raider-sync DELETE]', err)
    return NextResponse.json({ error: 'Failed to unlink profile' }, { status: 500 })
  }
}

// ─── GET — read current sync status ──────────────────────────────────────────

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) {
    return NextResponse.json({ error: 'Missing uid query param' }, { status: 400 })
  }

  try {
    const profile = await getRaiderSyncProfile(uid)
    return NextResponse.json({ ok: true, profile })
  } catch (err) {
    console.error('[raider-sync GET]', err)
    return NextResponse.json({ error: 'Failed to read profile' }, { status: 500 })
  }
}

/*
 * ─── Future: /api/raider-sync/callback ────────────────────────────────────
 *
 * Once MetaForge publishes a player auth / profile API, add a callback route:
 *
 *   src/app/api/raider-sync/callback/route.ts
 *
 * Flow:
 *   1. POST /api/raider-sync/start  → returns MetaForge consent URL
 *   2. User completes MetaForge / Embark OAuth
 *   3. MetaForge redirects to /api/raider-sync/callback?token=XXX&uid=YYY
 *   4. Callback route calls getMfProfileByToken(token) from metaforge.ts
 *   5. Calls saveMetaForgeProfile(uid, profile) from raiderSync.ts
 *   6. Redirects to /user-profile (or closes the popup)
 *
 * Example stub (not active):
 *
 *   import { getMfProfileByToken } from '@/lib/metaforge'
 *   import { saveMetaForgeProfile } from '@/lib/raiderSync'
 *
 *   export async function GET(req: NextRequest) {
 *     const token = req.nextUrl.searchParams.get('token')
 *     const uid   = req.nextUrl.searchParams.get('uid')
 *     if (!token || !uid) return redirect('/user-profile?sync=error')
 *     const profile = await getMfProfileByToken(token)
 *     await saveMetaForgeProfile(uid, profile)
 *     return redirect('/user-profile?sync=success')
 *   }
 */
