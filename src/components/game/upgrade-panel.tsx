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
