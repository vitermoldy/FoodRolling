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
      price: formatCoins(dishPrice(def, dish, income)),
      tier: dish.tier as DishTier,
      image: plateUrl(dish.id, def.theme.plate),
      details: [...dish.details, open ? 'Ada di sabuk' : `Masuk menu di Pendapatan level ${BALANCE.dishUnlock[i]}`],
      locked: !open,
    }
  }), [def, income, owned])

  const legend = React.useMemo(() => {
    const out: { [tier: number]: string } = {}
    for (let tier = 1; tier <= 5; tier++) out[tier] = formatCoins(tierPrice(def, tier, income))
    return out
  }, [def, income])

  return (
    <SushiConveyorMenu
      key={def.id}
      items={items}
      legend={legend}
      heading={`Menu ${def.name}`}
      caption="Warna piring menandai harga. Pilih piring untuk melihat isinya."
      className="rounded-[14px] border border-line"
      labels={{ add: 'Tutup', close: 'Tutup', previous: 'Piring sebelumnya', next: 'Piring berikutnya', pause: 'Jeda sabuk menu' }}
      dialogAction={(item, close) => item.locked ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { close(); onShowIncome() }}
          disabled={!owned}
        >
          {owned ? 'Lihat upgrade Pendapatan' : 'Restoran belum dibuka'}
        </button>
      ) : (
        <p className="text-sm text-muted-foreground">Chef sedang memasaknya.</p>
      )}
    />
  )
