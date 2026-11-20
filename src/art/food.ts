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

/** A wobbly blob around a centre, for sauces, cheese and eggs. */
function blob(rng: Rng, cx: number, cy: number, r: number, wobble: number, points = 9) {
  const pts: [number, number][] = []
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const rr = r * (1 - wobble / 2 + rng() * wobble)
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
  }
  let d = ''
  for (let i = 0; i < points; i++) {
    const p0 = pts[i]
    const p1 = pts[(i + 1) % points]
    const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]
    d += i === 0 ? `M${f(m[0])} ${f(m[1])}` : ''
    const p2 = pts[(i + 2) % points]
    const m2 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
    d += `Q${f(p1[0])} ${f(p1[1])} ${f(m2[0])} ${f(m2[1])}`
  }
  return d + 'Z'
}

/* ---------------------------------- Jepang ---------------------------------- */

function edamame(rng: Rng) {
  let pods = ''
  const spots: [number, number, number][] = [[40, 40, 30], [58, 38, -20], [64, 54, 70], [46, 58, 10], [36, 52, 80], [54, 48, 45], [50, 66, -30], [62, 66, 20], [34, 64, -50]]
  for (const [x, y, a] of spots) {
    pods += g(`translate(${x} ${y}) rotate(${a})`,
      rect(-11, -4.6, 22, 9.2, 4.6, '#7fb446', 'stroke="#577f28" stroke-width="1"') +
      ellipse(-6, 0, 3.4, 2.8, '#a4cf6b') + ellipse(0, 0, 3.4, 2.8, '#a4cf6b') + ellipse(6, 0, 3.4, 2.8, '#a4cf6b') +
      path('M-10 -3 Q0 -6 10 -3', 'none', 'stroke="#c8e59a" stroke-width="0.9" opacity="0.7"'))
  }
  return shadow(circle(50, 52, 31, '#000')) +
    circle(50, 51, 31, '#3a3530') + circle(50, 50, 30, '#4a443e') + circle(50, 51, 25.5, '#2a2622') +
    pods + scatter(rng, 26, 50, 52, 20, [0.5, 0.9], ['#ffffff', '#f2efe6'])
}

function nigiriRice(rng: Rng, y: number, w = 50) {
  return rect(50 - w / 2, y - 8, w, 19, 9, '#f6f2e8', 'stroke="#ded7c6" stroke-width="0.8"') +
    grains(rng, 18, 50, y + 6, 8, ['#e9e3d4', '#ffffff'], 1.1)
}

function tamago(rng: Rng) {
  let out = ''
  for (const y of [36, 64]) {
    out += shadow(rect(23, y - 11, 54, 22, 6, '#000'))
    out += nigiriRice(rng, y)
    out += rect(22, y - 12, 56, 20, 5, '#f4c443', 'stroke="#d9a027" stroke-width="0.9"')
    out += line(28, y - 6, 72, y - 6, 'rgba(176,112,22,0.28)', 1.4) + line(28, y + 1, 72, y + 1, 'rgba(176,112,22,0.22)', 1.2)
    out += rect(45.5, y - 13.5, 9, 23, 1.6, '#1f2b1d')
    out += line(47.5, y - 11, 47.5, y + 7, 'rgba(255,255,255,0.12)', 0.8)
  }
  return out
}

function kappa(rng: Rng) {
  let out = ''
  for (const y of [40, 62]) {
    for (const x of [29, 50, 71]) {
      out += shadow(circle(x, y, 10.5, '#000'))
      out += circle(x, y, 10.5, '#1d281c') + circle(x, y, 8.7, '#f8f5ee')
      out += grains(rng, 7, x, y, 6.5, ['#e8e2d4'], 0.9)
      out += circle(x, y, 3.8, '#5c9a39') + circle(x, y, 2.3, '#b2d98f') + circle(x - 0.6, y - 0.4, 0.6, '#f0f8e2')
    }
  }
  return out
}

