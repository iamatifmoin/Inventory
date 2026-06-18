import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 text-on-surface">
          <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-low p-6 text-center">
            <h1 className="font-display text-display-sm text-on-surface">Something went wrong</h1>
            <p className="mt-3 font-body text-body-md text-on-surface-variant">
              An unexpected error interrupted the app. Reload to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex h-row-height items-center justify-center rounded bg-primary px-4 font-body text-body-md text-on-primary transition duration-150 hover:brightness-110"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
