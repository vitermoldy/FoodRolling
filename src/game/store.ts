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
  liveId: RestaurantId | null
  liveAt: number
  offline: { seconds: number; coins: number } | null
  notice: Notice | null
  /** Restaurants we already told the player they can afford. */
  announced: RestaurantId[]
  saveError: boolean
}

interface Actions {
  buy: (kind: UpgradeKind) => void
  unlock: (id: RestaurantId) => void
  select: (id: RestaurantId) => void
  earn: (id: RestaurantId, amount: number) => void
  tick: (now: number) => void
  markLive: (id: RestaurantId | null, now: number) => void
  setBuyAmount: (amount: BuyAmount) => void
  setPaused: (paused: boolean) => void
  setTab: (tab: PanelTab) => void
  dismissOffline: () => void
  dismissNotice: () => void
  save: () => boolean
  reset: () => void
}

export type GameState = SaveData & UiState & Actions

