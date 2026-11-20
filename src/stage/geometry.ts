// Stage geometry. The loop parametrisation and the projection are the ones from the sushi conveyor
// component in Prompt.txt (`along`, `project`): a stadium loop seen from above, where the far side
// shrinks to `kb` and depth is foreshortened by TILT. The game adds a portrait variant for phones,
// where the loop's long axis runs into the screen instead of across it.
import { BELT_LENGTH, CHEF_SPOTS, RADIUS, SEAT_SPOTS, STRAIGHT } from '../game/sim.ts'

export const BAND = 1.22
export const TILT = 0.8
/** Width of the counter ring outside the belt, where customers put their plates. */
export const COUNTER = 0.8
/** Distance from the belt centre line to a seated customer. */
export const SEAT_OUT = BAND / 2 + COUNTER + 0.24
