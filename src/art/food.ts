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
    rect(24, 29, 52, 36, 4, '#e9a74b') +
    scatter(rng, 14, 50, 46, 17, [1.2, 2.6], ['#b8652a', '#c97b34', '#a95421']) +
    scatter(rng, 10, 50, 46, 16, [0.8, 1.6], ['#f7d27e']) +
    path(blob(rng, 34, 34, 4, 0.5), '#c7381f') + path(blob(rng, 68, 58, 3.5, 0.5), '#c7381f')) +
    leaf(58, 42, 10, -25, '#2c7d32')
}

function tiramisu(rng: Rng) {
  return shadow(rect(26, 26, 48, 50, 4, '#000')) +
    rect(26, 66, 48, 9, 2, '#f5ead2') + rect(26, 69, 48, 2.6, 1, '#a46f3d') + rect(26, 72.5, 48, 2.5, 1, '#f5ead2') +
    rect(26, 26, 48, 42, 4, '#6b4227') +
    scatter(rng, 70, 50, 47, 23, [0.3, 0.8], ['#4e2d18', '#87583a', '#5a361f']) +
    g('rotate(30 67 32)', ellipse(67, 32, 4.4, 3, '#3b2213') + line(63.6, 32, 70.4, 32, '#6c4127', 0.9)) +
    g('rotate(-20 35 58)', ellipse(35, 58, 4, 2.8, '#3b2213') + line(32, 58, 38, 58, '#6c4127', 0.9)) +
    leaf(58, 54, 9, -40, '#4f9a43')
}

/* -------------------------------- Indonesia -------------------------------- */

function cendol(rng: Rng) {
  let worms = ''
  for (let i = 0; i < 18; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * 19
    const x = 50 + Math.cos(a) * d
    const y = 50 + Math.sin(a) * d
    const t = rng() * Math.PI
    worms += `<path d="M${f(x - Math.cos(t) * 4)} ${f(y - Math.sin(t) * 4)}Q${f(x + 2)} ${f(y - 2)} ${f(x + Math.cos(t) * 4)} ${f(y + Math.sin(t) * 4)}" fill="none" stroke="${i % 3 ? '#5db346' : '#79c35d'}" stroke-width="3.4" stroke-linecap="round"/>`
  }
  return shadow(circle(50, 50, 31, '#000')) +
    circle(50, 50, 31, '#dff1f6', 'stroke="#b5d8e3" stroke-width="2"') + circle(50, 50, 27, '#f3ead6') +
    `<path d="M30 46 Q42 34 54 44 T72 52" fill="none" stroke="#8a491b" stroke-width="3.2" opacity="0.75" stroke-linecap="round"/>` +
    `<path d="M33 60 Q46 52 58 62 T70 64" fill="none" stroke="#9b5622" stroke-width="2.4" opacity="0.6" stroke-linecap="round"/>` +
    worms +
    rect(56, 33, 10, 10, 2.5, 'rgba(255,255,255,0.6)', 'stroke="#e3f4f8" stroke-width="0.8" transform="rotate(18 61 38)"') +
    rect(33, 58, 9, 9, 2.5, 'rgba(255,255,255,0.55)', 'stroke="#e3f4f8" stroke-width="0.8" transform="rotate(-12 37 62)"') +
    circle(64, 62, 3.4, '#e2413a') + circle(64, 62, 1.8, '#fff6f0') +
    ellipse(38, 32, 9, 3.5, 'rgba(255,255,255,0.45)', 'transform="rotate(-30 38 32)"')
}

