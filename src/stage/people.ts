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
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount))
  const b = Math.max(0, Math.min(255, (n & 255) + amount))
  return `rgb(${r},${g},${b})`
}

/** Torso as a soft trapezoid from the shoulders down to the waist. */
function torso(ctx: Ctx, cx: number, top: number, bottom: number, wTop: number, wBottom: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx - wTop / 2 + 0.06, top)
  ctx.quadraticCurveTo(cx - wTop / 2 - 0.02, top + 0.02, cx - wTop / 2, top + 0.12)
  ctx.lineTo(cx - wBottom / 2, bottom)
  ctx.quadraticCurveTo(cx, bottom + 0.06, cx + wBottom / 2, bottom)
  ctx.lineTo(cx + wTop / 2, top + 0.12)
  ctx.quadraticCurveTo(cx + wTop / 2 + 0.02, top + 0.02, cx + wTop / 2 - 0.06, top)
  ctx.closePath()
  ctx.fill()
}

/** Hair behind the head (long styles), drawn before the head. */
function hairBack(ctx: Ctx, look: Look, hx: number, hy: number, r: number, facing: Facing) {
  if (look.style === 3) {
    ctx.fillStyle = look.hair
    roundRect(ctx, hx - r * 1.08, hy - r * 0.2, r * 2.16, r * 1.75, r * 0.5)
    ctx.fill()
  } else if (look.style === 4) {
    dot(ctx, hx, hy - r * 0.15, r * 1.32, look.hair)
  } else if (look.style === 2 && facing !== 'down') {
    dot(ctx, hx, hy - r * 1.05, r * 0.42, look.hair)
  }
}

/** Hair on top of the head for the given facing. */
function hairFront(ctx: Ctx, look: Look, hx: number, hy: number, r: number, facing: Facing) {
  ctx.fillStyle = look.hair
  if (facing === 'up') {
    // Back of the head: hair covers it all.
    dot(ctx, hx, hy, r * 1.02, look.hair)
    if (look.style === 2) dot(ctx, hx, hy - r * 0.55, r * 0.45, shade(look.hair, 12))
    return
  }
  if (facing === 'down') {
    ctx.beginPath()
    if (look.style === 1) {
      ctx.ellipse(hx, hy - r * 0.2, r * 1.1, r * 0.95, 0, Math.PI * 0.98, Math.PI * 2.02)
      ctx.lineTo(hx + r * 1.08, hy + r * 0.45)
      ctx.lineTo(hx + r * 0.75, hy + r * 0.45)
      ctx.lineTo(hx + r * 0.7, hy - r * 0.15)
      ctx.lineTo(hx - r * 0.7, hy - r * 0.15)
      ctx.lineTo(hx - r * 0.75, hy + r * 0.45)
      ctx.lineTo(hx - r * 1.08, hy + r * 0.45)
    } else {
      ctx.ellipse(hx, hy - r * 0.18, r * 1.04, r * 0.9, 0, Math.PI * 1.02, Math.PI * 1.98)
      ctx.quadraticCurveTo(hx + r * 0.2, hy - r * 0.55, hx - r * 0.95, hy - r * 0.05)
    }
    ctx.closePath()
    ctx.fill()
    if (look.style === 2) dot(ctx, hx, hy - r * 1.1, r * 0.4, look.hair)
    return
  }
  // Side view: hair over the top and the back half.
  const dir = facing === 'right' ? 1 : -1
  ctx.beginPath()
  ctx.ellipse(hx - dir * r * 0.08, hy - r * 0.12, r * 1.05, r * 0.95, 0, dir > 0 ? Math.PI * 0.55 : Math.PI * -0.55, dir > 0 ? Math.PI * 1.95 : Math.PI * 0.95, dir < 0)
  ctx.lineTo(hx + dir * r * 0.15, hy - r * 0.35)
  ctx.closePath()
  ctx.fill()
  if (look.style === 2) dot(ctx, hx - dir * r * 0.9, hy - r * 0.55, r * 0.4, look.hair)
}

