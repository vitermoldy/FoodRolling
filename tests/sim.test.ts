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
