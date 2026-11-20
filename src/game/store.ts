import { create } from 'zustand'
import { bulkCost, incomeRate, type BuyAmount, type UpgradeKind } from './economy.ts'
import { RESTAURANTS, restaurantById, restaurantIndex, type RestaurantId } from './restaurants.ts'
