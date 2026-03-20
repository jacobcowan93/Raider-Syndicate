/**
 * Debug page: /debug/g2g
 *
 * Server component — checks G2G credentials and optionally fires a
 * read-only call (Get Services) when keys are present.
 */

import { getServices } from '@/lib/g2g'
import { G2gProductList } from '@/app/components/g2g/G2gProductList'

export const dynamic = 'force-dynamic'

export default async function G2gDebugPage() {
  const apiKey  = process.env.G2G_API_KEY
  const userId  = process.env.G2G_USER_ID
  const secret  = process.env.G2G_SECRET_KEY || process.env.G2G_SECRET

  const configured = Boolean(apiKey && userId && secret)

  let serviceResult: { ok: true; count: number; sample: unknown } | { ok: false; error: string } | null = null

  if (configured) {
    const start = Date.now()
    try {
      const services = await getServices()
      serviceResult = {
        ok: true,
        count: services.length,
        sample: services.slice(0, 3),
      }
      void start
    } catch (err) {
      serviceResult = { ok: false, error: String(err) }
    }
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', background: '#0b0d11', minHeight: '100vh', color: '#e2e8f0' }}>
      <h1 style={{ color: '#c9a84c', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
        🛒 G2G OpenAPI Debug
      </h1>
      <p style={{ color: '#8b9ab3', marginBottom: '2rem', fontSize: '0.85rem' }}>
        Base URL: <code style={{ color: '#c9a84c' }}>https://open-api.g2g.com</code>
        {' '}
        <span style={{ color: '#64748b' }}>(override with G2G_API_BASE_URL)</span>
      </p>

      {/* Credential check */}
      <div
        style={{
          marginBottom: '1.5rem',
          border: `1px solid ${configured ? '#1e2433' : '#7f1d1d'}`,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '0.6rem 1rem',
            background: configured ? '#13161e' : '#2d0a0a',
            fontWeight: 'bold',
            color: configured ? '#22c55e' : '#ef4444',
          }}
        >
          {configured ? '✓ G2G credentials configured' : '✗ G2G API not configured'}
        </div>
        <pre
          style={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.75rem',
            background: '#0f1117',
            color: '#94a3b8',
          }}
        >
          {[
            `G2G_API_KEY  ${apiKey  ? `set (${apiKey.slice(0, 6)}…)`  : 'NOT SET'}`,
            `G2G_USER_ID  ${userId  ? `set (${userId})`               : 'NOT SET'}`,
            `G2G_SECRET_KEY / G2G_SECRET  ${secret ? `set (${secret.slice(0, 4)}…)` : 'NOT SET'}`,
          ].join('\n')}
        </pre>
      </div>

      {/* Live call — only when keys present */}
      {configured && serviceResult && (
        <div
          style={{
            marginBottom: '1.5rem',
            border: `1px solid ${serviceResult.ok ? '#1e2433' : '#7f1d1d'}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.6rem 1rem',
              background: serviceResult.ok ? '#13161e' : '#2d0a0a',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 'bold', color: serviceResult.ok ? '#22c55e' : '#ef4444' }}>
              {serviceResult.ok ? '✓' : '✗'} GET /v2/product/service
            </span>
            {serviceResult.ok && (
              <span style={{ fontSize: '0.75rem', color: '#8b9ab3' }}>
                {serviceResult.count} service{serviceResult.count !== 1 ? 's' : ''} returned
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
              color: serviceResult.ok ? '#94a3b8' : '#fca5a5',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {serviceResult.ok
              ? JSON.stringify(serviceResult.sample, null, 2)
              : serviceResult.error}
          </pre>
        </div>
      )}

      {configured && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#c9a84c', fontSize: '1rem', marginBottom: '0.75rem' }}>
            GET /v2/products (Server Action + Tailwind list)
          </h2>
          <G2gProductList />
        </div>
      )}

      {!configured && (
        <div
          style={{
            padding: '1rem',
            border: '1px solid #1e2433',
            borderRadius: '8px',
            background: '#0f1117',
            color: '#8b9ab3',
            fontSize: '0.85rem',
          }}
        >
          <strong style={{ color: '#c9a84c' }}>Next steps:</strong>
          <ol style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li>Request API access at <a href="https://www.g2g.com" style={{ color: '#c9a84c' }}>g2g.com</a> → API Integration</li>
            <li>Generate your API key + secret in the G2G dashboard</li>
            <li>
              Add to <code style={{ color: '#dc2626' }}>.env.local</code>:
              <pre style={{ background: '#13161e', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                {`G2G_API_KEY=your_api_key\nG2G_USER_ID=your_user_id\nG2G_SECRET_KEY=your_secret`}
              </pre>
            </li>
            <li>Restart the dev server and reload this page</li>
          </ol>
        </div>
      )}

      <p style={{ color: '#374151', fontSize: '0.75rem', marginTop: '2rem' }}>
        Docs: <a href="https://docs.g2g.com" style={{ color: '#c9a84c' }}>docs.g2g.com</a>
      </p>
    </div>
  )
}
