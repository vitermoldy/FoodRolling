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
  const amount = useGame((s) => s.buyAmount)
  const setAmount = useGame((s) => s.setBuyAmount)
  const options: { value: BuyAmount; label: string }[] = [
    { value: 1, label: 'x1' },
    { value: 10, label: 'x10' },
    { value: 'max', label: 'Maks' },
  ]
  return (
    <div role="group" aria-label="Jumlah beli" className="flex gap-1 rounded-[12px] bg-stone p-1">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          aria-pressed={amount === o.value}
          onClick={() => setAmount(o.value)}
          className={`min-h-[44px] min-w-[3.25rem] rounded-[9px] px-3 text-sm font-semibold transition-colors ${amount === o.value ? 'bg-olive text-bone' : 'text-olive hover:bg-paper'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function UpgradeRows({ def, st }: { def: RestaurantDef; st: RestaurantState }) {
  const money = useGame((s) => s.money)
  const amount = useGame((s) => s.buyAmount)
  const buy = useGame((s) => s.buy)
  const best = bestValue(def, st)
  const rate = incomeRate(def, st)

  return (
    <ul className="flex flex-col gap-2">
      {UPGRADE_KINDS.map((kind) => {
        const Icon = UPGRADE_ICONS[kind]
        const maxed = isMaxed(st, kind)
        const { count, cost } = bulkCost(def, st, kind, amount, money)
        const affordable = !maxed && count > 0 && cost <= money
        const gain = maxed ? 0 : rateAfter(def, st, kind, count) - rate
        const dish = kind === 'income' ? nextDish(def, st) : null
        const blocked = !maxed && gain <= rate * 1e-6 && (kind === 'chefs' || kind === 'seats')
        return (
          <li key={kind} className={`rounded-[12px] border bg-paper p-3 ${best === kind ? 'border-olive' : 'border-line'}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[10px] bg-stone text-olive">
                <Icon width={24} height={24} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <h3 className="font-semibold text-olive">{TITLES[kind]}</h3>
                  <span className="text-xs text-moss">{levelText(kind, st)}</span>
                </div>
                <p className="mt-0.5 text-sm leading-snug text-olive">{effectText(kind, def, st)}</p>
                {dish && (
                  <p className="mt-1 text-xs text-moss">
                    Level {dish.level}: {dish.dish.name} masuk menu.
                  </p>
                )}
                {best === kind && <p className="mt-1 text-xs font-semibold text-olive">Paling untung untuk harganya</p>}
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <span className="num text-xs text-moss">
                {maxed ? 'Sudah penuh' : blocked ? (kind === 'chefs' ? 'Belum menambah: kursi yang menahan' : 'Belum menambah: dapur yang menahan') : `+${formatRate(gain)}`}
              </span>
              <button
                id={kind === 'income' ? 'upgrade-income' : undefined}
                type="button"
                className="btn btn-primary min-w-[9.5rem] justify-between px-3"
                disabled={!affordable}
                onClick={() => buy(kind)}
                aria-label={maxed ? `${TITLES[kind]} sudah penuh` : `Beli ${TITLES[kind]}${count > 1 ? ` ${count} kali` : ''}, ${formatCoins(cost)} koin`}
              >
                <span>{maxed ? 'Penuh' : count > 1 ? `Beli ${count}` : 'Beli'}</span>
                {!maxed && <span className="num font-medium">{formatCoins(cost)}</span>}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function NextRestaurant() {
  const restaurants = useGame((s) => s.restaurants)
  const money = useGame((s) => s.money)
  const select = useGame((s) => s.select)
  const unlock = useGame((s) => s.unlock)
  const current = useGame((s) => s.current)
  const next = nextLocked({ restaurants })
  if (!next) {
    return (
      <section aria-label="Restoran berikutnya" className="rounded-[14px] bg-olive p-4 text-bone">
        <p className="font-display text-lg font-semibold">Keenam restoran sudah buka.</p>
        <p className="mt-1 text-sm text-[#dfe3cf]">Sisa permainan: penuhi upgrade di tiap restoran.</p>
      </section>
    )
  }
  const def = restaurantById(next)
  const affordable = canUnlock({ restaurants, money }, next)
  const share = Math.min(1, money / def.unlockCost)
  return (
    <section aria-labelledby="next-heading" className="rounded-[14px] border border-line-strong bg-paper p-4">
      <p className="text-sm text-moss">Restoran berikutnya</p>
      <h2 id="next-heading" className="font-display text-lg font-semibold text-olive">
        {def.name}, {def.country}
      </h2>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-stone" role="progressbar" aria-label={`Uang terkumpul untuk ${def.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(share * 100)}>
        <div className="h-full rounded-full" style={{ width: `${share * 100}%`, background: def.theme.accent }} />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2 text-sm">
        <span className="num text-olive">{formatCoins(Math.min(money, def.unlockCost))}</span>
        <span className="num text-moss">{formatCoins(def.unlockCost)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary flex-1" disabled={!affordable} onClick={() => unlock(next)}>
          {affordable ? 'Buka sekarang' : `Kurang ${formatCoins(def.unlockCost - money)}`}
        </button>
        {current !== next && (
          <button type="button" className="btn btn-quiet" onClick={() => select(next)}>
            Lihat ruangannya
          </button>
