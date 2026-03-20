import { searchOffers, G2gOffer } from '@/lib/g2g'
import { getMfItemsPaged, MfItem } from '@/lib/metaforge'
import { uniqueBy } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Lowercase + trim for name-join matching */
const norm = (s: string) => s.toLowerCase().trim()

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  active:   { color: '#22c55e', bg: 'rgba(34,197,94,0.10)'   },
  inactive: { color: '#9ca3af', bg: 'rgba(156,163,175,0.10)' },
  pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)'  },
}

const RARITY_COLORS: Record<string, string> = {
  Common: '#9ca3af', Uncommon: '#22c55e', Rare: '#3b82f6',
  Epic: '#a855f7', Legendary: '#f59e0b',
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.pending
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ color: s.color, background: s.bg }}
    >
      {status}
    </span>
  )
}

function MfItemThumb({ item }: { item: MfItem }) {
  const color = RARITY_COLORS[item.rarity] ?? '#9ca3af'
  return (
    <div className="flex items-center gap-2 min-w-0">
      {item.icon ? (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
          style={{ background: `${color}18` }}
        >
          <Image src={item.icon} alt={item.name} width={24} height={24} unoptimized className="object-contain" />
        </div>
      ) : (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-black"
          style={{ background: `${color}18`, color }}
        >
          {item.name[0]}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold" style={{ color: '#e2e8f0' }}>{item.name}</p>
        <p className="text-[10px]" style={{ color }}>{item.rarity}</p>
      </div>
    </div>
  )
}

// ─── Credential setup card ────────────────────────────────────────────────────

function G2gSetupCard() {
  return (
    <div className="rounded-lg border p-8 flex flex-col gap-6" style={{ background: '#0f1117', borderColor: '#1e2433' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(201,168,76,0.12)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div>
          <p className="font-bold" style={{ color: '#e2e8f0' }}>G2G API not configured</p>
          <p className="text-xs" style={{ color: '#8b9ab3' }}>Set credentials to enable live marketplace data and offer management.</p>
        </div>
      </div>

      <div className="rounded border p-4 text-xs font-mono space-y-1" style={{ background: '#13161e', borderColor: '#1e2433', color: '#8b9ab3' }}>
        <p><span style={{ color: '#dc2626' }}># </span><span style={{ color: '#64748b' }}>.env.local — fill these in:</span></p>
        <p><span style={{ color: '#c9a84c' }}>G2G_API_KEY</span>=&lt;your-api-key&gt;</p>
        <p><span style={{ color: '#c9a84c' }}>G2G_USER_ID</span>=&lt;your-user-id&gt;</p>
        <p><span style={{ color: '#c9a84c' }}>G2G_SECRET</span>=&lt;your-hmac-secret&gt;</p>
      </div>

      <ol className="text-sm space-y-2" style={{ color: '#8b9ab3' }}>
        <li><span style={{ color: '#e2e8f0' }}>1.</span>{' '}Log in to <a href="https://www.g2g.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#c9a84c' }}>g2g.com</a> → avatar → API Integration.</li>
        <li><span style={{ color: '#e2e8f0' }}>2.</span>{' '}Request API access (required for sellers).</li>
        <li><span style={{ color: '#e2e8f0' }}>3.</span>{' '}Copy your key, user ID, and HMAC secret into <code className="rounded px-1" style={{ background: '#1e2433' }}>.env.local</code>.</li>
        <li><span style={{ color: '#e2e8f0' }}>4.</span>{' '}Restart the dev server — this page will show live offers.</li>
      </ol>

      <div className="flex gap-3">
        <a href="https://docs.g2g.com/setup-api-key-1237153m0" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{ borderColor: '#c9a84c', color: '#c9a84c', background: 'rgba(201,168,76,0.07)' }}>
          G2G API Docs ↗
        </a>
        <a href="/debug/g2g"
          className="inline-flex items-center gap-1.5 rounded border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{ borderColor: '#1e2433', color: '#8b9ab3' }}>
          Debug G2G
        </a>
      </div>
    </div>
  )
}

// ─── Item context card (shown when arriving from /arc-items "Sell on G2G") ───

function ItemContextCard({ item }: { item: MfItem }) {
  const color = RARITY_COLORS[item.rarity] ?? '#9ca3af'
  return (
    <div
      className="flex flex-wrap items-center gap-5 rounded-lg border p-5"
      style={{ background: '#13161e', borderColor: `${color}40` }}
    >
      {item.icon && (
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${color}15` }}
        >
          <Image src={item.icon} alt={item.name} width={48} height={48} unoptimized className="object-contain" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-base font-bold" style={{ color: '#e2e8f0' }}>{item.name}</h2>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
            {item.rarity}
          </span>
          <span className="text-xs" style={{ color: '#8b9ab3' }}>{item.item_type}</span>
        </div>
        {item.description && (
          <p className="text-xs line-clamp-2" style={{ color: '#8b9ab3' }}>{item.description}</p>
        )}
        {item.value > 0 && (
          <p className="mt-1 text-xs font-semibold" style={{ color: '#c9a84c' }}>
            ⚡ {item.value.toLocaleString()} base value
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs mb-2" style={{ color: '#8b9ab3' }}>Showing G2G offers for this item</p>
        <Link href="/arc-items"
          className="text-xs underline"
          style={{ color: '#8b9ab3' }}>
          ← Back to items
        </Link>
      </div>
    </div>
  )
}

// ─── Offers table ─────────────────────────────────────────────────────────────

function OffersTable({
  offers,
  mfByName,
}: {
  offers: G2gOffer[]
  mfByName: Map<string, MfItem>
}) {
  if (offers.length === 0) {
    return (
      <div
        className="rounded-lg border py-16 text-center text-sm"
        style={{ background: '#0f1117', borderColor: '#1e2433', borderStyle: 'dashed', color: '#8b9ab3' }}
      >
        No offers found. Try a different search, or create your first listing.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#1e2433' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #1e2433', background: '#13161e' }}>
            {['ARC Item', 'Offer Title', 'Type', 'Currency', 'Qty', 'Status', 'Updated'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b9ab3' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const mfItem = mfByName.get(norm(offer.offer_title))
            return (
              <tr key={offer.offer_id} style={{ borderBottom: '1px solid #0f1117' }} className="transition-colors hover:bg-white/[0.02]">
                {/* MetaForge joined item */}
                <td className="px-4 py-3" style={{ minWidth: 160 }}>
                  {mfItem ? (
                    <MfItemThumb item={mfItem} />
                  ) : (
                    <span className="text-xs" style={{ color: '#3b4660' }}>—</span>
                  )}
                </td>

                {/* G2G offer title + description */}
                <td className="px-4 py-3" style={{ color: '#e2e8f0' }}>
                  <span className="font-medium">{offer.offer_title}</span>
                  {offer.offer_description && (
                    <p className="mt-0.5 line-clamp-1 text-xs" style={{ color: '#64748b' }}>
                      {offer.offer_description}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 text-xs" style={{ color: '#8b9ab3' }}>{offer.offer_type}</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#c9a84c' }}>{offer.offer_currency}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#e2e8f0' }}>{offer.available_qty.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={offer.offer_status} /></td>
                <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>
                  {new Date(offer.updated_at).toLocaleDateString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface SearchParams {
  q?: string
  item?: string    // MetaForge item ID (from /arc-items "Sell on G2G" link)
  name?: string    // MetaForge item name (from /arc-items "Sell on G2G" link)
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await Promise.resolve(searchParams)

  // Effective search query: prefer item name param (from arc-items link), else free-text
  const effectiveQuery = sp.name?.trim() || sp.q?.trim() || ''
  const itemId         = sp.item?.trim() ?? ''

  const isConfigured = Boolean(
    process.env.G2G_API_KEY &&
    process.env.G2G_USER_ID &&
    process.env.G2G_SECRET,
  )

  let offers:       G2gOffer[]           = []
  let mfItems:      MfItem[]             = []
  let selectedItem: MfItem | null        = null
  let mfByName:     Map<string, MfItem>  = new Map()
  let g2gError:     string | null        = null
  let mfError:      string | null        = null

  // ── Parallel fetches ────────────────────────────────────────────────────────
  const [g2gResult, mfResult] = await Promise.allSettled([
    isConfigured
      ? searchOffers({ ...(effectiveQuery && { query: effectiveQuery }), page_size: 50 })
      : Promise.resolve({ offers: [] as G2gOffer[] }),
    // Fetch MetaForge items matching the search so we can join with offers.
    // When no query, fetch the first page so common items are covered.
    getMfItemsPaged({ ...(effectiveQuery && { search: effectiveQuery }), page_size: 50 }),
  ])

  if (g2gResult.status === 'fulfilled') {
    // Deduplicate by offer_id — G2G should never return dupes, but guard anyway
    offers = uniqueBy(g2gResult.value.offers ?? [], (o) => o.offer_id, 'G2G offer')
  } else {
    g2gError = g2gResult.reason instanceof Error
      ? g2gResult.reason.message
      : 'Failed to load G2G offers.'
  }

  if (mfResult.status === 'fulfilled') {
    // Deduplicate by item id before building the join map
    mfItems = uniqueBy(mfResult.value.items, (i) => i.id, 'MetaForge item')
    // Build normalised-name → MfItem lookup for the join
    mfByName = new Map(mfItems.map((i) => [norm(i.name), i]))
    // Resolve the specific item from the "Sell on G2G" link
    if (itemId) {
      selectedItem = mfItems.find((i) => i.id === itemId) ?? null
    }
  } else {
    mfError = mfResult.reason instanceof Error
      ? mfResult.reason.message
      : 'MetaForge unavailable.'
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5"
        style={{ background: '#13161e', borderColor: '#1e2433' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(201,168,76,0.12)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-widest" style={{ color: '#e2e8f0' }}>
              Marketplace
            </h1>
            <p className="text-xs" style={{ color: '#8b9ab3' }}>
              {!isConfigured
                ? 'G2G credentials required'
                : g2gError
                  ? 'G2G API error'
                  : `${offers.length} offer${offers.length !== 1 ? 's' : ''} · icons from MetaForge`}
            </p>
          </div>
        </div>

        {isConfigured && (
          <a href="https://docs.g2g.com/2022-11-10-1237175m0" target="_blank" rel="noopener noreferrer"
            className="text-xs underline" style={{ color: '#8b9ab3' }}>
            G2G Offer API docs ↗
          </a>
        )}
      </div>

      {/* ── Item context card (from arc-items "Sell on G2G" link) ───────── */}
      {selectedItem && <ItemContextCard item={selectedItem} />}

      {/* ── G2G not configured ──────────────────────────────────────────── */}
      {!isConfigured && <G2gSetupCard />}

      {/* ── Errors ──────────────────────────────────────────────────────── */}
      {g2gError && (
        <div className="rounded-lg border px-5 py-4 text-sm"
          style={{ background: 'rgba(220,38,38,0.07)', borderColor: 'rgba(220,38,38,0.3)', color: '#fca5a5' }}>
          <strong>G2G error:</strong> {g2gError}
        </div>
      )}
      {mfError && (
        <div className="rounded-lg border px-5 py-4 text-sm"
          style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.25)', color: '#fde68a' }}>
          <strong>MetaForge unavailable</strong> — item icons and names will not display next to offers. {mfError}
        </div>
      )}

      {/* ── Search bar + offers ─────────────────────────────────────────── */}
      {isConfigured && !g2gError && (
        <>
          {/* Search form */}
          <form action="/marketplace" method="get" className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b9ab3' }}>
                Search offers
              </label>
              <input
                name="q"
                defaultValue={sp.q ?? ''}
                placeholder="Item name, e.g. Aphelion Rifle…"
                className="rounded border bg-transparent px-3 py-1.5 text-sm outline-none"
                style={{ borderColor: '#1e2433', color: '#e2e8f0', minWidth: 260 }}
              />
            </div>
            <button type="submit" className="rounded px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: '#c9a84c', color: '#0b0d11' }}>
              Search
            </button>
            {effectiveQuery && (
              <a href="/marketplace" className="text-xs underline" style={{ color: '#8b9ab3' }}>Clear</a>
            )}
          </form>

          {/* Offers table — with MetaForge item join */}
          <OffersTable offers={offers} mfByName={mfByName} />

          {/* TODO: Add createOffer form here once G2G seller access is approved */}
        </>
      )}
    </div>
  )
}
