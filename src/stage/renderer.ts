// Draws one restaurant per frame: the painted room, the moving belt seams, plates, chefs at their
// stations, customers with their plate stacks, flying plates and coins.
import { foodSvg, toDataUrl } from '../art/food.ts'
import { tierColor } from '../art/tiers.ts'
import type { RestaurantDef, RestaurantId } from '../game/restaurants.ts'
import { BELT_LENGTH, PITCH, SEAT_SPOTS, SLOT_COUNT, type BeltSim, type SimEvent } from '../game/sim.ts'