function sate(rng: Rng) {
  let out = path(blob(rng, 36, 66, 15, 0.25), '#b6702c', 'stroke="#9a5a20" stroke-width="0.8"') +
    `<path d="M26 64 Q34 58 42 66 Q46 70 40 72" fill="none" stroke="#3a1c0b" stroke-width="2.4" stroke-linecap="round"/>` +
    scatter(rng, 8, 36, 66, 10, [0.6, 1.1], ['#e9c08a', '#7a3f16'])
  for (let k = 0; k < 4; k++) {
    const ox = k * 8 - 12
    const oy = k * 6 - 9
    let meat = ''
    for (let i = 0; i < 4; i++) {
      const t = 0.18 + i * 0.19
      const x = 18 + ox + t * 60
      const y = 74 + oy - t * 50
      meat += g(`rotate(-40 ${f(x)} ${f(y)})`, rect(x - 5, y - 4.4, 10, 8.8, 3, '#a2562a', 'stroke="#6b3214" stroke-width="0.7"') +
        circle(x - 1.5, y - 1.5, 1.4, '#5c2a10') + circle(x + 2, y + 1.6, 1.1, '#6a3315') + ellipse(x - 1, y - 2.6, 2.6, 0.9, 'rgba(255,190,120,0.45)'))
    }
    out += shadow(line(16 + ox, 76 + oy, 82 + ox, 22 + oy, '#000', 6))
    out += line(16 + ox, 76 + oy, 82 + ox, 22 + oy, '#d7b27a', 1.8) + meat
  }
  return out + circle(72, 70, 2.6, 'none', 'stroke="#c99bc0" stroke-width="1.3"') + circle(77, 66, 2.2, 'none', 'stroke="#c99bc0" stroke-width="1.2"')
}

function nasgor(rng: Rng) {
  return shadow(circle(48, 52, 27, '#000')) +
    path(blob(rng, 48, 52, 27, 0.12, 14), '#c0803f') +
    grains(rng, 70, 48, 52, 24, ['#d9a061', '#a96a31', '#e2b47a', '#8f5526'], 1.25) +
    scatter(rng, 6, 48, 52, 20, [0.9, 1.4], ['#d2422e', '#4f8a36']) +
    path(blob(rng, 50, 45, 14, 0.35, 10), '#fffaf0', 'stroke="#efe3cc" stroke-width="0.7"') +
    circle(51, 45, 6, '#f6ae17') + circle(49.5, 43.6, 1.8, 'rgba(255,255,255,0.7)') +
    path(blob(rng, 22, 36, 9, 0.3, 11), '#f6e5bd', 'stroke="#e2c88f" stroke-width="0.8"') +
    scatter(rng, 7, 22, 36, 6, [0.4, 0.8], ['#e0c48a']) +
    circle(77, 52, 6, '#e8f3d0', 'stroke="#5c9a3c" stroke-width="1.6"') + circle(73, 64, 5.5, '#e8f3d0', 'stroke="#5c9a3c" stroke-width="1.5"') +
    circle(74, 39, 6, '#d94a33') + circle(74, 39, 3.6, '#f07a5c') + scatter(rng, 4, 74, 39, 3, [0.4, 0.6], ['#ffe0a0'])
}

function gado(rng: Rng) {
  let out = shadow(circle(50, 50, 31, '#000')) + path(blob(rng, 50, 50, 31, 0.14, 13), '#cfe3a5')
  out += scatter(rng, 7, 50, 50, 22, [5, 8], ['#bcd98d', '#d9ebb7'])
  for (let i = 0; i < 6; i++) {
    const x = 30 + rng() * 40
    const y = 30 + rng() * 40
    const a = rng() * 180
    out += g(`rotate(${f(a)} ${f(x)} ${f(y)})`, rect(x - 9, y - 1.6, 18, 3.2, 1.6, '#4c9636'))
  }
  for (const [x, y] of [[38, 40], [60, 62], [56, 36]] as [number, number][]) out += rect(x - 4.5, y - 4.5, 9, 9, 1.5, '#efc987', 'stroke="#c99a52" stroke-width="0.8"')
  for (const [x, y] of [[40, 63], [64, 46]] as [number, number][]) out += rect(x - 6, y - 4, 12, 8, 1.5, '#c9a46a') + scatter(rng, 5, x, y, 3.5, [0.6, 1], ['#f2dfb3'])
  for (const [x, y] of [[28, 52], [70, 30]] as [number, number][]) out += circle(x, y, 6, '#f6f3e6', 'stroke="#9fc275" stroke-width="1.6"')
  out += `<path d="M24 46 Q36 38 48 48 T74 50 M30 62 Q44 56 58 64 T76 64" fill="none" stroke="#a6612a" stroke-width="4.2" stroke-linecap="round" opacity="0.92"/>`
  return out + scatter(rng, 14, 50, 50, 24, [0.6, 1.1], ['#7e4317', '#9b5a24'])
}

