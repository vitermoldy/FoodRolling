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
  dish: number
  tier: number
  from: ScreenPoint
  /** Where the plate ends up; read every frame because the belt keeps moving. */
  to: () => ScreenPoint
  start: number
  duration: number
}

interface Coin {
  x: number
  y: number
  text: string
  start: number
}

const STATION_TOP: Record<RestaurantId, [string, string]> = {
  jepang: ['#efdcb6', '#c9a774'],
  italia: ['#eeebe5', '#c9c3b8'],
  indonesia: ['#d9b27a', '#9a6a38'],
  meksiko: ['#f3efe6', '#2f6fb3'],
  india: ['#d8ad4a', '#9c7524'],
  prancis: ['#d5d8dc', '#9ba1a8'],
}

function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

export class StageRenderer {
  readonly canvas: HTMLCanvasElement
  private ctx: Ctx
  private dpr = 1
  layout: Layout
  private room: HTMLCanvasElement | null = null
  private roomKey = ''
  def: RestaurantDef
  sim: BeltSim | null = null
  reduced = false
  private food = new Map<string, HTMLImageElement>()
  private flights: Flight[] = []
  private coins: Coin[] = []
  private pulses: { chef: number; start: number }[] = []
  private looks = new Map<number, Look>()
  private time = 0

