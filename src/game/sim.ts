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
