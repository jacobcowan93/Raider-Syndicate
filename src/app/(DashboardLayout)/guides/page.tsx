import { getMfQuests } from '@/lib/metaforge'
import type { SearchParams } from 'next/dist/server/request/search-params'

export const dynamic = 'force-dynamic'

interface GuideLink {
  url: string
  label: string
  questName?: string
  trader?: string
}

const CURATED: { category: string; links: GuideLink[] }[] = [
  {
    category: 'Getting Started',
    links: [
      { url: 'https://metaforge.app/arc-raiders/arc-raiders-101-a-no-nonsense-arc-raider-beginner-guide', label: 'ARC Raiders 101 – Beginner Guide' },
      { url: 'https://metaforge.app/arc-raiders/how-to-find-every-blueprint-in-arc-raiders', label: 'How to Find Every Blueprint' },
      { url: 'https://metaforge.app/arc-raiders/database/items', label: 'Full Item Database' },
    ],
  },
  {
    category: 'Maps & Events',
    links: [
      { url: 'https://metaforge.app/arc-raiders', label: 'MetaForge Interactive Maps' },
    ],
  },
  {
    category: 'ARC Units',
    links: [
      { url: 'https://metaforge.app/arc-raiders/database/arcs', label: 'ARC Enemy Database' },
    ],
  },
]

interface Props { searchParams: Promise<SearchParams> }

export default async function GuidesPage({ searchParams }: Props) {
  const sp = await searchParams
  const search = typeof sp.search === 'string' ? sp.search.toLowerCase() : ''

  let questGuides: GuideLink[] = []
  let error: string | null = null

  try {
    const quests = await getMfQuests({ page_size: 200 })
    const seen = new Set<string>()
    for (const q of quests) {
      for (const gl of q.guide_links ?? []) {
        if (!seen.has(gl.url)) {
          seen.add(gl.url)
          questGuides.push({ url: gl.url, label: gl.label, questName: q.name, trader: q.trader_name ?? undefined })
        }
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load guides'
  }

  const filteredQuest = search
    ? questGuides.filter(g => g.label.toLowerCase().includes(search) || g.questName?.toLowerCase().includes(search))
    : questGuides

  return (
    <div style={{ background: '#0b0d11', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: '#dc2626' }}>Community Knowledge</p>
        <h1 className="text-2xl font-black uppercase tracking-wide text-white mb-1">Guides</h1>
        <p className="text-sm" style={{ color: '#8b9ab3' }}>
          Curated MetaForge guides + per-quest walkthroughs.{' '}
          <span className="text-white font-semibold">{questGuides.length} quest guides found.</span>
        </p>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3 mb-8">
        <input
          name="search" defaultValue={search}
          placeholder="Search guides…"
          className="rounded border px-3 py-1.5 text-sm bg-transparent outline-none"
          style={{ borderColor: '#1e2433', color: '#e2e8f0', minWidth: 260 }}
        />
        <button type="submit" className="px-5 py-1.5 rounded text-sm font-bold text-white" style={{ background: '#dc2626' }}>
          Search
        </button>
        {search && (
          <a href="/guides" className="px-4 py-1.5 rounded text-sm" style={{ color: '#8b9ab3', border: '1px solid #1e2433' }}>
            Clear
          </a>
        )}
      </form>

      {error && (
        <div className="mb-6 rounded border p-4 text-sm" style={{ borderColor: '#dc2626', background: 'rgba(220,38,38,0.08)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {/* Curated sections */}
      {!search && (
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-5" style={{ color: '#dc2626' }}>
            Official MetaForge Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CURATED.map(cat => (
              <div key={cat.category} className="rounded-xl border p-5" style={{ background: '#0f1117', borderColor: '#1e2433' }}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8b9ab3' }}>{cat.category}</h3>
                <ul className="space-y-3">
                  {cat.links.map(link => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noopener"
                        className="group flex items-start gap-2 text-sm font-medium hover:text-white transition-colors"
                        style={{ color: '#cbd5e1' }}>
                        <span className="mt-0.5 shrink-0 text-xs" style={{ color: '#dc2626' }}>→</span>
                        <span className="group-hover:underline">{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quest guides */}
      {filteredQuest.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-5" style={{ color: '#8b9ab3' }}>
            {search ? `Quest Guides matching "${search}"` : 'Quest Guides'}{' '}
            <span className="text-white">({filteredQuest.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredQuest.map((guide, i) => (
              <a key={i} href={guide.url} target="_blank" rel="noopener"
                className="group flex flex-col gap-2 rounded-lg border p-4 transition-all duration-200 hover:border-red-600/40"
                style={{ background: '#0f1117', borderColor: '#1e2433' }}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                    {guide.label}
                  </span>
                  <span className="text-[10px] shrink-0 mt-0.5" style={{ color: '#dc2626' }}>↗</span>
                </div>
                {guide.questName && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold"
                      style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
                      Quest
                    </span>
                    <span className="text-[11px] truncate" style={{ color: '#6b7280' }}>{guide.questName}</span>
                    {guide.trader && (
                      <span className="text-[10px]" style={{ color: '#4b5563' }}>· {guide.trader}</span>
                    )}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {filteredQuest.length === 0 && search && !error && (
        <div className="text-center py-16 text-sm" style={{ color: '#8b9ab3' }}>
          No guides found for &quot;{search}&quot;.
        </div>
      )}

      <p className="mt-12 text-center text-xs" style={{ color: '#374151' }}>
        Guides via <a href="https://metaforge.app/arc-raiders" target="_blank" rel="noopener" className="underline hover:text-gray-400">MetaForge</a> · Community-maintained.
      </p>
    </div>
  )
}
