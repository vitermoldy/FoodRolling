// Customers and chefs, drawn with canvas paths. Units inside the functions are plate diameters at
// the person's depth (`s` pixels each), with y growing down and the origin at the seat or the feet.
import { makeRng } from '../game/rng.ts'
import type { HatKind } from '../game/restaurants.ts'
import type { Facing } from './geometry.ts'

export interface Look {
  skin: string
  hair: string
  style: number
  shirt: string
  glasses: boolean
}

const SKINS = ['#f5d6c1', '#e9bf9c', '#d6a07a', '#b97c55', '#8f5b3c', '#6b412a']
