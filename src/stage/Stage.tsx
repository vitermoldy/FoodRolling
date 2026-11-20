import * as React from 'react'
import { restaurantById } from '@/game/restaurants'
import { BeltSim, simConfig } from '@/game/sim'
import { useGame } from '@/game/store'
import { StageRenderer } from './renderer'

const DRAG_START = 6

/** Short spoken summary of the belt, for the canvas label. */
function describe(sim: BeltSim, name: string): string {
  const seated = sim.seats.filter((s) => s.state === 'waiting' || s.state === 'eating').length
