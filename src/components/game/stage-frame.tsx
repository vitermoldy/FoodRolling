import * as React from 'react'
import { restaurantById, restaurantIndex, RESTAURANTS } from '@/game/restaurants'
import { canUnlock, nextLocked, useGame } from '@/game/store'
import { formatCoins } from '@/lib/format'
import { Stage, type StageHandle } from '@/stage/Stage'
import { CookIcon, LockIcon, PauseIcon, PlayIcon } from './icons'

const HINT_KEY = 'foodrolling.hint-seen'

