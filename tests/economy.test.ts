import { describe, expect, it } from 'vitest'
import { BALANCE } from '@/game/balance'
import {
  bottleneck,
  bulkCost,
  incomeRate,
  isMaxed,
  maxOf,
  newRestaurantState,
  nextDish,
  rateAfter,
  stepCost,
  unlockedDishIndexes,
  UPGRADE_KINDS,
} from '@/game/economy'
import { RESTAURANTS } from '@/game/restaurants'
import { newSave, offlineEarnings, parseSave, totalRate } from '@/game/save'
import { formatCoins, formatDuration } from '@/lib/format'

const jepang = RESTAURANTS[0]

describe('restaurants', () => {
  it('six restaurants, each pricier than the last, the first one free', () => {
    expect(RESTAURANTS.map((r) => r.id)).toEqual(['jepang', 'italia', 'indonesia', 'meksiko', 'india', 'prancis'])
    expect(RESTAURANTS[0].unlockCost).toBe(0)
    for (let i = 1; i < RESTAURANTS.length; i++) {
      expect(RESTAURANTS[i].unlockCost).toBeGreaterThan(RESTAURANTS[i - 1].unlockCost)
      expect(RESTAURANTS[i].scale).toBeGreaterThan(RESTAURANTS[i - 1].scale)
    }
  })

  it('every restaurant has six dishes on plate colours 1 to 5, cheapest first', () => {
    for (const r of RESTAURANTS) {
      expect(r.dishes).toHaveLength(6)
      const tiers = r.dishes.map((d) => d.tier)
      expect([...tiers].sort()).toEqual(tiers)
      expect(new Set(tiers)).toEqual(new Set([1, 2, 3, 4, 5]))
    }
  })
})

describe('upgrades', () => {
  it('every step costs more than the one before', () => {
    for (const kind of UPGRADE_KINDS) {
      const start = kind === 'chefs' ? BALANCE.chefs.start : kind === 'seats' ? BALANCE.seats.start : 1
      let last = 0
