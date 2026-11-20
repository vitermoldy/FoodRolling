import { BALANCE, BELT } from './balance.ts'
import {
  beltSpeed,
  cookTime,
  dishPrice,
  eatTime,
  unlockedDishIndexes,
  type RestaurantState,
} from './economy.ts'
import type { RestaurantDef } from './restaurants.ts'
import { makeRng } from './rng.ts'

// The belt is a stadium loop measured in plate diameters. Arc position u runs along the front
// straight first (right to left), round the left curve, back along the rear straight and round the
// right curve, the same parametrisation as the sushi conveyor component in Prompt.txt.
export const STRAIGHT = BELT.straight
export const RADIUS = BELT.radius
export const BELT_LENGTH = 2 * STRAIGHT + 2 * Math.PI * RADIUS
export const SLOT_COUNT = BELT.slots
export const PITCH = BELT_LENGTH / SLOT_COUNT

const frontU = (x: number) => STRAIGHT / 2 - x
const backU = (x: number) => STRAIGHT + Math.PI * RADIUS + (x + STRAIGHT / 2)
const leftU = (f: number) => STRAIGHT + RADIUS * f
const rightU = (f: number) => 2 * STRAIGHT + Math.PI * RADIUS + RADIUS * f

/** Seat positions in the order they are bought: centre of both straights first, the curves last. */
export const SEAT_SPOTS: number[] = [
  frontU(0.7), frontU(-0.7), backU(-0.7), backU(0.7),
  frontU(2.1), backU(-2.1), frontU(-2.1), backU(2.1),
  frontU(3.5), backU(-3.5), frontU(-3.5), backU(3.5),
  leftU(Math.PI / 3), rightU(Math.PI / 3), leftU((2 * Math.PI) / 3), rightU((2 * Math.PI) / 3),
]

export type Facing = 'front' | 'back'

/** Chefs stand in one row on the island, alternately facing the front and the rear lane. */
export const CHEF_SPOTS: { p: number; facing: Facing; u: number }[] = [
  { p: -0.7, facing: 'front', u: frontU(-0.7) },
  { p: 0.7, facing: 'back', u: backU(0.7) },
  { p: 2.1, facing: 'front', u: frontU(2.1) },
  { p: -2.1, facing: 'back', u: backU(-2.1) },
  { p: -3.5, facing: 'front', u: frontU(-3.5) },
  { p: 3.5, facing: 'back', u: backU(3.5) },
]

export function wrap(u: number): number {
  return ((u % BELT_LENGTH) + BELT_LENGTH) % BELT_LENGTH
}

/** Signed shortest distance from b to a along the loop. */
export function loopDelta(a: number, b: number): number {
  let d = wrap(a - b)
  if (d > BELT_LENGTH / 2) d -= BELT_LENGTH
  return d
}

export interface Plate {
  /** Unique id so the renderer can follow one plate from station to belt to counter. */
  id: number
  dish: number
}

export type ChefState = 'cooking' | 'ready'

export interface Chef {
  state: ChefState
  progress: number
  dish: number
  plateId: number
  /** Seconds since the last tap, for the renderer's sparkle. */
  helped: number
}

export type SeatState = 'empty' | 'arriving' | 'waiting' | 'eating' | 'leaving'

export interface Seat {
  state: SeatState
  timer: number
  /** Seed for the customer's look; changes with every new customer. */
  look: number
  want: number
  eaten: number
  bill: number
  /** Plate colours stacked in front of the customer. */
  stack: number[]
  /** The plate being eaten (dish index), or -1. */
  dish: number
  plateId: number
  /** Seconds this customer has waited for food. */
  waited: number
}

export type SimEvent =
  | { type: 'drop'; chef: number; slot: number; plateId: number }
  | { type: 'grab'; seat: number; slot: number; plateId: number }
  | { type: 'pay'; seat: number; amount: number }

export interface SimConfig {
  cookTime: number
  eatTime: number
  beltSpeed: number
  chefs: number
  seats: number
  dishes: number[]
  prices: number[]
  tiers: number[]
}

export function simConfig(def: RestaurantDef, state: RestaurantState): SimConfig {
  return {
    cookTime: cookTime(def, state),
    eatTime: eatTime(def, state),
    beltSpeed: beltSpeed(def, state),
    chefs: state.chefs,
    seats: state.seats,
    dishes: unlockedDishIndexes(def, state),
    prices: def.dishes.map((dish) => dishPrice(def, dish, state.income)),
    tiers: def.dishes.map((dish) => dish.tier),
  }
}

const C = BALANCE.customer

export class BeltSim {
  offset = 0
  velocity = 0
  /** True while the player holds the belt; cruise speed is suspended. */
  holding = false
  slots: (Plate | null)[] = Array.from({ length: SLOT_COUNT }, () => null)
  chefs: Chef[] = []
  seats: Seat[] = []
  events: SimEvent[] = []
  config: SimConfig
  private rng: () => number
  private nextPlate = 1

  constructor(config: SimConfig, seed = 1) {
    this.config = config
    this.rng = makeRng(seed)
    this.velocity = config.beltSpeed
    this.configure(config)
    // Open with a few customers already seated and chefs part-way through a dish.
    for (const chef of this.chefs) chef.progress = this.rng() * 0.6
    this.seats.forEach((seat, i) => {
      if (i % 2 === 0) { seat.state = 'waiting'; seat.timer = 0 }
      else seat.timer = 0.3 + this.rng() * 1.5
    })
  }

