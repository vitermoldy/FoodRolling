// Plays the game with a greedy bot on the income formula and prints when each restaurant opens.
// Run: npm run balance
import { RESTAURANTS } from '../src/game/restaurants.ts'
import * as E from '../src/game/economy.ts'

const fmt = (n: number) => {
  if (n < 1e3) return n.toFixed(1)
  const u = ['rb', 'jt', 'M', 'T', 'Kd', 'Kt']
  const e = Math.min(u.length, Math.floor(Math.log10(n) / 3))
  return (n / 10 ** (e * 3)).toFixed(2) + ' ' + u[e - 1]
}
const clock = (t: number) => `${Math.floor(t / 3600)}j${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}m`

const states = RESTAURANTS.map((_, i) => E.newRestaurantState(i === 0))
let money = 0
let t = 0
const dt = 1
const total = () => RESTAURANTS.reduce((sum, def, i) => sum + E.incomeRate(def, states[i]), 0)

type Option = { payback: number; cost: number; label: string; apply: () => void }

while (t < 12 * 3600) {
  const options: Option[] = []
  const rate = total()
  RESTAURANTS.forEach((def, i) => {
    const st = states[i]
    if (!st.owned) return
    for (const kind of E.UPGRADE_KINDS) {
