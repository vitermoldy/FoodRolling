import { describe, expect, it } from 'vitest'
import { BALANCE } from '@/game/balance'
import { incomeRate, newRestaurantState, platesPerSecond, type RestaurantState } from '@/game/economy'
import { RESTAURANTS } from '@/game/restaurants'
import { BeltSim, CHEF_SPOTS, SEAT_SPOTS, SLOT_COUNT, simConfig } from '@/game/sim'

