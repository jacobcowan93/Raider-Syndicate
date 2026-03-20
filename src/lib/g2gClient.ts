/**
 * Server-only G2G OpenAPI client (signing + HTTP).
 *
 * Docs: https://docs.g2g.com/authentication-intro-1237152m0
 * Signature: HMAC-SHA256(secret, path + apiKey + userId + timestamp) → hex
 *
 * Never import this module from client components — secrets must stay on the server.
 */

import crypto from 'crypto'

/** Official v2 host from G2G docs (Get Products, etc.). */
const DEFAULT_BASE_URL = 'https://open-api.g2g.com'

export class G2gApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly bodySnippet?: string,
  ) {
    super(message)
    this.name = 'G2gApiError'
  }
}

export function resolveG2gSecret(): string | undefined {
  return process.env.G2G_SECRET_KEY || process.env.G2G_SECRET
}

export function getG2gBaseUrl(): string {
  const raw = process.env.G2G_API_BASE_URL || DEFAULT_BASE_URL
  return raw.replace(/\/$/, '')
}

export function assertG2gEnv(): { apiKey: string; userId: string; secret: string } {
  const apiKey = process.env.G2G_API_KEY
  const userId = process.env.G2G_USER_ID
  const secret = resolveG2gSecret()
  if (!apiKey || !userId || !secret) {
    throw new Error(
      'G2G API not configured. Set G2G_API_KEY, G2G_USER_ID, and G2G_SECRET_KEY (or G2G_SECRET) in .env.local.',
    )
  }
  return { apiKey, userId, secret }
}

/**
 * `path` must match the request path and query string exactly (including `?…`),
 * in the same order used for `fetch`, so the signature matches what G2G verifies.
 */
export function signG2gRequest(
  path: string,
  timestamp: number,
  apiKey: string,
  userId: string,
  secret: string,
): string {
  const payload = `${path}${apiKey}${userId}${timestamp}`
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function g2gErrorMessage(status: number, url: string, text: string): string {
  if (status === 401) {
    return `G2G unauthorized (401) — check API key, user ID, secret, and signature clock skew: ${url}`
  }
  if (status === 429) {
    return `G2G rate limited (429) — back off and batch requests: ${url}`
  }
  return `G2G API error ${status} on ${url}: ${text || '(empty body)'}`
}

export async function g2gFetch<T>(
  pathAndQuery: string,
  options: RequestInit & { method?: string } = {},
): Promise<T> {
  const { apiKey, userId, secret } = assertG2gEnv()
  const timestamp = Date.now()
  const signature = signG2gRequest(pathAndQuery, timestamp, apiKey, userId, secret)
  const url = `${getG2gBaseUrl()}${pathAndQuery}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'g2g-api-key': apiKey,
      'g2g-userid': userId,
      'g2g-signature': signature,
      'g2g-timestamp': String(timestamp),
      ...options.headers,
    },
  })

  const text = await res.text().catch(() => '')

  if (!res.ok) {
    const msg = g2gErrorMessage(res.status, url, text)
    throw new G2gApiError(msg, res.status, text.slice(0, 500))
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new G2gApiError(
      `G2G returned non-JSON (${url}): ${text.slice(0, 200)}`,
      res.status,
      text.slice(0, 500),
    )
  }
}

/**
 * Build a stable path + query string for GET requests (sorted keys) so signing matches the URL.
 */
export function buildG2gQueryPath(
  pathname: string,
  query?: Record<string, string | undefined>,
): string {
  const entries = Object.entries(query ?? {}).filter(
    ([, v]) => v !== undefined && v !== null && String(v).length > 0,
  )
  entries.sort(([a], [b]) => a.localeCompare(b))
  const qs = new URLSearchParams(entries as [string, string][]).toString()
  return qs ? `${pathname}?${qs}` : pathname
}
