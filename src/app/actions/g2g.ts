'use server'

/**
 * Server Actions for G2G OpenAPI (never expose G2G_SECRET_KEY to the client).
 *
 * Firebase multi-seller: resolve the acting user's G2G seller id + keys from Firestore
 * inside these actions (e.g. `getDoc(doc(db, 'users', uid, 'integrations', 'g2g'))`)
 * and call a variant of `getG2gProducts` that accepts explicit credentials.
 */

import { G2gApiError, getG2gProducts, type G2gProduct } from '@/lib/g2g'

export type FetchG2gProductsResult =
  | { ok: true; products: G2gProduct[] }
  | { ok: false; error: string; status?: number }

export async function fetchG2gProducts(params: {
  category_id?: string
  service_id?: string
  brand_id?: string
  q?: string
} = {}): Promise<FetchG2gProductsResult> {
  try {
    const products = await getG2gProducts(params)
    return { ok: true, products }
  } catch (e) {
    if (e instanceof G2gApiError) {
      return { ok: false, error: e.message, status: e.status }
    }
    const message = e instanceof Error ? e.message : 'Unknown G2G error'
    return { ok: false, error: message }
  }
}
