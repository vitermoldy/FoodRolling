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
