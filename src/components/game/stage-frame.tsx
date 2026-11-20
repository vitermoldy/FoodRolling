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