function slicedTopping(rng: Rng, y: number, base: string, edge: string, stripe: string, stripes: number) {
  let out = nigiriRice(rng, y, 48)
  out += path(`M23 ${y - 4} Q24 ${y - 13} 36 ${y - 12} L70 ${y - 10} Q79 ${y - 9} 77 ${y + 1} Q75 ${y + 9} 64 ${y + 8} L30 ${y + 6} Q21 ${y + 5} 23 ${y - 4}Z`, base, `stroke="${edge}" stroke-width="0.9"`)
  for (let i = 0; i < stripes; i++) {
    const x = 30 + i * (40 / Math.max(1, stripes - 1)) + rng() * 2
    out += path(`M${f(x)} ${y - 11} Q${f(x + 4)} ${y - 2} ${f(x - 1)} ${y + 6}`, 'none', `stroke="${stripe}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"`)
  }
  out += path(`M28 ${y - 8} Q45 ${y - 12} 70 ${y - 8}`, 'none', 'stroke="rgba(255,255,255,0.45)" stroke-width="1.3" stroke-linecap="round"')
  return out
}

function salmon(rng: Rng) {
  return shadow(rect(22, 25, 56, 50, 10, '#000')) +
    g('rotate(-6 50 50)', slicedTopping(rng, 37, '#f2875a', '#d86a3d', '#ffd8c4', 5) + slicedTopping(rng, 64, '#f2875a', '#d86a3d', '#ffd8c4', 5))
}

function ikura(rng: Rng) {
  let out = ''
  for (const x of [35, 65]) {
    out += shadow(ellipse(x, 50, 15, 18, '#000'))
    out += ellipse(x, 50, 15, 18, '#1d291c', 'stroke="#2f3d2c" stroke-width="1"') + ellipse(x, 50, 12.2, 15, '#d5521b')
    for (let i = 0; i < 16; i++) {
      const a = rng() * Math.PI * 2
      const d = Math.sqrt(rng())
      const cx = x + Math.cos(a) * d * 9.5
      const cy = 50 + Math.sin(a) * d * 12
      out += circle(cx, cy, 3.1, '#ff7a29', 'stroke="#e0571a" stroke-width="0.5"') + circle(cx - 1, cy - 1.1, 0.9, '#fff3e0')
    }
  }
  out += path('M44 26 Q50 20 56 26 Q50 30 44 26Z', '#8fbf5a', 'stroke="#5b8c34" stroke-width="0.8"')
  return out
}

function otoro(rng: Rng) {
  let out = shadow(rect(22, 25, 56, 50, 10, '#000'))
  out += g('rotate(5 50 50)', slicedTopping(rng, 37, '#f1a0a2', '#d97c80', '#fde4e2', 7) + slicedTopping(rng, 64, '#f1a0a2', '#d97c80', '#fde4e2', 7))
  out += path(blob(rng, 79, 77, 5, 0.4), '#9dc240', 'stroke="#76992b" stroke-width="0.7"')
  return out
}

/* ---------------------------------- Italia ---------------------------------- */

function bruschetta(rng: Rng) {
  let out = ''
  const slices: [number, number, number][] = [[30, 50, -14], [50, 47, 3], [70, 52, 16]]
  for (const [x, y, a] of slices) {
    let top = ''
    for (let i = 0; i < 9; i++) {
      const cx = -6 + rng() * 12
      const cy = -12 + rng() * 22
      top += rect(cx - 2.4, cy - 2.4, 4.8, 4.8, 1.2, i % 3 === 0 ? '#b52f1f' : '#d8412d', `transform="rotate(${f(rng() * 90)} ${f(cx)} ${f(cy)})"`)
    }
    top += leaf(-2, -8, 7, 30, '#2f7d32') + leaf(4, 6, 6, -40, '#3b8d3a')
    out += shadow(ellipse(x, y, 12.5, 19, '#000'))
    out += g(`translate(${x} ${y}) rotate(${a})`,
      ellipse(0, 0, 12.5, 19, '#b9783a') + ellipse(0, 0, 10.4, 16.8, '#e5b066') +
      scatter(rng, 8, 0, 0, 9, [0.5, 1], ['#c98e48']) + top +
      ellipse(-4, -9, 4, 2, 'rgba(255,240,180,0.35)'))
  }
  return out
}

