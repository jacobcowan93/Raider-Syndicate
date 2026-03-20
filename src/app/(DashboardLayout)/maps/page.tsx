import { getMfEventsSchedule, type MfEvent } from '@/lib/metaforge'
import Image from 'next/image'
import EventCountdown from '@/app/components/arc/EventCountdown'

export const dynamic = 'force-dynamic'

const MAP_ACCENT: Record<string, string> = {
  'Buried City':  '#ef4444',
  'Spaceport':    '#3b82f6',
  'Dam':          '#22c55e',
  'Stella Montis':'#a855f7',
  'Blue Gate':    '#f59e0b',
}

export default async function MapsPage() {
  let events: MfEvent[] = []
  let error: string | null = null

  try {
    events = await getMfEventsSchedule()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load events'
  }

  const now = Date.now()

  // Group by map
  const byMap = events.reduce<Record<string, MfEvent[]>>((acc, ev) => {
    if (!acc[ev.map]) acc[ev.map] = []
    acc[ev.map].push(ev)
    return acc
  }, {})

  // Sort each map's events chronologically
  Object.values(byMap).forEach(evs => evs.sort((a, b) => a.startTime - b.startTime))

  const maps = Object.keys(byMap).sort()

  return (
    <div style={{ background: '#0b0d11', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: '#dc2626' }}>Live Schedule</p>
        <h1 className="text-2xl font-black uppercase tracking-wide text-white mb-1">Maps & Events</h1>
        <p className="text-sm" style={{ color: '#8b9ab3' }}>
          Real-time event schedule per map.{' '}
          <span className="text-white font-semibold">{events.length} slots loaded.</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded border p-4 text-sm" style={{ borderColor: '#dc2626', background: 'rgba(220,38,38,0.08)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {events.length === 0 && !error ? (
        <div className="text-center py-24 text-sm" style={{ color: '#8b9ab3' }}>No event data available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {maps.map(mapName => {
            const mapEvents = byMap[mapName]
            const accent = MAP_ACCENT[mapName] ?? '#dc2626'
            const liveEvents = mapEvents.filter(e => e.startTime <= now && e.endTime > now)
            const upcomingEvents = mapEvents.filter(e => e.startTime > now).slice(0, 4)

            return (
              <div key={mapName}
                className="rounded-xl overflow-hidden border"
                style={{ background: '#0f1117', borderColor: '#1e2433' }}>

                {/* Map header */}
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${accent}30`, background: `${accent}0a` }}>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-wide text-white">{mapName}</h2>
                    <p className="text-xs mt-0.5" style={{ color: accent }}>
                      {liveEvents.length > 0 ? `${liveEvents.length} event${liveEvents.length > 1 ? 's' : ''} active` : 'No active events'}
                    </p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full"
                    style={{ background: liveEvents.length > 0 ? '#4ade80' : '#374151', boxShadow: liveEvents.length > 0 ? '0 0 8px #4ade80' : 'none' }} />
                </div>

                {/* Live events */}
                {liveEvents.length > 0 && (
                  <div className="px-5 pt-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: '#4ade80' }}>🔴 Live Now</p>
                    {liveEvents.map((ev, i) => (
                      <div key={i} className="flex items-center gap-3 mb-2.5">
                        {ev.icon && (
                          <Image src={ev.icon} alt={ev.name} width={28} height={28} unoptimized className="rounded shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{ev.name}</p>
                          <EventCountdown endTime={ev.endTime} label="Ends in" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upcoming events */}
                {upcomingEvents.length > 0 && (
                  <div className="px-5 pt-3 pb-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: '#8b9ab3' }}>Up Next</p>
                    {upcomingEvents.map((ev, i) => (
                      <div key={i} className="flex items-center gap-3 mb-2">
                        {ev.icon && (
                          <Image src={ev.icon} alt={ev.name} width={22} height={22} unoptimized className="rounded shrink-0 opacity-70" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{ev.name}</p>
                          <EventCountdown endTime={ev.endTime} label="Starts" />
                        </div>
                        <span className="text-[10px] shrink-0" style={{ color: '#4b5563' }}>
                          {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-12 text-center text-xs" style={{ color: '#374151' }}>
        Schedule via <a href="https://metaforge.app/arc-raiders" target="_blank" rel="noopener" className="underline hover:text-gray-400">MetaForge</a> · Refreshes every 60 seconds.
      </p>
    </div>
  )
}
