// The still part of the stage, painted once per size and restaurant into an offscreen canvas:
// back wall with the country's decoration, floor, counter ring, belt bed, rails and island.
import type { RestaurantDef, RestaurantId, ThemeDef } from '../game/restaurants.ts'
import { makeRng } from '../game/rng.ts'
import { BAND, COUNTER, type Layout, type ScreenPoint } from './geometry.ts'

type Ctx = CanvasRenderingContext2D

