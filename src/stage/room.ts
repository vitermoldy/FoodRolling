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
  ctx.fillRect(0, 0, W, bandH)
  ctx.fillStyle = '#1f1410'
  ctx.fillRect(0, bandH, W, u * 0.08)
  ctx.strokeStyle = '#d9a521'
  ctx.lineWidth = Math.max(1.2, u * 0.05)
  for (let x = u * 0.4; x < W; x += u * 0.9) {
    ctx.beginPath()
    ctx.arc(x, bandH * 0.5, bandH * 0.26, Math.PI * 0.2, Math.PI * 1.7)
    ctx.arc(x + u * 0.45, bandH * 0.5, bandH * 0.26, Math.PI * 1.2, Math.PI * 2.7)
    ctx.stroke()
  }
  // Rumah gadang roof in the middle: the upswept gonjong horns.
  const rw = Math.min(W * 0.36, u * 6.4)
  const rx = W / 2 - rw / 2
  const ry = bandH + u * 0.2
  const rh = Math.min(bottom * 0.42, u * 1.4)
  ctx.fillStyle = '#2b1d16'
  ctx.beginPath()
  ctx.moveTo(rx, ry)
  ctx.quadraticCurveTo(rx + rw * 0.12, ry + rh * 0.85, rx + rw * 0.25, ry + rh * 0.9)
  ctx.quadraticCurveTo(rx + rw * 0.33, ry + rh * 0.2, rx + rw * 0.42, ry + rh * 0.05)
  ctx.quadraticCurveTo(rx + rw * 0.46, ry + rh * 0.75, rx + rw * 0.5, ry + rh * 0.8)
  ctx.quadraticCurveTo(rx + rw * 0.54, ry + rh * 0.75, rx + rw * 0.58, ry + rh * 0.05)
  ctx.quadraticCurveTo(rx + rw * 0.67, ry + rh * 0.2, rx + rw * 0.75, ry + rh * 0.9)
  ctx.quadraticCurveTo(rx + rw * 0.88, ry + rh * 0.85, rx + rw, ry)
  ctx.lineTo(rx + rw * 0.94, ry + rh * 1.05)
  ctx.lineTo(rx + rw * 0.06, ry + rh * 1.05)
  ctx.closePath()
  ctx.fill()
  rr(ctx, rx + rw * 0.06, ry + rh * 1.0, rw * 0.88, u * 0.1, 0, '#d9a521')
  // Display window with stacked plates at the left.
  const ew = Math.min(W * 0.17, u * 3)
  const eh = bottom * 0.5
  const ex = u * 0.5
  const ey = bottom - eh - u * 0.3
  rr(ctx, ex - u * 0.08, ey - u * 0.08, ew + u * 0.16, eh + u * 0.16, u * 0.06, '#5a2e18')
  rr(ctx, ex, ey, ew, eh, u * 0.03, '#e9f2f1')
  const dishes = ['#c9351f', '#5a2c14', '#e9b23c', '#2f6b2a', '#a8642a', '#d9542e']
  let k = 0
  // Shelves in the window, each with a row of dishes piled on plates, the Padang way.
  for (let row = 0; row < 3; row++) {
    const sy = ey + eh * (0.32 + row * 0.3)
    rr(ctx, ex + u * 0.06, sy, ew - u * 0.12, Math.max(1.5, u * 0.05), 0, 'rgba(90,46,24,0.55)')
    const n = 3
    for (let i = 0; i < n; i++) {
      const cx = ex + ew * (0.2 + i * 0.3)
      for (let h = 0; h < 2; h++) {
        const cy = sy - u * 0.08 - h * u * 0.13
        ctx.fillStyle = '#fbf6ea'
        ctx.beginPath()
        ctx.ellipse(cx, cy, ew * 0.12, u * 0.08, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = dishes[k++ % dishes.length]
        ctx.beginPath()
        ctx.ellipse(cx, cy - u * 0.04, ew * 0.08, u * 0.07, 0, Math.PI, 0)
        ctx.fill()
      }
    }
  }
  // Kawung batik panel at the right.
  const bw = Math.min(W * 0.17, u * 3)
  const bx = W - u * 0.5 - bw
  const by = bottom - eh - u * 0.3
  rr(ctx, bx, by, bw, eh, u * 0.04, '#4a2a16')
  ctx.save()
  ctx.beginPath()
  ctx.rect(bx, by, bw, eh)
  ctx.clip()
  const cell = u * 0.5
  for (let y = by; y < by + eh + cell; y += cell) {
    for (let x = bx; x < bx + bw + cell; x += cell) {
      ctx.fillStyle = '#e8c98a'
      for (const a of [0, Math.PI / 2]) {
        ctx.beginPath()
        ctx.ellipse(x, y, cell * 0.42, cell * 0.2, a + Math.PI / 4, 0, Math.PI * 2)
        ctx.fill()
      }
      disc(ctx, x, y, cell * 0.06, '#4a2a16')
    }
  }
  ctx.restore()
}

