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
  }, [notice, dismiss])

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      {notice && (
        <div key={notice.id} className="pointer-events-auto flex max-w-md items-center gap-3 rounded-[12px] bg-olive py-2 pl-4 pr-2 text-sm text-bone shadow-[0_14px_30px_-10px_rgb(20_20_5/0.55)]">
          <p className="flex-1">{notice.text}</p>
          {notice.goTo && (
            <button type="button" className="btn bg-bone px-3 text-olive hover:bg-white" onClick={() => { select(notice.goTo!); dismiss() }}>
