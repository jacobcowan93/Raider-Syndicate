import { getMfItemsPaged, getMfArcs } from '@/lib/metaforge'
import { uniqueBy } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { SearchParams } from 'next/dist/server/request/search-params'

export const dynamic = 'force-dynamic'

const RARITY_STYLE: Record<string, { border: string; text: string; bg: string }> = {
  Common:    { border: '#6b7280', text: '#9ca3af', bg: 'rgba(107,114,128,0.1)' },
  Uncommon:  { border: '#22c55e', text: '#4ade80', bg: 'rgba(34,197,94,0.1)'  },
  Rare:      { border: '#3b82f6', text: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
  Epic:      { border: '#a855f7', text: '#c084fc', bg: 'rgba(168,85,247,0.1)' },
  Legendary: { border: '#f59e0b', text: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
}
const rs = (r: string) =>
  RARITY_STYLE[r] ?? { border: '#6b7280', text: '#9ca3af', bg: 'rgba(107,114,128,0.1)' }

interface Props { searchParams: Promise<SearchParams> }

export default async function SkillTreesPage({ searchParams }: Props) {
  const sp = await searchParams
  const tab    = typeof sp.tab    === 'string' ? sp.tab    : 'augments'
  const search = typeof sp.search === 'string' ? sp.search : ''
  const rarity = typeof sp.rarity === 'string' ? sp.rarity : ''

  let augments: Awaited<ReturnType<typeof getMfItemsPaged>>['items'] = []
  let arcUnits: Awaited<ReturnType<typeof getMfArcs>> = []
  let error: string | null = null

  try {
    if (tab === 'augments') {
      const res = await getMfItemsPaged({ search, rarity, item_type: 'Augment', page_size: 100 })
      augments = uniqueBy(res.items, i => i.id, 'augment')
    } else {
      arcUnits = uniqueBy(await getMfArcs(), a => a.id, 'arc unit')
      if (search) {
        arcUnits = arcUnits.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load data'
  }

  const tabHref = (t: string) => {
    const p = new URLSearchParams({ tab: t })
    if (search) p.set('search', search)
    return `/skill-trees?${p}`
  }

  return (
    <div style={{ background: '#0b0d11', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: '#dc2626' }}>Build Planner</p>
        <h1 className="text-2xl font-black uppercase tracking-wide text-white mb-1">Skill Trees</h1>
        <p className="text-sm" style={{ color: '#8b9ab3' }}>
          Browse augments to plan your loadout — or study the ARC enemy roster to counter them.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'augments', label: '⚡ Augments' },
          { id: 'arcs', label: '🤖 ARC Roster' },
        ].map(t => (
          <Link key={t.id} href={tabHref(t.id)}
            className="px-4 py-2 rounded text-sm font-bold border transition-all"
            style={tab === t.id ? {
              background: 'rgba(220,38,38,0.18)',
              borderColor: 'rgba(220,38,38,0.5)',
              color: '#fff',
            } : {
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#94a3b8',
            }}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-8">
        <input type="hidden" name="tab" value={tab} />
        <input
          name="search" defaultValue={search}
          placeholder={tab === 'augments' ? 'Search augments…' : 'Search ARC units…'}
          className="rounded border px-3 py-1.5 text-sm bg-transparent outline-none"
          style={{ borderColor: '#1e2433', color: '#e2e8f0', minWidth: 220 }}
        />
        {tab === 'augments' && (
          <select name="rarity" defaultValue={rarity}
            className="rounded border px-3 py-1.5 text-sm bg-[#0f1117] outline-none"
            style={{ borderColor: '#1e2433', color: '#e2e8f0' }}>
            <option value="">All Rarities</option>
            {['Common','Uncommon','Rare','Epic','Legendary'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
        <button type="submit" className="px-5 py-1.5 rounded text-sm font-bold text-white" style={{ background: '#dc2626' }}>
          Filter
        </button>
        {(search || rarity) && (
          <Link href={tabHref(tab)} className="px-4 py-1.5 rounded text-sm" style={{ color: '#8b9ab3', border: '1px solid #1e2433' }}>
            Clear
          </Link>
        )}
      </form>

      {error && (
        <div className="mb-6 rounded border p-4 text-sm" style={{ borderColor: '#dc2626', background: 'rgba(220,38,38,0.08)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {/* Augments Grid */}
      {tab === 'augments' && (
        augments.length === 0 && !error ? (
          <div className="text-center py-24 text-sm" style={{ color: '#8b9ab3' }}>
            No augments found{search ? ' for your search' : ''}. Try a different filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {augments.map(item => {
              const style = rs(item.rarity)
              return (
                <div key={item.id}
                  className="flex gap-3 rounded-lg p-4 border"
                  style={{ background: '#0f1117', borderColor: '#1e2433' }}>
                  <div className="shrink-0 w-12 h-12 rounded flex items-center justify-center"
                    style={{ background: style.bg, border: `1px solid ${style.border}40` }}>
                    {item.icon ? (
                      <Image src={item.icon} alt={item.name} width={36} height={36} unoptimized className="object-contain" />
                    ) : <span className="text-lg">⚡</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-sm font-bold text-white truncate">{item.name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                        style={{ color: style.text, background: style.bg }}>
                        {item.rarity}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#8b9ab3' }}>
                        {item.description}
                      </p>
                    )}
                    {item.loadout_slots?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {(item.loadout_slots as string[]).map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ARC Roster */}
      {tab === 'arcs' && (
        arcUnits.length === 0 && !error ? (
          <div className="text-center py-24 text-sm" style={{ color: '#8b9ab3' }}>No ARC units found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arcUnits.map(arc => (
              <div key={arc.id}
                className="flex gap-4 rounded-xl p-5 border"
                style={{ background: '#0f1117', borderColor: '#1e2433' }}>
                {arc.icon ? (
                  <Image src={arc.icon} alt={arc.name} width={56} height={56} unoptimized
                    className="rounded-lg shrink-0 object-cover" style={{ width: 56, height: 56 }} />
                ) : (
                  <div className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
                    <span className="text-2xl">🤖</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black uppercase tracking-wide text-white mb-1">{arc.name}</h3>
                  {arc.description && (
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#8b9ab3' }}>
                      {arc.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <p className="mt-12 text-center text-xs" style={{ color: '#374151' }}>
        Data via <a href="https://metaforge.app/arc-raiders" target="_blank" rel="noopener" className="underline hover:text-gray-400">MetaForge</a>
      </p>
    </div>
  )
}
