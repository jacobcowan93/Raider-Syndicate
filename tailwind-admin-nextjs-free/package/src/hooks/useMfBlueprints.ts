'use client'

import { useState, useEffect } from 'react'
import { MF_BASE_URL } from '@/lib/metaforge'
import type { MfItem } from '@/lib/metaforge'

/**
 * Fetches MetaForge item metadata for a list of blueprint IDs.
 * Returns a Map<id, MfItem> for icon, rarity, description, workbench enrichment.
 */
export function useMfBlueprints(ids: string[]): { blueprintMeta: Map<string, MfItem>; loading: boolean } {
  const [blueprintMeta, setBlueprintMeta] = useState<Map<string, MfItem>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Fetch a large page to cover all blueprint items
        const res = await fetch(`${MF_BASE_URL}/items?page_size=500`, {
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) return
        const json = await res.json()
        const items: MfItem[] = json.data ?? []
        const idSet = new Set(ids)
        const map = new Map<string, MfItem>()
        for (const item of items) {
          if (idSet.has(item.id)) map.set(item.id, item)
        }
        if (!cancelled) setBlueprintMeta(map)
      } catch {
        // Fail silently — cards still render without enrichment
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  return { blueprintMeta, loading }
}
