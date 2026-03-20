/**
 * MetaForge ARC Raiders API client
 *
 * Docs:     https://metaforge.app/arc-raiders/api
 * Base URL: https://metaforge.app/api/arc-raiders
 *
 * Attribution required for public projects — link back to
 * https://metaforge.app/arc-raiders per the Terms of Usage.
 *
 * Data is community-maintained (not provided by Embark).
 * Cache aggressively; endpoints may change without warning.
 */

// ─── Config ────────────────────────────────────────────────────────────────

export const MF_BASE_URL =
  process.env.NEXT_PUBLIC_METAFORGE_BASE_URL ??
  'https://metaforge.app/api/arc-raiders'

// ─── Generic fetch wrapper ──────────────────────────────────────────────────

export async function mfFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${MF_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...options?.headers },
    // Next.js server-side caching — revalidate every 5 minutes by default.
    // Override per-call by passing { next: { revalidate: N } } in options.
    next: { revalidate: 300 },
    ...options,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `MetaForge API error ${res.status} on ${url}: ${text || res.statusText}`,
    )
  }

  return res.json() as Promise<T>
}

// ─── TypeScript interfaces ──────────────────────────────────────────────────

export interface MfStatBlock {
  damage?: number
  health?: number
  shield?: number
  weight?: number
  stackSize?: number
  magazineSize?: number
  fireRate?: number
  range?: number
  value?: number
  [key: string]: number | string | undefined
}

