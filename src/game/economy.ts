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
  if (kind === 'income') return def.scale * c.income.base * c.income.growth ** (level - 1)
  if (kind === 'speed') return def.scale * c.speed.base * c.speed.growth ** (level - 1)
  if (kind === 'chefs') return def.scale * (c.chefs[level - BALANCE.chefs.start] ?? Infinity)
  return def.scale * c.seats.base * c.seats.growth ** (level - BALANCE.seats.start)
}

export type BuyAmount = 1 | 10 | 'max'

/** How many steps of an upgrade the amount buys and what they cost together. */
export function bulkCost(
  def: RestaurantDef,
  state: RestaurantState,
  kind: UpgradeKind,
  amount: BuyAmount,
  money: number,
): { count: number; cost: number } {
  let level = state[kind]
  let cost = 0
  let count = 0
  const limit = amount === 'max' ? Infinity : amount
  while (count < limit && level < maxOf(kind)) {
    const next = stepCost(def, kind, level)
    // "Max" stops at what you can pay; a fixed amount shows its full price even when it is out of reach.
    if (amount === 'max' && cost + next > money) break
    cost += next
    level += 1
    count += 1
  }
  if (amount === 'max' && count === 0 && level < maxOf(kind)) return { count: 1, cost: stepCost(def, kind, level) }
  return { count, cost }
}

export function incomeMult(level: number): number {
  return BALANCE.income.growth ** (level - 1)
}
export function cookMult(level: number): number {
  return 1 + BALANCE.speed.cook * (level - 1)
}
export function eatMult(level: number): number {
  return 1 + BALANCE.speed.eat * (level - 1)
}
export function beltMult(level: number): number {
  return 1 + BALANCE.speed.belt * (level - 1)
}

export function cookTime(def: RestaurantDef, state: RestaurantState): number {
  return def.cookTime / cookMult(state.speed)
}
export function eatTime(def: RestaurantDef, state: RestaurantState): number {
  return def.eatTime / eatMult(state.speed)
}
export function beltSpeed(def: RestaurantDef, state: RestaurantState): number {
  return def.beltSpeed * beltMult(state.speed)
}

export function isDishUnlocked(index: number, incomeLevel: number): boolean {
  return (BALANCE.dishUnlock[index] ?? Infinity) <= incomeLevel
}

export function unlockedDishIndexes(def: RestaurantDef, state: RestaurantState): number[] {
  return def.dishes.map((_, i) => i).filter((i) => isDishUnlocked(i, state.income))
}

/** The next dish the income upgrade brings to the menu, with the level it needs. */
export function nextDish(def: RestaurantDef, state: RestaurantState): { dish: DishDef; level: number } | null {
  for (let i = 0; i < def.dishes.length; i++) {
    const level = BALANCE.dishUnlock[i]
    if (level > state.income) return { dish: def.dishes[i], level }
  }
  return null
}

export function tierPrice(def: RestaurantDef, tier: number, incomeLevel: number): number {
  return def.scale * (BALANCE.tierPrice[tier - 1] ?? 1) * incomeMult(incomeLevel)
}

export function dishPrice(def: RestaurantDef, dish: DishDef, incomeLevel: number): number {
  return tierPrice(def, dish.tier, incomeLevel)
}

export function averagePrice(def: RestaurantDef, state: RestaurantState): number {
  const open = unlockedDishIndexes(def, state)
  if (open.length === 0) return 0
  return open.reduce((sum, i) => sum + dishPrice(def, def.dishes[i], state.income), 0) / open.length
}

const C = BALANCE.customer
const AVG_WANT = (C.wantMin + C.wantMax) / 2
/** Seconds a seat spends per plate on arriving, leaving and staying empty, spread over the plates eaten. */
export const SEAT_OVERHEAD = (C.arrive + C.leave + (C.respawnMin + C.respawnMax) / 2) / AVG_WANT
