import { totalRate } from '@/game/save'
import { useGame } from '@/game/store'
import { formatCoins, formatRate } from '@/lib/format'
import { CoinIcon, SettingsIcon } from './icons'

export function TopBar({ onSettings }: { onSettings: () => void }) {
  const money = useGame((s) => s.money)
  const restaurants = useGame((s) => s.restaurants)
  const rate = totalRate(restaurants)

  return (
    <header className="flex items-center gap-3 border-b border-line bg-bone px-4 py-2 sm:px-6">
      <p className="font-display text-[1.375rem] font-semibold tracking-[-0.03em] text-olive">FoodRolling</p>
      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2" aria-live="off">
          <CoinIcon width={26} height={26} />
          <div className="leading-tight">
            <p className="num text-lg font-medium text-olive sm:text-xl" aria-label={`Uang: ${formatCoins(money)} koin`}>
              {formatCoins(money)}
            </p>
            <p className="num text-xs text-moss">+{formatRate(rate)}</p>
          </div>
        </div>
        <button type="button" onClick={onSettings} className="btn btn-quiet px-3" aria-label="Pengaturan dan simpanan">
          <SettingsIcon />
          <span className="hidden sm:inline">Pengaturan</span>
        </button>
      </div>
    </header>
  )
}
