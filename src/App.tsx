import * as React from 'react'
import { MenuPanel } from '@/components/game/menu-panel'
import { OfflineDialog, SettingsDialog } from '@/components/game/dialogs'
import { RestaurantStrip } from '@/components/game/restaurant-strip'
import { StageFrame } from '@/components/game/stage-frame'
import { Toast } from '@/components/game/toast'
import { TopBar } from '@/components/game/top-bar'
import { UpgradePanel } from '@/components/game/upgrade-panel'
import { BALANCE } from '@/game/balance'
import { restaurantById } from '@/game/restaurants'
import { useGame, type PanelTab } from '@/game/store'

const TABS: { id: PanelTab; label: string }[] = [
  { id: 'upgrade', label: 'Upgrade' },
  { id: 'menu', label: 'Menu' },
]

export default function App() {
  const current = useGame((s) => s.current)
  const tab = useGame((s) => s.tab)
  const setTab = useGame((s) => s.setTab)
  const [settings, setSettings] = React.useState(false)
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  // Restaurants off screen earn by the formula; save every few seconds and when the tab goes away.
  React.useEffect(() => {
    const { tick, save } = useGame.getState()
    const ticker = window.setInterval(() => tick(Date.now()), 250)
    const saver = window.setInterval(save, 5000)
    const flush = () => { tick(Date.now()); save() }
    const onVisibility = () => { if (document.hidden) flush() }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(ticker)
      window.clearInterval(saver)
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // The open restaurant lends its colour to the interface.