function margherita(rng: Rng) {
  let cheese = ''
  const spots: [number, number, number][] = [[38, 38, 7.5], [60, 36, 6.5], [64, 58, 7.5], [42, 62, 7], [52, 50, 6], [30, 52, 5]]
  for (const [x, y, r] of spots) cheese += path(blob(rng, x, y, r, 0.35), '#fff3da', 'stroke="#efdcb3" stroke-width="0.6"')
  return shadow(circle(50, 50, 34, '#000')) +
    circle(50, 50, 34, '#d9a05a', 'stroke="#b97b37" stroke-width="1"') +
    scatter(rng, 9, 50, 50, 32, [1, 1.9], ['#8b5524', '#a5672d']) +
    circle(50, 50, 28, '#c7381f') + circle(50, 50, 28, 'none', 'stroke="#a92a16" stroke-width="1.2"') +
    cheese + leaf(47, 42, 11, -30, '#2a7a30') + leaf(58, 56, 10, 40, '#2f8a35') + leaf(37, 56, 9, 110, '#2a7a30') +
    scatter(rng, 10, 50, 50, 26, [0.4, 0.7], ['#3a6b2a', '#ffffff'])
}

function spaghetti(rng: Rng) {
  let pasta = ''
  for (let i = 0; i < 26; i++) {
    const r = 8 + rng() * 19
    const a0 = rng() * Math.PI * 2
    const a1 = a0 + 1.2 + rng() * 2
    const x0 = 50 + Math.cos(a0) * r
    const y0 = 50 + Math.sin(a0) * r
    const x1 = 50 + Math.cos(a1) * r
    const y1 = 50 + Math.sin(a1) * r
    const arc = `M${f(x0)} ${f(y0)}A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y1)}`
    // A darker edge under each strand keeps the strands apart at small sizes.
    pasta += `<path d="${arc}" fill="none" stroke="#c5953c" stroke-width="3.6" stroke-linecap="round"/>`
    pasta += `<path d="${arc}" fill="none" stroke="${i % 3 === 0 ? '#f7dc8c' : '#efcb6a'}" stroke-width="2.2" stroke-linecap="round"/>`
  }
  return shadow(circle(50, 50, 30, '#000')) + circle(50, 50, 29, '#d7a94c') + pasta +
    path(blob(rng, 50, 49, 12, 0.4), '#c63a22', 'stroke="#a52a16" stroke-width="0.8"') +
    scatter(rng, 6, 50, 49, 7, [1.4, 2.2], ['#d9533a']) +
    scatter(rng, 18, 50, 50, 16, [0.5, 0.9], ['#fff7dc', '#f7eccb']) + leaf(56, 41, 10, -35, '#2c7d32')
}

function ravioli(rng: Rng) {
  let out = path(blob(rng, 50, 50, 31, 0.15, 12), 'rgba(214,160,58,0.45)')
  for (const y of [38, 62]) {
    for (const x of [30, 50, 70]) {
      const a = (rng() - 0.5) * 16
      out += shadow(rect(x - 9.5, y - 9.5, 19, 19, 3, '#000'))
      out += g(`rotate(${f(a)} ${x} ${y})`,
        rect(x - 9.5, y - 9.5, 19, 19, 3, '#f0d391', 'stroke="#d3ac5e" stroke-width="1.6" stroke-dasharray="1.6 1.4"') +
        rect(x - 5.5, y - 5.5, 11, 11, 4.5, '#f8e3ae') + ellipse(x - 2, y - 2.5, 2.6, 1.4, 'rgba(255,255,255,0.55)'))
    }
  }
  out += leaf(40, 50, 10, 20, '#7d9868', 'rgba(255,255,255,0.25)') + leaf(62, 50, 9, -30, '#879f72', 'rgba(255,255,255,0.25)')
  return out + scatter(rng, 10, 50, 50, 26, [0.5, 0.9], ['#5b4a2a'])
}

function lasagna(rng: Rng) {
  const body = rect(23, 28, 54, 44, 4, '#000')
  return shadow(body) + g('rotate(-7 50 50)',
    rect(22, 27, 56, 46, 5, '#b3311c') +
    rect(22, 64, 56, 9, 3, '#f1d79e') + rect(22, 67, 56, 2.4, 1, '#9a2c18') + rect(22, 70.5, 56, 2.5, 1, '#f1d79e') +
