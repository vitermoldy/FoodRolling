import { BALANCE } from './balance.ts'
import type { DishDef, RestaurantDef } from './restaurants.ts'

export type UpgradeKind = 'income' | 'speed' | 'chefs' | 'seats'
export const UPGRADE_KINDS: UpgradeKind[] = ['income', 'speed', 'chefs', 'seats']

export interface RestaurantState {
  owned: boolean
  /** Income level, 1 to BALANCE.income.max. */
  income: number
  /** Speed level, 1 to BALANCE.speed.max. */
  speed: number
  chefs: number
  seats: number
  /** Coins this restaurant has earned since it opened. */
  earned: number
}

export function newRestaurantState(owned: boolean): RestaurantState {
  return { owned, income: 1, speed: 1, chefs: BALANCE.chefs.start, seats: BALANCE.seats.start, earned: 0 }
}

export function levelOf(state: RestaurantState, kind: UpgradeKind): number {
  return state[kind]
}

export function maxOf(kind: UpgradeKind): number {
  if (kind === 'income') return BALANCE.income.max
  if (kind === 'speed') return BALANCE.speed.max
  if (kind === 'chefs') return BALANCE.chefs.max
  return BALANCE.seats.max
}

export function isMaxed(state: RestaurantState, kind: UpgradeKind): boolean {
  return state[kind] >= maxOf(kind)
}

/** Cost to go from `level` to `level + 1` (level counts chefs and seats for those kinds). */
export function stepCost(def: RestaurantDef, kind: UpgradeKind, level: number): number {
  const c = BALANCE.costs
  if (level >= maxOf(kind)) return Infinity
