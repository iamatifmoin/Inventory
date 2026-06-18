import { Link } from 'react-router-dom'

import { AppShell } from '../components/layout/AppShell'
import { formatPageTitle } from '../lib/utils'

export function NotFoundPage() {
  document.title = formatPageTitle('Not Found')

  return (
    <AppShell title="Not Found">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-lg border border-outline-variant bg-surface-container-low p-6 text-center">
          <p className="font-display text-label-caps uppercase tracking-wide text-on-surface-variant">
            404
          </p>
          <h1 className="mt-3 font-display text-display-sm text-on-surface">Page not found</h1>
          <p className="mt-3 font-body text-body-md text-on-surface-variant">
            The page you requested does not exist in this workspace.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-row-height items-center justify-center rounded bg-primary px-4 font-body text-body-md text-on-primary transition duration-150 hover:brightness-110"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
