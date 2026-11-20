import {
  bottleneck,
  bulkCost,
  capacity,
  cookTime,
  eatTime,
  incomeMult,
  incomeRate,
  isMaxed,
  maxOf,
  nextDish,
  production,
  rateAfter,
  stepCost,
  UPGRADE_KINDS,
  type BuyAmount,
  type RestaurantState,
  type UpgradeKind,
} from '@/game/economy'
import { BALANCE } from '@/game/balance'
import { restaurantById, type RestaurantDef } from '@/game/restaurants'
import { canUnlock, nextLocked, useGame } from '@/game/store'
import { formatCoins, formatDecimal, formatRate } from '@/lib/format'
import { UPGRADE_ICONS } from './icons'

const TITLES: Record<UpgradeKind, string> = {
  income: 'Pendapatan',
  speed: 'Kecepatan',
  chefs: 'Jumlah chef',
  seats: 'Tempat duduk',
}

function levelText(kind: UpgradeKind, st: RestaurantState) {
  if (kind === 'chefs') return `${st.chefs} dari ${maxOf('chefs')} chef`
  if (kind === 'seats') return `${st.seats} dari ${maxOf('seats')} kursi`
  return `Level ${st[kind]} dari ${maxOf(kind)}`
}

function effectText(kind: UpgradeKind, def: RestaurantDef, st: RestaurantState): string {
  if (kind === 'income') return `Harga piring x${formatDecimal(incomeMult(st.income), 2)}, naik ${Math.round((BALANCE.income.growth - 1) * 100)}% tiap level.`
  if (kind === 'speed') return `Masak ${formatDecimal(cookTime(def, st))} detik, makan ${formatDecimal(eatTime(def, st))} detik per piring. Sabuk ikut lebih cepat.`
  if (kind === 'chefs') return `Dapur menyiapkan ${formatDecimal(production(def, st), 2)} piring per detik.`
  return `Pelanggan menghabiskan ${formatDecimal(capacity(def, st), 2)} piring per detik.`
}

/** Best coins-per-second gained per coin spent among the four upgrades, for the "Paling untung" tag. */
function bestValue(def: RestaurantDef, st: RestaurantState): UpgradeKind | null {
  let best: UpgradeKind | null = null
  let bestScore = 0
  const now = incomeRate(def, st)
  for (const kind of UPGRADE_KINDS) {
    if (isMaxed(st, kind)) continue
    const gain = rateAfter(def, st, kind) - now
    const score = gain / stepCost(def, kind, st[kind])
    if (gain > 0 && score > bestScore) { bestScore = score; best = kind }
  }
  return best
}

export function UpgradePanel() {
  const current = useGame((s) => s.current)
  const st = useGame((s) => s.restaurants[s.current])
  const def = restaurantById(current)

  if (!st.owned) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-[12px] border border-dashed border-line-strong p-4 text-sm leading-relaxed text-olive">
          Upgrade {def.name} muncul setelah restoran ini dibuka. Restoran yang sudah buka tetap menghasilkan uang selama kamu melihat-lihat.
        </p>
        <NextRestaurant />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Summary def={def} st={st} />
      <section aria-labelledby="upgrade-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
