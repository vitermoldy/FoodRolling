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

function readStorage(): string | null {
  try {
    return localStorage.getItem(SAVE_KEY)
  } catch {
    return null
  }
}

function boot(now: number): SaveData & Pick<UiState, 'offline'> {
  const loaded = parseSave(readStorage(), now)
  if (!loaded) return { ...newSave(now), offline: null }
  const away = offlineEarnings(loaded, now)
  loaded.money += away.coins
  loaded.totalEarned += away.coins
  // Short absences are not worth a dialog; the coins are still added.
  return { ...loaded, offline: away.seconds >= 60 && away.coins > 0 ? away : null }
}

let lastTick = Date.now()
let noticeId = 1

export function snapshot(s: SaveData): SaveData {
  return {
    v: 1,
    money: s.money,
    totalEarned: s.totalEarned,
    current: s.current,
    restaurants: s.restaurants,
    startedAt: s.startedAt,
    savedAt: Date.now(),
  }
}

/** The next restaurant that can be bought, if any. */
export function nextLocked(s: Pick<SaveData, 'restaurants'>): RestaurantId | null {
  const def = RESTAURANTS.find((r) => !s.restaurants[r.id].owned)
  return def ? def.id : null
}

export function canUnlock(s: Pick<SaveData, 'restaurants' | 'money'>, id: RestaurantId): boolean {
  return nextLocked(s) === id && s.money >= restaurantById(id).unlockCost
}

export const useGame = create<GameState>()((set, get) => ({
  ...boot(Date.now()),
  buyAmount: 1,
  paused: false,
  tab: 'upgrade',
  liveId: null,
  liveAt: 0,
  notice: null,
  announced: [],
  saveError: false,

  buy(kind) {
    const s = get()
    const id = s.current
    const def = restaurantById(id)
    const st = s.restaurants[id]
    if (!st.owned) return
    const { count, cost } = bulkCost(def, st, kind, s.buyAmount, s.money)
    if (count <= 0 || cost > s.money) return
    set({
      money: s.money - cost,
      restaurants: { ...s.restaurants, [id]: { ...st, [kind]: st[kind] + count } },
    })
  },

  unlock(id) {
    const s = get()
    if (!canUnlock(s, id)) return
    const def = restaurantById(id)
    set({
      money: s.money - def.unlockCost,
      restaurants: { ...s.restaurants, [id]: { ...s.restaurants[id], owned: true } },
      current: id,
      tab: 'upgrade',
      notice: { id: noticeId++, text: `${def.name} sudah buka. Restoran sebelumnya tetap berjalan.` },
    })
    get().save()
  },

  select(id) {
    if (get().current === id) return
    set({ current: id })
  },

  earn(id, amount) {
    if (!(amount > 0)) return
    const s = get()
    const st = s.restaurants[id]
    set({
      money: s.money + amount,
      totalEarned: s.totalEarned + amount,
      restaurants: { ...s.restaurants, [id]: { ...st, earned: st.earned + amount } },
    })
  },

  tick(now) {
    const dt = Math.max(0, (now - lastTick) / 1000)
    lastTick = now
    const s = get()
    let gained = 0
    let restaurants = s.restaurants
    for (const def of RESTAURANTS) {
      const st = restaurants[def.id]
      if (!st.owned) continue
      // The restaurant on screen earns through its belt; every other one earns by the formula.
      const live = s.liveId === def.id && now - s.liveAt < 1500
      if (live) continue
      const coins = incomeRate(def, st) * dt
      if (coins <= 0) continue
      gained += coins
      restaurants = { ...restaurants, [def.id]: { ...st, earned: st.earned + coins } }
    }
    const patch: Partial<GameState> = {}
    if (gained > 0) {
      patch.money = s.money + gained
      patch.totalEarned = s.totalEarned + gained
      patch.restaurants = restaurants
    }
    const money = patch.money ?? s.money
    const next = nextLocked(s)
    if (next && !s.announced.includes(next) && money >= restaurantById(next).unlockCost) {
      patch.announced = [...s.announced, next]
      patch.notice = { id: noticeId++, text: `Uangmu cukup untuk membuka ${restaurantById(next).name}.`, goTo: next }
    }
    if (Object.keys(patch).length) set(patch)
  },

  markLive(id, now) {
    set({ liveId: id, liveAt: now })
  },

  setBuyAmount(buyAmount) {
    set({ buyAmount })
  },
  setPaused(paused) {
    set({ paused })
  },
  setTab(tab) {
    set({ tab })
  },
  dismissOffline() {
    set({ offline: null })
  },
  dismissNotice() {
    set({ notice: null })
  },

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot(get())))