  constructor(canvas: HTMLCanvasElement, def: RestaurantDef) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D is not available')
    this.ctx = ctx
    this.def = def
    this.layout = new Layout(1, 1)
    this.loadFood(def)
  }

  resize(width: number, height: number, dpr: number) {
    this.dpr = Math.min(2, Math.max(1, dpr))
    this.canvas.width = Math.round(width * this.dpr)
    this.canvas.height = Math.round(height * this.dpr)
    this.layout = new Layout(width, height)
    this.roomKey = ''
  }

  setRestaurant(def: RestaurantDef, sim: BeltSim | null) {
    this.def = def
    this.sim = sim
    this.flights = []
    this.coins = []
    this.pulses = []
    this.roomKey = ''
    this.loadFood(def)
  }

  /** Repaint the room on the next frame (fonts finished loading, for example). */
  invalidate() {
    this.roomKey = ''
  }

  pulse(chef: number) {
    this.pulses.push({ chef, start: this.time })
  }

  consume(events: SimEvent[]) {
    const sim = this.sim
    if (!sim) return
    const L = this.layout
    const now = this.time
    for (const e of events) {
      if (e.type === 'drop') {
        const plate = sim.slots[e.slot]
        if (!plate) continue
        this.flights.push({
          plateId: e.plateId,
          dish: plate.dish,
          tier: this.def.dishes[plate.dish]?.tier ?? 1,
          from: L.station(e.chef),
          to: () => L.belt(sim.slotPosition(e.slot)),
          start: now,
          duration: this.reduced ? 0.01 : 0.38,
        })
      } else if (e.type === 'grab') {
        const seat = sim.seats[e.seat]
        const dish = seat?.dish ?? 0
        const spot = L.counterSpot(e.seat, 'eat')
        this.flights.push({
          plateId: e.plateId,
          dish,
          tier: this.def.dishes[dish]?.tier ?? 1,
          from: L.belt(sim.slotPosition(e.slot)),
          to: () => spot,
          start: now,
          duration: this.reduced ? 0.01 : 0.32,
        })
      } else if (e.type === 'pay') {
        const p = L.seat(e.seat)
        const s = L.d * p.k
        let y = p.y - s * (SIT_HEIGHT + 0.25)
        // Two neighbours paying at once would print over each other; lift the newer number.
        const lineH = Math.max(14, L.d * 0.38)
        for (const c of this.coins) {
          if (now - c.start < 0.6 && Math.abs(c.x - p.x) < L.d * 1.6 && Math.abs(c.y - y) < lineH) y = c.y - lineH
        }
        this.coins.push({ x: p.x, y, text: `+${formatCoins(e.amount)}`, start: now })
      }
    }
  }

  /** Chef index under a point (CSS pixels), or -1. */
  hitChef(x: number, y: number): number {
    const sim = this.sim
    if (!sim) return -1
    let best = -1
    let bestY = -Infinity
    for (let i = 0; i < sim.chefs.length; i++) {
      const p = this.layout.chef(i)
      const s = this.layout.d * p.k
      const st = this.layout.station(i)
      const inChef = x > p.x - s * 0.42 && x < p.x + s * 0.42 && y > p.y - s * (STAND_HEIGHT + 0.1) && y < p.y + s * 0.15
      const inStation = Math.abs(x - st.x) < s * 0.5 && Math.abs(y - st.y) < s * 0.32
      if ((inChef || inStation) && p.y > bestY) { best = i; bestY = p.y }
    }
    return best
  }

  /** Closest belt position to a point and its distance in plate diameters. */
  nearestBelt(x: number, y: number): { u: number; dist: number } {
    let best = 0
    let bestD = Infinity
    const steps = 180
    for (let i = 0; i < steps; i++) {
      const u = (i / steps) * BELT_LENGTH
      const p = this.layout.belt(u)
      const dd = (p.x - x) ** 2 + (p.y - y) ** 2
      if (dd < bestD) { bestD = dd; best = u }
    }
    const p = this.layout.belt(best)
    return { u: best, dist: Math.sqrt(bestD) / (this.layout.d * p.k) }
  }

  /** Screen movement per unit of arc length at u. */
  tangent(u: number): { x: number; y: number } {
    const a = this.layout.belt(u)
    const b = this.layout.belt(u + 0.05)
    return { x: (b.x - a.x) / 0.05, y: (b.y - a.y) / 0.05 }
  }

  draw(dt: number) {
    this.time += dt
    const ctx = this.ctx
    const L = this.layout
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.ensureRoom()
    if (this.room) ctx.drawImage(this.room, 0, 0, L.width, L.height)
    const sim = this.sim
    if (!sim) return
    this.drawSeams(sim)

    const items: { y: number; draw: () => void }[] = []
    const flying = new Set(this.flights.map((f) => f.plateId))

    for (let i = 0; i < SLOT_COUNT; i++) {
      const plate = sim.slots[i]
      if (!plate || flying.has(plate.id)) continue
      const p = L.belt(sim.slotPosition(i))
      items.push({ y: p.y, draw: () => this.drawPlate(p.x, p.y, L.d * p.k * 0.9, this.tierOf(plate.dish), plate.dish) })
    }

    for (let i = 0; i < sim.chefs.length; i++) {
      const chef = sim.chefs[i]
      const st = L.station(i)
      const cp = L.chef(i)
      items.push({ y: st.y, draw: () => this.drawStation(i, st, chef.state === 'ready', chef.dish, chef.progress, flying.has(chef.plateId)) })
      items.push({ y: cp.y, draw: () => this.drawChef(i, cp, chef.state === 'cooking', chef.progress) })
    }

    for (let i = 0; i < sim.seats.length; i++) {
      const seat = sim.seats[i]
      const sp = L.seat(i)
      const stack = L.counterSpot(i, 'stack')
      const eat = L.counterSpot(i, 'eat')
      let alpha = 1
      let out = 0
      if (seat.state === 'empty') alpha = 0
      else if (seat.state === 'arriving') { const t = Math.max(0, seat.timer / 0.8); alpha = 1 - t; out = t }
      else if (seat.state === 'leaving') { const t = Math.max(0, seat.timer / 0.8); alpha = t; out = 1 - t }
      if (seat.stack.length) items.push({ y: stack.y, draw: () => this.drawStack(stack, seat.stack, seat.state === 'leaving' ? alpha : 1) })
      if (seat.state === 'eating' && !flying.has(seat.plateId)) {
        const left = Math.max(0.25, seat.timer / Math.max(0.01, sim.config.eatTime))
        items.push({ y: eat.y, draw: () => this.drawPlate(eat.x, eat.y, L.d * eat.k * 0.78, this.tierOf(seat.dish), seat.dish, left) })
      }
      // The stool stays when nobody sits on it.
      items.push({
        y: sp.y,
        draw: () => {
          this.drawStool(i, sp, alpha < 1)
          if (alpha > 0.01) this.drawCustomer(i, sp, alpha, out, seat.look, seat.state === 'eating' ? 'eat' : seat.state === 'waiting' && seat.waited > 3.5 ? 'wait' : 'idle')
        },
      })
    }

    items.sort((a, b) => a.y - b.y)
    for (const item of items) item.draw()

    this.drawFlights()
    this.drawBubbles(sim)
    this.drawCoins()
  }

  /* ------------------------------------------------------------------------ */

  private loadFood(def: RestaurantDef) {
    for (const dish of def.dishes) {
      if (this.food.has(dish.id)) continue
      const img = new Image()
      img.decoding = 'async'
      img.src = toDataUrl(foodSvg(dish.id, 256))
      this.food.set(dish.id, img)
    }
  }

  private tierOf(dish: number) {
    return this.def.dishes[dish]?.tier ?? 1
  }

  private ensureRoom() {
    const L = this.layout
    const key = `${this.def.id}:${L.width}x${L.height}:${this.dpr}`
    if (key === this.roomKey && this.room) return
    this.roomKey = key
    const c = this.room ?? document.createElement('canvas')
    c.width = Math.round(L.width * this.dpr)
    c.height = Math.round(L.height * this.dpr)
    const g = c.getContext('2d')
    if (!g) return
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    g.clearRect(0, 0, L.width, L.height)
    paintRoom(g, L, this.def)
    this.room = c
  }

  private drawSeams(sim: BeltSim) {
    const ctx = this.ctx
    const L = this.layout
    const slats = Math.round(BELT_LENGTH / 0.34)
    const pitch = BELT_LENGTH / slats
    const half = BAND * 0.46
    const lift = -L.d * 0.05
    const path = (shift: number) => {
      ctx.beginPath()
      for (let j = 0; j < slats; j++) {
        const u = sim.offset + shift + j * pitch
        const a = L.belt(u, -half)
        const b = L.belt(u, half)
        const m = L.belt(u + pitch * 0.2, 0)
        ctx.moveTo(a.x, a.y + lift)
        ctx.quadraticCurveTo(2 * m.x - (a.x + b.x) / 2, 2 * m.y - (a.y + b.y) / 2 + lift, b.x, b.y + lift)
      }
    }
    ctx.lineCap = 'round'
    path(0)
    ctx.strokeStyle = 'rgba(0,0,0,0.32)'
    ctx.lineWidth = Math.max(1, L.d * 0.014)
    ctx.stroke()
    path(-0.03)
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = Math.max(0.8, L.d * 0.009)
    ctx.stroke()
  }

  private drawPlate(x: number, y: number, size: number, tier: number, dish: number, foodLeft = 1, alpha = 1) {
    const ctx = this.ctx
    const rx = size / 2
    const ry = rx * TILT
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = 'rgba(25,15,5,0.22)'
    ctx.beginPath()
    ctx.ellipse(x + size * 0.03, y + size * 0.07, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = tierColor(tier)
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = this.def.theme.plate
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.01, rx * 0.84, ry * 0.84, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(70,50,30,0.12)'
    ctx.lineWidth = Math.max(0.6, size * 0.012)
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.01, rx * 0.66, ry * 0.66, 0, 0, Math.PI * 2)
    ctx.stroke()
    const img = this.food.get(this.def.dishes[dish]?.id ?? '')
    if (img && img.complete && img.naturalWidth > 0 && foodLeft > 0) {
      const fs = size * 0.86 * (0.55 + 0.45 * foodLeft)
      ctx.globalAlpha = alpha * Math.min(1, 0.35 + foodLeft)
      ctx.drawImage(img, x - fs / 2, y - size * 0.01 - (fs * TILT) / 2, fs, fs * TILT)
    }
    ctx.restore()
  }

  private drawStack(p: ScreenPoint, tiers: number[], alpha: number) {
    const ctx = this.ctx
    const s = this.layout.d * p.k
    const rx = s * 0.3
    const ry = rx * TILT
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = 'rgba(25,15,5,0.2)'
    ctx.beginPath()
    ctx.ellipse(p.x + s * 0.02, p.y + s * 0.05, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    tiers.forEach((tier, i) => {
      const y = p.y - i * s * 0.075
      ctx.fillStyle = tierColor(tier)
      ctx.beginPath()
      ctx.ellipse(p.x, y, rx, ry, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.beginPath()
      ctx.ellipse(p.x, y + s * 0.02, rx, ry, 0, 0, Math.PI)
      ctx.fill()
      if (i === tiers.length - 1) {
        ctx.fillStyle = this.def.theme.plate
        ctx.beginPath()
        ctx.ellipse(p.x, y - s * 0.005, rx * 0.8, ry * 0.8, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.restore()
  }

  private drawStation(index: number, p: ScreenPoint, ready: boolean, dish: number, progress: number, flying: boolean) {
    const ctx = this.ctx
    const s = this.layout.d * p.k
    const [top, edge] = STATION_TOP[this.def.id]
    const w = s * 0.95
    const h = s * 0.5 * TILT
    const face = s * 0.2
    ctx.fillStyle = 'rgba(25,15,5,0.18)'
    ctx.beginPath()
    ctx.roundRect(p.x - w / 2 + s * 0.03, p.y - h / 2 + s * 0.06, w, h + face, s * 0.08)
    ctx.fill()
    ctx.fillStyle = edge
    ctx.beginPath()
    ctx.roundRect(p.x - w / 2, p.y - h / 2, w, h + face, s * 0.08)
    ctx.fill()
    ctx.fillStyle = top
    ctx.beginPath()
    ctx.roundRect(p.x - w / 2, p.y - h / 2, w, h, s * 0.08)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(p.x - w / 2 + s * 0.08, p.y - h / 2 + s * 0.03, w - s * 0.16, Math.max(1, s * 0.02))
    if (ready && !flying) {
      this.drawPlate(p.x, p.y - s * 0.02, s * 0.62, this.tierOf(dish), dish)
    } else if (!ready) {
      // The dish takes shape on the board as the chef works.
      const img = this.food.get(this.def.dishes[dish]?.id ?? '')
      if (img && img.complete && img.naturalWidth > 0 && progress > 0.08) {
        const fs = s * 0.5
        ctx.save()
        ctx.globalAlpha = Math.min(1, progress * 1.1)
        ctx.drawImage(img, p.x - fs / 2, p.y - (fs * TILT) / 2 - s * 0.02, fs, fs * TILT)
        ctx.restore()
      }
      if (!this.reduced && progress > 0.15) this.drawSteam(p.x + s * 0.18, p.y - h / 2, s, index)
    }
  }

  private drawSteam(x: number, y: number, s: number, seed: number) {
    const ctx = this.ctx
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = Math.max(1, s * 0.04)
    ctx.lineCap = 'round'
    for (let k = 0; k < 2; k++) {
      const t = (this.time * 0.8 + k * 0.5 + seed * 0.37) % 1
      ctx.globalAlpha = (1 - t) * 0.8
      const yy = y - t * s * 0.5
      ctx.beginPath()
      ctx.moveTo(x + k * s * 0.12, yy)
      ctx.quadraticCurveTo(x + k * s * 0.12 + s * 0.06, yy - s * 0.08, x + k * s * 0.12, yy - s * 0.16)
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawChef(index: number, p: ScreenPoint, cooking: boolean, progress: number) {
    const ctx = this.ctx
    const s = this.layout.d * p.k
    const chef = this.def.theme.chef
    drawPerson(ctx, p.x, p.y, s, {
      facing: this.layout.chefFacing(index),
      look: this.chefLook(index),
      chef,
      time: this.time + index * 0.7,
      action: cooking ? 'cook' : 'idle',
      still: this.reduced,
    })
    // Progress ring beside the head.
    const rx = p.x + s * 0.62
    const ry = p.y - s * 1.5
    const r = s * 0.14
    ctx.save()
    ctx.lineWidth = Math.max(2, s * 0.05)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath()
    ctx.arc(rx, ry, r + ctx.lineWidth * 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(40,30,20,0.18)'
    ctx.beginPath()
    ctx.arc(rx, ry, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = this.def.theme.accent
    ctx.beginPath()
    ctx.arc(rx, ry, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (cooking ? progress : 1))
    ctx.stroke()
    ctx.restore()
    for (const pulse of this.pulses) {
      if (pulse.chef !== index) continue
      const t = (this.time - pulse.start) / 0.45
      if (t > 1) continue
      ctx.save()
      ctx.globalAlpha = 1 - t
      ctx.strokeStyle = this.def.theme.accent
      ctx.lineWidth = Math.max(2, s * 0.05)
      ctx.beginPath()
      ctx.arc(rx, ry, r + s * 0.35 * t, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
    this.pulses = this.pulses.filter((pl) => this.time - pl.start < 0.5)
  }

  private chefLook(index: number): Look {
    const key = 1000 + index + this.def.id.length * 31
    let look = this.looks.get(key)
    if (!look) {
      look = lookFrom(key * 7919)
      this.looks.set(key, look)
    }
    return look
  }

  private drawStool(index: number, p: ScreenPoint, empty: boolean) {
    const facing = this.layout.facingIn(SEAT_SPOTS[index])
    // A seated customer facing away covers the stool and draws it; otherwise show the empty seat.
    if (!empty && facing === 'up') return
    const ctx = this.ctx
    const s = this.layout.d * p.k
    ctx.fillStyle = 'rgba(25,15,5,0.16)'
    ctx.beginPath()
    ctx.ellipse(p.x, p.y + s * 0.08, s * 0.3, s * 0.11, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#5a3e2b'
    ctx.fillRect(p.x - s * 0.05, p.y - s * 0.02, s * 0.1, s * 0.12)
    ctx.fillStyle = '#7a5538'
    ctx.beginPath()
    ctx.ellipse(p.x, p.y - s * 0.04, s * 0.29, s * 0.11, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawCustomer(index: number, p: ScreenPoint, alpha: number, out: number, seed: number, action: 'idle' | 'eat' | 'wait') {
    const L = this.layout
    const u = SEAT_SPOTS[index]
    const outer = L.belt(u, 2.4)
    const x = p.x + (outer.x - p.x) * out * 0.6
    const y = p.y + (outer.y - p.y) * out * 0.6
    let look = this.looks.get(seed)
    if (!look) {
      look = lookFrom(seed)
      if (this.looks.size > 400) this.looks.clear()
      this.looks.set(seed, look)
    }
    this.ctx.save()
    this.ctx.globalAlpha = alpha
    drawPerson(this.ctx, x, y, L.d * p.k, { facing: L.facingIn(u), look, time: this.time + index * 0.9, action, still: this.reduced })
    this.ctx.restore()
  }

  private drawFlights() {
    const L = this.layout
    this.flights = this.flights.filter((f) => this.time - f.start < f.duration)
    for (const f of this.flights) {
      const t = ease(Math.min(1, (this.time - f.start) / f.duration))
      const to = f.to()
      const x = f.from.x + (to.x - f.from.x) * t
      const k = f.from.k + (to.k - f.from.k) * t
      const y = f.from.y + (to.y - f.from.y) * t - Math.sin(t * Math.PI) * L.d * k * 0.35
      this.drawPlate(x, y, L.d * k * 0.86, f.tier, f.dish)
    }
  }

  private drawBubbles(sim: BeltSim) {
    const ctx = this.ctx
    const L = this.layout
    for (let i = 0; i < sim.seats.length; i++) {
      const seat = sim.seats[i]
      if (seat.state !== 'waiting' || seat.waited < 3.5) continue
      const p = L.seat(i)
      const s = L.d * p.k
      const x = p.x + s * 0.34
      const y = p.y - s * (SIT_HEIGHT + 0.12)
      ctx.fillStyle = 'rgba(255,255,255,0.94)'
      ctx.beginPath()
      ctx.roundRect(x - s * 0.24, y - s * 0.14, s * 0.48, s * 0.28, s * 0.14)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(x - s * 0.12, y + s * 0.12)
      ctx.lineTo(x - s * 0.2, y + s * 0.24)
      ctx.lineTo(x - s * 0.02, y + s * 0.13)
      ctx.fill()
      for (let k = 0; k < 3; k++) {
        const bob = this.reduced ? 0 : Math.max(0, Math.sin(this.time * 6 - k * 0.8)) * s * 0.04
        ctx.fillStyle = '#5b5348'
        ctx.beginPath()
        ctx.arc(x + (k - 1) * s * 0.12, y - bob, s * 0.035, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private drawCoins() {
    const ctx = this.ctx
    const L = this.layout
    this.coins = this.coins.filter((c) => this.time - c.start < 1.3)
    const size = Math.max(12, L.d * 0.32)
    ctx.save()
    ctx.font = `700 ${size}px "Urbanist Variable", Urbanist, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    for (const c of this.coins) {
      const t = (this.time - c.start) / 1.3
      const y = c.y - (this.reduced ? 0 : t * L.d * 0.6)
      // Keep the number inside the stage near the edges.
      const half = ctx.measureText(c.text).width / 2 + size * 0.3
      const x = Math.min(L.width - half, Math.max(half, c.x))
      ctx.globalAlpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3
      ctx.lineWidth = Math.max(3, size * 0.22)
      ctx.strokeStyle = 'rgba(255,253,246,0.95)'
      ctx.strokeText(c.text, x, y)
      ctx.fillStyle = '#2f3a0c'
      ctx.fillText(c.text, x, y)
    }
    ctx.restore()
