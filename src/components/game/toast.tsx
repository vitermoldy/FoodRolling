import * as React from 'react'
import { useGame } from '@/game/store'
import { CloseIcon } from './icons'

export function Toast() {
  const notice = useGame((s) => s.notice)
  const dismiss = useGame((s) => s.dismissNotice)
  const select = useGame((s) => s.select)

  React.useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(dismiss, 7000)
    return () => window.clearTimeout(timer)
