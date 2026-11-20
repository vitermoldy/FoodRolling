import * as React from 'react'
import { restaurantById } from '@/game/restaurants'
import { BeltSim, simConfig } from '@/game/sim'
import { useGame } from '@/game/store'
import { StageRenderer } from './renderer'

const DRAG_START = 6

/** Short spoken summary of the belt, for the canvas label. */
function describe(sim: BeltSim, name: string): string {
  const seated = sim.seats.filter((s) => s.state === 'waiting' || s.state === 'eating').length
  const waiting = sim.seats.filter((s) => s.state === 'waiting').length
  return `${name}: ${sim.chefs.length} chef memasak, ${seated} dari ${sim.seats.length} kursi terisi, ${waiting} pelanggan menunggu makanan, ${sim.plateCount()} piring di sabuk.`
}

export interface StageHandle {
  /** One push of cooking progress for the next chef in turn (keyboard alternative to tapping). */
  helpNext: () => void
}

export const Stage = React.forwardRef<StageHandle, { className?: string }>(function Stage({ className }, ref) {
  const current = useGame((s) => s.current)
  const state = useGame((s) => s.restaurants[s.current])
  const paused = useGame((s) => s.paused)
  const earn = useGame((s) => s.earn)
  const markLive = useGame((s) => s.markLive)
  const def = restaurantById(current)

  const wrapRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rendererRef = React.useRef<StageRenderer | null>(null)
  const simRef = React.useRef<BeltSim | null>(null)
  const live = React.useRef({ paused, owned: state.owned, id: current })
  live.current = { paused, owned: state.owned, id: current }
  const helpTurn = React.useRef(0)
  const [label, setLabel] = React.useState('')
  const [cursor, setCursor] = React.useState('default')

  React.useImperativeHandle(ref, () => ({
    helpNext() {
      const sim = simRef.current
      if (!sim || sim.chefs.length === 0) return
      for (let k = 0; k < sim.chefs.length; k++) {
        const i = (helpTurn.current + k) % sim.chefs.length
        if (sim.help(i)) {
          rendererRef.current?.pulse(i)
          helpTurn.current = i + 1
          return
        }
      }
    },
  }), [])

  // Renderer, size and the frame loop live for the life of the component.
  React.useLayoutEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const renderer = new StageRenderer(canvas, restaurantById(useGame.getState().current))
    rendererRef.current = renderer
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyMotion = () => { renderer.reduced = media.matches }
    applyMotion()
    media.addEventListener('change', applyMotion)
    const measure = () => {
      const box = wrap.getBoundingClientRect()
      renderer.resize(Math.max(1, box.width), Math.max(1, box.height), window.devicePixelRatio || 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(wrap)
    document.fonts?.ready.then(() => renderer.invalidate())

    let raf = 0
    let last = performance.now()
    let labelAt = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000))
      last = now
      const sim = simRef.current
      const L = live.current
      const running = !!sim && L.owned && !L.paused && !document.hidden
      if (sim && running) {
        const coins = sim.step(dt)
        if (sim.events.length) {
          renderer.consume(sim.events)
          sim.events.length = 0
        }
        if (coins > 0) earn(L.id, coins)
        markLive(L.id, Date.now())
      }
      renderer.draw(running ? dt : 0)
      if (sim && now - labelAt > 1000) {
        labelAt = now
        setLabel(describe(sim, restaurantById(L.id).name))
      }
    }
    raf = requestAnimationFrame(frame)
    // `?debug` lets an automated click-through read the belt and the stage layout.
    if (new URLSearchParams(window.location.search).has('debug')) {
      Object.assign(window, { __stage: { get sim() { return simRef.current }, renderer } })
