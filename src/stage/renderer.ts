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
