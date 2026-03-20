/**
 * G2G OpenAPI v2 client stub
 *
 * Docs:           https://docs.g2g.com
 * Auth intro:     https://docs.g2g.com/authentication-intro-1237152m0
 * Setup API key:  https://docs.g2g.com/setup-api-key-1237153m0
 *
 * API access requires approval from G2G (limited to certain sellers/regions).
 * Fill in the env vars below once you have keys; all calls throw until then.
 *
 * Signature algorithm (per docs):
 *   HMAC-SHA256(secret, path + apiKey + userId + timestamp)
 *   → sent as hex in the `g2g-signature` header
 *   timestamp = Date.now() in milliseconds, expires within 5 minutes
 */

import crypto from 'crypto'

// ─── Config ────────────────────────────────────────────────────────────────

const G2G_BASE_URL = 'https://openapi.g2g.com'

const G2G_API_KEY = process.env.G2G_API_KEY
const G2G_USER_ID = process.env.G2G_USER_ID
const G2G_SECRET  = process.env.G2G_SECRET

// ─── Signature helper ──────────────────────────────────────────────────────

/**
 * Build the `g2g-signature` value.
 *
 * Per docs: HMAC-SHA256( secret, path + apiKey + userId + timestamp )
 * Result is a hex string.
 */
export function signG2gRequest(
  path: string,
  timestamp: number,
  apiKey = G2G_API_KEY,
  userId = G2G_USER_ID,
  secret = G2G_SECRET,
): string {
  if (!secret || !apiKey || !userId) {
    throw new Error(
      'G2G credentials not configured. Set G2G_API_KEY, G2G_USER_ID, and G2G_SECRET in .env.local.',
    )
  }
  const payload = `${path}${apiKey}${userId}${timestamp}`
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

// ─── Generic fetch wrapper ──────────────────────────────────────────────────

export async function g2gFetch<T>(
  path: string,
  options: RequestInit & { method?: string } = {},
): Promise<T> {
  if (!G2G_API_KEY || !G2G_USER_ID || !G2G_SECRET) {
    throw new Error(
      'G2G API not configured. Set G2G_API_KEY, G2G_USER_ID, and G2G_SECRET in .env.local.',
    )
  }

  const timestamp = Date.now()
  const signature = signG2gRequest(path, timestamp)

  const url = `${G2G_BASE_URL}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'g2g-api-key':   G2G_API_KEY,
      'g2g-userid':    G2G_USER_ID,
      'g2g-signature': signature,
      'g2g-timestamp': String(timestamp),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `G2G API error ${res.status} on ${url}: ${text || res.statusText}`,
    )
  }

  return res.json() as Promise<T>
}

// ─── TypeScript interfaces ──────────────────────────────────────────────────

export interface G2gService {
  service_id: string
  service_name: string
  delivery_method?: string
}

export interface G2gBrand {
  brand_id: string
  brand_name: string
  after?: string
}

export interface G2gOffer {
  offer_id: string
  seller_id: string
  offer_title: string
  offer_description?: string
  offer_status: string
  offer_type: string
  delivery_type: string
  region_id?: string
  offer_currency: string
  available_qty: number
  min_qty?: number
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface G2gSearchOffersParams {
  /** Free-text search query */
  query?: string
  /** Cursor for pagination */
  after?: string
  page?: number
  page_size?: number
  filter?: Record<string, unknown>
}

export interface G2gSearchOffersResponse {
  offers: G2gOffer[]
  page?: number
  page_size?: number
  after?: string
}

export interface G2gCreateOfferBody {
  offer_title: string
  offer_description?: string
  offer_type: string
  delivery_type: string
  region_id?: string
  offer_currency: string
  available_qty: number
  min_qty?: number
  unit_price: number
  delivery_method_ids?: string[]
  offer_attributes?: Record<string, unknown>[]
  [key: string]: unknown
}

// ─── Marketplace methods ────────────────────────────────────────────────────

/** POST /v2/offer/search — search marketplace offers */
export async function searchOffers(
  params: G2gSearchOffersParams = {},
): Promise<G2gSearchOffersResponse> {
  return g2gFetch<G2gSearchOffersResponse>('/v2/offer/search', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/** GET /v2/offer/{offerId} — retrieve a single offer by ID */
export async function getOffer(offerId: string): Promise<G2gOffer> {
  return g2gFetch<G2gOffer>(`/v2/offer/${offerId}`)
}

/**
 * POST /v2/offer — create a new listing offer.
 * Requires approved seller access. Will throw until keys are configured.
 */
export async function createOffer(body: G2gCreateOfferBody): Promise<G2gOffer> {
  return g2gFetch<G2gOffer>('/v2/offer', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ─── Product catalogue (read-only) ─────────────────────────────────────────

/** GET /v2/product/service — list available services */
export async function getServices(): Promise<G2gService[]> {
  const data = await g2gFetch<{ services?: G2gService[] } | G2gService[]>(
    '/v2/product/service',
  )
  return Array.isArray(data) ? data : (data.services ?? [])
}

/** GET /v2/product/brand — list brands */
export async function getBrands(after?: string): Promise<G2gBrand[]> {
  const qs = after ? `?after=${encodeURIComponent(after)}` : ''
  const data = await g2gFetch<{ brands?: G2gBrand[] } | G2gBrand[]>(
    `/v2/product/brand${qs}`,
  )
  return Array.isArray(data) ? data : (data.brands ?? [])
}