function ayampop(rng: Rng) {
  // A drumstick: round meaty end at the top left, a narrowing shaft and the bone knob at the bottom right.
  const leg = 'M24 40 Q22 22 40 22 Q56 22 60 38 Q62 46 66 52 L72 60 Q66 66 60 62 L52 56 Q44 58 34 56 Q24 52 24 40Z'
  return shadow(path(leg, '#000')) +
    path(blob(rng, 66, 76, 10, 0.35), '#2f6b2a') + leaf(60, 80, 10, 20, '#3c7d32') + leaf(76, 72, 9, -60, '#357a2e') +
    path(leg, '#f0dfbe', 'stroke="#d2b47a" stroke-width="1.2"') +
    rect(64, 56, 12, 6, 3, '#f6f1e6', 'transform="rotate(42 70 59)" stroke="#d9cfbc" stroke-width="0.8"') +
    circle(76, 66, 4, '#f8f4ea', 'stroke="#d9cfbc" stroke-width="0.8"') + circle(73, 68.5, 3.4, '#f8f4ea', 'stroke="#d9cfbc" stroke-width="0.8"') +
    path('M30 34 Q40 26 52 32', 'none', 'stroke="#fbf3df" stroke-width="3.5" stroke-linecap="round" opacity="0.85"') +
    scatter(rng, 9, 40, 40, 12, [1, 2.2], ['#e3c58c', '#d9b676']) +
    scatter(rng, 14, 40, 40, 13, [0.6, 1.1], ['#f8ecd2', '#e6cf9f']) +
    path(blob(rng, 33, 30, 8.5, 0.4), '#d1301c', 'stroke="#a8220f" stroke-width="0.7"') +
    scatter(rng, 7, 33, 30, 5, [0.5, 0.9], ['#f49a3a', '#ffcf7a'])
}

function rendang(rng: Rng) {
  let out = ''
  const chunks: [number, number, number][] = [[40, 40, 11], [61, 40, 10], [50, 58, 12], [34, 60, 9], [66, 60, 9]]
  for (const [x, y, r] of chunks) out += shadow(path(blob(rng, x, y, r, 0.45, 7), '#000'))
  out += path(blob(rng, 50, 51, 27, 0.2, 12), 'rgba(110,52,20,0.55)')
  for (const [x, y, r] of chunks) {
    out += path(blob(rng, x, y, r, 0.45, 7), '#5a2b13', 'stroke="#3a1a09" stroke-width="0.9"')
    out += path(blob(rng, x - 2, y - 2.5, r * 0.45, 0.5, 6), '#7b4421')
  }
  out += scatter(rng, 40, 50, 51, 25, [0.5, 1.2], ['#8d552a', '#a86a35', '#4a220d'])
  out += circle(28, 44, 3.2, 'none', 'stroke="#c9351f" stroke-width="1.6"') + circle(70, 50, 2.8, 'none', 'stroke="#c9351f" stroke-width="1.4"')
  out += line(44, 30, 52, 27, '#3c6b2c', 1.6) + line(58, 68, 64, 72, '#3c6b2c', 1.6) + line(26, 54, 28, 62, '#3c6b2c', 1.4)
  return out
}

/* --------------------------------- Meksiko --------------------------------- */

function churros(rng: Rng) {
  let out = ''
  for (let i = 0; i < 4; i++) {
    const y = 30 + i * 11
    const a = -18 + i * 4
    out += shadow(rect(14, y - 4.5, 56, 9, 4.5, '#000'))
    out += g(`rotate(${a} 42 ${y})`,
      rect(14, y - 4.5, 56, 9, 4.5, '#d6943d', 'stroke="#b2722a" stroke-width="0.8"') +
      line(17, y - 2, 67, y - 2, '#f0bd6c', 1.1) + line(17, y + 1, 67, y + 1, '#c07e30', 1) + line(17, y + 3, 67, y + 3, '#f0bd6c', 0.8) +
      scatter(rng, 10, 42, y, 4, [0.4, 0.8], ['#fff8ec', '#f6e6c8']))
  }
  out += shadow(circle(74, 68, 12, '#000')) + circle(74, 68, 12, '#f4efe6', 'stroke="#ddd3c2" stroke-width="1"') + circle(74, 68, 9.4, '#4b2312') + ellipse(71, 65, 3.4, 1.6, 'rgba(255,255,255,0.4)')
  return out
}

