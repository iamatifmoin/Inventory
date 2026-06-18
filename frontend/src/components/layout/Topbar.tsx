import { Bell, Menu, Settings } from 'lucide-react'

type TopbarProps = {
  title: string
  actions?: React.ReactNode
  onMenuToggle?: () => void
}

function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant/20 bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      {children}
    </button>
  )
}

export function Topbar({ title, actions, onMenuToggle }: TopbarProps) {
  return (
    <header className="flex h-topbar-height shrink-0 items-center justify-between border-b border-outline-variant/20 bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant/20 bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>
        <h2 className="font-display text-headline-sm text-on-surface">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <IconButton>
          <Bell size={16} strokeWidth={1.8} />
        </IconButton>
        <IconButton>
          <Settings size={16} strokeWidth={1.8} />
        </IconButton>
      </div>
    </header>
  )
}
