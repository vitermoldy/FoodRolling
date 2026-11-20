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