function nachos(rng: Rng) {
  let out = ''
  for (let i = 0; i < 11; i++) {
    const a = rng() * Math.PI * 2
    const d = Math.sqrt(rng()) * 21
    const x = 50 + Math.cos(a) * d
    const y = 50 + Math.sin(a) * d
    const rot = rng() * 360
    out += g(`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`, shadow(path('M0 -10 L9 7 L-9 7Z', '#000'), 1, 1.6) + path('M0 -10 L9 7 L-9 7Z', i % 2 ? '#f1c35a' : '#eab64b', 'stroke="#c8902e" stroke-width="0.8" stroke-linejoin="round"'))
  }
  out += path(blob(rng, 46, 46, 8, 0.6), '#ffb21f') + path(blob(rng, 60, 58, 6, 0.6), '#ffb21f') + path(blob(rng, 36, 60, 5, 0.6), '#ffbd34')
  for (const [x, y] of [[56, 38], [40, 54], [64, 64]] as [number, number][]) out += circle(x, y, 3.6, '#86c053', 'stroke="#3e8a35" stroke-width="1.6"') + scatter(rng, 3, x, y, 1.6, [0.4, 0.6], ['#f4f0d2'])
  out += path(blob(rng, 64, 44, 7.5, 0.35), '#86b84a', 'stroke="#5f8d2e" stroke-width="0.8"') + scatter(rng, 5, 64, 44, 5, [0.6, 1], ['#a7cf6a', '#d8412d'])
  return out
}

function taco(rng: Rng) {
  let out = ''
  for (const [x, a] of [[30, -10], [50, 0], [70, 10]] as [number, number][]) {
    let filling = ''
    for (let i = 0; i < 7; i++) {
      const y = -18 + i * 6 + rng() * 2
      filling += circle((rng() - 0.5) * 5, y, 2.2, '#c47a3e') + rect((rng() - 0.5) * 5 - 1.5, y + 2, 3, 3, 0.6, '#ffd24a')
    }
    filling += scatter(rng, 8, 0, 0, 14, [0.6, 1], ['#ffffff', '#f2e9ff']) + scatter(rng, 7, 0, 0, 15, [0.7, 1.1], ['#3f9a3a', '#2f7d2c'])
    out += shadow(ellipse(x, 50, 10, 28, '#000'))
    out += g(`translate(${x} 50) rotate(${a})`,
      ellipse(0, 0, 10, 28, '#ecd08d', 'stroke="#c9a35c" stroke-width="1"') + ellipse(0, 0, 6, 24, '#a35a2a') + filling +
      scatter(rng, 6, 0, 0, 22, [0.6, 1.2], ['#c9a35c']))
  }
  return out + path('M76 74 A8 8 0 0 1 88 74 Z', '#9ccc48', 'stroke="#6f9a2f" stroke-width="0.8"')
}