function face(ctx: Ctx, look: Look, hx: number, hy: number, r: number, facing: Facing, mouthOpen: boolean) {
  const ink = '#2a1d17'
  if (facing === 'down') {
    dot(ctx, hx - r * 0.36, hy + r * 0.05, r * 0.11, ink)
    dot(ctx, hx + r * 0.36, hy + r * 0.05, r * 0.11, ink)
    ctx.fillStyle = 'rgba(230,110,90,0.28)'
    ctx.beginPath()
    ctx.ellipse(hx - r * 0.58, hy + r * 0.32, r * 0.16, r * 0.09, 0, 0, Math.PI * 2)
    ctx.ellipse(hx + r * 0.58, hy + r * 0.32, r * 0.16, r * 0.09, 0, 0, Math.PI * 2)
    ctx.fill()
    if (mouthOpen) {
      ctx.fillStyle = '#7a2e22'
      ctx.beginPath()
      ctx.ellipse(hx, hy + r * 0.45, r * 0.13, r * 0.11, 0, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.strokeStyle = ink
      ctx.lineWidth = r * 0.08
      ctx.beginPath()
      ctx.arc(hx, hy + r * 0.3, r * 0.17, Math.PI * 0.2, Math.PI * 0.8)
      ctx.stroke()
    }
    if (look.glasses) {
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = r * 0.07
      ctx.beginPath()
      ctx.arc(hx - r * 0.36, hy + r * 0.05, r * 0.22, 0, Math.PI * 2)
      ctx.moveTo(hx + r * 0.58, hy + r * 0.05)
      ctx.arc(hx + r * 0.36, hy + r * 0.05, r * 0.22, 0, Math.PI * 2)
      ctx.moveTo(hx - r * 0.14, hy + r * 0.02)
      ctx.lineTo(hx + r * 0.14, hy + r * 0.02)
      ctx.stroke()
    }
    return
  }
  if (facing === 'up') {
    // Ears peeking out from the hair.
    ctx.fillStyle = look.skin
    ctx.beginPath()
    ctx.ellipse(hx - r * 0.98, hy + r * 0.12, r * 0.16, r * 0.22, 0, 0, Math.PI * 2)
    ctx.ellipse(hx + r * 0.98, hy + r * 0.12, r * 0.16, r * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  const dir = facing === 'right' ? 1 : -1
  dot(ctx, hx + dir * r * 0.5, hy + r * 0.02, r * 0.11, ink)
  ctx.fillStyle = look.skin
  ctx.beginPath()
  ctx.ellipse(hx + dir * r * 0.98, hy + r * 0.2, r * 0.14, r * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = mouthOpen ? '#7a2e22' : ink
  ctx.beginPath()
  ctx.ellipse(hx + dir * r * 0.7, hy + r * 0.48, r * (mouthOpen ? 0.1 : 0.12), r * (mouthOpen ? 0.09 : 0.04), 0, 0, Math.PI * 2)
  ctx.fill()
  if (look.glasses) {
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = r * 0.07
    ctx.beginPath()
    ctx.arc(hx + dir * r * 0.52, hy + r * 0.02, r * 0.22, 0, Math.PI * 2)
    ctx.moveTo(hx + dir * r * 0.3, hy)
    ctx.lineTo(hx - dir * r * 0.4, hy - r * 0.05)
    ctx.stroke()
  }
}

function hat(ctx: Ctx, chef: ChefStyle, hx: number, hy: number, r: number, facing: Facing) {
  const side = facing === 'left' || facing === 'right'
  const dir = facing === 'left' ? -1 : 1
  switch (chef.hat) {
    case 'hachimaki': {
      ctx.fillStyle = '#f4f1ea'
      roundRect(ctx, hx - r * 1.04, hy - r * 0.62, r * 2.08, r * 0.34, r * 0.12)
