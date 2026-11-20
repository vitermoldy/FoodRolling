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
