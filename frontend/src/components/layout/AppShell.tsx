import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

import { Sidebar, navigationItems } from './Sidebar'
import { Topbar } from './Topbar'

type AppShellProps = {
  title: string
  actions?: ReactNode
  children: ReactNode
}

export function AppShell({ title, actions, children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div
        className={clsx(
          'fixed inset-x-0 bottom-0 top-topbar-height z-40 bg-black/60 transition-opacity duration-200 md:hidden',
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        className={clsx(
          'fixed bottom-0 left-0 top-topbar-height z-50 w-sidebar-width transition-transform duration-200 md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar
          showCloseButton
          onClose={() => setIsMobileMenuOpen(false)}
          onNavigate={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:block">
        <Sidebar />
      </div>

      <div className="flex min-h-screen flex-col md:pl-sidebar-width">
        <Topbar
          title={title}
          actions={actions}
          onMenuToggle={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/20 bg-surface-container-lowest/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center justify-center gap-1 px-2 py-3 font-body text-body-sm transition-colors',
                    isActive ? 'text-on-surface' : 'text-on-surface-variant',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className={clsx(isActive ? 'text-primary' : 'text-on-surface-variant')}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