function quesadilla(rng: Rng) {
  let out = ''
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * Math.PI * 2 + 0.06
    const a1 = ((i + 1) / 4) * Math.PI * 2 - 0.06
    const mid = (a0 + a1) / 2
    const ox = Math.cos(mid) * 2.5
    const oy = Math.sin(mid) * 2.5
    const cx = 50 + ox
    const cy = 50 + oy
    const r = 30
    const d = `M${f(cx)} ${f(cy)}L${f(cx + Math.cos(a0) * r)} ${f(cy + Math.sin(a0) * r)}A${r} ${r} 0 0 1 ${f(cx + Math.cos(a1) * r)} ${f(cy + Math.sin(a1) * r)}Z`
    out += shadow(path(d, '#000'))
    out += path(d, '#e8b962', 'stroke="#c18a3a" stroke-width="1"')
    for (let k = 0; k < 3; k++) {
      const t = 0.35 + k * 0.22
      out += line(cx + Math.cos(a0 + 0.15) * r * t, cy + Math.sin(a0 + 0.15) * r * t, cx + Math.cos(a1 - 0.15) * r * t, cy + Math.sin(a1 - 0.15) * r * t, '#b47a2e', 1.8, 'opacity="0.75"')
    }
    out += circle(cx + Math.cos(a0 + 0.05) * 18, cy + Math.sin(a0 + 0.05) * 18, 2.6, '#ffd23f')
  }
  return out + scatter(rng, 6, 50, 50, 6, [1.2, 2], ['#ffd23f', '#d8412d'])
}

function burrito(rng: Rng) {
  return shadow(rect(14, 37, 68, 28, 14, '#000')) +
    g('rotate(-22 50 50)',
      rect(14, 36, 68, 28, 14, '#efd9a6', 'stroke="#c9ab70" stroke-width="1"') +
      `<path d="M30 37 Q34 50 30 63 M46 36 Q50 50 46 64" fill="none" stroke="#d6b97c" stroke-width="1.4"/>` +
      scatter(rng, 9, 40, 50, 11, [0.7, 1.4], ['#d6b071', '#c99d58']) +
      ellipse(78, 50, 7, 12.5, '#f6f0e2', 'stroke="#c9ab70" stroke-width="1.2"') +
      scatter(rng, 9, 78, 50, 6, [1, 1.8], ['#7a2a1e', '#a0522d', '#ffffff', '#4f8a36'])) +
    path(blob(rng, 30, 74, 7, 0.4), '#d8402e') + scatter(rng, 5, 30, 74, 4, [0.6, 1], ['#ffffff', '#3f9a3a'])
}

