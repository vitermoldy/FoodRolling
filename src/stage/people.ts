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
const HAIRS = ['#2a1c15', '#4a2f20', '#6e4b2e', '#1b1b1b', '#a7732f', '#8d8a86', '#b5462c']
const SHIRTS = ['#2f6f8f', '#c96f3a', '#6a8f3d', '#d9b44a', '#3c4a63', '#b84a4a', '#4f8f86', '#e7e1d4', '#7a6a5a', '#2e5e4e']

export function lookFrom(seed: number): Look {
  const rng = makeRng(seed)
  return {
    skin: SKINS[Math.floor(rng() * SKINS.length)],
    hair: HAIRS[Math.floor(rng() * HAIRS.length)],
    style: Math.floor(rng() * 5),
    shirt: SHIRTS[Math.floor(rng() * SHIRTS.length)],
    glasses: rng() < 0.16,
  }
}

export interface ChefStyle {
  hat: HatKind
  coat: string
  apron: string
  trim: string
}

export interface PersonOptions {
  facing: Facing
  look: Look
  chef?: ChefStyle
  /** Seconds, drives the arm motion. */
  time: number
  action: 'idle' | 'eat' | 'cook' | 'wait'
  /** Freeze arm motion (reduced motion). */
  still?: boolean
}

type Ctx = CanvasRenderingContext2D

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function limb(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, width: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function dot(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
