/**
 * Blueprint drop locations.
 * Keys match blueprint names from BlueprintTracker.
 * Populate with real data as it is discovered in-game.
 */

export interface BlueprintDrop {
  map: string
  condition: string
  containers: string
  scavengable: boolean
  trialsReward?: string
  questReward?: string
  location?: string
}

const DROPS: Record<string, BlueprintDrop> = {
  'Blaze Grenade':           { map: 'Any', condition: 'Any', containers: 'Military Crates', scavengable: false },
  'Smoke Grenade':           { map: 'Any', condition: 'Any', containers: 'Military Crates', scavengable: true },
  'Seeker Grenade':          { map: 'Any', condition: 'Any', containers: 'Military Crates', scavengable: false },
  'Gas Mine':                { map: 'Any', condition: 'Any', containers: 'Military Crates', scavengable: false },
  'Jolt Mine':               { map: 'Any', condition: 'Any', containers: 'High-Tier Crates', scavengable: false },
  'Deadline':                { map: 'Any', condition: 'Any', containers: 'High-Tier Crates', scavengable: false },
  'Explosive Mine':          { map: 'Any', condition: 'Any', containers: 'Military Crates', scavengable: false },
  'Vita Shot':               { map: 'Any', condition: 'Any', containers: 'Medical Crates', scavengable: true },
  'Vita Spray':              { map: 'Any', condition: 'Any', containers: 'Medical Crates', scavengable: true },
  'Defibrillator':           { map: 'Any', condition: 'Any', containers: 'Medical Crates', scavengable: false },
  'Barricade Kit':           { map: 'Any', condition: 'Any', containers: 'Equipment Crates', scavengable: true },
  'Snap Hook':               { map: 'Any', condition: 'Any', containers: 'Equipment Crates', scavengable: false },
}

export function getDropForBlueprint(name: string): BlueprintDrop | null {
  return DROPS[name] ?? null
}
