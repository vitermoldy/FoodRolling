import * as React from 'react'
import { foodSvg, toDataUrl } from '@/art/food'
import { RESTAURANTS } from '@/game/restaurants'
import { useGame } from '@/game/store'
import { formatCoins } from '@/lib/format'
import { LockIcon } from './icons'

const thumbs = new Map<string, string>()
function thumb(id: string) {
  let url = thumbs.get(id)
  if (!url) {
    url = toDataUrl(foodSvg(id, 64))
    thumbs.set(id, url)
  }
  return url
}

/** One tab per restaurant, in the order they open. Arrow keys move between them. */
export function RestaurantStrip() {
  const current = useGame((s) => s.current)
  const restaurants = useGame((s) => s.restaurants)
  const select = useGame((s) => s.select)
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1
    if (e.key === 'ArrowRight') next = (index + 1) % RESTAURANTS.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + RESTAURANTS.length) % RESTAURANTS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = RESTAURANTS.length - 1
    if (next < 0) return
    e.preventDefault()
    refs.current[next]?.focus()
    select(RESTAURANTS[next].id)
  }

  return (
    <nav aria-label="Restoran" className="border-b border-line bg-bone">
      <div role="tablist" aria-label="Pilih restoran" className="relative flex gap-1 overflow-x-auto px-3 py-2 sm:px-5 [scrollbar-width:thin]">
        {RESTAURANTS.map((r, i) => {
          const st = restaurants[r.id]
          const active = r.id === current
          return (
            <button
              key={r.id}
              ref={(node) => { refs.current[i] = node }}
              type="button"
              role="tab"
              id={`tab-${r.id}`}
              aria-controls="restaurant-view"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => select(r.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              style={active ? { boxShadow: `inset 0 -3px 0 ${r.theme.accent}` } : undefined}
              className={`flex min-h-[52px] shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-1.5 text-left transition-colors ${active ? 'bg-paper' : 'hover:bg-stone/70'}`}
            >
              <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-[#fbf8f1] ring-2" style={{ ['--tw-ring-color' as string]: st.owned ? r.theme.accent : 'rgb(56 69 15 / 0.2)' }}>
                <img src={thumb(r.dishes[5].id)} alt="" width={28} height={28} className={st.owned ? '' : 'opacity-40 grayscale'} />
                {!st.owned && <LockIcon width={14} height={14} className="absolute -bottom-1 -right-1 rounded-full bg-paper p-[1px] text-olive" />}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-olive">{r.name}</span>
                <span className="block text-xs text-moss">
                  {st.owned ? r.country : <><span className="sr-only">Terkunci, </span>{r.country}, <span className="num">{formatCoins(r.unlockCost)}</span></>}
                </span>
              </span>
            </button>
          )