  configure(config: SimConfig) {
    this.config = config
    while (this.chefs.length < config.chefs) this.chefs.push(this.newChef())
    this.chefs.length = Math.min(this.chefs.length, config.chefs)
    while (this.seats.length < config.seats) this.seats.push(this.newSeat())
    this.seats.length = Math.min(this.seats.length, config.seats)
  }

  slotPosition(i: number): number {
    return wrap(this.offset - i * PITCH)
  }

  nearestSlot(u: number): number {
    const i = Math.round((this.offset - u) / PITCH)
    return ((i % SLOT_COUNT) + SLOT_COUNT) % SLOT_COUNT
  }

  /** Moves the belt by hand (the player dragging it). */
  drag(du: number) {
    this.offset += du
  }

  /** A tap on a chef: a push of cooking progress. */
  help(index: number): boolean {
    const chef = this.chefs[index]
    if (!chef || chef.state !== 'cooking') return false
    chef.progress = Math.min(1, chef.progress + BALANCE.helpProgress)
    chef.helped = 0
    return true
  }

  /** Advances the simulation and returns the coins customers paid during it. */
  step(dt: number): number {
    let earned = 0
    const steps = Math.max(1, Math.ceil(dt / (1 / 60)))
    const h = dt / steps
    for (let s = 0; s < steps; s++) earned += this.substep(h)
    return earned
  }

  plateCount(): number {
    return this.slots.reduce((n, plate) => n + (plate ? 1 : 0), 0)
  }

  private substep(h: number): number {
    const cfg = this.config
    let earned = 0

    if (this.holding) this.velocity = 0
    else {
      // Ease back to cruise after a flick, quickly when far off.
      const k = 1 - Math.exp(-2.6 * h)
      this.velocity += (cfg.beltSpeed - this.velocity) * k
    }
    this.offset = wrap(this.offset + this.velocity * h)

    for (let i = 0; i < this.chefs.length; i++) {
      const chef = this.chefs[i]
      chef.helped += h
      if (chef.state === 'cooking') {
        chef.progress += h / cfg.cookTime
        if (chef.progress >= 1) { chef.progress = 1; chef.state = 'ready' }
      }
      if (chef.state === 'ready') {
        const slot = this.nearestSlot(CHEF_SPOTS[i].u)
        if (!this.slots[slot]) {
          this.slots[slot] = { id: chef.plateId, dish: chef.dish }
          this.events.push({ type: 'drop', chef: i, slot, plateId: chef.plateId })
          this.startDish(chef)
        }
      }
    }

    for (let i = 0; i < this.seats.length; i++) {
      const seat = this.seats[i]
      switch (seat.state) {
        case 'empty':
          seat.timer -= h
          if (seat.timer <= 0) {
            seat.state = 'arriving'
            seat.timer = C.arrive
            seat.look = Math.floor(this.rng() * 1e9)
            seat.want = C.wantMin + Math.floor(this.rng() * (C.wantMax - C.wantMin + 1))
            seat.eaten = 0
            seat.bill = 0
            seat.stack = []
            seat.waited = 0
          }
          break
        case 'arriving':
          seat.timer -= h
          if (seat.timer <= 0) { seat.state = 'waiting'; seat.waited = 0 }
          break
        case 'waiting': {
          seat.waited += h
          const slot = this.nearestSlot(SEAT_SPOTS[i])
          const plate = this.slots[slot]
          if (plate) {
            this.slots[slot] = null
            seat.state = 'eating'
            seat.timer = cfg.eatTime
            seat.dish = plate.dish
            seat.plateId = plate.id
            this.events.push({ type: 'grab', seat: i, slot, plateId: plate.id })
          }
          break
        }
        case 'eating':
          seat.timer -= h
          if (seat.timer <= 0) {
            // Each empty plate is paid straight away, so coins keep coming even at the start.
            const price = cfg.prices[seat.dish] ?? 0
            seat.eaten += 1
            seat.bill += price
            seat.stack.push(cfg.tiers[seat.dish] ?? 1)
            seat.dish = -1
            earned += price
            this.events.push({ type: 'pay', seat: i, amount: price })
            if (seat.eaten >= seat.want) {
              seat.state = 'leaving'
              seat.timer = C.leave
            } else {
              seat.state = 'waiting'
              seat.waited = 0
            }
          }
          break
        case 'leaving':
          seat.timer -= h
          if (seat.timer <= 0) {
            seat.state = 'empty'
            seat.timer = C.respawnMin + this.rng() * (C.respawnMax - C.respawnMin)
            seat.stack = []
          }
          break
      }
    }
    return earned
  }

  private newChef(): Chef {
    const chef: Chef = { state: 'cooking', progress: 0, dish: 0, plateId: 0, helped: 99 }
    this.startDish(chef)
    return chef
  }

  private newSeat(): Seat {
    return {
      state: 'empty',
      timer: 0.4 + this.rng() * 1.2,
      look: Math.floor(this.rng() * 1e9),
      want: 1,
      eaten: 0,
      bill: 0,
      stack: [],
      dish: -1,
      plateId: 0,
