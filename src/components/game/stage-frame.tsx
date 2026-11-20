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

