import * as React from 'react'
import { useGame } from '@/game/store'
import { CloseIcon } from './icons'

export function Toast() {
  const notice = useGame((s) => s.notice)
