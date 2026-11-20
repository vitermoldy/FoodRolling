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
/** Distance from the belt centre line in to a chef's station. */
export const STATION_IN = BAND / 2 + 0.5
/** Distance from the belt centre line in to the chef. */
export const CHEF_IN = RADIUS - 0.3
/** Screen height of a person per plate diameter (seated and standing). */
export const SIT_HEIGHT = 1.3
export const STAND_HEIGHT = 1.75

export type Orientation = 'landscape' | 'portrait'
export type Facing = 'down' | 'up' | 'left' | 'right'

export interface LoopPoint {
  p: number
  q: number
  /** Outward normal. */
  np: number
  nq: number
  /** Direction of travel. */
  tp: number
  tq: number
}

/** Point on the belt centre line in loop coordinates (p along the straights, q across). */
export function alongLoop(u: number): LoopPoint {
  const s = STRAIGHT
  const r = RADIUS
  let t = ((u % BELT_LENGTH) + BELT_LENGTH) % BELT_LENGTH
  if (t < s) return { p: s / 2 - t, q: r, np: 0, nq: 1, tp: -1, tq: 0 }
  t -= s
  const arc = Math.PI * r
  if (t < arc) {
    const f = t / r
    const sin = Math.sin(f)
    const cos = Math.cos(f)
    return { p: -s / 2 - r * sin, q: r * cos, np: -sin, nq: cos, tp: -cos, tq: -sin }
  }
  t -= arc
  if (t < s) return { p: -s / 2 + t, q: -r, np: 0, nq: -1, tp: 1, tq: 0 }
  t -= s
  const f = Math.min(Math.PI, t / r)
  const sin = Math.sin(f)
  const cos = Math.cos(f)
  return { p: s / 2 + r * sin, q: -r * cos, np: sin, nq: -cos, tp: cos, tq: sin }
}

export interface ScreenPoint {
  x: number
  y: number
  /** Perspective scale at this depth (1 at the front). */
  k: number
}

export class Layout {
  readonly width: number
  readonly height: number
  readonly orientation: Orientation
  /** Plate diameter at the front, in CSS pixels. */
  d = 1
  private cx = 0
  private ym = 0
  private a = 1
  private b = 0
  private depth = 1
  /** Screen y where the back wall meets the floor. */
  floorY = 0
  /** Screen y of the top of the scene (above the tallest head). */
  sceneTop = 0

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.orientation = width / Math.max(1, height) >= 1.05 ? 'landscape' : 'portrait'
    const landscape = this.orientation === 'landscape'
    const kb = landscape ? 0.8 : 0.7
    this.depth = landscape ? RADIUS + SEAT_OUT : STRAIGHT / 2 + RADIUS + SEAT_OUT
    this.a = (1 + kb) / 2
    this.b = (1 - kb) / (2 * this.depth)
    this.fit()
  }

  /** Loop coordinates to world (x across the screen, z towards the viewer). */
  world(p: number, q: number): { x: number; z: number } {
    return this.orientation === 'landscape' ? { x: p, z: q } : { x: q, z: p }
  }

  project(x: number, z: number): ScreenPoint {
    const k = this.a + this.b * z
    return { x: this.cx + x * k * this.d, y: this.ym + TILT * (this.a * z + (this.b * z * z) / 2) * this.d, k }
  }

  at(p: number, q: number): ScreenPoint {
    const w = this.world(p, q)
    return this.project(w.x, w.z)
  }

