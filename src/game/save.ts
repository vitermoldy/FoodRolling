import { BALANCE } from './balance.ts'
import { incomeRate, maxOf, newRestaurantState, UPGRADE_KINDS, type RestaurantState } from './economy.ts'
import { RESTAURANTS, RESTAURANT_IDS, type RestaurantId } from './restaurants.ts'

export const SAVE_KEY = 'foodrolling.save'

export interface SaveData {
  v: 1
  money: number
  totalEarned: number
  current: RestaurantId
  restaurants: Record<RestaurantId, RestaurantState>
  startedAt: number
  savedAt: number
}

export function newSave(now: number): SaveData {
  const restaurants = {} as Record<RestaurantId, RestaurantState>
  RESTAURANTS.forEach((r, i) => { restaurants[r.id] = newRestaurantState(i === 0) })
  return { v: 1, money: 0, totalEarned: 0, current: 'jepang', restaurants, startedAt: now, savedAt: now }
}

function finite(value: unknown, fallback: number, min = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, value) : fallback
}

/** Reads a save written by any earlier session; anything malformed falls back to a fresh value. */
export function parseSave(text: string | null, now: number): SaveData | null {
  if (!text) return null
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Partial<SaveData> & { restaurants?: Record<string, Partial<RestaurantState>> }
  if (data.v !== 1) return null
  const save = newSave(now)
  save.money = finite(data.money, 0)
  save.totalEarned = finite(data.totalEarned, save.money)
  save.startedAt = finite(data.startedAt, now)
  save.savedAt = Math.min(now, finite(data.savedAt, now))
  for (const id of RESTAURANT_IDS) {
    const r = data.restaurants?.[id]
    if (!r || typeof r !== 'object') continue
    const st = save.restaurants[id]
    st.owned = id === 'jepang' ? true : r.owned === true
    for (const kind of UPGRADE_KINDS) {
      const min = kind === 'chefs' ? BALANCE.chefs.start : kind === 'seats' ? BALANCE.seats.start : 1
      st[kind] = Math.min(maxOf(kind), Math.max(min, Math.floor(finite(r[kind], min))))
    }
    st.earned = finite(r.earned, 0)
  }
  // Restaurants open in order: a gap means the save was edited, so close everything after it.
  let open = true
  for (const id of RESTAURANT_IDS) {
    if (!save.restaurants[id].owned) open = false
    else if (!open) save.restaurants[id].owned = false
  }
  if (typeof data.current === 'string' && (RESTAURANT_IDS as string[]).includes(data.current)) save.current = data.current
