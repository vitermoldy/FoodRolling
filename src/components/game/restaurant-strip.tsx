import * as React from 'react'
import { foodSvg, toDataUrl } from '@/art/food'
import { RESTAURANTS } from '@/game/restaurants'
import { useGame } from '@/game/store'
import { formatCoins } from '@/lib/format'
import { LockIcon } from './icons'

const thumbs = new Map<string, string>()