export interface MfItem {
  id: string
  name: string
  description: string
  item_type: string
  loadout_slots: string[]
  /** Full CDN image URL, e.g. https://cdn.metaforge.app/arc-raiders/icons/... */
  icon: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | string
  value: number
  workbench: string | null
  stat_block: MfStatBlock
  flavor_text: string
  subcategory: string
  sources: unknown
  ammo_type: string
  locations: unknown[]
  guide_links: unknown[]
  game_asset_id: number
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface MfPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface MfItemsPagedResponse {
  items: MfItem[]
  pagination: MfPagination
  maxValue: number
}

/** ARC enemy unit (Bastion, Bombardier, etc.) */
export interface MfArc {
  id: string
  name: string
  description?: string
  icon?: string
  image?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface MfQuestReward {
  id: string
  item: {
    id: string
    icon: string
    name: string
    rarity: string
    item_type: string
  }
  item_id: string
  quantity: string
}

export interface MfQuest {
  id: string
  name: string
  objectives?: string[]
  xp?: number
  image?: string
  guide_links?: { url: string; label: string }[]
  trader_name?: string
  required_items?: unknown[]
  rewards?: MfQuestReward[]
  sort_order?: number
  [key: string]: unknown
}

/** A single event slot from the events schedule */
export interface MfEvent {
  name: string
  map: string
  icon: string
  /** Unix ms timestamp */
  startTime: number
  /** Unix ms timestamp */
  endTime: number
}

export interface MfEventsScheduleResponse {
  data: MfEvent[]
}

export interface MfTraderItem {
  id: string
  icon: string
  name: string
  value: number
  rarity: string
  item_type: string
  description?: string
  trader_price?: number
}

/** Keyed by trader name, e.g. { Apollo: [...], Celeste: [...] } */
export type MfTradersResponse = Record<string, MfTraderItem[]>

// ─── Typed helpers ──────────────────────────────────────────────────────────

export interface MfItemsParams {
  search?: string
  rarity?: string
  item_type?: string
  page?: number | string
  page_size?: number | string
}

/** GET /api/arc-raiders/items — returns a flat array (no pagination metadata) */
export async function getMfItems(params?: MfItemsParams): Promise<MfItem[]> {
  const { items } = await getMfItemsPaged(params)
  return items
}

/**
 * GET /api/arc-raiders/items — returns items + pagination metadata.
 * Supports: search, rarity, item_type, page, page_size (default 50).
 */
export async function getMfItemsPaged(
  params?: MfItemsParams,
): Promise<MfItemsPagedResponse> {
  const p: Record<string, string> = {}
  if (params?.search)    p.search    = params.search
  if (params?.rarity)    p.rarity    = params.rarity
  if (params?.item_type) p.item_type = params.item_type
  if (params?.page)      p.page      = String(params.page)
  if (params?.page_size) p.page_size = String(params.page_size)

  const qs = Object.keys(p).length ? '?' + new URLSearchParams(p).toString() : ''
  const raw = await mfFetch<{
    data: MfItem[]
    pagination: MfPagination
    maxValue: number
  }>(`/items${qs}`)

  return {
    items: raw.data ?? [],
    pagination: raw.pagination ?? { page: 1, limit: 50, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    maxValue: raw.maxValue ?? 0,
  }
}

/** GET /api/arc-raiders/arcs — returns ARC enemy units */
export async function getMfArcs(): Promise<MfArc[]> {
  const data = await mfFetch<MfArc[] | { data?: MfArc[]; arcs?: MfArc[] }>('/arcs')
  if (Array.isArray(data)) return data
  if ('data' in data && Array.isArray(data.data)) return data.data
  return (data.arcs ?? [])
}

export interface MfQuestsParams {
  search?: string
  trader?: string
  page?: number | string
  page_size?: number | string
}

/** GET /api/arc-raiders/quests */
export async function getMfQuests(params?: MfQuestsParams): Promise<MfQuest[]> {
  const p: Record<string, string> = {}
  if (params?.search)    p.search    = params.search
  if (params?.trader)    p.trader    = params.trader
  if (params?.page)      p.page      = String(params.page)
  if (params?.page_size) p.page_size = String(params.page_size)
  const qs = Object.keys(p).length ? '?' + new URLSearchParams(p).toString() : ''
  const data = await mfFetch<MfQuest[] | { data?: MfQuest[]; quests?: MfQuest[] }>(`/quests${qs}`)
  if (Array.isArray(data)) return data
  if ('data' in data && Array.isArray(data.data)) return data.data
  return (data.quests ?? [])
}

/**
 * GET /api/arc-raiders/events-schedule
 * Returns upcoming event slots per map with Unix-ms timestamps.
 */
export async function getMfEventsSchedule(): Promise<MfEvent[]> {
  const raw = await mfFetch<{ data?: MfEvent[] } | MfEvent[]>(
    'https://metaforge.app/api/arc-raiders/events-schedule',
    { next: { revalidate: 60 } },   // events change hourly — cache 1 min
  )
  if (Array.isArray(raw)) return raw
  return raw.data ?? []
}

// ─── Player Profile types (stubs) ───────────────────────────────────────────
//
// MetaForge's public API (as of 2026) only exposes game data — items, ARCs,
// quests, events, traders. It does NOT currently have player-profile or
// Embark-auth endpoints in the public API.
//
// These interfaces define the expected shape for WHEN MetaForge adds profile
// endpoints. The helpers below are stubbed so they can be dropped into the
// raiderSync flow without changing call-sites.
//
// TODO: When MetaForge publishes profile endpoints, replace the stub bodies
//       with real mfFetch calls and remove the thrown errors.

export interface MfProfileQuest {
  id: string
  name: string
  trader_name: string
  status: 'complete' | 'active' | 'locked'
}

export interface MfProfileProject {
  id: string
  name: string
  workbench: string
  status: 'complete' | 'in_progress' | 'locked'
}

/** Shape returned by a hypothetical /api/arc-raiders/profile/{id} endpoint */
export interface MfProfile {
  /** MetaForge internal profile identifier */
  profileId: string
  /** Embark account identifier — null until the player links their account */
  embarkId: string | null
  displayName: string
  /** e.g. ["PC", "PS5"] */
  platforms: string[]
  /** Estimated stash value in in-game currency */
  stashValue: number
  inventoryValue: number
  /** IDs of blueprints the MetaForge profile reports as owned */
  blueprintsOwned: string[]
  /** IDs of blueprints not yet obtained */
  blueprintsMissing: string[]
  quests: MfProfileQuest[]
  projects: MfProfileProject[]
  lastUpdated: string
}

/**
 * Fetch a MetaForge player profile by ID.
 *
 * STUB — MetaForge does not expose this endpoint publicly yet.
 * Replace the body with a real mfFetch call when the endpoint is available.
 *
 * @example (future)
 *   return mfFetch<MfProfile>(`/profiles/${profileId}`, { next: { revalidate: 60 } })
 */
export async function getMfProfileById(_profileId: string): Promise<MfProfile> {
  // TODO: replace with real endpoint once MetaForge publishes profile access
  throw new Error(
    'getMfProfileById: MetaForge player profile API is not yet publicly available. ' +
    'See https://metaforge.app/arc-raiders/api for updates.'
  )
}

/**
 * Fetch the MetaForge profile associated with a given auth token.
 *
 * STUB — MetaForge does not expose player auth/profiles in the public API.
 * This is the entry point for an OAuth / token-based flow once it launches.
 *
 * @example (future)
 *   return mfFetch<MfProfile>('/auth/profile', {
 *     headers: { Authorization: `Bearer ${token}` },
 *     next: { revalidate: 0 },
 *   })
 */
export async function getMfProfileByToken(_token: string): Promise<MfProfile> {
  // TODO: replace with real endpoint once MetaForge publishes auth/profile access
  throw new Error(
    'getMfProfileByToken: MetaForge player auth API is not yet publicly available. ' +
    'See https://metaforge.app/arc-raiders/api for updates.'
  )
}

/** GET /api/arc-raiders/traders — returns inventory keyed by trader name */
export async function getMfTraders(): Promise<MfTradersResponse> {
  const raw = await mfFetch<{ success?: boolean; data?: MfTradersResponse } | MfTradersResponse>('/traders')
  if ('data' in raw && raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    return raw.data as MfTradersResponse
  }
  if (typeof raw === 'object' && !Array.isArray(raw) && !('success' in raw)) {
    return raw as MfTradersResponse
  }
  return {}
}
