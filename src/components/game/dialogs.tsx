import * as React from 'react'
import { BALANCE } from '@/game/balance'
import { useGame } from '@/game/store'
import { formatCoins, formatDuration } from '@/lib/format'
import { CloseIcon } from './icons'

/** Native modal dialog: focus moves in, Escape closes, focus returns to the opener. */
function Modal({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDialogElement>(null)
  React.useEffect(() => {
    const dialog = ref.current
