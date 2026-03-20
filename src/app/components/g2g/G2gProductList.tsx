import { fetchG2gProducts } from '@/app/actions/g2g'

type Props = {
  /** When set, scopes the catalogue call (G2G requires brand context for product lists). */
  brandId?: string
  serviceId?: string
  query?: string
  className?: string
}

/**
 * Server component: loads G2G products via a Server Action wrapper (still server-only I/O).
 */
export async function G2gProductList({ brandId, serviceId, query, className = '' }: Props) {
  const result = await fetchG2gProducts({
    brand_id: brandId,
    service_id: serviceId,
    q: query,
  })

  if (!result.ok) {
    const isAuth = result.status === 401
    const isRate = result.status === 429
    return (
      <div
        className={`rounded-lg border px-4 py-3 text-sm ${className}`}
        style={{
          background: isAuth ? 'rgba(220,38,38,0.07)' : isRate ? 'rgba(245,158,11,0.08)' : 'rgba(220,38,38,0.05)',
          borderColor: isAuth ? 'rgba(220,38,38,0.35)' : isRate ? 'rgba(245,158,11,0.35)' : 'rgba(220,38,38,0.2)',
          color: isAuth ? '#fca5a5' : isRate ? '#fde68a' : '#fecaca',
        }}
      >
        <strong>{isRate ? 'Rate limited' : 'G2G products error'}</strong>
        <span className="opacity-90"> — {result.error}</span>
      </div>
    )
  }

  if (result.products.length === 0) {
    return (
      <div
        className={`rounded-lg border border-dashed px-4 py-10 text-center text-sm ${className}`}
        style={{ background: '#0f1117', borderColor: '#1e2433', color: '#8b9ab3' }}
      >
        No products returned. Pass <code className="rounded px-1 text-xs" style={{ background: '#1e2433' }}>brandId</code>{' '}
        (and optionally <code className="rounded px-1 text-xs" style={{ background: '#1e2433' }}>serviceId</code>) from{' '}
        <span style={{ color: '#c9a84c' }}>Get Brands</span> / <span style={{ color: '#c9a84c' }}>Get Services</span> first.
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto rounded-lg border ${className}`} style={{ borderColor: '#1e2433' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #1e2433', background: '#13161e' }}>
            {['Product', 'Service', 'Brand', 'Region'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#8b9ab3' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.products.map((p) => (
            <tr
              key={p.product_id}
              style={{ borderBottom: '1px solid #0f1117' }}
              className="transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3">
                <span className="font-medium" style={{ color: '#e2e8f0' }}>
                  {p.product_name}
                </span>
                <p className="mt-0.5 font-mono text-[10px]" style={{ color: '#64748b' }}>
                  {p.product_id}
                </p>
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: '#8b9ab3' }}>
                {p.service_name}
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: '#8b9ab3' }}>
                {p.brand_name}
              </td>
              <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#c9a84c' }}>
                {p.region_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
