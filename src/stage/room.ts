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
    for (let c = 1; c < 3; c++) { ctx.moveTo(x + (sw * c) / 3, bottom * 0.1); ctx.lineTo(x + (sw * c) / 3, bottom * 0.1 + sh) }
    for (let rI = 1; rI < 5; rI++) { ctx.moveTo(x, bottom * 0.1 + (sh * rI) / 5); ctx.lineTo(x + sw, bottom * 0.1 + (sh * rI) / 5) }
    ctx.stroke()
  }
  // Noren curtain in the middle with a round crest.
  const nw = Math.min(W * 0.3, u * 5)
  const nx = W / 2 - nw / 2
  const ny = bottom * 0.06
  rr(ctx, nx - u * 0.2, ny - u * 0.06, nw + u * 0.4, u * 0.12, u * 0.06, '#5a3d27')
  const panels = 4
  for (let i = 0; i < panels; i++) {
    const px = nx + (nw / panels) * i + u * 0.03
    rr(ctx, px, ny + u * 0.04, nw / panels - u * 0.06, Math.min(bottom * 0.5, u * 1.5), [0, 0, u * 0.05, u * 0.05], theme.chef.apron)
  }
  ctx.strokeStyle = '#f4efe4'
  ctx.lineWidth = Math.max(1.5, u * 0.07)
  ctx.beginPath()
  ctx.arc(W / 2, ny + Math.min(bottom * 0.25, u * 0.75), u * 0.36, 0, Math.PI * 2)
  ctx.stroke()
  disc(ctx, W / 2, ny + Math.min(bottom * 0.25, u * 0.75), u * 0.13, '#f4efe4')
  // Paper lanterns in the gaps between the screens and the curtain.
  const gap = (W / 2 - nw / 2 - (u * 0.4 + sw)) / 2
  for (const x of [u * 0.4 + sw + gap, W - u * 0.4 - sw - gap]) {
    if (gap < u * 0.5) break
    const cy = bottom * 0.3
    hang(ctx, x, 0, cy - u * 0.45, u)
    rr(ctx, x - u * 0.2, cy - u * 0.5, u * 0.4, u * 0.1, u * 0.03, '#2a2220')
    ctx.fillStyle = theme.accent
    ctx.beginPath()
    ctx.ellipse(x, cy, u * 0.34, u * 0.44, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(80,20,10,0.35)'
    ctx.lineWidth = Math.max(1, u * 0.025)
    ctx.beginPath()
    for (let k = -2; k <= 2; k++) { ctx.moveTo(x - u * 0.33 * Math.cos((k / 3) * 1.2), cy + k * u * 0.14); ctx.lineTo(x + u * 0.33 * Math.cos((k / 3) * 1.2), cy + k * u * 0.14) }
    ctx.stroke()
    rr(ctx, x - u * 0.2, cy + u * 0.4, u * 0.4, u * 0.1, u * 0.03, '#2a2220')
  }
}

function italia(ctx: Ctx, w: Wall) {
  const { W, bottom, u, theme, rng } = w
  // Brick wall.
  const bh = u * 0.32
  const bw = u * 0.78
  ctx.fillStyle = '#e8d6c2'
  ctx.fillRect(0, 0, W, bottom)
  for (let row = 0, y = 0; y < bottom; row++, y += bh) {
    for (let x = row % 2 ? -bw / 2 : 0; x < W; x += bw) {
      const tone = rng()
      rr(ctx, x + 1, y + 1, bw - 2, bh - 2, Math.max(1, u * 0.03), tone < 0.33 ? theme.wall : tone < 0.66 ? theme.wallLow : '#bd6a46')
    }
  }
  // Arched windows.
  const ww = Math.min(W * 0.14, u * 2.4)
  const wh = bottom * 0.66
  for (const x of [u * 0.6, W - u * 0.6 - ww]) {
    const y = bottom * 0.14
    ctx.fillStyle = '#f2e6d0'
    ctx.beginPath()
    ctx.roundRect(x - u * 0.12, y - u * 0.12, ww + u * 0.24, wh + u * 0.24, [ww / 2 + u * 0.12, ww / 2 + u * 0.12, u * 0.05, u * 0.05])
    ctx.fill()
    const sky = ctx.createLinearGradient(0, y, 0, y + wh)
    sky.addColorStop(0, '#a9d6ec')
    sky.addColorStop(1, '#e7f3ea')
    ctx.fillStyle = sky
    ctx.beginPath()
    ctx.roundRect(x, y, ww, wh, [ww / 2, ww / 2, 0, 0])
    ctx.fill()
    ctx.fillStyle = '#7fa35a'
    ctx.beginPath()
    ctx.ellipse(x + ww * 0.3, y + wh, ww * 0.35, wh * 0.18, 0, Math.PI, 0)
    ctx.ellipse(x + ww * 0.75, y + wh, ww * 0.3, wh * 0.24, 0, Math.PI, 0)
    ctx.fill()
    ctx.strokeStyle = '#f2e6d0'
    ctx.lineWidth = Math.max(1.5, u * 0.06)
    ctx.beginPath()
    ctx.moveTo(x + ww / 2, y)
    ctx.lineTo(x + ww / 2, y + wh)
    ctx.moveTo(x, y + wh * 0.55)
    ctx.lineTo(x + ww, y + wh * 0.55)
    ctx.stroke()
    // Vine over the arch.
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI
      const lx = x + ww / 2 + Math.cos(a) * (ww / 2 + u * 0.15)
      const ly = y + ww / 2 + Math.sin(a) * (ww / 2 + u * 0.15)
      ctx.fillStyle = i % 2 ? '#4f7f3a' : '#6a9a48'
      ctx.beginPath()
      ctx.ellipse(lx, ly, u * 0.16, u * 0.09, a, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // Shelf with bottles.
  const sw = Math.min(W * 0.34, u * 6)
  const sx = W / 2 - sw / 2
  const sy = bottom * 0.42
  for (let i = 0; i < 7; i++) {
    const bx = sx + u * 0.4 + (i * (sw - u * 0.8)) / 6
    const tall = 0.75 + (i % 3) * 0.12
    const glass = i % 3 === 0 ? '#2f4a2f' : i % 3 === 1 ? '#5a1f22' : '#3c5a3a'
    rr(ctx, bx - u * 0.13, sy - u * tall, u * 0.26, u * tall, [u * 0.1, u * 0.1, u * 0.03, u * 0.03], glass)
    rr(ctx, bx - u * 0.05, sy - u * (tall + 0.25), u * 0.1, u * 0.3, u * 0.03, glass)
    rr(ctx, bx - u * 0.1, sy - u * tall * 0.55, u * 0.2, u * 0.2, u * 0.02, '#efe4cc')
  }
  rr(ctx, sx, sy, sw, u * 0.14, u * 0.04, '#6c432a')
  // String lights.
  const pts = swag(-u, W + u, bottom * 0.07, bottom * 0.12, 26)
  ctx.strokeStyle = 'rgba(40,30,20,0.6)'
  ctx.lineWidth = Math.max(1, u * 0.025)
  ctx.beginPath()
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
  ctx.stroke()
  pts.forEach((p, i) => { if (i % 2 === 0) disc(ctx, p.x, p.y + u * 0.12, u * 0.09, '#ffd98a') })
}

function indonesia(ctx: Ctx, w: Wall) {
  const { W, bottom, u, theme } = w
  ctx.fillStyle = theme.wall
  ctx.fillRect(0, 0, W, bottom)
  // Carved band along the top: dark red with gold curls.
  const bandH = Math.min(bottom * 0.2, u * 0.7)
  ctx.fillStyle = '#6e1f15'
