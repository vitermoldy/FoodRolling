import * as React from 'react'
import { BALANCE } from '@/game/balance'
import { useGame } from '@/game/store'
import { formatCoins, formatDuration } from '@/lib/format'
import { CloseIcon } from './icons'

/** Native modal dialog: focus moves in, Escape closes, focus returns to the opener. */
