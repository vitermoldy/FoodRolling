import { BALANCE } from './balance.ts'
import { incomeRate, maxOf, newRestaurantState, UPGRADE_KINDS, type RestaurantState } from './economy.ts'
import { RESTAURANTS, RESTAURANT_IDS, type RestaurantId } from './restaurants.ts'

export const SAVE_KEY = 'foodrolling.save'

export interface SaveData {
  v: 1
  money: number
