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
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', restaurantById(current).theme.accent)
  }, [current])

  const showIncome = () => {
    setTab('upgrade')
    window.setTimeout(() => {
      const button = document.getElementById('upgrade-income')
      button?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      button?.focus({ preventScroll: true })
    }, 60)
  }

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    setTab(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="flex min-h-svh flex-col lg:h-svh">
      <a href="#panel" className="sr-only-focusable fixed left-3 top-3 z-50 rounded-[10px] bg-olive px-4 py-3 font-semibold text-bone">
        Lewati ke panel upgrade
      </a>
      <TopBar onSettings={() => setSettings(true)} />
      <RestaurantStrip />
      <main className="grid flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(380px,420px)]">
        <StageFrame />
        <aside id="panel" aria-label="Panel restoran" tabIndex={-1} className="flex flex-col border-line bg-bone lg:min-h-0 lg:border-l">
          <div role="tablist" aria-label="Isi panel" className="flex gap-1 border-b border-line px-4 pt-3 sm:px-5">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(node) => { tabRefs.current[i] = node }}
                type="button"
                role="tab"
                id={`panel-tab-${t.id}`}
                aria-controls={`panel-${t.id}`}
                aria-selected={tab === t.id}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`-mb-px min-h-[44px] border-b-[3px] px-4 text-[0.9375rem] font-semibold transition-colors ${tab === t.id ? 'border-accent text-olive' : 'border-transparent text-moss hover:text-olive'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`panel-tab-${tab}`}
            className="flex-1 px-4 py-4 sm:px-5 lg:overflow-y-auto"
          >
            {tab === 'upgrade' ? <UpgradePanel /> : <MenuPanel onShowIncome={showIncome} />}
          </div>
