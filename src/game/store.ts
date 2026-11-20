import { create } from 'zustand'
import { bulkCost, incomeRate, type BuyAmount, type UpgradeKind } from './economy.ts'
import { RESTAURANTS, restaurantById, restaurantIndex, type RestaurantId } from './restaurants.ts'
import { newSave, offlineEarnings, parseSave, SAVE_KEY, type SaveData } from './save.ts'

export type PanelTab = 'upgrade' | 'menu'

export interface Notice {
  id: number
  text: string
  /** Restaurant to show when the notice's button is pressed. */
  goTo?: RestaurantId
}

interface UiState {
  buyAmount: BuyAmount
  paused: boolean
  tab: PanelTab
  /** Restaurant whose belt is being simulated on screen, and when it last drew a frame. */
