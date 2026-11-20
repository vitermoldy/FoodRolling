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
          <h2 id="upgrade-heading" className="font-display text-lg font-semibold text-olive">Upgrade</h2>
          <AmountPicker />
        </div>
        <UpgradeRows def={def} st={st} />
      </section>
      <NextRestaurant />
    </div>
  )
}

function Summary({ def, st }: { def: RestaurantDef; st: RestaurantState }) {
  const p = production(def, st)
  const c = capacity(def, st)
  const top = Math.max(p, c)
  const slow = bottleneck(def, st)
  return (
    <section aria-label="Ringkasan restoran" className="rounded-[14px] bg-paper p-4 shadow-[0_1px_0_rgb(56_69_15/0.12)]">
      <p className="text-sm text-moss">Pendapatan restoran ini</p>
      <p className="num mt-0.5 text-[1.75rem] font-medium leading-none tracking-[-0.03em] text-olive">+{formatRate(incomeRate(def, st))}</p>
      <div className="mt-4 flex flex-col gap-2.5">
        <Meter label="Dapur" value={p} max={top} slow={slow === 'chefs'} />
        <Meter label="Kursi" value={c} max={top} slow={slow === 'seats'} />
      </div>
      <p className="mt-3 text-sm leading-snug text-olive">
        {slow === 'chefs'
          ? 'Pelanggan menunggu makanan. Tambah chef atau kecepatan supaya piring lebih cepat keluar.'
          : 'Dapur lebih cepat dari pelanggan, piring menumpuk di sabuk. Tambah tempat duduk atau kecepatan.'}
      </p>
    </section>
  )
}

function Meter({ label, value, max, slow }: { label: string; value: number; max: number; slow: boolean }) {
  return (
    <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3">
      <span className="text-sm font-medium text-olive">{label}</span>
      <span className="h-2.5 overflow-hidden rounded-full bg-stone" aria-hidden="true">
        <span className="block h-full rounded-full" style={{ width: `${Math.max(4, (value / Math.max(1e-9, max)) * 100)}%`, background: slow ? 'var(--accent)' : 'var(--color-olive)' }} />
      </span>
      <span className="num w-[9.5rem] text-right text-xs text-olive">
        {formatDecimal(value, 2)} piring/detik{slow ? <span className="sr-only">, ini yang menahan</span> : null}
      </span>
    </div>
  )
}

function AmountPicker() {
