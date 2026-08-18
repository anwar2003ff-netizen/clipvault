import type { Tab } from '@/App'

const ITEMS: { tab: Tab; label: string; icon: string }[] = [
  { tab: 'home', label: 'Home', icon: '🏠' },
  { tab: 'library', label: 'Library', icon: '▦' },
  { tab: 'favorites', label: 'Favorites', icon: '♥' },
  { tab: 'projects', label: 'Projects', icon: '☰' },
  { tab: 'settings', label: 'Settings', icon: '⚙' },
]

export default function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-vault-border bg-vault-surface/95 backdrop-blur safe-bottom">
      {ITEMS.map((item) => {
        const isActive = item.tab === active
        return (
          <button
            key={item.tab}
            onClick={() => onChange(item.tab)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 active:opacity-70"
            aria-current={isActive}
          >
            <span
              className={`text-xl leading-none ${isActive ? 'text-vault-gold' : 'text-vault-muted'}`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] tracking-wide ${isActive ? 'text-vault-gold' : 'text-vault-muted'}`}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
