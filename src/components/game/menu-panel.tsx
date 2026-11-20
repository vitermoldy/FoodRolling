import * as React from 'react'
import { plateSvg, toDataUrl } from '@/art/food'
import SushiConveyorMenu, { type ConveyorDish, type DishTier } from '@/components/ui/sushi-conveyor-menu'
import { BALANCE } from '@/game/balance'
import { dishPrice, isDishUnlocked, tierPrice } from '@/game/economy'
import { restaurantById } from '@/game/restaurants'
import { useGame } from '@/game/store'
import { formatCoins } from '@/lib/format'

const plates = new Map<string, string>()
function plateUrl(id: string, plate: string) {
  const key = `${id}:${plate}`
  let url = plates.get(key)
  if (!url) {
    url = toDataUrl(plateSvg(id, plate))
    plates.set(key, url)
  }
  return url
}

/** The restaurant's dishes on the conveyor menu from the prompt. Plate colour marks the price. */
export function MenuPanel({ onShowIncome }: { onShowIncome: () => void }) {
  const current = useGame((s) => s.current)
  const income = useGame((s) => s.restaurants[s.current].income)
  const owned = useGame((s) => s.restaurants[s.current].owned)
  const def = restaurantById(current)

  const items = React.useMemo<ConveyorDish[]>(() => def.dishes.map((dish, i) => {
    const open = owned && isDishUnlocked(i, income)
    return {
      id: dish.id,
      name: dish.name,
      description: dish.description,