function meksiko(ctx: Ctx, w: Wall) {
  const { W, bottom, u, theme } = w
  ctx.fillStyle = theme.wall
  ctx.fillRect(0, 0, W, bottom)
  // Talavera tile band near the floor.
  const th = Math.min(bottom * 0.22, u * 0.7)
  const ty = bottom - th
  for (let x = 0, i = 0; x < W; x += th, i++) {
    rr(ctx, x + 1, ty + 1, th - 2, th - 2, u * 0.03, '#f6f1e6')
    ctx.strokeStyle = '#1f5fa8'
    ctx.lineWidth = Math.max(1, u * 0.04)
    ctx.beginPath()
    ctx.arc(x + th / 2, ty + th / 2, th * 0.22, 0, Math.PI * 2)
    ctx.stroke()
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4
      disc(ctx, x + th / 2 + Math.cos(a) * th * 0.36, ty + th / 2 + Math.sin(a) * th * 0.36, th * 0.07, i % 2 ? '#1f5fa8' : '#e0a12a')
    }
    disc(ctx, x + th / 2, ty + th / 2, th * 0.08, '#1f5fa8')
  }
  // Papel picado: two strings of cut-paper flags.
  const colors = ['#e8508a', '#f2c230', '#3fa36b', '#3a7cc2', '#e8803a']
  for (const [row, y] of [[0, bottom * 0.06], [1, bottom * 0.24]] as [number, number][]) {
    const pts = swag(-u * 0.5, W + u * 0.5, y, bottom * 0.06, Math.max(6, Math.round(W / (u * 0.75))))
    ctx.strokeStyle = 'rgba(60,40,30,0.6)'
    ctx.lineWidth = Math.max(1, u * 0.025)
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.stroke()
    pts.forEach((p, i) => {
      if (i === pts.length - 1) return
      const fw = u * 0.5
      const fh = u * 0.62
      ctx.fillStyle = colors[(i + row * 2) % colors.length]
      ctx.beginPath()
      ctx.moveTo(p.x - fw / 2, p.y)
      ctx.lineTo(p.x + fw / 2, p.y)
      ctx.lineTo(p.x + fw / 2, p.y + fh)
      for (let z = 4; z >= 0; z--) ctx.lineTo(p.x - fw / 2 + (fw * z) / 4, p.y + fh - (z % 2 ? u * 0.08 : 0))
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = theme.wall
      for (const [dx, dy] of [[0, 0.22], [-0.13, 0.42], [0.13, 0.42]] as [number, number][]) {
        ctx.beginPath()
        ctx.moveTo(p.x + dx * u, p.y + dy * u - u * 0.07)
        ctx.lineTo(p.x + dx * u + u * 0.06, p.y + dy * u)
        ctx.lineTo(p.x + dx * u, p.y + dy * u + u * 0.07)
        ctx.lineTo(p.x + dx * u - u * 0.06, p.y + dy * u)
        ctx.closePath()
        ctx.fill()
      }
    })
  }
