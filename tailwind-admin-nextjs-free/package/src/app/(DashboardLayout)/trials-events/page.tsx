import { getMfEventsSchedule, getMfQuests, type MfEvent, type MfQuest } from '@/lib/metaforge'
import { uniqueBy } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import EventCountdown from '@/app/components/arc/EventCountdown'
import type { SearchParams } from 'next/dist/server/request/search-params'

export const dynamic = 'force-dynamic'

interface Props { searchParams: Promise<SearchParams> }

export default async function TrialsEventsPage({ searchParams }: Props) {
  const sp = await searchParams
  const tab    = typeof sp.tab    === 'string' ? sp.tab    : 'events'
  const search = typeof sp.search === 'string' ? sp.search : ''
  const trader = typeof sp.trader === 'string' ? sp.trader : ''

  let events: MfEvent[] = []
  let quests: MfQuest[] = []
  let error: string | null = null

  try {
    const [evRes, qRes] = await Promise.allSettled([
      getMfEventsSchedule(),
      getMfQuests({ search: search || undefined, page_size: 100 }),
    ])
    if (evRes.status === 'fulfilled') events = evRes.value
    if (qRes.status === 'fulfilled') quests = uniqueBy(qRes.value, q => q.id, 'quest')
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load data'
  }

  const now = Date.now()
  const liveEvents = events.filter(e => e.startTime <= now && e.endTime > now)
  const upcomingEvents = events.filter(e => e.startTime > now).slice(0, 20)

  // Group quests by trader
  const traders = [...new Set(quests.map(q => q.trader_name).filter(Boolean))] as string[]
  const filteredQuests = trader ? quests.filter(q => q.trader_name === trader) : quests
  const displayedQuests = search
    ? filteredQuests.filter(q => q.name.toLowerCase().includes(search.toLowerCase()))
    : filteredQuests

  const tabHref = (t: string) => `/trials-events?tab=${t}`

  return (
    <div style={{ background: '#0b0d11', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: '#dc2626' }}>Live Data</p>
        <h1 className="text-2xl font-black uppercase tracking-wide text-white mb-1">Trials &amp; Events</h1>
        <p className="text-sm" style={{ color: '#8b9ab3' }}>
          Live map events · Trader missions · Weekly trials
        </p>
      </div>

      {/* Live counter pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
          style={{ background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.3)', color: '#4ade80' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {liveEvents.length} events live now
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
          style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa' }}>
          {quests.length} quests loaded
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'events', label: '📡 Map Events' },
          { id: 'quests', label: '📋 Quests' },
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

      {error && (
        <div className="mb-6 rounded border p-4 text-sm" style={{ borderColor: '#dc2626', background: 'rgba(220,38,38,0.08)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {/* Events Tab */}
      {tab === 'events' && (
        <div className="space-y-8">
          {liveEvents.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-4" style={{ color: '#4ade80' }}>
                🔴 Active Right Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {liveEvents.map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-4 border"
                    style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)' }}>
                    {ev.icon && <Image src={ev.icon} alt={ev.name} width={36} height={36} unoptimized className="rounded" />}
                    <div>
                      <p className="text-sm font-bold text-white">{ev.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>{ev.map}</p>
                      <EventCountdown endTime={ev.endTime} label="Ends in" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-4" style={{ color: '#8b9ab3' }}>
                Up Next
              </h2>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1e2433' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#0f1117', borderBottom: '1px solid #1e2433' }}>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold" style={{ color: '#8b9ab3' }}>Event</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold" style={{ color: '#8b9ab3' }}>Map</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold" style={{ color: '#8b9ab3' }}>Starts</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold" style={{ color: '#8b9ab3' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents.map((ev, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e2433' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {ev.icon && <Image src={ev.icon} alt={ev.name} width={20} height={20} unoptimized className="rounded" />}
                            <span className="text-white font-medium">{ev.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: '#8b9ab3' }}>{ev.map}</td>
                        <td className="px-4 py-3">
                          <EventCountdown endTime={ev.startTime} label="In" />
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>
                          {Math.round((ev.endTime - ev.startTime) / 60000)}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quests Tab */}
      {tab === 'quests' && (
        <div>
          {/* Trader filter + search */}
          <form method="GET" className="flex flex-wrap gap-3 mb-6">
            <input type="hidden" name="tab" value="quests" />
            <input
              name="search" defaultValue={search}
              placeholder="Search quests…"
              className="rounded border px-3 py-1.5 text-sm bg-transparent outline-none"
              style={{ borderColor: '#1e2433', color: '#e2e8f0', minWidth: 220 }}
            />
            {traders.length > 0 && (
              <select name="trader" defaultValue={trader}
                className="rounded border px-3 py-1.5 text-sm bg-[#0f1117] outline-none"
                style={{ borderColor: '#1e2433', color: '#e2e8f0' }}>
                <option value="">All Traders</option>
                {traders.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
            <button type="submit" className="px-5 py-1.5 rounded text-sm font-bold text-white" style={{ background: '#dc2626' }}>
              Filter
            </button>
            {(search || trader) && (
              <Link href="/trials-events?tab=quests" className="px-4 py-1.5 rounded text-sm" style={{ color: '#8b9ab3', border: '1px solid #1e2433' }}>
                Clear
              </Link>
            )}
          </form>

          <p className="text-xs mb-5" style={{ color: '#8b9ab3' }}>
            {displayedQuests.length} quest{displayedQuests.length !== 1 ? 's' : ''}
            {trader ? ` from ${trader}` : ''}{search ? ` matching "${search}"` : ''}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedQuests.slice(0, 60).map(quest => (
              <div key={quest.id} className="rounded-xl border p-4" style={{ background: '#0f1117', borderColor: '#1e2433' }}>
                <div className="flex gap-3">
                  {quest.image && (
                    <Image src={quest.image} alt={quest.name} width={48} height={48} unoptimized
                      className="rounded shrink-0 object-cover" style={{ width: 48, height: 48 }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white">{quest.name}</h3>
                      {quest.trader_name && (
                        <span className="text-[10px] px-2 py-0.5 rounded shrink-0 font-semibold"
                          style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
                          {quest.trader_name}
                        </span>
                      )}
                    </div>
                    {quest.objectives && quest.objectives.length > 0 && (
                      <ul className="text-xs space-y-0.5 mb-2" style={{ color: '#8b9ab3' }}>
                        {quest.objectives.slice(0, 3).map((obj, i) => (
                          <li key={i} className="truncate">· {obj}</li>
                        ))}
                        {quest.objectives.length > 3 && (
                          <li style={{ color: '#4b5563' }}>+{quest.objectives.length - 3} more…</li>
                        )}
                      </ul>
                    )}
                    {quest.rewards && quest.rewards.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {quest.rewards.slice(0, 4).map((r, i) => (
                          <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2433' }}>
                            <Image src={r.item.icon} alt={r.item.name} width={14} height={14} unoptimized />
                            <span className="text-[10px]" style={{ color: '#94a3b8' }}>×{r.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {quest.guide_links && quest.guide_links.length > 0 && (
                      <a href={quest.guide_links[0].url} target="_blank" rel="noopener"
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: '#dc2626' }}>
                        Guide →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-12 text-center text-xs" style={{ color: '#374151' }}>
        Data via <a href="https://metaforge.app/arc-raiders" target="_blank" rel="noopener" className="underline hover:text-gray-400">MetaForge</a>
      </p>
    </div>
  )
}
