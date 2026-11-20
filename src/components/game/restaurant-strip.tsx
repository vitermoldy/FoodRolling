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
