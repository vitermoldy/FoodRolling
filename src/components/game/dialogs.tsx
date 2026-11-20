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
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[14px] border border-line-strong bg-paper p-0 text-olive shadow-[0_24px_60px_-18px_rgb(30_25_10/0.5)]"
    >
      {open && <div className="p-5">{children}</div>}
    </dialog>
  )