function enchiladas(rng: Rng) {
  let rolls = ''
  for (const y of [36, 50, 64]) rolls += rect(20, y - 7, 60, 14, 7, '#e3c27c', 'stroke="#c69c55" stroke-width="0.8"')
  return shadow(rect(18, 27, 64, 46, 12, '#000')) + rolls +
    path(blob(rng, 50, 50, 25, 0.25, 12), '#b42c1e', 'opacity="0.95"') +
    `<path d="M24 43 L76 43 M24 57 L76 57" stroke="#8f1f14" stroke-width="1.6" opacity="0.6"/>` +
    path(blob(rng, 42, 44, 7, 0.5), '#ffd47a') + path(blob(rng, 58, 56, 6, 0.5), '#ffd47a') + path(blob(rng, 62, 40, 4.5, 0.5), '#ffd98a') +
    `<path d="M28 36 L36 40 L44 34 L52 40 L60 34 L68 40 M30 62 L38 58 L46 64 L54 58 L62 64" fill="none" stroke="#fff8ec" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    scatter(rng, 12, 50, 50, 22, [0.7, 1.1], ['#3f9a3a', '#2f7d2c'])
}

/* ---------------------------------- India ---------------------------------- */

function samosa(rng: Rng) {
  let out = ''
  for (const [x, y, a] of [[38, 46, -12], [60, 56, 24]] as [number, number, number][]) {
    const tri = 'M0 -17 Q2 -16 16 10 Q16 13 12 13 L-12 13 Q-16 13 -16 10 Q-2 -16 0 -17Z'
    out += g(`translate(${x} ${y}) rotate(${a})`,
      shadow(path(tri, '#000')) + path(tri, '#d8a04a', 'stroke="#b17426" stroke-width="1.2"') +
      scatter(rng, 9, 0, 2, 9, [0.8, 1.6], ['#ebbd6a', '#c98a35']) +
      `<path d="M-12 11 L12 11" stroke="#b17426" stroke-width="1.6" stroke-dasharray="1.5 1.8"/>`)
  }
  out += shadow(circle(74, 30, 9.5, '#000')) + circle(74, 30, 9.5, '#f3efe6', 'stroke="#d8d1c2" stroke-width="1"') + circle(74, 30, 7.4, '#5aa548') + scatter(rng, 4, 74, 30, 5, [0.5, 0.8], ['#8fd07a'])
  return out
}

function naan(rng: Rng) {
  const shape = 'M50 16 Q74 24 76 50 Q76 80 50 84 Q24 80 24 50 Q26 24 50 16Z'
  let char = ''
  for (let i = 0; i < 10; i++) char += path(blob(rng, 34 + rng() * 32, 26 + rng() * 52, 2 + rng() * 3, 0.6, 6), i % 2 ? '#a7692b' : '#8c5520')
  return shadow(path(shape, '#000')) + path(shape, '#ecc58c', 'stroke="#c99a58" stroke-width="1.2"') +
    scatter(rng, 12, 50, 50, 22, [1.5, 3], ['#f5d9a8']) + char +
    path('M36 30 Q50 22 64 32', 'none', 'stroke="rgba(255,244,200,0.6)" stroke-width="4" stroke-linecap="round"') +
    scatter(rng, 18, 50, 52, 20, [0.6, 1.1], ['#4d8a35', '#f8f1dc'])
}

function dal(rng: Rng) {
  return shadow(circle(50, 50, 31, '#000')) +
    circle(50, 50, 31, '#b8702f', 'stroke="#8f521d" stroke-width="1.2"') + circle(50, 50, 28.5, '#d18a45') + circle(50, 50, 25, '#e6ad38') +
    `<path d="M32 50 Q40 36 54 40 Q66 44 62 56 Q58 64 48 60" fill="none" stroke="#f6d27a" stroke-width="2.4" stroke-linecap="round"/>` +
    scatter(rng, 7, 50, 50, 18, [1.6, 2.6], ['#ffd65a']) +
    g('rotate(30 42 44)', ellipse(42, 44, 4.5, 1.5, '#b2261b')) + g('rotate(-20 60 58)', ellipse(60, 58, 4.2, 1.4, '#b2261b')) +
    scatter(rng, 24, 50, 50, 20, [0.4, 0.8], ['#5b3a1a']) +
    leaf(56, 40, 6, 20, '#3f8a35') + leaf(40, 58, 5.5, -30, '#3f8a35')
}

function biryani(rng: Rng) {
  return shadow(circle(50, 52, 29, '#000')) +
    path(blob(rng, 50, 52, 29, 0.12, 14), '#f6e9c6') +
    grains(rng, 90, 50, 52, 26, ['#fbf3dc', '#f2c24f', '#e8892e', '#fffaf0', '#f7e2a8'], 1.15) +
    path(blob(rng, 40, 46, 7, 0.4), '#b5531f', 'stroke="#7d3412" stroke-width="0.8"') +
    path(blob(rng, 60, 58, 6.5, 0.4), '#b5531f', 'stroke="#7d3412" stroke-width="0.8"') +
    path(blob(rng, 58, 40, 5.5, 0.4), '#c0602a', 'stroke="#7d3412" stroke-width="0.8"') +
    `<path d="M30 60 q4 -3 8 0 M44 66 q4 -3 8 0 M64 46 q3 -3 7 0 M36 36 q4 -2 7 1" fill="none" stroke="#8a4a1a" stroke-width="1.6" stroke-linecap="round"/>` +
    leaf(50, 46, 7, 30, '#3f9a43') + leaf(68, 64, 6, -40, '#3f9a43') +
    ellipse(30, 48, 6, 5, '#fffdf6', 'stroke="#ece5d2" stroke-width="0.6"') + circle(30, 48, 2.8, '#f2b62a')
}

function butterchicken(rng: Rng) {
  let chunks = ''
  for (const [x, y] of [[42, 42], [60, 46], [46, 60], [58, 62], [36, 54]] as [number, number][]) chunks += path(blob(rng, x, y, 5.5, 0.5, 7), '#c2602a', 'stroke="#9a4418" stroke-width="0.7"')
  return shadow(circle(50, 50, 31, '#000')) +
    circle(50, 50, 31, '#f3efe7', 'stroke="#dcd5c8" stroke-width="1.2"') + circle(50, 50, 26, '#e1712b') +
    chunks + `<path d="M30 48 Q40 34 56 40 Q70 46 64 58 Q58 68 44 64" fill="none" stroke="#fff6ea" stroke-width="2.6" stroke-linecap="round"/>` +
    circle(58, 52, 2.8, '#ffe08a') + scatter(rng, 12, 50, 50, 20, [0.6, 1], ['#3f8a35', '#2f7d2c'])
}

function thali(rng: Rng) {
  const bowls: [string, string][] = [['#e6ad38', '#f6d27a'], ['#e1712b', '#f39a5a'], ['#4f8a3a', '#7fb35f'], ['#f6f2e6', '#ffffff'], ['#b8321f', '#da5a3f'], ['#8a5a2a', '#a8763f']]
  let out = shadow(circle(50, 50, 37, '#000')) + circle(50, 50, 37, '#c7cbd0', 'stroke="#a9aeb4" stroke-width="1.2"') + circle(50, 50, 34, '#dfe2e6')
  bowls.forEach(([c, hi], i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2
    const x = 50 + Math.cos(a) * 22
    const y = 50 + Math.sin(a) * 22
    out += circle(x + 0.8, y + 1.2, 9, 'rgba(0,0,0,0.15)') + circle(x, y, 9, '#b7bcc2') + circle(x, y, 7.3, c) + ellipse(x - 2, y - 2, 2.6, 1.4, hi)
  })
  out += path(blob(rng, 50, 50, 10, 0.2), '#fbf6ea') + grains(rng, 18, 50, 50, 8, ['#ffffff', '#ece5d2'], 1)
  return out + scatter(rng, 4, 50, 50, 5, [0.6, 0.9], ['#3f8a35'])
}

/* --------------------------------- Prancis --------------------------------- */

function macaron(rng: Rng) {
  const shells: [number, number, string, string][] = [[38, 40, '#a8c97b', '#8fb062'], [62, 42, '#e8778e', '#cf5c74'], [50, 63, '#f1e1bc', '#d8c69c']]
  let out = ''
  for (const [x, y, c, e] of shells) {
    out += shadow(circle(x, y, 13.5, '#000'))
    out += circle(x, y, 13.5, e) + circle(x, y, 12, c) + ellipse(x - 3, y - 4, 6, 3.2, 'rgba(255,255,255,0.4)')
    out += scatter(rng, 10, x, y + 11.5, 2, [0.5, 0.9], [e])
  }
  return out
}

function croissant(rng: Rng) {
  // One crescent body with tapered horns, then the rolled layers as curved bands across it.
  const body = 'M12 66 Q14 48 28 38 Q40 28 50 28 Q60 28 72 38 Q86 48 88 66 Q80 62 72 64 Q62 70 50 70 Q38 70 28 64 Q20 62 12 66Z'
  let out = shadow(path(body, '#000')) + path(body, '#d68a37', 'stroke="#a8621e" stroke-width="1.2"')
  for (const x of [24, 36, 50, 64, 76]) {
    const dx = Math.abs(x - 50)
    const top = 30 + dx * 0.42
    const bottom = 69 - dx * 0.2
    const bend = x < 50 ? -4 : x > 50 ? 4 : 0
    out += `<path d="M${x} ${f(top + 1)} Q${x + bend} ${f((top + bottom) / 2)} ${x} ${f(bottom - 1)}" fill="none" stroke="#a8621e" stroke-width="1.5" stroke-linecap="round"/>`
  }
  out += path('M32 40 Q50 30 68 40 Q60 48 50 48 Q40 48 32 40Z', '#f0b25a', 'opacity="0.85"')
  out += path('M38 37 Q50 32 62 37', 'none', 'stroke="rgba(255,244,214,0.8)" stroke-width="2.2" stroke-linecap="round"')
  return out + scatter(rng, 6, 50, 46, 12, [0.4, 0.7], ['#f8d38a'])
}

function crepe(rng: Rng) {
  const shape = 'M22 70 L22 32 Q50 22 76 46 Q60 66 22 70Z'
  let out = shadow(path(shape, '#000')) + path(shape, '#ecc27f', 'stroke="#c99752" stroke-width="1.2"')
  for (let i = 0; i < 14; i++) out += path(blob(rng, 26 + rng() * 40, 34 + rng() * 30, 1.6 + rng() * 2, 0.6, 6), '#c98e48', 'opacity="0.7"')
  out += `<path d="M22 32 Q40 40 46 66" fill="none" stroke="#d9a862" stroke-width="1.4"/>`
  for (const [x, y, a] of [[60, 70, -10], [72, 60, 30], [70, 76, 60], [80, 70, 10]] as [number, number, number][]) {
    out += g(`translate(${x} ${y}) rotate(${a})`, path('M0 -6 Q6 -7 6 0 Q5 6 0 8 Q-5 6 -6 0 Q-6 -7 0 -6Z', '#d8343f', 'stroke="#ad1f2c" stroke-width="0.6"') + scatter(rng, 5, 0, 1, 4, [0.35, 0.5], ['#f7d96a']) + path('M-3 -6 L0 -9 L3 -6Z', '#4f9a43'))
  }
  out += path(blob(rng, 34, 56, 6, 0.4), '#fffaf0', 'stroke="#efe6d6" stroke-width="0.6"')
  return out + scatter(rng, 30, 46, 48, 22, [0.3, 0.6], ['#ffffff'])
}

function quiche(rng: Rng) {
  const a0 = -Math.PI / 2 - 0.5
  const a1 = -Math.PI / 2 + 0.5
  const cx = 50
  const cy = 76
  const r = 52
  const p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r]
  const p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]
  const shape = `M${cx} ${cy}L${f(p0[0])} ${f(p0[1])}A${r} ${r} 0 0 1 ${f(p1[0])} ${f(p1[1])}Z`
  const inner = `M${cx} ${cy - 5}L${f(p0[0] + 4)} ${f(p0[1] + 6)}A${r - 7} ${r - 7} 0 0 1 ${f(p1[0] - 4)} ${f(p1[1] + 6)}Z`
  return shadow(path(shape, '#000')) + path(shape, '#d4a058', 'stroke="#b07f3c" stroke-width="1.2"') +
    `<path d="M${f(p0[0])} ${f(p0[1])}A${r} ${r} 0 0 1 ${f(p1[0])} ${f(p1[1])}" fill="none" stroke="#e8bd76" stroke-width="3" stroke-dasharray="3 2.2"/>` +
    path(inner, '#f0cd70') +
    scatter(rng, 12, 50, 46, 12, [1, 2.2], ['#4d7f2f', '#3e6d26']) +
    scatter(rng, 9, 50, 46, 13, [1.2, 2.4], ['#c98c3b', '#d9a24d'])
}

function brulee(rng: Rng) {
  let flute = ''
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    flute += circle(50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, 3.2, '#f6f5f1')
  }
  return shadow(circle(50, 50, 32, '#000')) + flute + circle(50, 50, 30.5, '#fbfbf8', 'stroke="#e6e2d8" stroke-width="1"') +
    `<defs><radialGradient id="caramel" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#e9b65c"/><stop offset="1" stop-color="#b8731f"/></radialGradient></defs>` +
    circle(50, 50, 25.5, 'url(#caramel)') +
    `<path d="M34 44 L44 50 L40 60 M44 50 L56 46 L64 54 M56 46 L58 36" fill="none" stroke="#8f5418" stroke-width="1.1" stroke-linecap="round"/>` +
    scatter(rng, 7, 62, 38, 3.6, [1.8, 2.3], ['#c2253c', '#d63a4f']) + leaf(70, 42, 8, -30, '#4f9a43') +
    ellipse(40, 38, 7, 2.6, 'rgba(255,240,200,0.45)', 'transform="rotate(-25 40 38)"')
}

function ratatouille(rng: Rng) {
  const kinds: [string, string][] = [['#d9432c', '#ee7a5c'], ['#4f7f2e', '#d9e4a3'], ['#4b2340', '#efe2c4'], ['#e2a524', '#f7df8a']]
