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

function disc(ctx: Ctx, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function hang(ctx: Ctx, x: number, y0: number, y1: number, u: number) {
  ctx.strokeStyle = 'rgba(40,30,20,0.55)'
  ctx.lineWidth = Math.max(1, u * 0.03)
  ctx.beginPath()
  ctx.moveTo(x, y0)
  ctx.lineTo(x, y1)
  ctx.stroke()
}

/** A drooping string across the wall, as points. */
function swag(x0: number, x1: number, y: number, sag: number, n: number) {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    pts.push({ x: x0 + (x1 - x0) * t, y: y + Math.sin(t * Math.PI) * sag })
  }
  return pts
}

interface Wall {
  W: number
  top: number
  bottom: number
  /** Decoration unit, about one plate at the back of the room. */
  u: number
  theme: ThemeDef
  def: RestaurantDef
  rng: () => number
}

/* ------------------------------ wall decoration ------------------------------ */

function jepang(ctx: Ctx, w: Wall) {
  const { W, bottom, u, theme } = w
  // Hinoki planks.
  for (let x = 0, i = 0; x < W; x += u * 0.9, i++) {
    ctx.fillStyle = i % 2 ? theme.wall : '#e4cc9f'
    ctx.fillRect(x, 0, u * 0.9, bottom)
    ctx.fillStyle = 'rgba(120,80,40,0.12)'
    ctx.fillRect(x, 0, Math.max(1, u * 0.02), bottom)
  }
  // Shoji screens at both sides.
  const sw = Math.min(W * 0.16, u * 3.2)
  const sh = bottom * 0.78
  for (const x of [u * 0.4, W - u * 0.4 - sw]) {
    rr(ctx, x - u * 0.08, bottom * 0.1 - u * 0.08, sw + u * 0.16, sh + u * 0.16, u * 0.04, '#5a3d27')
    rr(ctx, x, bottom * 0.1, sw, sh, 0, '#f7f1e2')
    ctx.strokeStyle = '#6b4a30'
    ctx.lineWidth = Math.max(1, u * 0.05)
    ctx.beginPath()
