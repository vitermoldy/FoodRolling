import { BALANCE } from './balance.ts'
import type { DishDef, RestaurantDef } from './restaurants.ts'

export type UpgradeKind = 'income' | 'speed' | 'chefs' | 'seats'
export const UPGRADE_KINDS: UpgradeKind[] = ['income', 'speed', 'chefs', 'seats']

