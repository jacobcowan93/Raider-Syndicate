/**
 * Debug page: /debug/metaforge
 *
 * Server component — calls MetaForge directly at request time.
 * Proves the client compiles and the endpoints are reachable.
 */

import { getMfEventsSchedule, getMfItems, getMfArcs, getMfQuests } from '@/lib/metaforge'

export const dynamic = 'force-dynamic'

type Result<T> =
  | {
      ok: true
      data: T
      count: number
      elapsed: number
    }
  | {
      ok: false
      error: string
    }

async function tryFetch<T>(label: string, fn: () => Promise<T>): Promise<{ label: string } & Result<T>> {
  const start = Date.now()
  try {
    const data = await fn()
    const count = Array.isArray(data)
      ? data.length
      : typeof data === 'object' && data !== null
        ? Object.keys(data as object).length
        : 1
    return { label, ok: true, data, count, elapsed: Date.now() - start }
  } catch (err) {
    return { label, ok: false, error: String(err) }
  }
}

export default async function MetaForgeDebugPage() {
  const [events, items, arcs, quests] = await Promise.all([
    tryFetch('events-schedule', () => getMfEventsSchedule()),
    tryFetch('items (first 5)', () =>
      getMfItems({ page_size: 5 }).then((r) => r.slice(0, 5)),
    ),
    tryFetch('arcs (first 5)', () =>
      getMfArcs().then((r) => r.slice(0, 5)),
    ),
    tryFetch('quests (first 5)', () =>
      getMfQuests({ page_size: 5 }).then((r) => r.slice(0, 5)),
    ),
  ])

  const results = [events, items, arcs, quests]

  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', background: '#0b0d11', minHeight: '100vh', color: '#e2e8f0' }}>
      <h1 style={{ color: '#dc2626', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
        🛰 MetaForge Debug
      </h1>
      <p style={{ color: '#8b9ab3', marginBottom: '2rem', fontSize: '0.85rem' }}>
        Base URL: <code style={{ color: '#c9a84c' }}>{process.env.NEXT_PUBLIC_METAFORGE_BASE_URL ?? 'https://metaforge.app/api/arc-raiders'}</code>
      </p>

      {results.map((r) => (
        <div
          key={r.label}
          style={{
            marginBottom: '1.5rem',
            border: `1px solid ${r.ok ? '#1e2433' : '#7f1d1d'}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.6rem 1rem',
              background: r.ok ? '#13161e' : '#2d0a0a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 'bold', color: r.ok ? '#22c55e' : '#ef4444' }}>
              {r.ok ? '✓' : '✗'} {r.label}
            </span>
            {r.ok && (
              <span style={{ fontSize: '0.75rem', color: '#8b9ab3' }}>
                {r.count} top-level key{r.count !== 1 ? 's' : ''} · {r.elapsed}ms
              </span>
            )}
          </div>
          <pre
            style={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.75rem',
              overflowX: 'auto',
              background: '#0f1117',
              color: r.ok ? '#94a3b8' : '#fca5a5',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {r.ok
              ? JSON.stringify(r.data, null, 2)
              : r.error}
          </pre>
        </div>
      ))}

      <p style={{ color: '#374151', fontSize: '0.75rem', marginTop: '2rem' }}>
        Data sourced from MetaForge — <a href="https://metaforge.app/arc-raiders" style={{ color: '#c9a84c' }}>metaforge.app/arc-raiders</a>
      </p>
    </div>
  )
}
