// Draws one restaurant per frame: the painted room, the moving belt seams, plates, chefs at their
// stations, customers with their plate stacks, flying plates and coins.
import { foodSvg, toDataUrl } from '../art/food.ts'
import { tierColor } from '../art/tiers.ts'
import type { RestaurantDef, RestaurantId } from '../game/restaurants.ts'
import { BELT_LENGTH, PITCH, SEAT_SPOTS, SLOT_COUNT, type BeltSim, type SimEvent } from '../game/sim.ts'
import { formatCoins } from '../lib/format.ts'
import { BAND, Layout, STAND_HEIGHT, SIT_HEIGHT, TILT, type ScreenPoint } from './geometry.ts'
import { drawPerson, lookFrom, type Look } from './people.ts'
import { paintRoom } from './room.ts'

type Ctx = CanvasRenderingContext2D

interface Flight {
  plateId: number
