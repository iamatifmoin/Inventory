import { Menu } from 'lucide-react'

type TopbarProps = {
  title: string
  actions?: React.ReactNode
  onMenuToggle?: () => void
}

export function Topbar({ title, actions, onMenuToggle }: TopbarProps) {
  return (
    <header className="flex h-topbar-height shrink-0 items-center justify-between border-b border-outline-variant/20 bg-surface px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-outline-variant/20 bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>
        <h2 className="truncate font-display text-headline-sm text-on-surface">{title}</h2>
      </div>

      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </header>
  )
}
