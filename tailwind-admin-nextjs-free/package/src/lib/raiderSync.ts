/**
 * Raider Sync — Firestore helpers for storing and reading a player's
 * linked Embark / MetaForge profile against their Firebase UID.
 *
 * Firestore shape  →  users/{uid}  (merged, never replaced)
 * ─────────────────────────────────────────────────────────
 *  embarkLinked         boolean          true once an Embark username is saved
 *  embarkUsername       string | null    entered by the user (manual, for now)
 *  embarkId             string | null    filled in once MetaForge profile API lands
 *  metaForgeProfileId   string | null    MetaForge profile ID (future)
 *  displayName          string | null    from MetaForge profile (future) or auth
 *  platforms            string[]         e.g. ["PC"] (future)
 *  stashValue           number           (future MetaForge data)
 *  lastSync             Timestamp | null time of last successful sync
 *  syncError            string | null    last error message, if any
 *
 *  Existing fields (set by BlueprintTracker) are never touched here:
 *    obtainedBlueprints  string[]
 *
 * All writes use { merge: true } so other fields are preserved.
 */

import { db } from '@/lib/firebaseClient'
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RaiderSyncProfile {
  embarkLinked: boolean
  embarkUsername: string | null
  embarkId: string | null
  metaForgeProfileId: string | null
  displayName: string | null
  platforms: string[]
  stashValue: number
  lastSync: Timestamp | null
  syncError: string | null
}

export const RAIDER_SYNC_DEFAULTS: RaiderSyncProfile = {
  embarkLinked: false,
  embarkUsername: null,
  embarkId: null,
  metaForgeProfileId: null,
  displayName: null,
  platforms: [],
  stashValue: 0,
  lastSync: null,
  syncError: null,
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Read the Raider Sync fields for a given Firebase UID.
 * Returns defaults merged with whatever is stored in Firestore.
 */
export async function getRaiderSyncProfile(uid: string): Promise<RaiderSyncProfile> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return { ...RAIDER_SYNC_DEFAULTS }
  const data = snap.data() as Partial<RaiderSyncProfile>
  return {
    ...RAIDER_SYNC_DEFAULTS,
    ...data,
  }
}

// ─── Write ───────────────────────────────────────────────────────────────────

/**
 * Save an Embark username for the player.
 * Marks embarkLinked = true and records the sync time.
 * Does not overwrite obtainedBlueprints or other unrelated fields.
 */
export async function saveEmbarkUsername(uid: string, embarkUsername: string): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      embarkLinked: true,
      embarkUsername: embarkUsername.trim(),
      lastSync: serverTimestamp(),
      syncError: null,
    },
    { merge: true }
  )
}

/**
 * Clear the Embark link for a player.
 * Resets all Raider Sync fields but leaves other data (blueprints, etc.) intact.
 */
export async function clearEmbarkLink(uid: string): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      embarkLinked: false,
      embarkUsername: null,
      embarkId: null,
      metaForgeProfileId: null,
      displayName: null,
      platforms: [],
      stashValue: 0,
      lastSync: serverTimestamp(),
      syncError: null,
    },
    { merge: true }
  )
}

/**
 * Save a full MetaForge profile payload into the user's Firestore doc.
 * Called once MetaForge publishes player profile endpoints.
 *
 * TODO: Wire this from /api/raider-sync/callback once the real API is available.
 */
export async function saveMetaForgeProfile(
  uid: string,
  profile: {
    metaForgeProfileId: string
    embarkId: string | null
    displayName: string
    platforms: string[]
    stashValue: number
  }
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      embarkLinked: true,
      metaForgeProfileId: profile.metaForgeProfileId,
      embarkId: profile.embarkId,
      displayName: profile.displayName,
      platforms: profile.platforms,
      stashValue: profile.stashValue,
      lastSync: serverTimestamp(),
      syncError: null,
    },
    { merge: true }
  )
}

/**
 * Store a sync error so the UI can show a "Re-link" prompt.
 */
export async function saveSyncError(uid: string, message: string): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    { syncError: message },
    { merge: true }
  )
}
