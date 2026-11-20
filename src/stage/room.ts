// The still part of the stage, painted once per size and restaurant into an offscreen canvas:
// back wall with the country's decoration, floor, counter ring, belt bed, rails and island.
import type { RestaurantDef, RestaurantId, ThemeDef } from '../game/restaurants.ts'
import { makeRng } from '../game/rng.ts'
import { BAND, COUNTER, type Layout, type ScreenPoint } from './geometry.ts'

type Ctx = CanvasRenderingContext2D

function polygon(ctx: Ctx, pts: ScreenPoint[], dy = 0) {
  ctx.moveTo(pts[0].x, pts[0].y + dy)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y + dy)
  ctx.closePath()
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number | number[], fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

