import { describe, expect, it } from 'vitest'
import { BALANCE } from '@/game/balance'
import { incomeRate, newRestaurantState, platesPerSecond, type RestaurantState } from '@/game/economy'
import { RESTAURANTS } from '@/game/restaurants'
import { BeltSim, CHEF_SPOTS, SEAT_SPOTS, SLOT_COUNT, simConfig } from '@/game/sim'

const jepang = RESTAURANTS[0]

function state(patch: Partial<RestaurantState>): RestaurantState {
  return { ...newRestaurantState(true), ...patch }
}

/** Runs the belt for a warm-up and then measures coins and plates per second. */
function measure(st: RestaurantState, seconds = 1500, seed = 7) {
  const sim = new BeltSim(simConfig(jepang, st), seed)
  sim.step(120)
  sim.events.length = 0
  let coins = 0
  for (let t = 0; t < seconds; t += 0.05) coins += sim.step(0.05)
  const eaten = sim.events.filter((e) => e.type === 'grab').length
  return { coins: coins / seconds, plates: eaten / seconds }
}

describe('belt layout', () => {
  it('has a spot for every seat and chef the shop can sell', () => {
    expect(SEAT_SPOTS.length).toBe(BALANCE.seats.max)
    expect(CHEF_SPOTS.length).toBe(BALANCE.chefs.max)
  })
})

describe('belt simulation', () => {
  it('never loses or duplicates a plate', () => {
    const sim = new BeltSim(simConfig(jepang, state({ chefs: 6, seats: 5, speed: 10 })), 3)
    const seen = new Set<number>()
    for (let t = 0; t < 400; t += 0.1) {
      sim.step(0.1)
      for (const e of sim.events) {
        if (e.type === 'drop') {
          expect(seen.has(e.plateId)).toBe(false)
          seen.add(e.plateId)
        }
      }
      sim.events.length = 0
      expect(sim.plateCount()).toBeLessThanOrEqual(SLOT_COUNT)
    }
  })

  it('pays each customer the plates they ate', () => {
    const sim = new BeltSim(simConfig(jepang, state({ chefs: 3, seats: 4 })), 11)
    let paid = 0
    let reported = 0
    for (let t = 0; t < 300; t += 0.1) {
      paid += sim.step(0.1)
      for (const e of sim.events) if (e.type === 'pay') reported += e.amount
      sim.events.length = 0
    }
    expect(paid).toBeGreaterThan(0)
    expect(reported).toBeCloseTo(paid, 6)
  })

  it('a tap on a chef moves cooking forward', () => {
    const sim = new BeltSim(simConfig(jepang, state({})), 5)
    const before = sim.chefs[0].progress
    expect(sim.help(0)).toBe(true)
    expect(sim.chefs[0].progress).toBeCloseTo(Math.min(1, before + BALANCE.helpProgress), 6)
  })

  it('dragging the belt backwards still delivers plates', () => {
    const sim = new BeltSim(simConfig(jepang, state({ chefs: 4, seats: 8 })), 9)
    sim.holding = true
