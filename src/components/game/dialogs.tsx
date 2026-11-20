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
}

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const save = useGame((s) => s.save)
  const reset = useGame((s) => s.reset)
  const saveError = useGame((s) => s.saveError)
  const totalEarned = useGame((s) => s.totalEarned)
  const [savedAt, setSavedAt] = React.useState<string | null>(null)
  const [confirm, setConfirm] = React.useState(false)

  React.useEffect(() => {
    if (!open) { setConfirm(false); setSavedAt(null) }
  }, [open])

  const saveNow = () => {
    if (save()) setSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="settings-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="settings-title" className="font-display text-xl font-semibold">Pengaturan</h2>
        <button type="button" className="btn btn-quiet -mr-1 -mt-1 size-11 p-0" onClick={onClose} aria-label="Tutup pengaturan">
