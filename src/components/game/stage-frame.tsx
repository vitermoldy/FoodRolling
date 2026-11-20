import * as React from 'react'
import { restaurantById, restaurantIndex, RESTAURANTS } from '@/game/restaurants'
import { canUnlock, nextLocked, useGame } from '@/game/store'
import { formatCoins } from '@/lib/format'
import { Stage, type StageHandle } from '@/stage/Stage'
import { CookIcon, LockIcon, PauseIcon, PlayIcon } from './icons'

const HINT_KEY = 'foodrolling.hint-seen'

function readHintSeen() {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}

export function StageFrame() {
  const current = useGame((s) => s.current)
  const owned = useGame((s) => s.restaurants[s.current].owned)
  const paused = useGame((s) => s.paused)
  const setPaused = useGame((s) => s.setPaused)
  const def = restaurantById(current)
  const stage = React.useRef<StageHandle>(null)
  const [hintSeen, setHintSeen] = React.useState(readHintSeen)

  const seeHint = () => {
    if (hintSeen) return
    setHintSeen(true)
    try {
      localStorage.setItem(HINT_KEY, '1')
    } catch {
      // A blocked storage only means the hint shows again next time.
    }
  }

  return (
    <section
      id="restaurant-view"
      role="tabpanel"
      aria-labelledby={`tab-${current}`}
      className="relative h-[min(72svh,660px)] min-h-[460px] overflow-hidden bg-stone lg:h-auto lg:min-h-0"
      onPointerDown={owned ? seeHint : undefined}
    >
      <StageBoundary>
        <Stage ref={stage} className="absolute inset-0" />
      </StageBoundary>

      <div className="pointer-events-none absolute left-3 top-3 rounded-[10px] border border-line bg-paper/95 px-3 py-1.5 shadow-[0_2px_8px_rgb(40_30_10/0.12)]">
        <h1 className="font-display text-base font-semibold leading-tight text-olive sm:text-lg">{def.name}</h1>
        <p className="text-xs text-moss">
          Restoran {restaurantIndex(current) + 1} dari {RESTAURANTS.length}, {def.country}
        </p>
      </div>

      {owned && (
        <>
          {paused && (
            <p className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-[10px] bg-olive px-3 py-1.5 text-center text-xs font-medium text-bone max-sm:top-[4.4rem]">
              Sabuk dijeda. Restoran tetap menghasilkan uang.
            </p>
          )}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <button
              type="button"
              className="btn btn-quiet shadow-[0_2px_8px_rgb(40_30_10/0.14)]"
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
              {paused ? 'Jalankan' : 'Jeda'}
            </button>
            <button
              type="button"
              className="btn btn-quiet shadow-[0_2px_8px_rgb(40_30_10/0.14)]"
              disabled={paused}
              onClick={() => { stage.current?.helpNext(); seeHint() }}
            >
              <CookIcon />
              Bantu chef
            </button>
          </div>
          {!hintSeen && !paused && (
            <p className="pointer-events-none absolute bottom-3 right-3 max-w-[15rem] rounded-[10px] bg-paper/95 px-3 py-2 text-xs leading-snug text-olive shadow-[0_2px_8px_rgb(40_30_10/0.12)] max-sm:hidden">
              Seret sabuk untuk memutarnya. Ketuk chef untuk membantu memasak.
            </p>
          )}
        </>
      )}

      {!owned && <LockedCard />}
    </section>
  )
}

function LockedCard() {
  const current = useGame((s) => s.current)
  const money = useGame((s) => s.money)
  const restaurants = useGame((s) => s.restaurants)
  const unlock = useGame((s) => s.unlock)
  const def = restaurantById(current)
  const next = nextLocked({ restaurants })
  const isNext = next === current
  const affordable = canUnlock({ restaurants, money }, current)
  const previous = RESTAURANTS[restaurantIndex(current) - 1]
  const blocking = next ? restaurantById(next) : null

  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(to_bottom,rgb(36_40_20/0.15),rgb(36_40_20/0.45))] p-4">
      <div className="w-full max-w-sm rounded-[14px] border border-line-strong bg-paper p-5 shadow-[0_18px_40px_-12px_rgb(30_25_10/0.45)]">
        <p className="flex items-center gap-2 text-sm text-moss">
          <LockIcon width={16} height={16} />
          Belum dibuka
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-olive">{def.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-olive">{def.blurb}</p>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-3">
          <span className="text-sm text-moss">Harga buka</span>
          <span className="num text-lg font-medium text-olive">{formatCoins(def.unlockCost)}</span>
        </div>
        {isNext ? (
          <>
            <button type="button" className="btn btn-primary mt-3 w-full" disabled={!affordable} onClick={() => unlock(current)}>
              {affordable ? `Buka ${def.name}` : `Kurang ${formatCoins(def.unlockCost - money)} koin`}
            </button>
            {!affordable && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone" role="progressbar" aria-label="Uang terkumpul untuk membuka" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(Math.min(1, money / def.unlockCost) * 100)}>
                <div className="h-full rounded-full bg-olive" style={{ width: `${Math.min(100, (money / def.unlockCost) * 100)}%` }} />
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 rounded-[10px] bg-stone px-3 py-2 text-sm text-olive">
            Buka {blocking?.name ?? previous?.name} dulu. Restoran terbuka berurutan.
          </p>
        )}
      </div>
    </div>
  )
}

/** If the canvas cannot start, say so instead of leaving a blank stage. */
class StageBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return (
