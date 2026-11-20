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
      for (let level = start; level < maxOf(kind); level++) {
        const cost = stepCost(jepang, kind, level)
        expect(cost).toBeGreaterThan(last)
        last = cost
      }
      expect(stepCost(jepang, kind, maxOf(kind))).toBe(Infinity)
    }
  })

  it('buying x10 costs the sum of ten single steps', () => {
    const st = newRestaurantState(true)
    let sum = 0
    for (let i = 0; i < 10; i++) sum += stepCost(jepang, 'income', 1 + i)
    expect(bulkCost(jepang, st, 'income', 10, 0)).toEqual({ count: 10, cost: sum })
  })

  it('"Maks" buys what the money covers and stops at the cap', () => {
    const st = newRestaurantState(true)
    const money = stepCost(jepang, 'speed', 1) + stepCost(jepang, 'speed', 2) + 1
    expect(bulkCost(jepang, st, 'speed', 'max', money).count).toBe(2)
    const full = { ...st, chefs: BALANCE.chefs.max }
    expect(isMaxed(full, 'chefs')).toBe(true)
    expect(bulkCost(jepang, full, 'chefs', 'max', 1e30).count).toBe(0)
  })

  it('more chefs only help while the kitchen is the bottleneck', () => {
    const st = { ...newRestaurantState(true), chefs: 1, seats: 16 }
    expect(bottleneck(jepang, st)).toBe('chefs')
    expect(rateAfter(jepang, st, 'chefs')).toBeGreaterThan(incomeRate(jepang, st))
    const full = { ...st, chefs: 6, seats: 4 }
    expect(bottleneck(jepang, full)).toBe('seats')
    expect(rateAfter(jepang, full, 'chefs')).toBeCloseTo(incomeRate(jepang, full), 9)
    expect(rateAfter(jepang, full, 'seats')).toBeGreaterThan(incomeRate(jepang, full))
  })

  it('the income upgrade brings dishes onto the menu at set levels', () => {
    const st = newRestaurantState(true)
    expect(unlockedDishIndexes(jepang, st)).toEqual([0, 1])
    expect(nextDish(jepang, st)?.level).toBe(BALANCE.dishUnlock[2])
    const top = { ...st, income: BALANCE.income.max }
    expect(unlockedDishIndexes(jepang, top)).toEqual([0, 1, 2, 3, 4, 5])
    expect(nextDish(jepang, top)).toBeNull()
  })

  it('a closed restaurant earns nothing', () => {
    expect(incomeRate(RESTAURANTS[1], newRestaurantState(false))).toBe(0)
  })
})

describe('save', () => {
  it('round-trips through JSON', () => {
    const save = newSave(1000)
    save.money = 1234.5
    save.restaurants.jepang.chefs = 3
    save.restaurants.italia.owned = true
    save.current = 'italia'
    const back = parseSave(JSON.stringify(save), 2000)
    expect(back?.money).toBe(1234.5)
    expect(back?.restaurants.jepang.chefs).toBe(3)
    expect(back?.restaurants.italia.owned).toBe(true)
    expect(back?.current).toBe('italia')
  })

  it('rejects garbage and clamps edited values', () => {
    expect(parseSave('not json', 0)).toBeNull()
    expect(parseSave('{"v":2}', 0)).toBeNull()
    const edited = newSave(0) as unknown as Record<string, unknown>
    const rs = edited.restaurants as Record<string, Record<string, unknown>>
    rs.jepang.chefs = 99
    rs.jepang.seats = -5
    rs.jepang.income = 'lots'
    rs.india.owned = true
    edited.money = -50
    const back = parseSave(JSON.stringify(edited), 10)!
    expect(back.restaurants.jepang.chefs).toBe(BALANCE.chefs.max)
    expect(back.restaurants.jepang.seats).toBe(BALANCE.seats.start)
