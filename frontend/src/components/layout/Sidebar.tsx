import {
  CircleUserRound,
  LayoutDashboard,
  Package,
  ShoppingCart,
  X,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

type NavigationItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const navigationItems: NavigationItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
]

type SidebarProps = {
  className?: string
  onClose?: () => void
  onNavigate?: () => void
  showCloseButton?: boolean
}

export function Sidebar({ className, onClose, onNavigate, showCloseButton = false }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'flex h-full w-sidebar-width flex-col bg-surface-container-lowest',
        'border-r border-outline-variant/20',
        className,
      )}
    >
      <div className="border-b border-outline-variant/20 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-headline-sm text-on-surface">Inventory OS</h1>
          </div>
          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant/20 bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
              aria-label="Close navigation menu"
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  'relative flex h-row-height items-center gap-3 rounded-r-md border border-transparent px-3 pl-4 font-body text-body-md transition-colors',
                  isActive
                    ? 'bg-surface-container-high text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={clsx(
                      'absolute inset-y-1 left-0 w-0.5 rounded-full',
                      isActive ? 'bg-primary' : 'bg-transparent',
                    )}
                  />
                  <Icon size={16} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant/20 px-4 py-4">
        <div className="flex items-center gap-3 rounded-md bg-surface-container-low px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface">
            <CircleUserRound size={18} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-body text-body-md text-on-surface">Admin User</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
