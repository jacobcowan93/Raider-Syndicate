import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Deduplicate an array by a key derived from each element.
 *
 * - Returns a new array containing only the first occurrence of each unique key.
 * - In development, logs a warning to the server console if any duplicates were
 *   found, so they surface immediately without breaking the UI.
 *
 * Usage:
 *   const items  = uniqueBy(rawItems,  (i) => i.id)
 *   const offers = uniqueBy(rawOffers, (o) => o.offer_id)
 */
export function uniqueBy<T>(
  arr: T[],
  keyFn: (item: T) => string | number,
  label = 'item',
): T[] {
  const seen  = new Map<string | number, T>()
  const dupes: (string | number)[] = []

  for (const item of arr) {
    const key = keyFn(item)
    if (seen.has(key)) {
      dupes.push(key)
    } else {
      seen.set(key, item)
    }
  }

  if (dupes.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[uniqueBy] ${dupes.length} duplicate ${label} key(s) detected and removed:`,
      dupes,
    )
  }

  return Array.from(seen.values())
}
