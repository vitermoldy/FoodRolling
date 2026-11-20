// Every dish, drawn from above on a 100 x 100 canvas centred on (50, 50). The food stays inside a
// radius of about 34 so it sits on a plate; the plate itself is drawn by the caller.
import { makeRng } from '../game/rng.ts'

type Rng = () => number

const f = (n: number) => Math.round(n * 100) / 100

function circle(cx: number, cy: number, r: number, fill: string, extra = '') {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" ${extra}/>`
}
function ellipse(cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') {
  return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" ${extra}/>`
}
function rect(x: number, y: number, w: number, h: number, rx: number, fill: string, extra = '') {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(rx)}" fill="${fill}" ${extra}/>`
}
function path(d: string, fill: string, extra = '') {
  return `<path d="${d}" fill="${fill}" ${extra}/>`
}
function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width: number, extra = '') {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`
}
function g(transform: string, inner: string) {
  return `<g transform="${transform}">${inner}</g>`
}
/** A soft shadow under the food, offset towards the bottom right. */
function shadow(inner: string, dx = 1.6, dy = 2.4) {
  return `<g transform="translate(${dx} ${dy})" opacity="0.18" fill="#2a1a0c">${inner}</g>`
}

/** Small dots scattered inside a circle. */
function scatter(rng: Rng, count: number, cx: number, cy: number, radius: number, r: [number, number], colors: string[], extra = '') {
  let out = ''
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * radius
    out += circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r[0] + rng() * (r[1] - r[0]), colors[Math.floor(rng() * colors.length)], extra)
  }
  return out
}

/** Short grains (rice) scattered inside a circle. */
function grains(rng: Rng, count: number, cx: number, cy: number, radius: number, colors: string[], size = 1.3) {
  let out = ''
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * radius
    out += ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, size * 1.7, size * 0.8, colors[Math.floor(rng() * colors.length)], `transform="rotate(${f(rng() * 180)} ${f(cx + Math.cos(a) * d)} ${f(cy + Math.sin(a) * d)})"`)
  }
  return out
}

/** A leaf with a midrib, pointing along `angle` degrees. */
function leaf(cx: number, cy: number, len: number, angle: number, fill: string, rib = 'rgba(255,255,255,0.35)') {
  const w = len * 0.42
  return g(`translate(${f(cx)} ${f(cy)}) rotate(${f(angle)})`,
    path(`M${f(-len / 2)} 0 Q0 ${f(-w)} ${f(len / 2)} 0 Q0 ${f(w)} ${f(-len / 2)} 0Z`, fill) +
    line(-len / 2 + 1, 0, len / 2 - 1.5, 0, rib, 0.8))
}

