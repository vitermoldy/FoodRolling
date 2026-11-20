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

