/**
 * G2G OpenAPI v2 helpers (offers, catalogue).
 *
 * Docs: https://docs.g2g.com
 * Low-level signing/HTTP: `./g2gClient` (server-only).
 *
 * Multi-seller / Firebase: store per-user G2G credentials in Firestore, e.g.
 *   `users/{firebaseUid}/integrations/g2g` → { g2gUserId, apiKeyRef, secretRef }
 * and pass `userId` + secrets from that document into server actions instead of env.
 * Prefer Secret Manager or encrypted fields for `G2G_SECRET_KEY`, not plain text.
 */

import {
  assertG2gEnv,
  buildG2gQueryPath,
  g2gFetch,
  signG2gRequest as computeG2gSignature,
} from './g2gClient'

// ─── Signature (tests / custom flows) ────────────────────────────────────────

/** HMAC for `path + apiKey + userId + timestamp` using configured env credentials. */
export function signG2gRequest(path: string, timestamp: number): string {
  const { apiKey, userId, secret } = assertG2gEnv()
  return computeG2gSignature(path, timestamp, apiKey, userId, secret)
}

export { g2gFetch, G2gApiError } from './g2gClient'

// ─── TypeScript interfaces ───────────────────────────────────────────────────

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

export interface G2gProduct {
  service_id: string
  brand_id: string
  product_id: string
  category_id: string
  product_name: string
  service_name: string
  brand_name: string
  region_name: string
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

interface G2gEnvelope<T> {
  code?: number
  message?: string
  payload?: T
}

// ─── Marketplace methods ─────────────────────────────────────────────────────

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

// ─── Product catalogue (read-only) ───────────────────────────────────────────

/** GET /v2/product/service — list available services */
export async function getServices(): Promise<G2gService[]> {
  const data = await g2gFetch<{ services?: G2gService[] } | G2gService[]>(
    '/v2/product/service',
  )
  return Array.isArray(data) ? data : (data.services ?? [])
}

/** GET /v2/product/brand — list brands */
export async function getBrands(after?: string): Promise<G2gBrand[]> {
  const path = buildG2gQueryPath('/v2/product/brand', { after })
  const data = await g2gFetch<{ brands?: G2gBrand[] } | G2gBrand[]>(path)
  return Array.isArray(data) ? data : (data.brands ?? [])
}

/**
 * GET https://open-api.g2g.com/v2/products — catalogue products for a brand/service.
 * @see https://docs.g2g.com/get-products-18583481e0
 */
export async function getG2gProducts(params: {
  category_id?: string
  service_id?: string
  brand_id?: string
  q?: string
} = {}): Promise<G2gProduct[]> {
  const path = buildG2gQueryPath('/v2/products', {
    category_id: params.category_id,
    service_id: params.service_id,
    brand_id: params.brand_id,
    q: params.q,
  })
  const data = await g2gFetch<G2gEnvelope<{ product_list?: G2gProduct[] }>>(path, {
    method: 'GET',
  })
  if (typeof data.code === 'number' && data.code !== 20000001) {
    throw new Error(data.message || `G2G API code ${data.code}`)
  }
  return data.payload?.product_list ?? []
}
