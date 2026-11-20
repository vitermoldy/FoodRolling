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
