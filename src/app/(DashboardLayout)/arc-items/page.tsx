import { getMfItemsPaged, MfItem } from '@/lib/metaforge'
import { uniqueBy } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

// ─── Rarity config ───────────────────────────────────────────────────────────

const RARITY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Common:    { color: '#9ca3af', bg: 'rgba(156,163,175,0.10)', border: 'rgba(156,163,175,0.25)' },
  Uncommon:  { color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)'   },
  Rare:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)'  },
  Epic:      { color: '#a855f7', bg: 'rgba(168,85,247,0.10)',  border: 'rgba(168,85,247,0.25)'  },
  Legendary: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.30)'  },
}

const ITEM_TYPES = [
  'Advanced Material', 'Blueprint', 'Consumable', 'Key',
  'Misc', 'Modification', 'Nature', 'Quick Use',
  'Recyclable', 'Refined Material', 'Topside Material', 'Trinket', 'Weapon',
]
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']

// ─── Sub-components ──────────────────────────────────────────────────────────

function RarityBadge({ rarity }: { rarity: string }) {
  const s = RARITY_STYLES[rarity] ?? RARITY_STYLES.Common
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {rarity}
    </span>
  )
}

function ItemCard({ item }: { item: MfItem }) {
  const s = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.Common
  const sellUrl = `/marketplace?item=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-white/[0.02]"
      style={{ background: '#0f1117', borderColor: s.border }}
    >
      {/* Icon + name */}
      <div className="flex items-center gap-3">
        {item.icon ? (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
            style={{ background: s.bg }}
          >
            <Image
              src={item.icon}
              alt={item.name}
              width={40}
              height={40}
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-lg font-black"
            style={{ background: s.bg, color: s.color }}
          >
            {item.name[0]}
          </div>
        )}
        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold leading-tight"
            style={{ color: '#e2e8f0' }}
          >
            {item.name}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: '#8b9ab3' }}>
            {item.item_type}
          </p>
        </div>
      </div>

      {/* Rarity + value */}
      <div className="flex items-center justify-between">
        <RarityBadge rarity={item.rarity} />
        {item.value > 0 && (
          <span className="text-xs font-semibold" style={{ color: '#c9a84c' }}>
            ⚡ {item.value.toLocaleString()}
          </span>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: '#64748b' }}>
          {item.description}
        </p>
      )}

      {/* Sell on G2G */}
      <div className="mt-auto pt-1 border-t" style={{ borderColor: '#1e2433' }}>
        <Link
          href={sellUrl}
          className="text-xs font-semibold tracking-wide transition-opacity hover:opacity-70"
          style={{ color: '#c9a84c' }}
        >
          Sell on G2G →
        </Link>
      </div>
    </div>
  )
}

function PaginationLink({
  href,
  label,
  disabled,
}: {
  href: string
  label: string
  disabled?: boolean
}) {
  if (disabled) {
    return (
      <span
        className="rounded border px-3 py-1.5 text-xs opacity-30"
        style={{ borderColor: '#1e2433', color: '#8b9ab3' }}
      >
        {label}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className="rounded border px-3 py-1.5 text-xs font-semibold transition-colors"
      style={{ borderColor: '#dc2626', color: '#dc2626', background: 'rgba(220,38,38,0.07)' }}
    >
      {label}
    </Link>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface SearchParams {
  q?: string
  page?: string
  rarity?: string
  type?: string
}

export default async function ArcItemsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await Promise.resolve(searchParams)
  const page      = Math.max(1, Number(sp.page ?? 1))
  const search    = sp.q?.trim() ?? ''
  const rarity    = sp.rarity ?? ''
  const item_type = sp.type ?? ''

  let items: MfItem[] = []
  let pagination = {
    page: 1, limit: 50, total: 0,
    totalPages: 1, hasNextPage: false, hasPrevPage: false,
  }
  let error: string | null = null

  try {
    const result = await getMfItemsPaged({
      page,
      page_size: 50,
      ...(search    && { search }),
      ...(rarity    && { rarity }),
      ...(item_type && { item_type }),
    })
    items      = uniqueBy(result.items, (i) => i.id, 'MetaForge item')
    pagination = result.pagination
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load items from MetaForge.'
  }

  // Build URL helper for filters + pagination
  function buildUrl(overrides: Record<string, string | number>) {
    const params: Record<string, string> = {}
    if (search)    params.q      = search
    if (rarity)    params.rarity = rarity
    if (item_type) params.type   = item_type
    params.page = String(page)
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params[k] = String(v)
      else   delete params[k]
    })
    const qs = new URLSearchParams(params).toString()
    return `/arc-items${qs ? '?' + qs : ''}`
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5"
        style={{ background: '#13161e', borderColor: '#1e2433' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'rgba(59,130,246,0.12)' }}
          >
            {/* box icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-widest" style={{ color: '#e2e8f0' }}>
              ARC Items
            </h1>
            <p className="text-xs" style={{ color: '#8b9ab3' }}>
              {error ? 'MetaForge unavailable' : `${pagination.total.toLocaleString()} items · page ${pagination.page} of ${pagination.totalPages}`}
            </p>
          </div>
        </div>

        {/* Attribution */}
        <a
          href="https://metaforge.app/arc-raiders"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline"
          style={{ color: '#8b9ab3' }}
        >
          Data: metaforge.app/arc-raiders ↗
        </a>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <form
        action="/arc-items"
        method="get"
        className="flex flex-wrap items-end gap-3"
      >
        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b9ab3' }}>
            Search
          </label>
          <input
            name="q"
            defaultValue={search}
            placeholder="e.g. rifle, helmet…"
            className="rounded border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-1"
            style={{ borderColor: '#1e2433', color: '#e2e8f0', minWidth: 200 }}
          />
        </div>

        {/* Rarity */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b9ab3' }}>
            Rarity
          </label>
          <select
            name="rarity"
            defaultValue={rarity}
            className="rounded border bg-[#0b0d11] px-3 py-1.5 text-sm outline-none"
            style={{ borderColor: '#1e2433', color: '#e2e8f0' }}
          >
            <option value="">All Rarities</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b9ab3' }}>
            Type
          </label>
          <select
            name="type"
            defaultValue={item_type}
            className="rounded border bg-[#0b0d11] px-3 py-1.5 text-sm outline-none"
            style={{ borderColor: '#1e2433', color: '#e2e8f0' }}
          >
            <option value="">All Types</option>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: '#dc2626', color: '#fff' }}
        >
          Filter
        </button>
        {(search || rarity || item_type) && (
          <a
            href="/arc-items"
            className="text-xs underline"
            style={{ color: '#8b9ab3' }}
          >
            Clear
          </a>
        )}
      </form>

      {/* ── Error state ───────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-lg border px-5 py-4 text-sm"
          style={{ background: 'rgba(220,38,38,0.07)', borderColor: 'rgba(220,38,38,0.3)', color: '#fca5a5' }}
        >
          <strong>MetaForge error:</strong> {error}
        </div>
      )}

      {/* ── Item grid ─────────────────────────────────────────────────────── */}
      {!error && items.length === 0 && (
        <div
          className="rounded-lg border py-16 text-center text-sm"
          style={{ background: '#0f1117', borderColor: '#1e2433', borderStyle: 'dashed', color: '#8b9ab3' }}
        >
          No items match your filters.
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#8b9ab3' }}>
            Showing {((page - 1) * pagination.limit) + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <PaginationLink
              href={buildUrl({ page: page - 1 })}
              label="← Previous"
              disabled={!pagination.hasPrevPage}
            />
            <PaginationLink
              href={buildUrl({ page: page + 1 })}
              label="Next →"
              disabled={!pagination.hasNextPage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
