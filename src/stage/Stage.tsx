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
