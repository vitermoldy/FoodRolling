// Every dish, drawn from above on a 100 x 100 canvas centred on (50, 50). The food stays inside a
// radius of about 34 so it sits on a plate; the plate itself is drawn by the caller.
import { makeRng } from '../game/rng.ts'

type Rng = () => number

const f = (n: number) => Math.round(n * 100) / 100

function circle(cx: number, cy: number, r: number, fill: string, extra = '') {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" ${extra}/>`
}
function ellipse(cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') {
