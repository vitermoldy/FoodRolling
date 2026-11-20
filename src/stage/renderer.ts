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
