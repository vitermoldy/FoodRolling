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
