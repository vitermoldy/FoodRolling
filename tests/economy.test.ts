import { describe, expect, it } from 'vitest'
import { BALANCE } from '@/game/balance'
import {
  bottleneck,
  bulkCost,
  incomeRate,
  isMaxed,
  maxOf,
  newRestaurantState,
  nextDish,
  rateAfter,
  stepCost,
  unlockedDishIndexes,
  UPGRADE_KINDS,
} from '@/game/economy'
import { RESTAURANTS } from '@/game/restaurants'
import { newSave, offlineEarnings, parseSave, totalRate } from '@/game/save'
import { formatCoins, formatDuration } from '@/lib/format'

const jepang = RESTAURANTS[0]

describe('restaurants', () => {
  it('six restaurants, each pricier than the last, the first one free', () => {
