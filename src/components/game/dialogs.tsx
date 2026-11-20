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
          <CloseIcon />
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed">
        Progres tersimpan otomatis di browser ini setiap 5 detik dan saat tab ditutup. Selama game ditutup, restoran tetap berjalan sampai {BALANCE.offlineCapHours} jam.
      </p>
      <p className="mt-3 flex items-baseline justify-between border-t border-line pt-3 text-sm">
        <span className="text-moss">Total uang yang pernah didapat</span>
        <span className="num font-medium">{formatCoins(totalEarned)}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={saveNow}>Simpan sekarang</button>
        <p className="text-sm" role="status">
          {saveError ? 'Browser menolak penyimpanan. Progres hilang saat tab ditutup.' : savedAt ? `Tersimpan pukul ${savedAt}.` : ''}
        </p>
      </div>

      <div className="mt-5 rounded-[12px] border border-dashed border-line-strong p-3">
        {confirm ? (
          <>
            <p className="text-sm font-semibold text-danger">Hapus semua restoran dan uang? Ini tidak bisa dibatalkan.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-quiet" onClick={() => setConfirm(false)}>Batal</button>
              <button
                type="button"
                className="btn bg-danger text-white hover:bg-[#82220f]"
                onClick={() => { reset(); onClose() }}
              >
                Hapus progres
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm">Mulai lagi dari Kaiten Hinoki dengan uang nol.</p>
            <button type="button" className="btn btn-quiet mt-2" onClick={() => setConfirm(true)}>Mulai dari awal</button>
          </>
        )}
      </div>
    </Modal>
  )
}

export function OfflineDialog() {
  const offline = useGame((s) => s.offline)
  const dismiss = useGame((s) => s.dismissOffline)
  return (
    <Modal open={!!offline} onClose={dismiss} labelledBy="offline-title">
      {offline && (
        <>
          <h2 id="offline-title" className="font-display text-xl font-semibold">Selamat datang kembali</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Selama {formatDuration(offline.seconds)} kamu pergi, restoranmu tetap melayani pelanggan dan menghasilkan:
          </p>
          <p className="num mt-3 text-3xl font-medium tracking-[-0.03em]">+{formatCoins(offline.coins)}</p>
          {offline.seconds >= BALANCE.offlineCapHours * 3600 - 1 && (
            <p className="mt-1 text-xs text-moss">Dihitung sampai batas {BALANCE.offlineCapHours} jam.</p>
          )}
          <button type="button" className="btn btn-primary mt-5 w-full" onClick={dismiss} autoFocus>
            Lanjut main
          </button>
