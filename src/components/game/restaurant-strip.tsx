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
